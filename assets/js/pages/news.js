/* ============================================================
   pages/news.js · 全网资讯(新闻通稿样式)
   数据来源:data/news.json(全网简讯通稿:官方公告 / 社团动态 / 社区 / 数据简报)
   能力:分类筛选 / 搜索 / 通稿卡片(标题+导语+正文+信源)
   对应 JD 职责:行业动态监测与内容情报
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;

  const S = { news: [], category: "all", query: "", box: null, list: null, expanded: new Set() };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function timeStr(t) {
    if (!t) return "";
    const d = new Date(String(t).replace("+00:00", "Z"));
    return isNaN(d) ? t : d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
  }

  async function load() {
    const d = await window.Store.news();
    S.news = d && d.news ? d.news : [];
  }

  const CATS = ["官方动态", "演出企划", "官方活动", "新衣发布", "数据洞察", "数据简报", "趋势观察", "联动动态", "商业化", "平台规则", "社群观察"];

  function filtered() {
    let arr = S.news.slice();
    if (S.category !== "all") arr = arr.filter(n => n.category === S.category);
    if (S.query) {
      const q = S.query.toLowerCase();
      arr = arr.filter(n => (n.title + n.lede + (n.body || []).join("") + n.source).toLowerCase().includes(q));
    }
    return arr;
  }

  function render(box) {
    S.box = box;
    box.innerHTML = "";
    const note = A.el("div", "ai-note", "AI Agent · 全网资讯编辑部(对应 JD:行业动态 / 热点追踪,每日自动聚合 V 圈简讯)");
    note.style.marginBottom = "var(--space-3)";
    box.appendChild(note);

    const stats = A.el("div", "stat-grid");
    box.appendChild(stats);

    const bar = A.el("div", "card");
    bar.style.padding = "var(--space-3)";
    bar.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center">
        <input id="newsSearch" type="search" placeholder="搜索通稿 / 信源 / 关键词" style="flex:1;min-width:180px;padding:8px 14px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
        <select id="newsCat" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          <option value="all">全部分类</option>
          ${CATS.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>
    `;
    box.appendChild(bar);

    const list = A.el("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "var(--space-2)";
    list.style.marginTop = "var(--space-3)";
    box.appendChild(list);
    S.list = list;

    A.qs("#newsSearch", box).addEventListener("input", (e) => { S.query = e.target.value.trim(); draw(); });
    A.qs("#newsCat", box).addEventListener("change", (e) => { S.category = e.target.value; draw(); });

    load().then(() => {
      const brief = S.news.find(n => n.category === "数据简报");
      const nCat = new Set(S.news.map(n => n.category)).size;
      const cards = [
        ["通稿总数", A.fmt(S.news.length) + " 篇", "全网简讯每日聚合"],
        ["资讯分类", A.fmt(nCat) + " 类", "官方/演出/数据/商业…"],
        ["最新快讯", brief ? brief.title.slice(0, 12) + "…" : "-", "虚拟区人气速报"],
        ["更新频率", "每日", "定时任务自动生成"],
      ];
      stats.innerHTML = cards.map(([l, v, d]) => `
        <div class="card stat-card"><div class="stat-label">${l}</div><div class="stat-value">${v}</div><div class="stat-delta caption">${d}</div></div>
      `).join("");
      draw();
    });
  }

  function draw() {
    if (!S.list) return;
    const arr = filtered();
    if (!arr.length) {
      S.list.innerHTML = `<div class="empty card"><div style="font-size:34px;opacity:.4">◎</div><div class="empty-title">没有匹配的通稿</div><p class="caption">尝试清空筛选条件。</p></div>`;
      return;
    }
    S.list.innerHTML = arr.map(articleHTML).join("");
    S.list.querySelectorAll("[data-nid]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.nid;
      if (S.expanded.has(id)) S.expanded.delete(id); else S.expanded.add(id);
      draw();
    }));
  }

  function articleHTML(n) {
    const open = S.expanded.has(n.id);
    const bodyParas = (n.body || []);
    return `
      <article class="card" style="padding:var(--space-4)">
        <div style="display:flex;gap:var(--space-1);flex-wrap:wrap;margin-bottom:8px">
          <span class="tag tag-b">${esc(n.category || "资讯")}</span>
          ${(n.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("")}
        </div>
        <h3 style="margin:0;font-size:17px;line-height:1.5;font-weight:700">${esc(n.title)}</h3>
        <p style="margin:8px 0 0;font-size:14px;font-weight:600;color:var(--color-text-primary);line-height:1.7">${esc(n.lede)}</p>
        ${open ? `
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
          ${bodyParas.map(p => `<p style="margin:0;font-size:14px;color:var(--color-text-secondary);line-height:1.8">　　${esc(p)}</p>`).join("")}
        </div>` : bodyParas.length ? `
        <p style="margin:8px 0 0;font-size:14px;color:var(--color-text-tertiary);line-height:1.6">　　${esc(bodyParas[0]).slice(0, 90)}${bodyParas[0].length > 90 ? "……" : ""}</p>` : ""}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap;gap:var(--space-2)">
          <span class="caption">信源:${esc(n.source || "综合")} · ${esc(timeStr(n.time))}</span>
          <div style="display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap">
            ${n.activityTitle ? `<span class="caption" title="阅读全文将跳转该活动页面">活动:${esc(n.activityTitle)}</span>` : ""}
            ${bodyParas.length ? `<button class="btn btn-secondary" data-nid="${esc(n.id)}" style="padding:4px 14px;font-size:13px" title="在本页展开正文">${open ? "收起正文 ▲" : "展开正文"}</button>` : ""}
            <a class="btn" href="${esc(n.url || "#")}" target="_blank" rel="noopener" style="padding:4px 14px;font-size:13px;text-decoration:none" title="跳转哔哩哔哩活动页面">阅读全文 ↗</a>
          </div>
        </div>
      </article>`;
  }

  window.Pages = window.Pages || {};
  window.Pages.news = { render };
})();