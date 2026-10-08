/* ============================================================
   app.js · 应用骨架
   哈希路由 + 侧边导航 + 面包屑 + 主题/侧栏/抽屉 + 页面分发
   ============================================================ */
(function () {
  "use strict";

  // ---------- 路由表 ----------
  const ROUTES = [
    { group: "工作区", items: [
      { id: "overview",   label: "总览",       icon: "◇", desc: "今日运营概览与 AI 建议" },
      { id: "anchors",    label: "主播中心",   icon: "👤", desc: "全网主播数据、分层诊断与运营推荐" },
      { id: "analysis",   label: "数据导入与分析", icon: "🗂", desc: "Excel 导入主播数据、生成分析报告" },
      { id: "planning",   label: "内容企划库", icon: "✎", desc: "节日/热点方案生成与活动整合" },
    ]},
    { group: "数据情报", items: [
      { id: "monitor",    label: "开播监控",   icon: "📡", desc: "全站 VTuber 开播实时监控,一键进入直播间" },
      { id: "news",       label: "全网资讯",   icon: "◎", desc: "V 圈新闻通稿与圈内动态聚合" },
      { id: "community",  label: "粉丝社群",   icon: "♡", desc: "社群讨论分析与粉丝偏好洞察" },
      { id: "review",     label: "直播复盘",   icon: "▶", desc: "弹幕/礼物/留存/付费复盘日报" },
      { id: "daily",      label: "数据日报",   icon: "≡", desc: "每日指标快照与趋势" },
    ]},
  ];

  const HOME_ID = "overview";

  // ---------- 状态 ----------
  const state = {
    route: HOME_ID,
    params: [],
    theme: localStorage.getItem("vt-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    sidebarCollapsed: localStorage.getItem("vt-sidebar") === "1",
  };

  // ---------- 工具 ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  // ---------- 暴露给模块的公共 API(须在 $/el 等声明后,避免 TDZ) ----------
  window.App = {
    state,
    findRoute,
    toast,
    qs: $,
    el,
    refresh: handleHash,
    fmt(n, d = 0) {
      if (n == null) return "-";
      return Number(n).toLocaleString("zh-CN", { maximumFractionDigits: d });
    },
  };

  function findRoute(id) {
    for (const g of ROUTES) for (const it of g.items) if (it.id === id) return it;
    return null;
  }

  function toast(msg) {
    const wrap = $("#toastWrap");
    const t = el("div", "toast", msg);
    wrap.appendChild(t);
    setTimeout(() => { t.remove(); }, 2600);
  }

  // ---------- 侧边导航 ----------
  function renderSidebar() {
    const nav = $("#sidebarNav");
    nav.innerHTML = "";
    ROUTES.forEach((g) => {
      const group = el("div", "nav-group");
      group.appendChild(el("div", "nav-group-title", g.group));
      g.items.forEach((it) => {
        const a = el("a", "nav-item" + (it.id === state.route ? " active" : ""));
        a.href = "#/" + it.id;
        a.setAttribute("aria-current", it.id === state.route ? "page" : "false");
        a.appendChild(el("span", "nav-icon", it.icon));
        a.appendChild(el("span", "nav-text", it.label));
        group.appendChild(a);
      });
      nav.appendChild(group);
    });
  }

  // ---------- 面包屑 ----------
  function renderBreadcrumb() {
    const bc = $("#breadcrumb");
    const cur = findRoute(state.route);
    if (!cur) return;
    // 模块页为浅层同级,面包屑保持两级:总览(可点上级)› 当前页(纯文本)。
    // 深层子页(如主播中心>导入)后续由模块自身追加层级。
    bc.innerHTML = "";
    const home = el("a", "", "总览");
    home.href = "#/" + HOME_ID;
    bc.appendChild(home);
    bc.appendChild(el("span", "sep", "›"));
    bc.appendChild(el("span", "current", cur.label));
  }

  // ---------- 页面分发:模块页面注册制 ----------
  // window.Pages[<routeId>] = { render(appBox) } 由各模块脚本注册
  function renderPage() {
    const content = $("#content");
    const route = findRoute(state.route);
    if (!route) { window.location.hash = "#/" + HOME_ID; return; }

    const page = el("div");
    page.appendChild(el("h1", "page-title", route.label));
    page.appendChild(el("p", "page-desc", route.desc));
    content.innerHTML = "";
    content.appendChild(page);

    // 模块页面容器
    const box = el("div", "page-box");
    content.appendChild(box);

    const handler = window.Pages && window.Pages[state.route];
    if (handler && typeof handler.render === "function") {
      handler.render(box, { subscribe: onRouteSubPage });
    } else {
      const ph = el("div", "card");
      ph.appendChild(el("div", "page-placeholder", `
        <div style="font-size:32px;opacity:.45">${route.icon}</div>
        <div class="empty-title" style="font-size:16px;font-weight:600">模块「${route.label}」建设中</div>
        <p style="color:var(--color-text-secondary)">骨架已就绪,该模块将按 design-system.md 规范填充真实数据与 AI 分析。</p>
        <span class="ai-note">AI Agent 工作台 · 骨架期</span>
      `));
      box.appendChild(ph);
    }
  }

  // 深层子页面(如 主播中心 > 导入)由模块内部通过 hash 追加层级
  function onRouteSubPage() { renderBreadcrumb(); }

  // ---------- 主题 ----------
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("vt-theme", state.theme);
    $("#themeToggle").textContent = state.theme === "dark" ? "☀" : "◐";
  }

  // ---------- 侧栏展开/收起/抽屉 ----------
  function applySidebar() {
    const sb = $("#sidebar");
    sb.classList.toggle("collapsed", state.sidebarCollapsed);
    localStorage.setItem("vt-sidebar", state.sidebarCollapsed ? "1" : "0");
    const isMobile = window.innerWidth <= 767;
    $("#collapseToggle").style.display = isMobile ? "none" : "";
    if (!isMobile) sb.classList.remove("open");
  }

  // ---------- 路由 ----------
  function handleHash() {
    const segs = (window.location.hash || "")
      .replace(/^#\//, "").split("/").filter(Boolean);
    const id = segs[0] || HOME_ID;
    if (!findRoute(id)) { window.location.hash = "#/" + HOME_ID; return; }
    state.route = id;
    state.params = segs.slice(1);
    renderSidebar();
    renderBreadcrumb();
    renderPage();
    $("#content").scrollTop = 0;
    window.scrollTo(0, 0);
    // 移动端切页后关闭抽屉
    $("#sidebar").classList.remove("open");
    $("#sidebarMask").classList.remove("show");
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    window.addEventListener("hashchange", handleHash);

    $("#themeToggle").addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
    });

    $("#menuToggle").addEventListener("click", () => {
      const sb = $("#sidebar"), mask = $("#sidebarMask");
      sb.classList.toggle("open");
      mask.classList.toggle("show", sb.classList.contains("open"));
    });

    $("#sidebarMask").addEventListener("click", () => {
      $("#sidebar").classList.remove("open");
      $("#sidebarMask").classList.remove("show");
    });

    $("#collapseToggle").addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      applySidebar();
    });
  }

  // ---------- 启动 ----------
  document.addEventListener("DOMContentLoaded", async () => {
    applyTheme();
    applySidebar();
    renderSidebar();
    renderBreadcrumb();
    bindEvents();
    handleHash();

    // 今日 AI 状态角标:有数据文件时点亮
    const d = await Store.daily();
    const note = $("#todayNote");
    if (d && d.insights) {
      note.textContent = "AI 已更新 " + (d.date || "");
      note.title = "今日数据与 AI 分析已就绪";
    } else {
      note.textContent = "AI";
      note.title = "等待定时任务写入今日数据";
    }
  });
})();