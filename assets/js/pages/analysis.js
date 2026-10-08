/* ============================================================
   pages/analysis.js · 数据导入与分析(独立模块)
   能力:Excel/CSV 导入主播数据 → 本地库(localStorage)
        生成分析报告(Markdown 下载):抓取数据 / 本地导入 / 全量合并
   对应 JD 职责:数据资产的录入与报告产出闭环
   ============================================================ */
(function () {
  "use strict";
  const A = window.App;
  const toast = A.toast;

  const S = {
    remote: null,        // data/anchors.json(定时任务抓取)
    imports: [],         // 本地导入(localStorage vt-imports)
    box: null,
    scope: "all",        // 报告范围:all=全量 crawl=仅抓取 local=仅导入
  };

  // ---------- 本地库 ----------
  function readLocal() {
    try { return JSON.parse(localStorage.getItem("vt-imports") || "[]"); }
    catch (e) { return []; }
  }
  function saveLocal() {
    localStorage.setItem("vt-imports", JSON.stringify(S.imports));
  }

  async function load() {
    const remote = await window.Store.anchors();
    S.remote = remote && remote.anchors ? remote.anchors : [];
    S.imports = readLocal();
  }

  // ---------- 渲染 ----------
  function render(box) {
    S.box = box;
    box.innerHTML = "";

    const note = A.el("div", "ai-note", "AI Agent · 数据资产录入与分析报告(对应 JD:数据沉淀与复盘产出)");
    note.style.marginBottom = "var(--space-3)";
    box.appendChild(note);

    // 信息卡:两项数据源规模
    const info = A.el("div", "stat-grid");
    box.appendChild(info);

    // 导入卡片
    const impCard = A.el("div", "card");
    impCard.style.padding = "var(--space-4)";
    impCard.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);flex-wrap:wrap">
        <div style="flex:1;min-width:260px">
          <b style="font-size:16px">Excel / CSV 导入</b>
          <p class="caption" style="margin-top:6px;line-height:1.6">
            支持 .xlsx / .xls / .csv,识别列:<code>主播名、UID、粉丝数、涨粉、互动率(%)、30天开播、平均在线、营收</code>。
            导入的数据保存在浏览器本地,并与每日抓取的全网数据一起参与报告生成。
          </p>
          <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap">
            <button class="btn" id="anaImport">📄 选择文件导入</button>
            <button class="btn btn-secondary" id="anaClear">清空本地导入</button>
          </div>
        </div>
        <div style="width:220px;background:var(--color-bg-subtle);border-radius:var(--radius-md);padding:var(--space-3)">
          <div class="caption">本地导入</div>
          <div style="font-size:26px;font-weight:700" id="anaLocalCount">0</div>
          <div class="caption">位主播(浏览器本地)</div>
        </div>
      </div>
    `;
    box.appendChild(impCard);

    // 报告卡片
    const repCard = A.el("div", "card");
    repCard.style.padding = "var(--space-4)";
    repCard.style.marginTop = "var(--space-3)";
    repCard.innerHTML = `
      <b style="font-size:16px">生成分析报告</b>
      <p class="caption" style="margin-top:6px">一键聚合生成 Markdown 运营分析报告(含 AI 诊断、风险与建议),可直接用于周报/复盘。</p>
      <div style="display:flex;gap:var(--space-2);align-items:center;margin-top:var(--space-3);flex-wrap:wrap">
        <select id="anaScope" style="padding:7px 12px;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg);color:var(--color-text-primary);font-size:14px;outline:none">
          <option value="all">范围:全量(抓取 + 导入)</option>
          <option value="crawl">范围:仅全网抓取数据</option>
          <option value="local">范围:仅本地导入数据</option>
        </select>
        <button class="btn" id="anaExport">⬇ 导出分析报告(.md)</button>
      </div>
      <p class="caption" style="margin-top:var(--space-2)" id="anaScopeTip"></p>
    `;
    box.appendChild(repCard);

    // 导入明细表
    const listCard = A.el("div", "card");
    listCard.style.padding = "var(--space-4)";
    listCard.style.marginTop = "var(--space-3)";
    listCard.innerHTML = `<b style="font-size:16px">本地导入明细</b><div id="anaList" style="margin-top:var(--space-3)"></div>`;
    box.appendChild(listCard);

    // 事件
    A.qs("#anaImport", box).addEventListener("click", importExcel);
    A.qs("#anaClear", box).addEventListener("click", () => {
      if (!S.imports.length) { toast("本地导入已为空"); return; }
      S.imports = [];
      saveLocal();
      refresh();
      toast("已清空本地导入");
    });
    A.qs("#anaScope", box).addEventListener("change", (e) => {
      S.scope = e.target.value;
      drawScopeTip();
    });
    A.qs("#anaExport", box).addEventListener("click", exportReport);

    load().then(() => { refresh(); drawScopeTip(); });
  }

  function refresh() {
    const box = S.box;
    A.qs("#anaLocalCount", box).textContent = A.fmt(S.imports.length);
    const info = box.querySelector(".stat-grid");
    const sumFollow = S.imports.reduce((s, a) => s + (a.followers || 0), 0);
    const cards = [
      ["全网抓取主播", A.fmt(S.remote.length) + " 位", "每日定时任务更新(B站虚拟区)"],
      ["本地导入主播", A.fmt(S.imports.length) + " 位", "存于浏览器 localStorage"],
      ["导入粉丝合计", A.fmt(sumFollow), "参与报告的导入粉丝基数"],
      ["报告数据池", A.fmt(S.remote.length + S.imports.length) + " 位", "抓取 + 导入(去重前)"],
    ];
    info.innerHTML = cards.map(([l, v, d]) => `
      <div class="card stat-card">
        <div class="stat-label">${l}</div>
        <div class="stat-value">${v}</div>
        <div class="stat-delta caption">${d}</div>
      </div>
    `).join("");

    const holder = A.qs("#anaList", box);
    if (!S.imports.length) {
      holder.innerHTML = `
        <div class="empty" style="padding:var(--space-4)">
          <div style="font-size:30px;opacity:.4">🗂</div>
          <div class="empty-title">暂无本地导入数据</div>
          <p class="caption">点击上方「选择文件导入」,把运营表里的主播数据接进来。</p>
        </div>`;
      return;
    }
    holder.innerHTML = `
      <div class="table-wrap">
        <table class="plain">
          <thead><tr><th>主播</th><th>分层</th><th>粉丝数</th><th>涨粉</th><th>互动率</th><th>30天开播</th><th>营收</th><th>来源</th></tr></thead>
          <tbody>${S.imports.map(r => `
            <tr>
              <td><b>${esc(r.name)}</b><div class="caption">uid ${r.uid}</div></td>
              <td><span class="tag">${esc(r.tier || "腰部")}</span></td>
              <td>${A.fmt(r.followers)}</td>
              <td class="${r.followerDelta >= 0 ? "up" : "down"}">${r.followerDelta >= 0 ? "+" : ""}${A.fmt(r.followerDelta)}</td>
              <td>${((r.interactionRate || 0) * 100).toFixed(1)}%</td>
              <td>${A.fmt(r.liveCount30d)} 场</td>
              <td>¥${A.fmt(r.revenue30d)}</td>
              <td><span class="tag tag-b">Excel</span></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  function drawScopeTip() {
    const tip = A.qs("#anaScopeTip", S.box);
    if (!tip) return;
    const n = reportList().length;
    tip.textContent = `当前范围将包含 ${n} 位主播。`;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  // ---------- 报告 ----------
  function reportList() {
    const crawl = S.remote.slice();
    const local = S.imports.slice();
    if (S.scope === "crawl") return crawl;
    if (S.scope === "local") return local;
    return crawl.concat(local);
  }

  function exportReport() {
    const list = reportList();
    if (!list.length) { toast("当前范围没有可导出的数据"); return; }
    const now = new Date();
    const d = now.toISOString().slice(0, 10);
    const scopeName = { all: "全量(抓取+导入)", crawl: "全网抓取", local: "本地导入" }[S.scope];
    const liveN = list.filter(a => a.isLive).length;
    const headN = list.filter(a => a.tier === "头部").length;

    // 分层汇总
    const sum = (k) => list.reduce((s, a) => s + (a[k] || 0), 0);

    let md = `# VTuber 主播运营分析报告\n\n`;
    md += `> 生成时间:${now.toLocaleString("zh-CN")} · 数据范围:${scopeName}\n\n`;
    md += `## 一、总体概览\n\n`;
    md += `- 主播总数:${list.length} 位(头部 ${headN} 位 · 腰部 ${list.filter(a => a.tier === "腰部").length} 位 · 潜力 ${list.filter(a => a.tier === "潜力").length} 位)\n`;
    md += `- 当前开播:${liveN} 场\n`;
    md += `- 粉丝总量:${A.fmt(sum("followers"))} | 30 天净涨粉:${A.fmt(sum("followerDelta"))}\n`;
    md += `- 30 天营收合计:¥${A.fmt(sum("revenue30d"))}\n\n`;
    md += `## 二、主播明细\n\n`;
    list.forEach(a => {
      const ai = a.ai || {};
      md += `### ${a.name}(uid ${a.uid}) — ${a.tier || "腰部"}主播\n\n`;
      md += `- 粉丝数:${A.fmt(a.followers)} | 涨粉:${a.followerDelta >= 0 ? "+" : ""}${A.fmt(a.followerDelta)} | 今日:${a.isLive ? `直播中(人气 ${A.fmt(a.popularity)})` : "未开播"}\n`;
      md += `- 互动率:${((a.interactionRate || 0) * 100).toFixed(1)}% | 30天开播:${A.fmt(a.liveCount30d)}场 | 30天营收:¥${A.fmt(a.revenue30d)}\n\n`;
      if (ai.summary) md += `**AI 诊断:** ${ai.summary}\n\n`;
      if (ai.risks) md += `> ⚠️ 风险:${ai.risks}\n\n`;
      if (ai.suggestions && ai.suggestions.length) {
        md += `**AI 运营建议:**\n`;
        ai.suggestions.forEach(s => { md += `1. ${s}\n`; });
        md += `\n`;
      }
      md += `---\n\n`;
    });
    md += `*本报告由 VTuber 虚拟直播运营 AI 工作台自动生成*\n`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const aEl = A.el("a");
    aEl.href = url; aEl.download = `主播分析报告-${d}.md`;
    aEl.click();
    URL.revokeObjectURL(url);
    toast(`报告已导出,共 ${list.length} 位主播`);
  }

  // ---------- Excel 导入 ----------
  function importExcel() {
    const input = A.el("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      toast("正在解析 Excel…");
      try {
        const XLSX = await loadXlsx();
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        const parsed = rows.map(parseRow).filter(Boolean);
        if (!parsed.length) { toast("未识别到有效主播列"); return; }
        S.imports = S.imports.concat(parsed);
        saveLocal();
        refresh();
        drawScopeTip();
        toast(`导入成功 ${parsed.length} 位主播`);
      } catch (e) {
        console.error(e);
        toast("解析失败,请检查表格列名");
      }
    };
    input.click();
  }

  function parseRow(r) {
    const name = r["主播名"] || r["名称"] || r["主播"] || r["name"];
    const uid = Number(r["UID"] || r["uid"] || r["id"]) || null;
    if (!name && !uid) return null;
    const pf = (v) => (v == null || isNaN(v) ? 0 : Number(v));
    const tier = ["头部", "腰部", "潜力"].includes(r["分层"]) ? r["分层"] : "腰部";
    return {
      uid: uid != null ? uid : Math.floor(Math.random() * 1e9),
      name: String(name),
      roomId: null, platform: "bilibili",
      followers: pf(r["粉丝数"]),
      followerDelta: pf(r["涨粉"]),
      avgViewers: pf(r["平均在线"]),
      interactionRate: pf(r["互动率(%)"]) > 1 ? pf(r["互动率(%)"]) / 100 : pf(r["互动率(%)"]),
      liveCount30d: pf(r["30天开播"] || r["开播次数"]),
      liveHours30d: pf(r["开播时长"]),
      revenue30d: pf(r["营收"] || r["30天营收(元)"]),
      tier, growth: "stable",
      tags: [], imported: true,
      ai: null,
    };
  }

  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      s.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error("XLSX 未挂载"));
      s.onerror = () => reject(new Error("CDN 加载失败"));
      document.head.appendChild(s);
    });
  }

  // ---------- 注册 ----------
  window.Pages = window.Pages || {};
  window.Pages.analysis = { render };
})();