/* ============================================================
   pages/anchors.js · 主播中心
   数据来源:data/anchors.json(定时任务抓取全网 VTuber 全量数据)
   能力:分层可视化 / 筛选排序 / AI 智能诊断
   (Excel 导入与分析报告 → 独立模块 pages/analysis.js)
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;
  const toast = A.toast;

  const S = {
    list: [],
    remote: null,        // data/anchors.json 原始响应(含 updatedAt)
    loaded: false,
    query: "",
    tier: "all",
    sortBy: "followers",
    sortDir: "desc",
    activeUid: null,
    box: null,           // 页面容器引用(render 时写入)
  };

  const TIER_ORDER = { "头部": 0, "腰部": 1, "潜力": 2 };
  const SORT_OPTS = [
    ["followers", "粉丝数"], ["followerDelta", "涨粉数"],
    ["interactionRate", "互动率"], ["revenue30d", "30天营收"],
    ["liveCount30d", "30天开播"],
  ];

  // ---------- 数据 ----------
  async function load() {
    const remote = await window.Store.anchors();
    S.remote = remote;
    S.list = remote && remote.anchors ? remote.anchors : [];
    S.loaded = true;
  }

  // ---------- 渲染 ----------
  function render(box) {
    S.box = box;
    box.innerHTML = "";
    const wrap = A.el("div", "");

    // 状态区:数据源 + 更新时间
    const src = A.el("p", "caption", "加载数据中…");
    wrap.appendChild(src);

    // 统计卡片
    const stats = A.el("div", "stat-grid");
    wrap.appendChild(stats);

    // 工具条
    const bar = A.el("div", "card", "");
    bar.style.padding = "var(--space-3)";
    bar.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center">
        <input id="anchSearch" type="search" placeholder="搜索主播名 / UID" style="flex:1;min-width:180px;padding:8px 14px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
        <select id="anchTier" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          <option value="all">全部分层</option>
          <option value="头部">头部</option>
          <option value="腰部">腰部</option>
          <option value="潜力">潜力</option>
        </select>
        <select id="anchSort" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          ${SORT_OPTS.map(([k, l]) => `<option value="${k}" ${k === S.sortBy ? "selected" : ""}>按${l}</option>`).join("")}
        </select>
      </div>
    `;
    wrap.appendChild(bar);

    // 表格容器
    const boxWrap = A.el("div");
    wrap.appendChild(boxWrap);

    box.appendChild(wrap);

    // 事件(委托到容器,表头行后续由 draw 子渲染)
    A.qs("#anchSearch", bar).addEventListener("input", (e) => { S.query = e.target.value.trim(); draw(); });
    A.qs("#anchTier", bar).addEventListener("change", (e) => { S.tier = e.target.value; draw(); });
    A.qs("#anchSort", bar).addEventListener("change", (e) => { S.sortBy = e.target.value; draw(); });
    // 抽屉/诊断按钮:document 级委托,仅注册一次,幂等查询
    if (!window.__vtDiagBound) {
      document.addEventListener("click", onTableClick);
      window.__vtDiagBound = true;
    }

    load().then(() => {
      src.textContent = sourceText();
      drawStats(stats);
      draw();
    }).catch(() => {
      src.textContent = "数据加载失败,请检查 data/anchors.json";
      drawEmpty(boxWrap, "数据加载失败", "请确认 data 目录已由定时任务生成数据文件。");
    });

    // 抽屉容器(全局唯一)
    if (!A.qs("#diagnoseDrawer")) document.body.appendChild(buildDrawer());
  }

  function sourceText() {
    const n = S.list.length;
    const up = S.remote && S.remote.updatedAt ? new Date(String(S.remote.updatedAt).replace("+00:00", "Z")) : null;
    const live = S.remote && S.remote.liveCount != null ? ` · 当前开播 ${S.remote.liveCount} 场` : "";
    const area = S.remote && S.remote.area ? ` · ${S.remote.area}` : "";
    return "数据来源:全网抓取(B站虚拟区)" + area + " · " + n + " 位主播" +
      (up ? " · 更新于 " + up.toLocaleString("zh-CN") : "") + live;
  }

  // ---------- 统计 ----------
  function drawStats(stats) {
    const n = S.list.length;
    const top = n ? S.list.reduce((a, b) => (a.followerDelta > b.followerDelta ? a : b)) : null;
    const avgInter = n ? (S.list.reduce((s, a) => s + (a.interactionRate || 0), 0) / n) : 0;
    const liveNow = S.list.filter(a => a.isLive).length;
    const cards = [
      ["主播总数(库内)", A.fmt(n), "抓取自 B站虚拟区直播间列表"],
      ["当前开播", A.fmt(liveNow), (S.remote && S.remote.liveCount != null) ? "全网虚拟区即时开播" : "开播状态快照"],
      ["涨粉 TOP", top ? top.name : "-", top ? "+" + A.fmt(top.followerDelta) : ""],
      ["平均互动率", (avgInter * 100).toFixed(1) + "%", "品类均值约 45%"],
    ];
    stats.innerHTML = cards.map(([l, v, d]) => `
      <div class="card stat-card">
        <div class="stat-label">${l}</div>
        <div class="stat-value">${v}</div>
        <div class="stat-delta caption">${d}</div>
      </div>
    `).join("");
  }

  // ---------- 表格 ----------
  function filtered() {
    let arr = S.list.slice();
    if (S.tier !== "all") arr = arr.filter(a => a.tier === S.tier);
    if (S.query) {
      const q = S.query.toLowerCase();
      arr = arr.filter(a => a.name.toLowerCase().includes(q) || String(a.uid).includes(q));
    }
    arr.sort((a, b) => {
      const va = a[S.sortBy] ?? 0, vb = b[S.sortBy] ?? 0;
      return S.sortDir === "desc" ? vb - va : va - vb;
    });
    return arr;
  }

  function draw() {
    const boxWrap = S.box;
    const arr = filtered();
    const holder = boxWrap.querySelector("#anchTableBox") || rebuildTableBox(boxWrap);
    if (!arr.length) { drawEmpty(holder, "没有匹配的主播", "尝试清空筛选条件,等待每日定时任务刷新全网数据。"); return; }
    holder.innerHTML = `
      <div class="table-wrap">
        <table class="plain">
          <thead><tr>
            <th>主播</th><th>今日开播</th><th>分层</th><th>粉丝数</th><th>涨粉</th><th>互动率</th>
            <th>30天开播</th><th>30天营收</th><th>趋势</th><th>操作</th>
          </tr></thead>
          <tbody>
            ${arr.map(row).join("")}
          </tbody>
        </table>
      </div>
      <p class="caption" style="margin-top:8px">共 ${arr.length} 位(已按${sortLabel()} ${S.sortDir === "desc" ? "降序" : "升序"})${S.tier !== "all" ? " · 分层=" + S.tier : ""}${S.query ? " · 搜索=" + S.query : ""}</p>
    `;
  }

  function sortLabel() {
    const o = SORT_OPTS.find(([k]) => k === S.sortBy);
    return o ? o[1] : S.sortBy;
  }

  function rebuildTableBox(boxWrap) {
    let holder = A.qs("#anchTableBox", boxWrap);
    if (!holder) { holder = A.el("div"); holder.id = "anchTableBox"; boxWrap.appendChild(holder); }
    return holder;
  }

  function row(a) {
    const g = a.growth === "up" ? '<span class="up">↑</span>'
      : a.growth === "down" ? '<span class="down">↓</span>' : "→";
    const tag = a.tier === "潜力"
      ? '<span class="tag tag-b">' + a.tier + "</span>"
      : '<span class="tag">' + a.tier + "</span>";
    const live = a.isLive
      ? `<span class="tag" style="background:#ff4d6d;color:#fff">LIVE ${A.fmt(a.popularity)}人气</span>`
      : '<span class="caption">未开播</span>';
    return `
      <tr>
        <td><b>${a.name}</b><div class="caption">uid ${a.uid}</div></td>
        <td>${live}</td>
        <td>${tag}</td>
        <td>${A.fmt(a.followers)}</td>
        <td class="${a.followerDelta >= 0 ? "up" : "down"}">${a.followerDelta >= 0 ? "+" : ""}${A.fmt(a.followerDelta)}</td>
        <td>${((a.interactionRate || 0) * 100).toFixed(1)}%</td>
        <td>${A.fmt(a.liveCount30d)} 场</td>
        <td>¥${A.fmt(a.revenue30d)}</td>
        <td>${g}</td>
        <td><button class="btn btn-secondary" data-uid="${a.uid}" data-act="diag" style="padding:4px 12px;font-size:13px">AI 诊断</button></td>
      </tr>
    `;
  }

  function drawEmpty(holder, title, note) {
    holder.innerHTML = `
      <div class="empty card">
        <div style="font-size:34px;opacity:.4">👤</div>
        <div class="empty-title">${title}</div>
        <p>${note}</p>
      </div>
    `;
  }

  function onTableClick(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const uid = Number(btn.dataset.uid);
    const a = S.list.find(x => x.uid === uid);
    if (a) openDiag(a);
  }

  // ---------- AI 诊断抽屉 ----------
  function buildDrawer() {
    const d = A.el("aside", "");
    d.id = "diagnoseDrawer";
    d.style.cssText = `
      position:fixed; top:0; right:-460px; width:min(440px,94vw); height:100vh;
      background:var(--color-bg); border-left:1px solid var(--color-border);
      box-shadow:var(--shadow-lg); z-index:60; display:flex; flex-direction:column;
      transition:right .3s ease-out;
    `;
    return d;
  }

  function openDiag(a) {
    const d = A.qs("#diagnoseDrawer");
    const ai = a.ai || {};
    document.body.style.overflow = "hidden";
    d.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);border-bottom:1px solid var(--color-border)">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--color-accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600">${a.name[0]}</div>
          <div>
            <b style="font-size:16px">${a.name}</b>
            <div class="caption">uid ${a.uid} ${a.tags ? "· " + a.tags.join(" / ") : ""}</div>
          </div>
        </div>
        <button class="icon-btn" data-close style="font-size:18px">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)">
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
          <span class="tag tag-b">${a.tier}主播</span>
          ${a.growth === "up" ? '<span class="tag" style="color:var(--color-success)">上升期</span>' : a.growth === "down" ? '<span class="tag" style="color:var(--color-danger)">预警期</span>' : '<span class="tag">平稳期</span>'}
          <span class="ai-note">AI 诊断</span>
        </div>
        ${ai.summary ? `
        <div style="font-size:15px;line-height:1.7;border-left:3px solid var(--color-accent);padding-left:12px">${ai.summary}</div>` : `<div class="caption" style="padding:12px;background:var(--color-bg-subtle);border-radius:var(--radius-md)">暂无 AI 诊断——每日定时任务将调用大模型自动生成。</div>`}
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2)">
          ${m("粉丝数", A.fmt(a.followers))}
          ${m("30天涨粉", (a.followerDelta >= 0 ? "+" : "") + A.fmt(a.followerDelta), a.followerDelta >= 0 ? "up" : "down")}
          ${m("当前状态", a.isLive ? "● 直播中" : "未开播", a.isLive ? "up" : "")}
          ${m("平均互动率", (a.interactionRate * 100).toFixed(1) + "%", a.interactionRate >= 0.45 ? "up" : "")}
          ${m("30天营收", "¥" + A.fmt(a.revenue30d))}
        </div>
        ${ai.risks ? `
        <div>
          <b style="font-size:14px;color:var(--color-danger)">风险提示</b>
          <p style="font-size:14px;color:var(--color-text-secondary);margin-top:4px">${ai.risks}</p>
        </div>` : ""}
        ${(ai.suggestions && ai.suggestions.length) ? `
        <div>
          <b style="font-size:14px">AI 运营建议</b>
          <ol style="margin:8px 0 0 20px;font-size:14px;color:var(--color-text-secondary);display:flex;flex-direction:column;gap:6px">
            ${ai.suggestions.map(x => `<li>${x}</li>`).join("")}
          </ol>
        </div>` : ""}
      </div>
      <div style="padding:var(--space-3) var(--space-4);border-top:1px solid var(--color-border);display:flex;gap:var(--space-2)">
        <button class="btn" style="flex:1" data-act="goto-analysis">去「数据导入与分析」生成报告</button>
        <button class="btn btn-secondary" data-close>关闭</button>
      </div>
    `;
    requestAnimationFrame(() => { d.style.right = "0px"; });
    d.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeDiag));
    A.qs("[data-act=goto-analysis]", d).addEventListener("click", () => {
      closeDiag();
      window.location.hash = "#/analysis";
    });
  }

  function m(label, val, cls) {
    return `
      <div style="background:var(--color-bg-subtle);border-radius:var(--radius-md);padding:10px 12px">
        <div class="caption">${label}</div>
        <div class="${cls === "up" ? "up" : cls === "down" ? "down" : ""}" style="font-size:16px;font-weight:600;margin-top:2px">${val}</div>
      </div>`;
  }

  function closeDiag() {
    const d = A.qs("#diagnoseDrawer");
    d.style.right = "-460px";
    document.body.style.overflow = "";
    setTimeout(() => { d.innerHTML = ""; }, 320);
  }

  // ---------- 注册 ----------
  window.Pages = window.Pages || {};
  window.Pages.anchors = { render };
})();