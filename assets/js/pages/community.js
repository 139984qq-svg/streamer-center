/* ============================================================
   pages/community.js · 粉丝社群
   数据来源:data/community.json(V 圈热词 + 粉丝偏好画像)
   能力:热词榜(热度/情感)+ 粉丝偏好标签
   对应 JD 职责:粉丝社群洞察与用户分层运营
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;

  const S = { topics: [], prefs: [], box: null, senti: "all" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  const SENTI_CLS = { "正面": "up", "中性": "", "负面": "down" };

  async function load() {
    const d = await window.Store.community();
    S.topics = d && d.topics ? d.topics : [];
    S.prefs = d && d.prefs ? d.prefs : [];
  }

  function filtered() {
    return S.senti === "all" ? S.topics.slice() : S.topics.filter(t => t.sentiment === S.senti);
  }

  function render(box) {
    S.box = box;
    box.innerHTML = "";
    const note = A.el("div", "ai-note", "AI Agent · 社群洞察(对应 JD:粉丝运营 / 圈层用户分层)");
    note.style.marginBottom = "var(--space-3)";
    box.appendChild(note);

    const stats = A.el("div", "stat-grid");
    box.appendChild(stats);

    const grid2 = A.el("div", "two-col");
    box.appendChild(grid2);

    const topicCard = A.el("div", "card");
    topicCard.style.padding = "var(--space-4)";
    topicCard.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2)">
        <b style="font-size:16px">圈层热词榜</b>
        <select id="commSenti" style="padding:6px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:13px;outline:none">
          <option value="all">全部情感</option>
          <option value="正面">正面</option>
          <option value="中性">中性</option>
          <option value="负面">负面</option>
        </select>
      </div>
      <div id="commTopics" style="margin-top:var(--space-3);display:flex;flex-direction:column;gap:var(--space-2)"></div>
    `;
    grid2.appendChild(topicCard);

    const prefCard = A.el("div", "card");
    prefCard.style.padding = "var(--space-4)";
    prefCard.innerHTML = `<b style="font-size:16px">粉丝偏好画像</b><div id="commPrefs" style="margin-top:var(--space-3);display:flex;flex-direction:column;gap:var(--space-3)"></div>`;
    grid2.appendChild(prefCard);

    A.qs("#commSenti", box).addEventListener("change", (e) => { S.senti = e.target.value; drawTopics(); });

    load().then(() => {
      const pos = S.topics.filter(t => t.sentiment === "正面").length;
      const neg = S.topics.filter(t => t.sentiment === "负面").length;
      const avgHeat = S.topics.length ? Math.round(S.topics.reduce((s, t) => s + (t.heat || 0), 0) / S.topics.length) : 0;
      const cards = [
        ["热词收录", A.fmt(S.topics.length) + " 个", "圈层常用语料持续更新"],
        ["正面话题", A.fmt(pos) + " 个", "二创/应援/联动类为主"],
        ["负面话题", A.fmt(neg) + " 个", "节奏/争议类,需舆情关注"],
        ["平均热度", A.fmt(avgHeat), "0-100 圈层热度指数"],
      ];
      stats.innerHTML = cards.map(([l, v, d]) => `
        <div class="card stat-card"><div class="stat-label">${l}</div><div class="stat-value">${v}</div><div class="stat-delta caption">${d}</div></div>
      `).join("");
      drawTopics();
      drawPrefs();
    });
  }

  function drawTopics() {
    const holder = A.qs("#commTopics", S.box);
    if (!holder) return;
    const arr = filtered();
    if (!arr.length) { holder.innerHTML = `<p class="caption">暂无匹配热词</p>`; return; }
    holder.innerHTML = arr.map((t, i) => `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px"><b style="margin-right:8px;color:var(--color-text-tertiary)">${i + 1}</b>${esc(t.word)}</span>
          <span style="display:flex;gap:var(--space-1);align-items:center">
            <span class="${SENTI_CLS[t.sentiment] || ""}" style="font-size:13px">${esc(t.sentiment)}</span>
            <span class="caption">${A.fmt(t.heat)}</span>
          </span>
        </div>
        <div style="height:6px;background:var(--color-bg-subtle);border-radius:var(--radius-full);margin-top:6px;overflow:hidden">
          <div style="height:100%;width:${Math.max(4, t.heat || 0)}%;background:var(--color-accent);border-radius:var(--radius-full)"></div>
        </div>
        ${(t.examples || []).length ? `<div class="caption" style="margin-top:4px">“${esc(t.examples[0])}”</div>` : ""}
      </div>
    `).join("");
  }

  function drawPrefs() {
    const holder = A.qs("#commPrefs", S.box);
    if (!holder) return;
    const max = Math.max(...S.prefs.map(p => p.value || 0), 1);
    holder.innerHTML = S.prefs.map(p => `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="tag tag-b">${esc(p.tag)}</span>
          <span class="caption">偏好指数 ${A.fmt(p.value)}</span>
        </div>
        <div style="height:6px;background:var(--color-bg-subtle);border-radius:var(--radius-full);margin-top:6px;overflow:hidden">
          <div style="height:100%;width:${Math.round((p.value || 0) / max * 100)}%;background:var(--color-success);border-radius:var(--radius-full)"></div>
        </div>
        <p class="caption" style="margin:4px 0 0;line-height:1.5">${esc(p.desc)}</p>
      </div>
    `).join("");
  }

  window.Pages = window.Pages || {};
  window.Pages.community = { render };
})();