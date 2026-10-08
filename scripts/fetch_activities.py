#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_activities.py · 每日抓取 B站官方活动列表,并筛选 VTuber 相关活动
- 数据源:B站活动列表接口 api.bilibili.com/x/activity/page/list
  (活动列表页 blackboard/activity-list.html 所加载的接口,已实测可用,无需登录)
  mold=0 活动 / mold=1 话题专题,各抓前 N 页取最新
- 过滤规则(两档):
  强特征词(虚拟/Vtuber/虚拟主播/live2d/皮套/中之人 等)+ 通过排除词 → 必留;
  直播演出企划特征词(歌会/演出/音乐节/企划/联动/生日/3D 等)+ 通过排除词 → 保留补足;
  命中硬排除词(游戏/影视/动漫/综艺/IP)或标题过短 → 剔除;
  纯激励/创作征集类标题(无直播演出特征) → 剔除。
- 输出:data/activities.json,结构保持不变:{updatedAt, source, count, activities:[{title,url,status,stime,etime}]}
  与旧库合并:旧条目若仍在最新列表则更新状态;连载中的旧 VTuber 活动保留兜底。
运行:python3 scripts/fetch_activities.py
"""
import json
import os
import time
import urllib.request
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
NOW = datetime.now(timezone(timedelta(hours=8)))
TZ = "+08:00"

API = "https://api.bilibili.com/x/activity/page/list"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
REFER = "https://www.bilibili.com/blackboard/activity-list.html"

# 强特征词:命中且通过排除词 → 必留
STRONG = ["虚拟主播", "虚拟区", "虚拟up", "虚拟偶像", "虚拟歌手", "虚拟歌姬", "虚拟人", "虚拟", "vtuber",
          "Vtuber", "vtb", "VTB", "vup", "VUP", "皮套", "中之人", "生放送", "虚拟酱", "虚拟演出",
          "虚拟演唱会", "虚拟音乐节", "虚拟嘉年华", "live2d", "Live2D", "歌回", "虚拟秀"]
# 直播/演出/企划特征词:命中且通过排除词 → 保留(补足数量)
WEAK = ["歌会", "演唱会", "音乐节", "小剧场", "舞台", "音声", "3D", "3d", "出道", "生日会", "联动直播",
        "嘉年华", "盛典", "星探", "次元", "企划", "演出", "虚拟节目", "夏日祭", "电音"]
# 泛类型排除词:标题为纯激励/创作征集类(无直播演出特征)时命中即剔除
EXCL_HARD = ["大赛", "招募", "征集", "激励", "创作者", "有奖", "周年", "十周年"]

# 硬排除词表:命中即剔除(游戏/影视/动漫/综艺/IP/泛内容)
HARD = [
    "王者", "原神", "火影", "蛋仔", "NBA", "APEX", "第五人格", "洛克王国", "阴阳师", "光遇",
    "二重螺旋", "星布谷地", "无限大", "遗忘之海", "诡秘", "魔法少女小圆", "RE0", "星塔旅人", "幻塔",
    "和平精英", "金铲铲", "无畏契约", "鸣潮", "崩坏", "星穹", "明日方舟", "碧蓝航线", "战舰", "卡拉彼丘",
    "尘白禁区", "剑网3", "FF14", "无尽冬日", "归环", "无名之汐", "三角洲", "世界之外", "恋与", "光与夜",
    "代号鸢", "未定", "深空之眼", "晶核", "胜利女神", "PUBG", "荒野乱斗", "CFM", "明日之后", "一梦江湖",
    "少女前线", "头号玩家", "P5X", "穿越火线", "逆水寒", "三谋", "CODM", "英雄联盟", "炉石", "魔兽",
    "DNF", "FGO", "永劫", "七日世界", "重返未来", "燕云十六声", "战地", "彩虹六号", "豪吃", "手游", "电竞",
    "迪士尼", "猩球崛起", "蝙蝠侠", "复仇者", "高达", "CLANNAD", "夏日大作战", "国创", "新番", "动漫",
    "动画", "电影", "电视剧", "综艺", "老飞宇", "笑点", "诺贝尔", "格致", "泽野", "CLAMP", "哥伦比亚",
    "Bob Marley", "大会员", "翻唱", "春晚", "春意红包", "CNY", "California", "入海", "千星绪", "舞台剧",
    "话剧", "相声", "脱口秀", "读书", "书法", "手工", "美食", "穿搭", "旅行", "数码", "汽车", "日语",
    "考研", "教师", "公益", "非遗", "汉服", "国风", "健美", "健身", "户外", "摩托", "钢琴", "乐器",
    "绘画", "摄影", "轻舞蹈", "健康", "喜力", "星银", "上B站看演出", "好片",
    "片单", "种草", "优酷", "爱奇艺", "腾讯视频", "芒果", "小说", "漫画", "cos", "C服", "模玩", "手办",
    "披荆斩棘", "攀登", "星战", "戒烟", "戒酒",
    # —— 补充泛二次元/非 VTuber 活动 ——
    "鬼畜", "宅舞", "舞蹈", "专辑", "KING SUPER", "红白歌会", "纪念", "特辑", "同人绘", "Bonly",
    "ONLY", "扮演", "任意妆", "LoveLive", "星探", "毕业", "开学", "校园", "翻跳", "cover", "Cover",
    "模仿秀", "配音", "广播剧", "小说推书", "安利", "影视飓风", "自媒", "圈子",
    "乐队", "致郁", "悬疑", "搞笑", "情感", "职场", "相亲", "恋爱", "脱口show", "综艺",
    "挑战赛", "奖学金", "新番导视", "导视", "实机", "试玩", "前瞻", "发布会", "线下",
    "同人会", "宅", "漫展", "毛绒", "谷子", "徽章", "立牌", "海报", "日历",
    # —— 实例排除:乙女游戏生日/影视联动/泛二次元综艺 ——
    "顾时夜", "易遇", "沈星回", "夏以昼", "黎深", "生贺", "生日活动企划", "异世界", "音乐节二创",
    "爸妈来自二次元", "二次元副本", "白蛇", "哪吒", "灵笼", "翻唱大赛", "金曲",
]

PAGE_SIZE = 15
MAX_PAGES_MOLD0 = 100  # 活动:最多 100 页(1500 条)
MAX_PAGES_MOLD1 = 50   # 话题:最多 50 页(750 条)
KEEP_ETIME_DAYS = 400  # 已结束活动距今超过该天数 → 剔除(保留近一年虚拟活动作为轮转素材)


def get_json(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Referer": REFER, "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_mold(mold, max_pages):
    """抓取某个 mold 的前 max_pages 页活动,返回原始条目列表(调用失败静默跳过)"""
    out = []
    for pn in range(1, max_pages + 1):
        url = "%s?plat=1,3&mold=%d&http=3&ps=%d&pn=%d" % (API, mold, PAGE_SIZE, pn)
        try:
            d = get_json(url)
        except Exception:
            time.sleep(1)
            continue
        if d.get("code") != 0:
            break
        items = (d.get("data") or {}).get("list") or []
        if not items:
            break
        out.extend(items)
        time.sleep(0.4)
    return out


def is_vtuber(title, etime=0):
    """标题是否 VTuber / 虚拟直播演出相关
    etime:活动结束时间(unix),过期超过 KEEP_ETIME_DAYS 的历史活动剔除"""
    if not title or len(title) < 4:
        return False
    # 已结束且过期太久的历史活动剔除(避免堆积 2021-2024 的旧活动)
    try:
        et = int(etime)
        if 0 < et < time.time() - KEEP_ETIME_DAYS * 86400:
            return False
    except Exception:
        pass
    low = title.lower()
    strong = any(w in low for w in STRONG)
    weak = any(w in low for w in WEAK)
    # 命中硬排除词(游戏/影视/泛内容)→ 剔除
    for w in HARD:
        if w in title:
            return False
    # 命中泛类型词(激励/征集/周年等)且非强特征 → 剔除
    if any(w in title for w in EXCL_HARD) and not strong:
        return False
    return strong or weak


def norm_url(u):
    """补全协议链接,仅保留可落地访问的【活动详情页】(剔除列表页/主页等)"""
    if not u:
        return ""
    u = u.strip()
    if u.startswith("//"):
        u = "https:" + u
    if not u.startswith("http"):
        return ""
    # 列表页特征 → 剔除(activity-list.html / topic 列表 / 频道页)
    if "activity-list" in u or "/topic/list" in u or "/topic/index" in u or "/v/channel" in u:
        return ""
    # 仅接受活动详情页:blackboard/era 或 blackboard/topic 的具体活动落地页
    if "/blackboard/era/" in u or "/blackboard/topic/" in u:
        return u
    return ""


def parse_ts(ts):
    try:
        return datetime.fromtimestamp(int(ts), tz=timezone(timedelta(hours=8))).strftime("%Y-%m-%d")
    except Exception:
        return ""


def status_of(etime):
    """按结束时间判断状态:已结束 / 进行中(etime 缺失或为 0 视为进行中)"""
    try:
        if int(etime) <= 0:
            return "进行中"
        if int(etime) < time.time():
            return "已结束"
        return "进行中"
    except Exception:
        return "进行中"


def main():
    print("[%s] 开始抓取 B站活动列表(VTuber 过滤)..." % NOW.strftime("%H:%M:%S"))
    raw = []
    print(" - mold=0 活动...")
    raw += fetch_mold(0, MAX_PAGES_MOLD0)
    print(" - mold=1 话题...")
    raw += fetch_mold(1, MAX_PAGES_MOLD1)
    print(" 共抓取原始条目 %d 条" % len(raw))

    seen = {}
    new_list = []
    for it in raw:
        title = (it.get("name") or "").strip()
        url = norm_url(it.get("pc_url"))
        if not title or not url or url in seen:
            continue
        seen[url] = 1
        new_list.append({
            "title": title,
            "url": url,
            "status": status_of(it.get("etime")),
            "stime": parse_ts(it.get("stime")),
            "etime": parse_ts(it.get("etime")),
            "etime_ts": it.get("etime") or 0,
        })

    vtuber = [a for a in new_list if is_vtuber(a["title"], a.get("etime_ts", 0))]
    print(" 去重后 %d 条,其中 VTuber 相关 %d 条" % (len(new_list), len(vtuber)))

    # 与旧库合并:旧库中仍连载且为 VTuber 相关(且不在本次最新抓取内)的条目保留兜底
    old_path = os.path.join(DATA_DIR, "activities.json")
    old = []
    try:
        with open(old_path, "r", encoding="utf-8") as fp:
            old = (json.load(fp).get("activities") or [])
    except Exception:
        pass
    fresh_urls = set(a["url"] for a in new_list)
    merged = list(vtuber)
    seen_url = set(a["url"] for a in merged)
    for o in old:
        if o["url"] in seen_url or o["url"] in fresh_urls:
            continue
        if o.get("status") == "已结束":
            continue
        t = o.get("title") or ""
        if not is_vtuber(t):
            continue
        merged.append(o)
        seen_url.add(o["url"])

    # 排序:进行中在前,按结束时间近到远
    def s_key(a):
        return (0 if a["status"] != "已结束" else 1, a.get("etime") or "")

    merged.sort(key=s_key)
    # 移除内部字段 etime_ts
    for a in merged:
        a.pop("etime_ts", None)
    now_str = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S") + TZ
    doc = {
        "updatedAt": now_str,
        "source": "B站官方活动列表接口(api.bilibili.com/x/activity/page/list,每日自动抓取,VTuber 相关)",
        "count": len(merged),
        "activities": merged,
    }
    with open(old_path, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, indent=2)
    print(" 已写入 %s,共 %d 条 VTuber 活动" % (old_path, len(merged)))
    for a in merged[:30]:
        print("   - %s | %s | 结束:%s" % (a["title"], a["status"], a.get("etime")))


if __name__ == "__main__":
    main()