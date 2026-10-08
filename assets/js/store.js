/* ============================================================
   store.js · 数据层
   画板统一从这里读取数据:优先 /data/*.json(定时任务写入),
   缺失时返回占位/空态,不阻塞页面渲染。
   ============================================================ */
(function () {
  "use strict";

  const Store = {
    /** 抓取 JSON,失败返回 null */
    async fetchJSON(url) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        console.warn("[store] 读取失败:", url, e);
        return null;
      }
    },

    // ---- 各模块数据 ----
    /** 每日指标快照 data/daily.json */
    daily: () => Store.fetchJSON("data/daily.json"),

    /** 主播库 data/anchors.json */
    anchors: () => Store.fetchJSON("data/anchors.json"),

    /** 全网资讯 data/news.json */
    news: () => Store.fetchJSON("data/news.json"),

    /** 内容企划库 data/plans.json */
    plans: () => Store.fetchJSON("data/plans.json"),

    /** 社群分析 data/community.json */
    community: () => Store.fetchJSON("data/community.json"),

    /** 直播复盘 data/reviews.json */
    reviews: () => Store.fetchJSON("data/reviews.json"),

    /** AI 分析结果 data/ai-insights.json */
    insights: () => Store.fetchJSON("data/ai-insights.json"),
  };

  window.Store = Store;
})();