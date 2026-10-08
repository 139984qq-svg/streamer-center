/* ============================================================
   pages/planning.js · 内容企划库
   数据来源:data/plans.json(运营知识库 + AI 生成)
   能力:类型/主题筛选 + 方案卡片 + 详情抽屉(步骤/互动/AI 建议)
   对应 JD 职责:节日/热点内容企划与活动整合
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;
  const toast = A.toast;

  const S = {
    plans: [], type: "all", query: "", box: null, active: null, grid: null, cnt: null,
  };
  const TYPE_META = { "节日": "tag", "热点": "tag-b", "活动": "tag-c", "联动": "tag", "商业化": "tag-b", "官方活动": "tag-c" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  async function load() {
    const d = await window.Store.plans();
    S.plans = d && d.plans ? d.plans : [];
  }

  function filtered() {
    let arr = S.plans.slice();
    if (S.type !== "all") arr = arr.filter(p => p.type === S.type);
    if (S.query) {
      const q = S.query.toLowerCase();
      arr = arr.filter(p => (p.title + p.theme + p.summary).toLowerCase().includes(q));
    }
    return arr;
  }

  // ---------- 渲染 ----------
  function render(box) {
    S.box = box;
    box.innerHTML = "";
    const note = A.el("div", "ai-note", "AI Agent · 内容企划库(对应 JD:热点策划 / 节日内容运营 / 活动整合)");
    note.style.marginBottom = "var(--space-3)";
    box.appendChild(note);

    const stats = A.el("div", "stat-grid");
    box.appendChild(stats);

    const bar = A.el("div", "card");
    bar.style.padding = "var(--space-3)";
    bar.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center">
        <input id="planSearch" type="search" placeholder="搜索企划 / 主题 / 摘要" style="flex:1;min-width:180px;padding:8px 14px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
        <select id="planType" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          <option value="all">全部类型</option>
          ${["节日", "热点", "活动", "联动", "商业化", "官方活动"].map(t => `<option value="${t}">${t}</option>`).join("")}
        </select>
      </div>
    `;
    box.appendChild(bar);

    const grid = A.el("div", "plan-grid");
    box.appendChild(grid);
    const cnt = A.el("p", "caption");
    cnt.style.marginTop = "var(--space-2)";
    box.appendChild(cnt);
    S.grid = grid; S.cnt = cnt;

    A.qs("#planSearch", box).addEventListener("input", (e) => { S.query = e.target.value.trim(); draw(); });
    A.qs("#planType", box).addEventListener("change", (e) => { S.type = e.target.value; draw(); });

    load().then(() => {
      const types = {};
      S.plans.forEach(p => { types[p.type] = (types[p.type] || 0) + 1; });
      const cards = [
        ["企划总数", A.fmt(S.plans.length) + " 套", "节日/热点/活动全案模板"],
        ["节日企划", A.fmt(types["节日"] || 0), "国庆/万圣/圣诞/新春…"],
        ["活动企划", A.fmt((types["活动"] || 0) + (types["官方活动"] || 0)), "生日会/周年/新衣/耐久…"],
        ["AI 建议覆盖", "100%", "每方案含 rationale + risks + suggestions"],
      ];
      stats.innerHTML = cards.map(([l, v, d]) => `
        <div class="card stat-card"><div class="stat-label">${l}</div><div class="stat-value">${v}</div><div class="stat-delta caption">${d}</div></div>
      `).join("");
      draw();
    });
  }

  function drawAll(grid, cnt) {
    const arr = filtered();
    cnt.textContent = `共 ${arr.length} 套企划${S.type !== "all" ? " · 类型=" + S.type : ""}${S.query ? " · 搜索=" + S.query : ""}`;
    if (!arr.length) {
      grid.innerHTML = `<div class="empty card" style="grid-column:1/-1"><div style="font-size:34px;opacity:.4">✎</div><div class="empty-title">没有匹配的企划</div><p class="caption">尝试清空筛选条件。</p></div>`;
      return;
    }
    grid.innerHTML = arr.map(cardHTML).join("");
    grid.querySelectorAll("[data-plan]").forEach(b => b.addEventListener("click", () => {
      const p = S.plans.find(x => x.id === b.dataset.plan);
      if (p) openDetail(p);
    }));
  }

  function draw() {
    if (S.grid && S.cnt) drawAll(S.grid, S.cnt);
  }

  function cardHTML(p) {
    const cls = TYPE_META[p.type] || "tag";
    const rec = p.todayRecommended
      ? '<span class="tag" style="background:var(--color-warning,#ff9f0a);color:#fff;font-weight:600">✦ 今日推荐</span>' : "";
    const d2 = p.daysTo != null
      ? (p.daysTo > 0 ? `<span class="tag tag-c">距档期 ${p.daysTo} 天</span>` : `<span class="tag tag-c">档期内</span>`)
      : "";
    return `
      <div class="card" style="padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2)">
        <div style="display:flex;gap:var(--space-1);flex-wrap:wrap">
          <span class="${cls}">${esc(p.type)}</span>
          <span class="tag">${esc(p.targetTier)}</span>
          ${rec}${d2}
        </div>
        <b style="font-size:16px;line-height:1.45">${esc(p.title)}</b>
        <div class="caption" style="display:flex;gap:var(--space-2);flex-wrap:wrap">
          <span>📅 ${esc(p.dates)}</span><span>主题:${esc(p.theme)}</span>
        </div>
        <p style="font-size:14px;color:var(--color-text-secondary);line-height:1.65;margin:0">${esc(p.summary)}</p>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center">
          <span class="caption">${(p.plan_steps || []).length} 步执行 · ${(p.interactions || []).length} 项互动</span>
          <button class="btn btn-secondary" data-plan="${esc(p.id)}" style="padding:5px 14px;font-size:13px">查看方案</button>
        </div>
      </div>`;
  }

  // ---------- 详情抽屉 ----------
  function ensureDrawer() {
    let d = A.qs("#planDrawer");
    if (!d) {
      d = A.el("aside", "");
      d.id = "planDrawer";
      d.style.cssText = `
        position:fixed; top:0; right:-520px; width:min(500px,96vw); height:100vh;
        background:var(--color-bg); border-left:1px solid var(--color-border);
        box-shadow:var(--shadow-lg); z-index:60; display:flex; flex-direction:column;
        transition:right .3s ease-out;
      `;
      document.body.appendChild(d);
    }
    return d;
  }

  function openDetail(p) {
    S.active = p;
    const d = ensureDrawer();
    const ai = p.ai || {};
    document.body.style.overflow = "hidden";
    d.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4);border-bottom:1px solid var(--color-border)">
        <div>
          <div style="display:flex;gap:var(--space-1);margin-bottom:6px">
            <span class="${TYPE_META[p.type] || "tag"}">${esc(p.type)}</span>
            <span class="tag">${esc(p.targetTier)}</span>
          </div>
          <b style="font-size:17px;line-height:1.4">${esc(p.title)}</b>
        </div>
        <button class="icon-btn" data-close style="font-size:18px">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-4)">
        <div>
          <div class="caption">主题 · ${esc(p.theme)}</div>
          <div class="caption">档期 · ${esc(p.dates)}</div>
          <p style="font-size:14px;color:var(--color-text-secondary);line-height:1.7;margin:8px 0 0">${esc(p.summary)}</p>
        </div>
        <div>
          <b style="font-size:14px">执行步骤</b>
          <ol style="margin:8px 0 0 20px;display:flex;flex-direction:column;gap:8px">
            ${(p.plan_steps || []).map(s => `<li style="font-size:14px;color:var(--color-text-secondary);line-height:1.6">${esc(s)}</li>`).join("")}
          </ol>
        </div>
        <div>
          <b style="font-size:14px">互动环节设计</b>
          <div style="display:flex;gap:var(--space-1);flex-wrap:wrap;margin-top:8px">
            ${(p.interactions || []).map(i => `<span class="tag tag-b">${esc(i)}</span>`).join("")}
          </div>
        </div>
        ${ai.rationale ? `
        <div>
          <span class="ai-note">AI 策划依据</span>
          <p style="font-size:14px;color:var(--color-text-secondary);line-height:1.7;margin:8px 0 0">${esc(ai.rationale)}</p>
        </div>` : ""}
        ${ai.risks ? `
        <div>
          <b style="font-size:14px;color:var(--color-danger)">风险提示</b>
          <p style="font-size:14px;color:var(--color-text-secondary);margin-top:4px;line-height:1.7">${esc(ai.risks)}</p>
        </div>` : ""}
        ${(ai.suggestions && ai.suggestions.length) ? `
        <div>
          <b style="font-size:14px">AI 优化建议</b>
          <ul style="margin:8px 0 0 20px;display:flex;flex-direction:column;gap:6px">
            ${ai.suggestions.map(s => `<li style="font-size:14px;color:var(--color-text-secondary);line-height:1.6">${esc(s)}</li>`).join("")}
          </ul>
        </div>` : ""}
      </div>
      <div style="padding:var(--space-3) var(--space-4);border-top:1px solid var(--color-border)">
        <button class="btn btn-secondary" style="width:100%" data-close>关闭</button>
      </div>
    `;
    requestAnimationFrame(() => { d.style.right = "0px"; });
    d.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeDetail));
  }

  function closeDetail() {
    const d = A.qs("#planDrawer");
    d.style.right = "-520px";
    document.body.style.overflow = "";
  }

  // ---------- 注册 ----------
  window.Pages = window.Pages || {};
  window.Pages.planning = { render };
})();