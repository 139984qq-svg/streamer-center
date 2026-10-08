/* ============================================================
   pages/monitor.js · 开播监控(独立页面)
   数据来源:data/anchors.json(每日全量抓取累积的全站 VTuber 库,
             开播状态由 refresh_live_status.py 每 30 分钟刷新)
   能力:全站主播列表 / 正在开播·未开播标签区分 / 进入直播间跳转
        刷新页面(或点击刷新)重新判断主播是否还在开播,下播后按钮失效
   对应 JD 职责:品类实时监控与主播动态追踪
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;
  const toast = A.toast;

  const S = {
    list: [], remote: null, loading: false, box: null,
    status: "all",     // all | live | off
    tier: "all",
    query: "",
    page: 1,
    pageSize: 60,
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  async function load() {
    S.loading = true;
    const remote = await window.Store.anchors(); // no-store,刷新页面即重新拉取最新快照
    S.remote = remote;
    S.list = remote && remote.anchors ? remote.anchors : [];
    S.loading = false;
  }

  // ---------- 筛选 ----------
  function filtered() {
    let arr = S.list.slice();
    if (S.status === "live") arr = arr.filter(a => a.isLive);
    if (S.status === "off") arr = arr.filter(a => !a.isLive);
    if (S.tier !== "all") arr = arr.filter(a => a.tier === S.tier);
    if (S.query) {
      const q = S.query.toLowerCase();
      arr = arr.filter(a => (a.name || "").toLowerCase().includes(q) || String(a.uid).includes(q));
    }
    // 默认排序:开播优先(人气降序),其后按粉丝数
    arr.sort((a, b) => {
      if (!!a.isLive !== !!b.isLive) return a.isLive ? -1 : 1;
      if (a.isLive) return (b.popularity || 0) - (a.popularity || 0);
      return (b.followers || 0) - (a.followers || 0);
    });
    return arr;
  }

  // ---------- 渲染 ----------
  function render(box) {
    S.box = box;
    box.innerHTML = "";
    const note = A.el("div", "ai-note", "AI Agent · 开播监控(对应 JD:实时动态追踪。状态快照每 30 分钟更新,刷新页面即可重新判断主播是否还在开播)");
    note.style.marginBottom = "var(--space-3)";
    box.appendChild(note);

    const stats = A.el("div", "stat-grid");
    box.appendChild(stats);

    const bar = A.el("div", "card");
    bar.style.padding = "var(--space-3)";
    bar.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center">
        <input id="monSearch" type="search" placeholder="搜索主播名 / UID" style="flex:1;min-width:160px;padding:8px 14px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
        <select id="monStatus" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          <option value="all">全部状态</option>
          <option value="live">正在开播</option>
          <option value="off">未开播</option>
        </select>
        <select id="monTier" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          <option value="all">全部分层</option>
          <option value="头部">头部</option>
          <option value="腰部">腰部</option>
          <option value="潜力">潜力</option>
        </select>
        <button class="btn btn-secondary" id="monRefresh">⟳ 刷新状态</button>
      </div>
    `;
    box.appendChild(bar);

    // 图例
    const legend = A.el("div", "caption");
    legend.style.cssText = "margin-top:var(--space-2);display:flex;gap:var(--space-3);flex-wrap:wrap";
    legend.innerHTML = `
      <span><span class="live-dot" style="background:#ff4d6d"></span> 正在开播:可点击进入直播间</span>
      <span><span class="live-dot" style="background:var(--color-text-tertiary)"></span> 未开播:按钮失效(刷新页面可重新判断)</span>
    `;
    box.appendChild(legend);

    const grid = A.el("div", "mon-grid");
    box.appendChild(grid);
    const pager = A.el("div");
    pager.style.cssText = "display:flex;justify-content:center;gap:var(--space-2);margin-top:var(--space-4);align-items:center";
    box.appendChild(pager);

    S.grid = grid; S.pager = pager;

    A.qs("#monSearch", box).addEventListener("input", (e) => { S.query = e.target.value.trim(); S.page = 1; draw(); });
    A.qs("#monStatus", box).addEventListener("change", (e) => { S.status = e.target.value; S.page = 1; draw(); });
    A.qs("#monTier", box).addEventListener("change", (e) => { S.tier = e.target.value; S.page = 1; draw(); });
    A.qs("#monRefresh", box).addEventListener("click", async () => {
      toast("正在重新拉取最新开播快照…");
      await load();
      drawStats(stats);
      draw();
      toast("状态已按最新快照更新");
    });

    load().then(() => { drawStats(stats); draw(); });
  }

  function fmtStamp() {
    const up = S.remote && S.remote.updatedAt ? new Date(String(S.remote.updatedAt).replace("+00:00", "Z")) : null;
    return up ? up.toLocaleString("zh-CN", { hour12: false }) : "—";
  }

  function drawStats(stats) {
    const n = S.list.length;
    const live = S.list.filter(a => a.isLive).length;
    const off = n - live;
    const cards = [
      ["库内主播", A.fmt(n) + " 位", "每日抓取累积的全站 VTuber"],
      ["正在开播", A.fmt(live) + " 场", "实时人气可查,可一键进直播间"],
      ["未开播", A.fmt(off) + " 位", "进入按钮已禁用"],
      ["快照时间", fmtStamp(), "每 30 分钟自动刷新"],
    ];
    stats.innerHTML = cards.map(([l, v, d]) => `
      <div class="card stat-card"><div class="stat-label">${l}</div><div class="stat-value">${v}</div><div class="stat-delta caption">${d}</div></div>
    `).join("");
  }

  function draw() {
    if (!S.grid || !S.pager) return;
    const arr = filtered();
    const totalPages = Math.max(1, Math.ceil(arr.length / S.pageSize));
    if (S.page > totalPages) S.page = totalPages;
    const start = (S.page - 1) * S.pageSize;
    const pageArr = arr.slice(start, start + S.pageSize);

    if (!pageArr.length) {
      S.grid.innerHTML = `<div class="empty card" style="grid-column:1/-1"><div style="font-size:34px;opacity:.4">📡</div><div class="empty-title">没有匹配的主播</div><p class="caption">尝试清空筛选条件。</p></div>`;
      S.pager.innerHTML = "";
      return;
    }

    S.grid.innerHTML = pageArr.map(cardHTML).join("");
    S.grid.querySelectorAll("[data-room]").forEach(b => b.addEventListener("click", () => {
      const roomId = b.dataset.room;
      if (b.hasAttribute("disabled")) { toast("主播未开播,直播间入口暂不可用"); return; }
      window.open("https://live.bilibili.com/" + roomId, "_blank", "noopener");
    }));

    S.pager.innerHTML = `
      <button class="btn btn-secondary" id="monPrev" ${S.page <= 1 ? "disabled" : ""} style="padding:5px 14px">‹ 上一页</button>
      <span class="caption">第 ${S.page} / ${totalPages} 页 · 共 ${arr.length} 位</span>
      <button class="btn btn-secondary" id="monNext" ${S.page >= totalPages ? "disabled" : ""} style="padding:5px 14px">下一页 ›</button>
    `;
    A.qs("#monPrev", S.pager).addEventListener("click", () => { S.page--; draw(); S.box.scrollIntoView({ behavior: "smooth" }); });
    A.qs("#monNext", S.pager).addEventListener("click", () => { S.page++; draw(); S.box.scrollIntoView({ behavior: "smooth" }); });
  }

  function cardHTML(a) {
    const isLive = !!a.isLive;
    const statusTag = isLive
      ? `<span class="tag" style="background:#ff4d6d;color:#fff;font-weight:600">● 正在开播</span>`
      : `<span class="tag" style="background:var(--color-bg-subtle);color:var(--color-text-tertiary)">○ 未开播</span>`;
    const tierTag = a.tier === "潜力"
      ? '<span class="tag tag-b">' + a.tier + "</span>"
      : '<span class="tag">' + a.tier + "</span>";
    const btn = isLive
      ? `<button class="btn" data-room="${esc(a.roomId)}" style="padding:6px 16px;font-size:13px;width:100%">▶ 进入直播间</button>`
      : `<button class="btn" disabled data-room="${esc(a.roomId)}" style="padding:6px 16px;font-size:13px;width:100%;background:var(--color-bg-subtle);color:var(--color-text-tertiary)">未开播</button>`;
    return `
      <div class="card" style="padding:var(--space-3);display:flex;flex-direction:column;gap:var(--space-2)">
        <div style="display:flex;justify-content:space-between;gap:var(--space-1);flex-wrap:wrap">
          <b style="font-size:15px">${esc(a.name)}</b>
          ${statusTag}
        </div>
        <div class="caption" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:var(--space-1)">
          <span>uid ${esc(a.uid)}</span>
          <span>${esc(a.area || "虚拟主播")}</span>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center">
          <span class="caption">粉丝 ${A.fmt(a.followers)}</span>
          ${isLive ? `<span class="caption" style="color:#ff4d6d;font-weight:600">人气 ${A.fmt(a.popularity)}</span>` : ""}
          ${tierTag}
        </div>
        ${isLive ? `<div class="caption" style="line-height:1.5">${esc(a.liveTitle || "") || "直播标题未收录"}</div>` : ""}
        <div style="margin-top:auto">${btn}</div>
      </div>`;
  }

  // ---------- 注册 ----------
  window.Pages = window.Pages || {};
  window.Pages.monitor = { render };
})();