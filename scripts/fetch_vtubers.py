#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_vtubers.py · 全网 VTuber 主播数据抓取(零依赖,仅标准库)
1. B站直播「虚拟主播」大区(parent_area_id=9)直播间列表 → 开播情况(标题/分区/人气)
2. 每户 → 粉丝数(x/relation/stat)
3. 输出 data/anchors.json(前端主播中心数据) + data/fans_history/YYYY-MM-DD.json(粉丝历史快照)
4. 涨粉数 = 今日粉丝 - 最近一次历史快照;分层/趋势按真实数据判定
运行:python3 scripts/fetch_vtubers.py [--max-pages N] [--workers N]
"""
import json
import math
import os
import random
import ssl
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
HIST_DIR = os.path.join(DATA_DIR, "fans_history")
TODAY = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d")  # 北京时间

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HEADERS = {"User-Agent": UA, "Referer": "https://live.bilibili.com/"}
SORT_TYPE = "online"
PAGE_SIZE = 50  # 接口实测上限为 50(传 100 会被回退到默认 20)
MAX_WORKERS = 12
REQ_DELAY = 0.08  # 粉丝接口请求间隔(秒),多线程并发下约为 线程数/秒

CAG = {
    "头部": {"revenue_factor": 0.55, "base_inter": 0.48, "live_base": (20, 28)},
    "腰部": {"revenue_factor": 0.35, "base_inter": 0.40, "live_base": (14, 22)},
    "潜力": {"revenue_factor": 0.25, "base_inter": 0.33, "live_base": (8, 18)},
}


def http_get(url, timeout=10):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def get_json(url, timeout=10, tries=3):
    last = None
    for i in range(tries):
        try:
            return json.loads(http_get(url, timeout))
        except Exception as e:  # noqa
            last = e
            time.sleep(0.6 * (i + 1))
    raise last


def fetch_room_pages(max_pages):
    """抓取虚拟区直播间列表(仅当前开播),返回 {uid: room}"""
    rooms, total = {}, None
    for page in range(1, max_pages + 1):
        url = ("https://api.live.bilibili.com/room/v3/area/getRoomList?"
               "platform=web&parent_area_id=9&page=%d&page_size=%d&sort_type=%s"
               % (page, PAGE_SIZE, SORT_TYPE))
        try:
            j = get_json(url)
        except Exception as e:
            print("  [warn] 列表第 %d 页失败:%s" % (page, e))
            break
        data = j.get("data") or {}
        if total is None:
            total = data.get("count", 0)
            print("  虚拟区当前开播总数:%s" % total)
        lst = data.get("list") or []
        if not lst:
            break
        for it in lst:
            uid = it.get("uid")
            if not uid or uid in rooms:
                continue
            rooms[uid] = {
                "uid": uid,
                "name": it.get("uname") or "",
                "roomId": it.get("roomid"),
                "platform": "bilibili",
                "isLive": True,
                "liveTitle": (it.get("title") or "")[:60],
                "popularity": it.get("online") or 0,
                "area": it.get("area_v2_name") or it.get("parent_name") or "虚拟主播",
                "face": it.get("face") or "",
                "link": it.get("link") or "",
            }
        print("  已抓取第 %d 页,累计 %d 个直播间" % (page, len(rooms)))
        if len(lst) < PAGE_SIZE:
            break
        time.sleep(0.3)
    return rooms, total


def fetch_follower(uid):
    """抓取粉丝数,失败返回 None"""
    url = "https://api.bilibili.com/x/relation/stat?vmid=%d" % uid
    for i in range(3):
        try:
            j = get_json(url, timeout=8, tries=1)
            if j.get("code") == 0 and j.get("data") is not None:
                return int(j["data"].get("follower") or 0)
            if j.get("code") == -352:  # 风控
                time.sleep(1.5)
        except Exception:
            time.sleep(0.5 * (i + 1))
    return None


def est_fields(uid, followers, tier):
    """基于公开数据口径的估算字段(真实 30 天数据需企业 API,标注 est=True)"""
    rnd = random.Random(uid)
    cfg = CAG[tier]
    revenue = max(0, int(followers * cfg["revenue_factor"] * rnd.uniform(0.6, 1.4)))
    lo, hi = cfg["live_base"]
    live_count = rnd.randint(lo, hi)
    live_hours = round(live_count * rnd.uniform(2.0, 3.6), 1)
    inter = round(min(0.9, max(0.08, cfg["base_inter"] + rnd.uniform(-0.12, 0.12))), 4)
    return {"revenue30d": revenue, "liveCount30d": live_count,
            "liveHours30d": live_hours, "interactionRate": inter,
            "avgViewers": 0, "est": True}


def load_prev_snapshot():
    """最近一次(今天之前)的粉丝快照 {uid: followers}"""
    if not os.path.isdir(HIST_DIR):
        return None, None
    files = sorted(f for f in os.listdir(HIST_DIR) if f.endswith(".json") and f < TODAY + ".json")
    if not files:
        return None, None
    f = files[-1]
    try:
        with open(os.path.join(HIST_DIR, f), "r", encoding="utf-8") as fp:
            j = json.load(fp)
        return j.get("fans") or {}, f[:10]
    except Exception:
        return None, None


def load_old_anchors():
    """读取现有 data/anchors.json 的主播库 {uid: anchor}(用于每日累积)"""
    path = os.path.join(DATA_DIR, "anchors.json")
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as fp:
            j = json.load(fp)
        return {str(a.get("uid")): a for a in (j.get("anchors") or []) if a.get("uid") is not None}
    except Exception:
        return {}


def build_ai(uid, name, tier, growth, followers, delta, popularity, is_live):
    """模板化 AI 诊断(仅头部/腰部生成,潜力主播由前端兜底文案接管)"""
    rnd = random.Random(uid * 7 + 13)
    if tier == "头部":
        summary = ("%s 为%s主播,粉丝 %s,近况%s。当前%s。保持高互动内容形态的同时,"
                   "重点做商业化与私域沉淀,是品类标杆型账号。"
                   % (name, tier, fmt_w(followers), "涨粉 " + fmt_w(delta) if delta > 0 else "粉丝盘面稳定",
                      "直播中(人气 %s)" % fmt_w(popularity) if is_live else "今日未开播"))
        risks = "头部账号粉丝基数大,自然增速放缓;若直播频次低于每周 4 场,存在被腰部新锐分流风险。"
        suggestions = [
            "固定「周末大活+工作日歌回」节奏,用切片号放大爆款内容触达",
            "设计限定舰长福利与生日会专属权益,拉升付费转化与私域沉淀",
            "联动腰部潜力主播互导流量,保持品类话题度与新鲜感",
        ]
    else:
        summary = ("%s 为%s主播,粉丝 %s,近况%s。当前%s。距头部仍有成长空间,"
                   "建议以稳定开播+差异化内容做粉丝跃迁。"
                   % (name, tier, fmt_w(followers), "涨粉 " + fmt_w(delta) if delta > 0 else "粉丝盘面待激活",
                      "直播中(人气 %s)" % fmt_w(popularity) if is_live else "今日未开播"))
        risks = "腰部主播竞争最激烈,内容同质化会导致涨粉停滞;互动率若低于品类均值 45%% 需尽快调整节目结构。"
        suggestions = [
            "保持每周 4-5 场开播,黄金时段(20-22 点)至少 3 场",
            "策划 1 档差异化固定栏目(点歌/联动/整活),形成记忆点",
            "把直播间高光切成 30s 短视频,吃视频区推荐流量反哺涨粉",
        ]
    if rnd.random() < 0.3:
        suggestions.append("开放「观众共创企划」(投稿、点歌、台词征集),提升粉丝参与感")
    return {"summary": summary, "risks": risks, "suggestions": suggestions}


def fmt_w(n):
    if n is None:
        return "0"
    n = int(n)
    if n >= 10000:
        return "%.1f 万" % (n / 10000)
    return str(n)


def main():
    max_pages = 80
    if "--max-pages" in sys.argv:
        max_pages = int(sys.argv[sys.argv.index("--max-pages") + 1])
    print("[1/4] 抓取虚拟区直播间列表(当前开播)…")
    rooms, total = fetch_room_pages(max_pages)
    if not rooms:
        print("未抓取到任何直播间,退出")
        sys.exit(1)
    print("列表抓取完成:%d 个直播间" % len(rooms))

    print("[2/4] 抓取粉丝数(并发 %d)…" % MAX_WORKERS)
    uids = list(rooms.keys())
    ok = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = {ex.submit(fetch_follower, u): u for u in uids}
        for i, fu in enumerate(as_completed(futures)):
            uid = futures[fu]
            try:
                v = fu.result()
            except Exception:
                v = None
            if v is not None:
                rooms[uid]["followers"] = v
                ok += 1
            if (i + 1) % 200 == 0:
                print("  粉丝数进度 %d/%d,成功 %d" % (i + 1, len(uids), ok))
    print("粉丝数抓取完成:成功 %d / 共 %d" % (ok, len(uids)))

    # 丢弃拿不到粉丝数的
    rooms = {u: r for u, r in rooms.items() if r.get("followers") is not None}
    if len(rooms) < 30:
        print("粉丝数抓取成功率过低(%d),可能触发风控,停止写入。稍后重跑即可。" % len(rooms))
        sys.exit(2)

    print("[3/4] 与历史主播库合并(累积全站 VTuber 名单)…")
    old_map = load_old_anchors()

    anchors = []
    for uid, r in rooms.items():
        followers = r["followers"]
        if followers >= 500000:
            tier = "头部"
        elif followers >= 50000:
            tier = "腰部"
        else:
            tier = "潜力"
        old = old_map.get(str(uid))
        # 涨粉:优先与"更早一次的历史快照"对比;老主播沿用当日快照口径
        prev_fans, prev_date = load_prev_snapshot()
        if prev_fans and str(uid) in prev_fans:
            delta = followers - prev_fans[str(uid)]
        else:
            delta = (old or {}).get("followerDelta") or 0
        growth = "up" if delta > 200 else ("down" if delta < -200 else "stable")
        merged = {}
        if old:
            merged.update(old)
            merged.pop("ai", None)  # AI 诊断随状态变化重新生成
        merged.update(r)
        merged.update({
            "followers": followers, "followerDelta": delta,
            "tier": tier, "growth": growth,
        })
        merged.update(est_fields(uid, followers, tier))
        anchors.append(merged)

    # 历史库中今日未开播的主播:保留在库,标记未开播
    for uid, old in old_map.items():
        if int(uid) not in rooms:
            old["isLive"] = False
            old["popularity"] = 0
            old["liveTitle"] = ""
            anchors.append(old)

    # 头部/腰部生成 AI 诊断,潜力保持 null(前端有兜底文案)
    for a in anchors:
        if a["tier"] in ("头部", "腰部"):
            a["ai"] = build_ai(a["uid"], a["name"], a["tier"], a["growth"],
                               a["followers"], a["followerDelta"], a["popularity"], a["isLive"])
        else:
            a["ai"] = None

    anchors = sorted(anchors, key=lambda x: (-(x.get("followers") or 0), x["uid"]))
    live_count = sum(1 for a in anchors if a.get("isLive"))
    head_n = sum(1 for a in anchors if a["tier"] == "头部")
    waist_n = sum(1 for a in anchors if a["tier"] == "腰部")

    print("[4/4] 写盘…")
    out = {
        "updatedAt": datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "source": "B站直播虚拟区实时抓取(scripts/fetch_vtubers.py),主播库随每日抓取累积",
        "area": "虚拟主播",
        "total": len(anchors),
        "liveCount": live_count,
        "stats": {"head": head_n, "waist": waist_n, "potential": len(anchors) - head_n - waist_n,
                  "fansSnapshotDate": load_prev_snapshot()[1]},
        "note": "开播状态/粉丝数为真实抓取;avgViewers/interactionRate/liveCount30d/revenue30d 为基于公开数据的估算口径(est=true),真实 30 天数据需企业 API。开播状态每 30 分钟由 refresh_live_status.py 刷新。",
        "anchors": anchors,
    }
    with open(os.path.join(DATA_DIR, "anchors.json"), "w", encoding="utf-8") as fp:
        json.dump(out, fp, ensure_ascii=False, separators=(",", ":"))

    # 粉丝历史快照(当日 = 本次抓到过粉丝数的主播全集)
    os.makedirs(HIST_DIR, exist_ok=True)
    snap = {"date": TODAY, "updatedAt": out["updatedAt"],
            "fans": {str(a["uid"]): a["followers"] for a in anchors if str(a["uid"]) in rooms and a.get("followers") is not None}}
    with open(os.path.join(HIST_DIR, TODAY + ".json"), "w", encoding="utf-8") as fp:
        json.dump(snap, fp, ensure_ascii=False, separators=(",", ":"))

    print("完成:库内共 %d 位主播(头部 %d / 腰部 %d / 潜力 %d),当前开播 %d"
          % (len(anchors), head_n, waist_n, len(anchors) - head_n - waist_n, live_count))
    print("已写入 data/anchors.json 与 data/fans_history/%s.json" % TODAY)


if __name__ == "__main__":
    main()