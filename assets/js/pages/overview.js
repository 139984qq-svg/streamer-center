/* ============================================================
   pages/overview.js · 总览(滚动大盘数据看板)
   数据来源:实时聚合 anchors / reviews / news / community / plans
   风格:电商后台式 KPI 大屏:指标带 + 排行榜 + 图表 + 资讯滚动
   对应 JD 职责:全品类运营全景把控(一屏看懂盘子)
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;

  const S = {
    anchors: null, reviews: [], news: [], community: null, plans: [],
    box: null, kpi: null, row1: null, row2: null, row3: null, refreshBtn: null, refreshing: false,
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  // 万/亿 缩写
  function fmtW(n) {
    n = Number(n) || 0;
    if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(2) + " 亿";
    if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(1) + " 万";
    return A.fmt(n);
  }

  function timeStr(t) {
    if (!t) return "";
    const d = new Date(String(t).replace("+00:00", "Z"));
    return isNaN(d) ? String(t) : d.toLocaleString("zh-CN", { hour12: false });
  }

  async function load() {
    const [an, rv, nw, cm, pl] = await Promise.all([
      window.Store.anchors(), window.Store.reviews(), window.Store.news(),
      window.Store.community(), window.Store.plans(),
    ]);
    S.anchors = an;
    S.reviews = rv && rv.reviews ? rv.reviews : [];
    S.news = nw && nw.news ? nw.news : [];
    S.community = cm && cm.topics ? cm.topics : [];
    S.plans = pl && pl.plans ? pl.plans : [];
  }

  // ================= 图表 =================
  function pt(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: (cx + r * Math.cos(rad)).toFixed(2), y: (cy + r * Math.sin(rad)).toFixed(2) };
  }

  function tierDonutHTML() {
    const stats = (S.anchors && S.anchors.stats) || { head: 0, waist: 0, potential: 0 };
    const tiers = [
      { label: "头部", v: stats.head || 0, color: "var(--color-accent)" },
      { label: "腰部", v: stats.waist || 0, color: "var(--color-accent-weak)" },
      { label: "潜力", v: stats.potential || 0, color: "var(--color-border)" },
    ];
    const total = tiers.reduce((s, t) => s + t.v, 0) || 1;
    const C = 100, R = 78, rIn = 50;
    let arcs = "", angle = -90;
    tiers.forEach(t => {
      const f = (t.v || 0) / total;
      if (f <= 0) return;
      const sweep = f * 360;
      const a0 = angle, a1 = angle + sweep;
      const p0 = pt(C, C, R, a0), p1 = pt(C, C, R, a1);
      arcs += `<path d="M ${p0.x} ${p0.y} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${p1.x} ${p1.y} L ${C} ${C} Z" fill="${t.color}"/>`;
      angle = a1;
    });
    const legend = tiers.map(t => `
      <span class="caption" style="display:inline-flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${t.color}"></span>
        ${t.label} · ${A.fmt(t.v)} 位(${Math.round((t.v / total) * 100)}%)
      </span>`).join("");
    return `
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <svg viewBox="0 0 200 200" style="width:150px;height:150px;flex:none" role="img" aria-label="主播分层构成环形图">
          ${arcs}
          <circle cx="${C}" cy="${C}" r="${rIn}" fill="var(--color-bg)"/>
          <text x="${C}" y="${C - 4}" text-anchor="middle" style="font-size:24px;font-weight:700;fill:var(--color-text-primary)">${fmtW(total)}</text>
          <text x="${C}" y="${C + 16}" text-anchor="middle" style="font-size:10px;fill:var(--color-text-tertiary)">库内主播</text>
        </svg>
        <div style="display:flex;flex-direction:column;gap:8px;min-width:140px">${legend}</div>
      </div>`;
  }

  function rankBarsHTML(items, key, label, fmt) {
    if (!items.length) return `<p class="caption">暂无数据</p>`;
    const max = Math.max(...items.map(x => x[key] || 0), 1);
    return `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${items.map((x, i) => `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:13px"><b style="margin-right:6px;color:var(--color-text-tertiary)">${i + 1}</b>${esc(x.name)}</span>
              <span class="caption">${fmt ? fmt(x[key]) : A.fmt(x[key])}${label}</span>
            </div>
            <div class="ov-bar"><div style="width:${Math.max(3, Math.round((x[key] / max) * 100))}%"></div></div>
          </div>`).join("")}
      </div>`;
  }

  function miniTrendHTML() {
    const data = S.reviews.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-14);
    if (!data.length) return `<p class="caption">暂无复盘数据</p>`;
    const W = 520, H = 150, PL = 34, PR = 10, PT = 10, PB = 22;
    const x0 = PL, x1 = W - PR, y0 = PT, y1 = H - PB;
    const n = data.length;
    const xAt = (i) => x0 + (n <= 1 ? 0 : (i * (x1 - x0)) / (n - 1));
    const yAt = (v) => y0 + (y1 - y0) * (1 - v);
    const keys = [["retention", "var(--color-accent)", "留存率"], ["stay3m", "var(--color-success)", "3分钟停留"]];
    let out = "";
    for (let k = 0; k <= 2; k++) {
      const gy = y0 + ((y1 - y0) * k) / 2;
      out += `<line x1="${x0}" y1="${gy}" x2="${x1}" y2="${gy}" stroke="var(--color-border)" stroke-dasharray="3 4"/>`;
    }
    keys.forEach(([key, color]) => {
      const pts = data.map((r, i) => `${xAt(i).toFixed(1)},${yAt(r[key] || 0).toFixed(1)}`);
      out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="2"/>`;
      data.forEach((r, i) => { out += `<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(r[key] || 0).toFixed(1)}" r="2.2" fill="${color}"/>`; });
    });
    return `
      <div class="chart-legend" style="display:flex;gap:14px;margin-bottom:6px">
        ${keys.map(([, c, l]) => `<span class="caption" style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:12px;height:3px;background:${c}"></span>${l}</span>`).join("")}
      </div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="最近14场留存趋势迷你图">
        ${out}
        <text x="${x0}" y="${y1 + 14}" style="font-size:9px;fill:var(--color-text-tertiary)">${esc(data[0].date.slice(5))}</text>
        <text x="${x1}" y="${y1 + 14}" style="font-size:9px;fill:var(--color-text-tertiary)" text-anchor="end">${esc(data[n - 1].date.slice(5))}</text>
      </svg>`;
  }

  function areaBarsHTML() {
    const anchors = (S.anchors && S.anchors.anchors) || [];
    const map = {};
    anchors.forEach(a => {
      if (!a.isLive) return;
      const k = a.area || "其他";
      map[k] = (map[k] || 0) + 1;
    });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return rankBarsHTML(top.map(([name, v]) => ({ name, v })), "v", " 场", A.fmt);
  }

  // ================= 页面 =================
  function render(box) {
    S.box = box;
    box.innerHTML = "";
    // 状态条 + 手动刷新按钮
    const head = A.el("div");
    head.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin-bottom:var(--space-3);flex-wrap:wrap";
    const note = A.el("div", "ai-note", "AI Agent · 运营大盘(对应 JD:全品类直播运营把控,数据每 30 分钟刷新开播状态、每日全量更新)");
    const refreshBtn = A.el("button", "btn btn-secondary", "⟳ 刷新数据");
    refreshBtn.style.padding = "5px 14px";
    refreshBtn.style.fontSize = "13px";
    refreshBtn.style.flex = "none";
    head.appendChild(note);
    head.appendChild(refreshBtn);
    box.appendChild(head);
    S.refreshBtn = refreshBtn;
    refreshBtn.addEventListener("click", manualRefresh);

    // KPI 带
    const kpi = A.el("div", "kpi-grid");
    box.appendChild(kpi);
    S.kpi = kpi;

    // 行 1:人气榜 + 分层/分区
    const row1 = A.el("div", "ov-grid-2");
    box.appendChild(row1);
    const hotCard = A.el("div", "card");
    hotCard.style.padding = "var(--space-4)";
    hotCard.innerHTML = `<div class="ov-sec-title">实时人气榜 TOP 10</div><div data-c="hot"></div>`;
    row1.appendChild(hotCard);
    const tierCard = A.el("div", "card");
    tierCard.style.padding = "var(--space-4)";
    tierCard.innerHTML = `<div class="ov-sec-title">主播分层构成</div><div data-c="tier"></div>
      <div class="ov-sec-title" style="margin-top:var(--space-4)">分区开播活跃度 TOP 6</div><div data-c="area"></div>`;
    row1.appendChild(tierCard);
    S.row1 = row1;

    // 行 2:涨粉榜 + 复盘质量
    const row2 = A.el("div", "ov-grid-2");
    box.appendChild(row2);
    const gainCard = A.el("div", "card");
    gainCard.style.padding = "var(--space-4)";
    gainCard.innerHTML = `<div class="ov-sec-title">今日涨粉 TOP 10</div><div data-c="gain"></div>`;
    row2.appendChild(gainCard);
    const revCard = A.el("div", "card");
    revCard.style.padding = "var(--space-4)";
    revCard.innerHTML = `<div class="ov-sec-title">复盘质量指标</div><div data-c="revkpi"></div><div data-c="trend" style="margin-top:var(--space-3)"></div>`;
    row2.appendChild(revCard);
    S.row2 = row2;

    // 行 3:资讯 + 热词
    const row3 = A.el("div", "ov-grid-2");
    box.appendChild(row3);
    const newsCard = A.el("div", "card");
    newsCard.style.padding = "var(--space-4)";
    newsCard.innerHTML = `<div class="ov-sec-title">最新资讯通稿</div><div data-c="news"></div>`;
    row3.appendChild(newsCard);
    const heatCard = A.el("div", "card");
    heatCard.style.padding = "var(--space-4)";
    heatCard.innerHTML = `<div class="ov-sec-title">圈层热词</div><div data-c="heat"></div>
      <div class="ov-sec-title" style="margin-top:var(--space-4)">企划推荐</div><div data-c="plan"></div>`;
    row3.appendChild(heatCard);
    S.row3 = row3;

    load().then(() => drawAll());
  }

  async function manualRefresh() {
    if (S.refreshing) return;
    S.refreshing = true;
    S.refreshBtn.disabled = true;
    S.refreshBtn.textContent = "⟳ 刷新中…";
    try {
      await load(); // Store.fetchJSON 使用 no-store,强制拉取最新数据文件
      drawAll();
      A.toast("大盘数据已按最新快照刷新");
    } catch (e) {
      console.error(e);
      A.toast("刷新失败,请稍后再试");
    } finally {
      S.refreshing = false;
      S.refreshBtn.disabled = false;
      S.refreshBtn.textContent = "⟳ 刷新数据";
    }
  }

  function drawAll() {
    const { kpi, row1, row2, row3 } = S;
    if (!kpi) return;
    const anchors = (S.anchors && S.anchors.anchors) || [];
    const total = (S.anchors && S.anchors.total) || anchors.length;
    const live = anchors.filter(a => a.isLive).length;
    const fansSum = anchors.reduce((s, a) => s + (a.followers || 0), 0);
    const deltaSum = anchors.reduce((s, a) => s + (a.followerDelta || 0), 0);
    const revSum = anchors.reduce((s, a) => s + (a.revenue30d || 0), 0);
    const up = S.anchors && S.anchors.updatedAt ? timeStr(S.anchors.updatedAt) : "—";

    const kpis = [
      ["库内主播", A.fmt(total) + " 位", "每日抓取累积"],
      ["当前开播", A.fmt(live) + " 场", `开播率 ${total ? Math.round(live / total * 100) : 0}%`],
      ["粉丝总量", fmtW(fansSum), "库内主播粉丝合计"],
      ["今日涨粉", (deltaSum >= 0 ? "+" : "") + fmtW(deltaSum), deltaSum === 0 ? "首日建档 · 明日起对比历史快照" : "与历史快照对比"],
      ["30天营收(估)", "¥" + fmtW(revSum), "估算口径 est"],
      ["复盘样本", A.fmt(S.reviews.length) + " 场", "数据更新于 " + up.slice(5, 16)],
    ];
    kpi.innerHTML = kpis.map(([l, v, d]) => `
      <div class="card stat-card">
        <div class="stat-label">${l}</div>
        <div class="stat-value">${v}</div>
        <div class="stat-delta caption">${d}</div>
      </div>`).join("");

    // 人气榜
    const hot = anchors.filter(a => a.isLive).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 10);
    row1.querySelector('[data-c="hot"]').innerHTML = rankBarsHTML(hot, "popularity", " 人气", A.fmt);
    // 分层
    row1.querySelector('[data-c="tier"]').innerHTML = tierDonutHTML();
    row1.querySelector('[data-c="area"]').innerHTML = areaBarsHTML();
    // 涨粉
    const gain = anchors.slice().sort((a, b) => (b.followerDelta || 0) - (a.followerDelta || 0)).slice(0, 10);
    const maxGain = Math.max(...gain.map(a => a.followerDelta || 0), 0);
    row2.querySelector('[data-c="gain"]').innerHTML =
      rankBarsHTML(gain, "followerDelta", "", (v) => (v >= 0 ? "+" : "") + fmtW(v)) +
      (maxGain === 0 ? `<p class="caption" style="margin-top:8px">主播库今日首次建档,尚无历史快照基线;明日起该榜单将展示真实涨粉对比。</p>` : "");
    // 复盘 KPI
    const n = S.reviews.length || 1;
    const avg = (k) => S.reviews.reduce((s, r) => s + (r[k] || 0), 0) / n;
    const revKpis = [
      ["人均留存率", (avg("retention") * 100).toFixed(1) + "%"],
      ["3分钟停留率", (avg("stay3m") * 100).toFixed(1) + "%"],
      ["平均开播率", (avg("openRate") * 100).toFixed(1) + "%"],
      ["平均付费率", (avg("payRate") * 100).toFixed(2) + "%"],
    ];
    row2.querySelector('[data-c="revkpi"]').innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2)">
        ${revKpis.map(([l, v]) => `
          <div style="background:var(--color-bg-subtle);border-radius:var(--radius-md);padding:10px 12px">
            <div class="caption">${l}</div>
            <div style="font-size:17px;font-weight:700;margin-top:2px">${v}</div>
          </div>`).join("")}
      </div>`;
    row2.querySelector('[data-c="trend"]').innerHTML = miniTrendHTML();

    // 资讯
    const nws = S.news.slice(0, 4);
    row3.querySelector('[data-c="news"]').innerHTML = nws.length ? `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${nws.map(n2 => `
          <a href="${esc(n2.url || "#/news")}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;display:block">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">
              <b style="font-size:14px;line-height:1.5">${esc(n2.title)}</b>
              <span class="tag tag-b" style="flex:none">${esc(n2.category || "资讯")}</span>
            </div>
            <p class="caption" style="margin-top:4px;line-height:1.6">${esc((n2.lede || "").slice(0, 72))}${(n2.lede || "").length > 72 ? "…" : ""}</p>
          </a>`).join("")}
      </div>` : `<p class="caption">暂无资讯</p>`;

    // 热词
    const heats = S.community.slice().sort((a, b) => (b.heat || 0) - (a.heat || 0)).slice(0, 14);
    row3.querySelector('[data-c="heat"]').innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${heats.map(t => `<span class="heat-tag">${esc(t.word)}<span class="h">${A.fmt(t.heat)}</span></span>`).join("")}
      </div>`;

    // 企划推荐
    const plansN = S.plans.slice(0, 3);
    row3.querySelector('[data-c="plan"]').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${plansN.map(p => `
          <a href="#/planning" style="text-decoration:none;color:inherit">
            <div style="background:var(--color-bg-subtle);border-radius:var(--radius-md);padding:10px 14px">
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                <span class="tag tag-b">${esc(p.type || "企划")}</span>
                <b style="font-size:14px">${esc(p.title)}</b>
              </div>
              <p class="caption" style="margin-top:6px;line-height:1.55;margin-bottom:0">${esc((p.summary || "").slice(0, 64))}… · 📅 ${esc(p.dates)}</p>
            </div>
          </a>`).join("")}
      </div>`;
  }

  // ---------- 注册 ----------
  window.Pages = window.Pages || {};
  window.Pages.overview = { render };
})();