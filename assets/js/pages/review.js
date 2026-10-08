/* ============================================================
   pages/review.js · 直播复盘
   数据来源:data/reviews.json(基于主播中心真实数据的复盘样本)
   能力:数据图表分析(留存趋势折线 / 开播率分布饼图 / 营收条形)
        + 复盘表 + 单场 AI 复盘抽屉
   指标:人均留存率、3分钟停留率、开播率、付费率、礼物营收
   对应 JD 职责:直播复盘与运营调优(数据图表驱动)
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;
  const toast = A.toast;

  const S = { reviews: [], box: null, sortBy: "date", tableBox: null };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  async function load() {
    const d = await window.Store.reviews();
    S.reviews = d && d.reviews ? d.reviews : [];
  }

  function sorted() {
    const arr = S.reviews.slice();
    const key = S.sortBy;
    arr.sort((a, b) => (b[key] || 0) - (a[key] || 0));
    return arr;
  }

  // ================= 图表:折线(留存趋势) =================
  function trendSVG() {
    const data = S.reviews.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    const W = 760, H = 240, PL = 46, PR = 14, PT = 14, PB = 34;
    const keys = ["retention", "stay3m"];
    const maxV = Math.max(...data.map(r => Math.max(r.retention || 0, r.stay3m || 0)), 0.5);
    const yMax = Math.ceil(maxV * 100 / 10) * 10; // 刻度百分数
    const x0 = PL, x1 = W - PR, y0 = PT, y1 = H - PB;
    const n = data.length;
    const xAt = (i) => x0 + (n <= 1 ? 0 : (i * (x1 - x0)) / (n - 1));
    const yAt = (v) => y0 + (y1 - y0) * (1 - (v * 100) / yMax);
    let grid = "";
    const ticks = 4;
    for (let k = 0; k <= ticks; k++) {
      const gy = y0 + ((y1 - y0) * k) / ticks;
      const gv = Math.round(yMax - (yMax * k) / ticks);
      grid += `<line x1="${x0}" y1="${gy}" x2="${x1}" y2="${gy}" stroke="var(--color-border)" stroke-width="1" stroke-dasharray="3 4"/>`;
      grid += `<text x="${x0 - 8}" y="${gy + 4}" style="font-size:10px;fill:var(--color-text-tertiary)" text-anchor="end">${gv}%</text>`;
    }
    const colors = ["var(--color-accent)", "var(--color-success)"];
    const labels = ["人均留存率", "3分钟停留率"];
    let paths = "";
    keys.forEach((key, ci) => {
      const pts = data.map((r, i) => `${xAt(i).toFixed(1)},${yAt(r[key] || 0).toFixed(1)}`);
      paths += `<polyline points="${pts.join(" ")}" fill="none" stroke="${colors[ci]}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      data.forEach((r, i) => {
        paths += `<circle class="trend-pt" data-idx="${i}" cx="${xAt(i).toFixed(1)}" cy="${yAt(r[key] || 0).toFixed(1)}" r="2.6" fill="${colors[ci]}"/>`;
      });
    });
    // x 轴日期标签(最多 8 个)
    let xlab = "";
    const step = Math.max(1, Math.ceil(n / 8));
    data.forEach((r, i) => {
      if (i % step === 0) {
        xlab += `<text x="${xAt(i).toFixed(1)}" y="${y1 + 18}" style="font-size:10px;fill:var(--color-text-tertiary)" text-anchor="middle">${esc(r.date.slice(5))}</text>`;
      }
    });
    return `
      <div class="chart-legend" style="display:flex;gap:16px;flex-wrap:wrap">
        ${labels.map((l, i) => `<span class="caption" style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:14px;height:3px;border-radius:2px;background:${colors[i]}"></span>${l}</span>`).join("")}
      </div>
      <div style="overflow-x:auto;margin-top:8px">
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:520px;height:auto" role="img" aria-label="留存率与3分钟停留率趋势折线图">
          ${grid}${paths}${xlab}
        </svg>
      </div>
      <p class="caption" style="margin-top:4px">横轴为复盘场次日期(升序),纵轴为百分比;点对应单场复盘样本。</p>`;
  }

  // ================= 图表:饼图(开播率分布) =================
  const TIERS = [
    { label: "高频(≥85%)", min: 0.85, color: "var(--color-accent)" },
    { label: "中频(60%-85%)", min: 0.60, color: "var(--color-accent-weak)" },
    { label: "低频(<60%)", min: 0, color: "var(--color-border)" },
  ];

  function tierIndex(v) {
    if (v >= 0.85) return 0;
    if (v >= 0.60) return 1;
    return 2;
  }

  function tierStats() {
    const groups = [[], [], []];
    S.reviews.forEach(r => { groups[tierIndex(r.openRate || 0)].push(r); });
    return groups;
  }

  function donutSVG() {
    const tiers = TIERS;
    const counts = tierStats().map(g => g.length);
    const total = S.reviews.length || 1;
    const avg = S.reviews.length
      ? (S.reviews.reduce((s, r) => s + (r.openRate || 0), 0) / S.reviews.length * 100) : 0;

    const C = 100, R = 78, rIn = 50; // viewBox 200
    let arcs = "";
    let angle = -90;
    const fracs = counts.map(c => c / total);
    fracs.forEach((f, i) => {
      if (f <= 0) return;
      const sweep = f * 360;
      const a0 = angle, a1 = angle + sweep;
      const p0 = pt(C, C, R, a0), p1 = pt(C, C, R, a1);
      const large = sweep > 180 ? 1 : 0;
      arcs += `<path class="donut-seg" data-tier="${i}" d="M ${p0.x} ${p0.y} A ${R} ${R} 0 ${large} 1 ${p1.x} ${p1.y} L ${C} ${C} Z" fill="${tiers[i].color}"/>`;
      angle = a1;
    });
    const legend = tiers.map((t, i) => `
      <span class="caption" style="display:inline-flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${t.color}"></span>
        ${esc(t.label)} · ${counts[i]} 场(${Math.round(fracs[i] * 100)}%)
      </span>`).join("");
    return `
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <svg viewBox="0 0 200 200" style="width:170px;height:170px;flex:none" role="img" aria-label="开播率分布饼图">
          ${arcs}
          <circle cx="${C}" cy="${C}" r="${rIn}" fill="var(--color-bg)"/>
          <text x="${C}" y="${C - 4}" text-anchor="middle" style="font-size:26px;font-weight:700;fill:var(--color-text-primary)">${avg.toFixed(0)}%</text>
          <text x="${C}" y="${C + 16}" text-anchor="middle" style="font-size:10px;fill:var(--color-text-tertiary)">平均开播率</text>
        </svg>
        <div style="display:flex;flex-direction:column;gap:8px;min-width:150px">${legend}</div>
      </div>
      <p class="caption" style="margin-top:8px">开播率 = 近 30 天开播天数 ÷ 30;按高频/中频/低频三档切分场次占比。</p>`;
  }

  function pt(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: (cx + r * Math.cos(rad)).toFixed(2), y: (cy + r * Math.sin(rad)).toFixed(2) };
  }

  // ================= 图表:营收 Top8 条形 =================
  function barsHTML() {
    const top = S.reviews.slice().sort((a, b) => (b.giftRevenue || 0) - (a.giftRevenue || 0)).slice(0, 8);
    const max = Math.max(...top.map(r => r.giftRevenue || 0), 1);
    return `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${top.map((r, i) => `
          <div class="bar-row" data-name="${esc(r.anchor)}" data-rev="${esc(r.id)}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:13px"><b style="margin-right:6px;color:var(--color-text-tertiary)">${i + 1}</b>${esc(r.anchor)}</span>
              <span class="caption">¥${A.fmt(r.giftRevenue)}</span>
            </div>
            <div style="height:8px;background:var(--color-bg-subtle);border-radius:var(--radius-full);overflow:hidden">
              <div style="height:100%;width:${Math.max(3, Math.round((r.giftRevenue / max) * 100))}%;background:var(--color-accent);border-radius:var(--radius-full)"></div>
            </div>
          </div>`).join("")}
      </div>
      <p class="caption" style="margin-top:8px">样本场次礼物营收 Top 8,条形长度为相对值;悬停查看详情。</p>`;
  }

  // ================= 悬停提示(hover tooltip) =================
  function tipEl() {
    let t = A.qs("#chartTip");
    if (!t) {
      t = A.el("div");
      t.id = "chartTip";
      t.style.cssText = `
        position:fixed; z-index:99; pointer-events:none; display:none;
        background:var(--color-bg); border:1px solid var(--color-border);
        border-radius:var(--radius-md); box-shadow:var(--shadow-lg);
        padding:10px 14px; font-size:13px; line-height:1.7;
        color:var(--color-text-primary); max-width:280px;
      `;
      document.body.appendChild(t);
    }
    return t;
  }
  function showTip(html, x, y) {
    const t = tipEl();
    t.innerHTML = html;
    t.style.display = "block";
    moveTip(x, y);
  }
  function moveTip(x, y) {
    const t = tipEl();
    const w = t.offsetWidth, h = t.offsetHeight;
    const px = Math.min(x + 14, window.innerWidth - w - 12);
    const py = Math.min(y + 14, window.innerHeight - h - 12);
    t.style.left = Math.max(8, px) + "px";
    t.style.top = Math.max(8, py) + "px";
  }
  function hideTip() { tipEl().style.display = "none"; }

  function bindChartInteractions() {
    const box = S.box;
    // 折线数据点:悬停显示该场次的完整指标
    const trendData = S.reviews.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    box.querySelectorAll(".trend-pt").forEach(c => {
      const rec = trendData[Number(c.dataset.idx)];
      if (!rec) return;
      c.style.cursor = "pointer";
      c.addEventListener("mouseenter", (e) => {
        c.setAttribute("r", "4.6");
        box.querySelectorAll(`.trend-pt[data-idx="${c.dataset.idx}"]`).forEach(p => p.setAttribute("r", "4.6"));
        showTip(`
          <b>${esc(rec.anchor)} · ${esc(rec.date.slice(5))}</b><br>
          人均留存率 <b style="color:var(--color-accent)">${((rec.retention || 0) * 100).toFixed(1)}%</b><br>
          3分钟停留率 <b style="color:var(--color-success)">${((rec.stay3m || 0) * 100).toFixed(1)}%</b><br>
          <span class="caption">弹幕 ${A.fmt(rec.danmakuCount)} · 时长 ${A.fmt(rec.durationH, 1)}h · 礼物 ¥${A.fmt(rec.giftRevenue)}</span>
        `, e.clientX, e.clientY);
      });
      c.addEventListener("mousemove", (e) => moveTip(e.clientX, e.clientY));
      c.addEventListener("mouseleave", () => {
        box.querySelectorAll(".trend-pt").forEach(p => p.setAttribute("r", "2.6"));
        hideTip();
      });
    });
    // 饼图扇区:悬停显示该档数据
    const groups = tierStats();
    const total = S.reviews.length || 1;
    box.querySelectorAll(".donut-seg").forEach(p => {
      const i = Number(p.dataset.tier);
      p.style.cursor = "pointer";
      p.addEventListener("mouseenter", (e) => {
        p.style.opacity = "0.55";
        const g = groups[i] || [];
        const avgRate = g.length ? (g.reduce((s, r) => s + (r.openRate || 0), 0) / g.length * 100) : 0;
        showTip(`
          <b>${esc(TIERS[i].label)}</b><br>
          场次 <b>${g.length} 场</b>(${Math.round((g.length / total) * 100)}%)<br>
          该档平均开播率 <b>${avgRate.toFixed(1)}%</b><br>
          <span class="caption">开播率 = 近30天开播天数 ÷ 30</span>
        `, e.clientX, e.clientY);
      });
      p.addEventListener("mousemove", (e) => moveTip(e.clientX, e.clientY));
      p.addEventListener("mouseleave", () => { p.style.opacity = "1"; hideTip(); });
    });
    // 营收条形:悬停显示完整详情
    box.querySelectorAll(".bar-row").forEach(row => {
      const rev = S.reviews.find(r => r.id === row.dataset.rev);
      row.style.cursor = "pointer";
      row.addEventListener("mouseenter", (e) => {
        showTip(`
          <b>${esc(rev ? rev.anchor : row.dataset.name)} · ${esc(rev ? rev.date.slice(5) : "")}</b><br>
          礼物营收 <b>¥${A.fmt(rev ? rev.giftRevenue : 0)}</b><br>
          <span class="caption">时长 ${A.fmt(rev ? rev.durationH : 0, 1)}h · 人均留存 ${((rev ? rev.retention : 0) * 100).toFixed(1)}% · 付费率 ${((rev ? rev.payRate : 0) * 100).toFixed(2)}%</span>
        `, e.clientX, e.clientY);
      });
      row.addEventListener("mousemove", (e) => moveTip(e.clientX, e.clientY));
      row.addEventListener("mouseleave", hideTip);
    });
  }

  // ================= 页面渲染 =================
  function render(box) {
    S.box = box;
    box.innerHTML = "";
    const note = A.el("div", "ai-note", "AI Agent · 直播复盘(对应 JD:数据复盘 / 内容迭代,含留存率、3分钟停留率、开播率图表分析)");
    note.style.marginBottom = "var(--space-3)";
    box.appendChild(note);

    const stats = A.el("div", "stat-grid");
    box.appendChild(stats);

    // 图表区
    const charts = A.el("div", "two-col");
    box.appendChild(charts);
    const trendCard = A.el("div", "card");
    trendCard.style.padding = "var(--space-4)";
    trendCard.style.gridColumn = "1 / -1";
    trendCard.innerHTML = `<b style="font-size:16px">留存与停留趋势</b>`;
    charts.appendChild(trendCard);
    const donutCard = A.el("div", "card");
    donutCard.style.padding = "var(--space-4)";
    donutCard.innerHTML = `<b style="font-size:16px">开播率分布</b>`;
    charts.appendChild(donutCard);
    const barCard = A.el("div", "card");
    barCard.style.padding = "var(--space-4)";
    barCard.innerHTML = `<b style="font-size:16px">礼物营收 Top 8</b>`;
    charts.appendChild(barCard);

    // 工具条
    const bar = A.el("div", "card");
    bar.style.padding = "var(--space-3)";
    bar.style.marginTop = "var(--space-3)";
    bar.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center">
        <b style="font-size:15px">复盘明细</b>
        <span class="caption" style="margin-left:auto">排序:</span>
        <select id="revSort" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          <option value="date">日期</option>
          <option value="danmakuCount">弹幕数</option>
          <option value="giftRevenue">礼物营收</option>
          <option value="retention">人均留存</option>
          <option value="stay3m">3分钟停留</option>
          <option value="openRate">开播率</option>
          <option value="payRate">付费率</option>
        </select>
      </div>
    `;
    box.appendChild(bar);

    const tableBox = A.el("div");
    tableBox.style.marginTop = "var(--space-3)";
    box.appendChild(tableBox);
    S.tableBox = tableBox;

    A.qs("#revSort", box).addEventListener("change", (e) => { S.sortBy = e.target.value; draw(); });

    load().then(() => {
      const n = S.reviews.length;
      const avgRet = n ? S.reviews.reduce((s, r) => s + (r.retention || 0), 0) / n : 0;
      const avgStay = n ? S.reviews.reduce((s, r) => s + (r.stay3m || 0), 0) / n : 0;
      const avgOpen = n ? S.reviews.reduce((s, r) => s + (r.openRate || 0), 0) / n : 0;
      const avgPay = n ? S.reviews.reduce((s, r) => s + (r.payRate || 0), 0) / n : 0;
      const cards = [
        ["人均留存率", (avgRet * 100).toFixed(1) + "%", "场均观看留存口径"],
        ["3分钟停留率", (avgStay * 100).toFixed(1) + "%", "开播 3 分钟仍在场比例"],
        ["平均开播率", (avgOpen * 100).toFixed(1) + "%", "近 30 天开播天数占比"],
        ["平均付费率", (avgPay * 100).toFixed(2) + "%", "付费转化参考"],
      ];
      stats.innerHTML = cards.map(([l, v, d]) => `
        <div class="card stat-card"><div class="stat-label">${l}</div><div class="stat-value">${v}</div><div class="stat-delta caption">${d}</div></div>
      `).join("");

      trendCard.innerHTML += trendSVG();
      donutCard.innerHTML += donutSVG();
      barCard.innerHTML += barsHTML();
      draw();
      bindChartInteractions();
    });
  }

  function draw() {
    if (!S.tableBox) return;
    const arr = sorted();
    if (!arr.length) {
      S.tableBox.innerHTML = `<div class="empty card"><div style="font-size:34px;opacity:.4">▶</div><div class="empty-title">暂无复盘数据</div><p class="caption">数据将随每日定时任务写入 data/reviews.json。</p></div>`;
      return;
    }
    S.tableBox.innerHTML = `
      <div class="table-wrap">
        <table class="plain">
          <thead><tr>
            <th>日期</th><th>主播</th><th>分区</th><th>时长</th><th>弹幕</th>
            <th>礼物营收</th><th>人均留存</th><th>3分钟停留</th><th>开播率</th><th>付费率</th><th>操作</th>
          </tr></thead>
          <tbody>
            ${arr.map(r => `
              <tr>
                <td>${esc(r.date)}</td>
                <td><b>${esc(r.anchor)}</b><div class="caption">${(r.liveNow || "") === "直播中" ? '<span class="up">● 直播中</span>' : 'uid ' + esc(r.anchorUid)}</div></td>
                <td><span class="tag">${esc(r.area || "虚拟")}</span></td>
                <td>${A.fmt(r.durationH, 1)}h</td>
                <td>${A.fmt(r.danmakuCount)}</td>
                <td>¥${A.fmt(r.giftRevenue)}</td>
                <td>${((r.retention || 0) * 100).toFixed(1)}%</td>
                <td>${((r.stay3m || 0) * 100).toFixed(1)}%</td>
                <td>${((r.openRate || 0) * 100).toFixed(0)}%<div class="caption">${A.fmt(r.openDays30d)}天/30天</div></td>
                <td>${((r.payRate || 0) * 100).toFixed(2)}%</td>
                <td><button class="btn btn-secondary" data-rev="${esc(r.id)}" style="padding:4px 12px;font-size:13px">AI 复盘</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="caption" style="margin-top:8px">共 ${arr.length} 场复盘 · 点击「AI 复盘」查看单场摘要与调优建议</p>
    `;
    S.tableBox.querySelectorAll("[data-rev]").forEach(b => b.addEventListener("click", () => {
      const r = S.reviews.find(x => x.id === b.dataset.rev);
      if (r) openDetail(r);
    }));
  }

  // ---------- AI 复盘抽屉 ----------
  function ensureDrawer() {
    let d = A.qs("#reviewDrawer");
    if (!d) {
      d = A.el("aside", "");
      d.id = "reviewDrawer";
      d.style.cssText = `
        position:fixed; top:0; right:-480px; width:min(460px,94vw); height:100vh;
        background:var(--color-bg); border-left:1px solid var(--color-border);
        box-shadow:var(--shadow-lg); z-index:60; display:flex; flex-direction:column;
        transition:right .3s ease-out;
      `;
      document.body.appendChild(d);
    }
    return d;
  }

  function openDetail(r) {
    const d = ensureDrawer();
    const ai = r.ai || {};
    document.body.style.overflow = "hidden";
    d.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);border-bottom:1px solid var(--color-border)">
        <div>
          <b style="font-size:16px">${esc(r.anchor)} · ${esc(r.date)}</b>
          <div class="caption">${esc(r.area || "")} · 时长 ${A.fmt(r.durationH, 1)}h · 弹幕 ${A.fmt(r.danmakuCount)}</div>
        </div>
        <button class="icon-btn" data-close style="font-size:18px">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)">
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2)">
          ${m("人均留存率", ((r.retention || 0) * 100).toFixed(1) + "%")}
          ${m("3分钟停留率", ((r.stay3m || 0) * 100).toFixed(1) + "%")}
          ${m("开播率", ((r.openRate || 0) * 100).toFixed(0) + "%(" + A.fmt(r.openDays30d) + "天/30天)")}
          ${m("礼物营收", "¥" + A.fmt(r.giftRevenue))}
          ${m("付费率", ((r.payRate || 0) * 100).toFixed(2) + "%")}
          ${m("粉丝量", A.fmt(r.fans))}
        </div>
        <div>
          <span class="ai-note">AI 复盘摘要</span>
          <p style="font-size:14px;color:var(--color-text-secondary);line-height:1.7;margin:8px 0 0">${esc(ai.summary || "暂无摘要")}</p>
        </div>
        ${(ai.highlights && ai.highlights.length) ? `
        <div>
          <b style="font-size:14px">本场亮点</b>
          <ul style="margin:8px 0 0 20px;display:flex;flex-direction:column;gap:6px">
            ${ai.highlights.map(h => `<li style="font-size:14px;color:var(--color-text-secondary);line-height:1.6">${esc(h)}</li>`).join("")}
          </ul>
        </div>` : ""}
        ${(ai.suggestions && ai.suggestions.length) ? `
        <div>
          <b style="font-size:14px">调优建议</b>
          <ol style="margin:8px 0 0 20px;display:flex;flex-direction:column;gap:6px">
            ${ai.suggestions.map(s => `<li style="font-size:14px;color:var(--color-text-secondary);line-height:1.6">${esc(s)}</li>`).join("")}
          </ol>
        </div>` : ""}
        <div class="caption" style="padding:10px 12px;background:var(--color-bg-subtle);border-radius:var(--radius-md)">
          关键词:${(r.keywords || []).map(k => esc(k)).join(" / ")}
        </div>
      </div>
      <div style="padding:var(--space-3) var(--space-4);border-top:1px solid var(--color-border)">
        <button class="btn btn-secondary" style="width:100%" data-close>关闭</button>
      </div>
    `;
    requestAnimationFrame(() => { d.style.right = "0px"; });
    d.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeDetail));
  }

  function m(label, val) {
    return `
      <div style="background:var(--color-bg-subtle);border-radius:var(--radius-md);padding:10px 12px">
        <div class="caption">${label}</div>
        <div style="font-size:15px;font-weight:600;margin-top:2px">${val}</div>
      </div>`;
  }

  function closeDetail() {
    const d = A.qs("#reviewDrawer");
    d.style.right = "-480px";
    document.body.style.overflow = "";
  }

  window.Pages = window.Pages || {};
  window.Pages.review = { render };
})();