#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
refresh_live_status.py · 开播状态高频刷新(零依赖,仅标准库)
只抓虚拟区当前开播列表(约 60 个请求,不抓粉丝数),把 anchors.json 中
每位主播的 isLive / popularity / liveTitle / área 更新到最新快照:
- 在当日开播列表中的 → isLive=true,刷新人气/标题
- 不在列表中的 → isLive=false
供「开播监控」页面在刷新时重新判断主播是否还在直播。
运行:python3 scripts/refresh_live_status.py
"""
import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
TODAY = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HEADERS = {"User-Agent": UA, "Referer": "https://live.bilibili.com/"}
PAGE_SIZE = 50
SORT_TYPE = "online"


def get_json(url, timeout=10, tries=3):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception as e:  # noqa
            last = e
            time.sleep(0.5 * (i + 1))
    raise last


def fetch_online(max_pages=80):
    """抓当前开播列表 → {uid: {roomId,name,title,popularity,area}}"""
    online = {}
    for page in range(1, max_pages + 1):
        url = ("https://api.live.bilibili.com/room/v3/area/getRoomList?"
               "platform=web&parent_area_id=9&page=%d&page_size=%d&sort_type=%s"
               % (page, PAGE_SIZE, SORT_TYPE))
        try:
            j = get_json(url)
        except Exception as e:
            print("  [warn] 第 %d 页失败:%s" % (page, e))
            break
        lst = ((j.get("data") or {}).get("list")) or []
        if not lst:
            break
        for it in lst:
            uid = it.get("uid")
            if not uid:
                continue
            online[uid] = {
                "uid": uid,
                "name": it.get("uname") or "",
                "roomId": it.get("roomid"),
                "isLive": True,
                "liveTitle": (it.get("title") or "")[:60],
                "popularity": it.get("online") or 0,
                "area": it.get("area_v2_name") or it.get("parent_name") or "虚拟主播",
            }
        if len(lst) < PAGE_SIZE:
            break
        time.sleep(0.25)
    return online


def main():
    path = os.path.join(DATA_DIR, "anchors.json")
    if not os.path.exists(path):
        print("data/anchors.json 不存在,请先运行 fetch_vtubers.py")
        sys.exit(1)
    print("[1/2] 抓取当前开播列表…")
    online = fetch_online()
    if not online:
        print("开播列表为空或抓取失败,停止刷新(保留旧状态)")
        sys.exit(1)

    with open(path, "r", encoding="utf-8") as fp:
        data = json.load(fp)
    anchors = data.get("anchors") or []

    live_now = 0
    for a in anchors:
        cur = online.get(a.get("uid"))
        if cur:
            a["isLive"] = True
            a["liveTitle"] = cur["liveTitle"]
            a["popularity"] = cur["popularity"]
            a["area"] = cur["area"]
            live_now += 1
        else:
            a["isLive"] = False
            a["popularity"] = 0
            a["liveTitle"] = ""

    data["liveCount"] = live_now
    data["updatedAt"] = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%dT%H:%M:%S+08:00")
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, separators=(",", ":"))

    print("[2/2] 完成:库内 %d 位,当前开播 %d,快照时间 %s" % (len(anchors), live_now, data["updatedAt"]))


if __name__ == "__main__":
    main()