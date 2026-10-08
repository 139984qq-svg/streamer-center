/* ============================================================
   pages/daily.js · 数据日报
   数据来源:data/daily.json(当日) + data/daily_history/{date}.json(历史归档)
   能力:日期切换查看今日/昨日/历史日报(KPI、分层、复盘均值、
        人气/涨粉TOP、AI 摘要)
   对应 JD 职责:日报产出与微信推送的数据底座
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;

  const S = { box: null, dates: [], cur: null, curData: null };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function fmtW(n) {
    n = Number(n) || 0;
    if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(2) + " 亿";
    if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(1) + " 万";
    return A.fmt(n);
  }

  async function loadIndex() {
    // 历史日报清单(每日 22:05 生成时归档并重建)
    const idx = await window.Store.fetchJSON("data/daily_history/index.json");
    S.dates = idx && idx.dates ? idx.dates : [];
  }

  async function loadDate(date) {
    if (!date) {
      S.curData = await window.Store.daily();
      return;
    }
    const d = await window.Store.fetchJSON("data/daily_history/" + date + ".json");
    if (d) S.curData = d;
    else {
      // 归档缺失时退回当日文件
      const fallback = await window.Store.daily();
      S.curData = fallback && fallback.date === date ? fallback : null;
    }
  }

  // ---------- 渲染 ----------
  function render(box) {
    S.box = box;
    box.innerHTML = "";
    const note = A.el("div", "ai-note", "AI Agent · 数据日报(对应 JD:每日数据复盘与日报产出,每日 22:05 自动生成并归档)");
    note.style.marginBottom = "var(--space-3)";
    box.appendChild(note);

    const dateBar = A.el("div", "card");
    dateBar.style.padding = "var(--space-3)";
    dateBar.innerHTML = `<div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap">
      <b style="font-size:14px">日报日期:</b><span id="dailyChips" style="display:flex;gap:8px;flex-wrap:wrap"></span>
      <span class="caption" id="dailyStamp" style="margin-left:auto"></span>
    </div>`;
    box.appendChild(dateBar);

    const body = A.el("div");
    box.appendChild(body);
    S.body = body;

    (async () => {
      await loadIndex();
      await loadDate(null); // 默认最新(当日)
      S.cur = S.curData && S.curData.date ? S.curData.date : null;
      drawChips();
      drawBody();
    })();
  }

  function drawChips() {
    const holder = A.qs("#dailyChips", S.box);
    if (!holder) return;
    // 展示靠前的 14 个日期
    const dates = S.dates.slice(0, 14);
    holder.innerHTML = dates.map(d => `
      <button class="btn ${d === S.cur ? "" : "btn-secondary"}" data-day="${esc(d)}" style="padding:4px 14px;font-size:13px;flex:none">${esc(d.slice(5))}</button>
    `).join("");
    holder.querySelectorAll("[data-day]").forEach(b => b.addEventListener("click", async () => {
      const d = b.dataset.day;
      await loadDate(d);
      S.cur = d;
      drawChips();
      drawBody();
      S.box.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  function drawBody() {
    if (!S.body) return;
    const d = S.curData;
    A.qs("#dailyStamp", S.box).textContent = d && d.updatedAt ? "生成于 " + d.updatedAt.slice(5, 16).replace("T", " ") : "";
    if (!d) {
      S.body.innerHTML = `<div class="empty card"><div style="font-size:34px;opacity:.4">≡</div>
        <div class="empty-title">暂无该日报</div>
        <p class="caption">等待定时任务生成当日日报(每日 22:05)。</p></div>`;
      return;
    }
    const st = d.stats || { head: 0, waist: 0, potential: 0 };
    const rv = d.reviewAvg || {};
    const kpis = [
      ["库内主播", A.fmt(d.totalAnchors) + " 位", "当日累积口径"],
      ["开播场次", A.fmt(d.liveCount) + " 场", "开播率 " + (d.totalAnchors ? Math.round(d.liveCount / d.totalAnchors * 100) : 0) + "%"],
      ["粉丝总量", fmtW(d.totalFollowers), "库内合计"],
      ["净涨粉", (d.followerDelta >= 0 ? "+" : "") + fmtW(d.followerDelta), "与历史快照对比"],
      ["30天营收(估)", "¥" + fmtW(d.estRevenue30d), "估算口径 est"],
      ["复盘场次", A.fmt(d.reviewCount || 0) + " 场", "当日复盘样本"],
    ];
    S.body.innerHTML = `
      <div class="kpi-grid" style="margin-top:var(--space-3)">
        ${kpis.map(([l, v, dd]) => `
          <div class="card stat-card"><div class="stat-label">${l}</div><div class="stat-value">${v}</div><div class="stat-delta caption">${dd}</div></div>`).join("")}
      </div>

      <div class="ov-grid-2">
        <div class="card" style="padding:var(--space-4)">
          <div class="ov-sec-title">主播分层构成</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)">
            ${[["头部", st.head || 0], ["腰部", st.waist || 0], ["潜力", st.potential || 0]].map(([l, v]) => `
              <div style="background:var(--color-bg-subtle);border-radius:var(--radius-md);padding:12px">
                <div class="caption">${l}</div>
                <div style="font-size:20px;font-weight:700;margin-top:2px">${A.fmt(v)}</div>
              </div>`).join("")}
          </div>
          <div class="ov-sec-title" style="margin-top:var(--space-4)">复盘质量均值</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2)">
            ${[["人均留存", ((rv.retention || 0) * 100).toFixed(1) + "%"], ["3分钟停留", ((rv.stay3m || 0) * 100).toFixed(1) + "%"],
               ["开播率", ((rv.openRate || 0) * 100).toFixed(1) + "%"], ["付费率", ((rv.payRate || 0) * 100).toFixed(2) + "%"]].map(([l, v]) => `
              <div style="background:var(--color-bg-subtle);border-radius:var(--radius-md);padding:10px 12px">
                <div class="caption">${l}</div>
                <div style="font-size:16px;font-weight:700;margin-top:2px">${v}</div>
              </div>`).join("")}
          </div>
        </div>

        <div class="card" style="padding:var(--space-4)">
          <div class="ov-sec-title">今日人气 TOP 3</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${(d.topLive || []).map((x, i) => `
              <div style="display:flex;justify-content:space-between;gap:8px">
                <span style="font-size:14px"><b style="margin-right:8px;color:var(--color-text-tertiary)">${i + 1}</b>${esc(x.name)}</span>
                <span class="caption">人气 ${A.fmt(x.popularity)}</span>
              </div>`).join("")}
          </div>
          <div class="ov-sec-title" style="margin-top:var(--space-4)">涨粉 TOP 3</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${(d.topGain || []).map((x, i) => `
              <div style="display:flex;justify-content:space-between;gap:8px">
                <span style="font-size:14px"><b style="margin-right:8px;color:var(--color-text-tertiary)">${i + 1}</b>${esc(x.name)}</span>
                <span class="${x.delta >= 0 ? "up" : "down"}">${x.delta >= 0 ? "+" : ""}${fmtW(x.delta)}</span>
              </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="card" style="padding:var(--space-4);margin-top:var(--space-3)">
        <div class="ov-sec-title">AI 今日研判</div>
        <p style="font-size:14px;line-height:1.75;color:var(--color-text-secondary);margin:0;border-left:3px solid var(--color-accent);padding-left:12px">${esc((d.insights && d.insights.summary) || "—")}</p>
        ${(d.insights && d.insights.highlights && d.insights.highlights.length) ? `
        <ul style="margin:12px 0 0 18px;display:flex;flex-direction:column;gap:6px">
          ${d.insights.highlights.map(h => `<li style="font-size:14px;color:var(--color-text-secondary)">${esc(h)}</li>`).join("")}
        </ul>` : ""}
        <div class="caption" style="margin-top:12px">${esc(d.source || "")} · 该日报可直接用于微信早报推送与周报汇总。</div>
      </div>
    `;
  }

  // ---------- 注册 ----------
  window.Pages = window.Pages || {};
  window.Pages.daily = { render };
})();