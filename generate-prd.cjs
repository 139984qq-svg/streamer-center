const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
        BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
        TabStopType, TabStopPosition } = require("docx");

// ── Colors ──
const PURPLE = "4A1D8E";
const PURPLE_LIGHT = "F3E8FF";
const GRAY_HEADER = "6B21A8";
const WHITE = "FFFFFF";
const LIGHT_BG = "F9FAFB";

// ── Border helpers ──
const borderDef = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const allBorders = { top: borderDef, bottom: borderDef, left: borderDef, right: borderDef };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// A4: 11906 x 16838 DXA, margins 1440 each side => usable width = 9026
const TABLE_WIDTH = 9026;
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

// ── Numbering config ──
const numberingConfig = {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "bullets2",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "bullets3",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "bullets4",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "bullets5",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "bullets6",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "bullets7",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "numbers",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "numbers2",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "numbers3",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
  ]
};

// ── Helper: paragraph shortcut ──
function p(text, opts = {}) {
  const runOpts = { font: "Microsoft YaHei", size: 22, ...opts };
  if (opts.bold) runOpts.bold = true;
  if (opts.color) runOpts.color = opts.color;
  if (opts.italics) runOpts.italics = true;
  const paraOpts = { children: [new TextRun({ text, ...runOpts })], spacing: { after: 120 } };
  if (opts.alignment) paraOpts.alignment = opts.alignment;
  if (opts.numbering) paraOpts.numbering = opts.numbering;
  if (opts.spacing) paraOpts.spacing = opts.spacing;
  return new Paragraph(paraOpts);
}

function heading(text, level) {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, font: "Microsoft YaHei" })],
  });
}

function emptyLine() {
  return new Paragraph({ children: [], spacing: { after: 60 } });
}

// ── Helper: multi-run paragraph ──
function multiP(runs, opts = {}) {
  const children = runs.map(r => {
    if (typeof r === "string") return new TextRun({ text: r, font: "Microsoft YaHei", size: 22 });
    return new TextRun({ font: "Microsoft YaHei", size: 22, ...r });
  });
  return new Paragraph({ children, spacing: { after: 120 }, ...opts });
}

// ── Table builder ──
function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders: allBorders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: PURPLE, type: ShadingType.CLEAR },
      margins: CELL_MARGINS,
      children: [new Paragraph({ children: [new TextRun({ text: h, font: "Microsoft YaHei", size: 20, bold: true, color: WHITE })] })]
    }))
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders: allBorders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? WHITE : LIGHT_BG, type: ShadingType.CLEAR },
      margins: CELL_MARGINS,
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), font: "Microsoft YaHei", size: 20 })] })]
    }))
  }));

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

// ── Read logo ──
let logoData;
try {
  logoData = fs.readFileSync("public/logo.png");
} catch(e) {
  logoData = null;
}

// ── Build Document ──
const children = [];

// ===== COVER PAGE =====
children.push(emptyLine(), emptyLine(), emptyLine(), emptyLine());

if (logoData) {
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new ImageRun({
      type: "png",
      data: logoData,
      transformation: { width: 280, height: 90 },
      altText: { title: "捞月狗Logo", description: "捞月狗平台官方Logo", name: "logo" }
    })]
  }));
  children.push(emptyLine());
}

children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 600, after: 200 },
  children: [new TextRun({ text: "主播中心 Web App", font: "Microsoft YaHei", size: 52, bold: true, color: PURPLE })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: "产品需求文档 (PRD)", font: "Microsoft YaHei", size: 36, color: GRAY_HEADER })]
}));
children.push(emptyLine());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "捞月狗直播平台", font: "Microsoft YaHei", size: 24, color: "666666" })]
}));
children.push(emptyLine(), emptyLine(), emptyLine(), emptyLine());

// Document info table
const infoColWidths = [2500, 6526];
children.push(makeTable(
  ["项目", "内容"],
  [
    ["文档名称", "捞月狗主播中心 Web App PRD"],
    ["文档版本", "v1.0"],
    ["创建日期", "2026-06-23"],
    ["产品定位", "主播学习 + 训练 + 资源 一站式 Web 平台"],
    ["技术栈", "Vite + React 19 + Tailwind CSS v4 + React Router v6"],
    ["AI 能力", "接入免费大模型（智谱 GLM-4-Flash / SiliconFlow / DeepSeek）"],
    ["部署方案", "Vercel / Netlify 免费静态托管"],
  ],
  infoColWidths
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 1. 项目概述 =====
children.push(heading("一、项目概述", HeadingLevel.HEADING_1));

children.push(heading("1.1 产品定位", HeadingLevel.HEADING_2));
children.push(p("捞月狗主播中心是一个面向平台全体主播的外部独立 Web App，定位为主播的「学习 + 训练 + 资源」一站式服务平台。不涉及登录鉴权与后台数据看板（暂无 API 对接），以内容消费和场景模拟训练为核心，帮助新老主播快速上手、持续成长。"));
children.push(p("所有人可通过 Web 网址直接访问使用，对全体主播完全开放。"));

children.push(heading("1.2 解决的问题", HeadingLevel.HEADING_2));
children.push(p("目前捞月狗平台缺乏一个集成的主播服务中心，主播在以下场景中无处可去："));
children.push(p("新主播不知道怎么开播、怎么暖场、怎么处理违规弹幕", { numbering: { reference: "bullets", level: 0 } }));
children.push(p("老主播缺少高质量话术灵感和场景化训练工具", { numbering: { reference: "bullets", level: 0 } }));
children.push(p("平台活动信息散落在各群/公告中，主播参与率低", { numbering: { reference: "bullets", level: 0 } }));
children.push(p("合规培训没有标准化的学习和考核路径", { numbering: { reference: "bullets", level: 0 } }));
children.push(p("不同定位的主播缺乏针对性的内容推荐", { numbering: { reference: "bullets", level: 0 } }));

children.push(heading("1.3 目标用户", HeadingLevel.HEADING_2));
children.push(makeTable(
  ["用户类型", "特征", "核心需求"],
  [
    ["新人主播", "刚入驻平台", "学习基本功和平台规则"],
    ["成长期主播", "有一定经验", "提升互动技巧和处理复杂场景的能力"],
    ["成熟主播", "经验丰富", "新鲜话术灵感和高阶玩法"],
  ],
  [2000, 3013, 4013]
));

children.push(heading("1.4 平台背景", HeadingLevel.HEADING_2));
children.push(p("捞月狗是语音厅直播平台，核心玩法为语音厅互动（一卡八麦位 + Boss 麦），同时新增露脸直播板块（需刷礼物解锁 10 分钟视频）。用户核心行为是语音互动，主播需要具备暖场、控场、唤醒用户、合规应对等综合能力。"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 2. 功能架构 =====
children.push(heading("二、功能架构总览", HeadingLevel.HEADING_1));

children.push(p("主播中心 Web App 整体功能架构如下："));
children.push(emptyLine());

const archColWidths = [2256, 2256, 2257, 2257];
children.push(makeTable(
  ["一级模块", "二级模块", "优先级", "状态"],
  [
    ["个人中心（Dashboard）", "欢迎区/进度/任务/诊断", "P0", "已完成"],
    ["模拟直播间", "一卡八麦位 + AI 模拟对话", "P0", "已完成"],
    ["学习中心", "7个子模块总入口", "P0", "已完成"],
    ["直播话术库", "30 标签 / 930 条话术", "P0", "已完成"],
    ["写作业灵感", "7类心理学主题", "P1", "已完成"],
    ["打赏群体心理画像", "5类用户画像 + 150条话术", "P1", "已完成"],
    ["今日热点话题", "35热点 + 230场景话题", "P1", "已完成"],
    ["标杆课堂", "音频波形 + 时间线分析", "P1", "已完成"],
    ["危机应对手册", "6类场景应急方案", "P1", "已完成"],
    ["主播成长地图", "3阶段18任务", "P1", "已完成"],
    ["上岗考核", "合规考试系统", "P2", "规划中"],
  ],
  archColWidths
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 3. 核心模块详细设计 =====
children.push(heading("三、核心模块详细设计", HeadingLevel.HEADING_1));

// 3.1 个人中心
children.push(heading("3.1 个人中心（首页 Dashboard）", HeadingLevel.HEADING_2));
children.push(p("打开 Web App 的默认首屏，展示主播当前状态与快捷入口。"));
children.push(emptyLine());
children.push(makeTable(
  ["模块", "内容", "说明"],
  [
    ["欢迎区", "欢迎回来，{昵称} + 当日激励语", "顶部区域"],
    ["进度卡片-1", "整体学习进度 (45%) + 进度条", "左上核心指标"],
    ["进度卡片-2", "上岗合格度 (68%) + 进度条", "右上核心指标"],
    ["数据统计行", "完成题数/连续打卡/AI评分/模拟积分", "四格横排"],
    ["今日任务", "当日待完成任务列表", "可勾选"],
    ["学习诊断", "Luna AI 生成的学习报告摘要", "底部信息卡片"],
  ],
  [2000, 4013, 3013]
));

children.push(emptyLine());

// 3.2 模拟直播
children.push(heading("3.2 模拟直播间（优先级 P0）", HeadingLevel.HEADING_2));
children.push(p("核心训练模块，模拟真实直播间环境，让主播在安全环境中练习应对各种场景。已接入免费大模型 API，提供实时 AI 教练辅导。"));

children.push(heading("3.2.1 麦位布局还原", HeadingLevel.HEADING_3));
children.push(p("一卡八布局：1 个主持位（顶部）+ Boss 麦 + 8 个嘉宾麦位（4x2 网格排列）。每个麦位显示头像占位 + 昵称 + 麦位序号。模拟中由 AI 角色自动填充各麦位，制造各种训练场景。"));

children.push(heading("3.2.2 AI 教练功能", HeadingLevel.HEADING_3));
children.push(p("话术提词器：根据当前直播间公屏消息和氛围状态，AI 实时生成 3 条可直接使用的话术建议，点击即填入发送框", { numbering: { reference: "bullets2", level: 0 } }));
children.push(p("AI 对话问答：主播可随时向 Luna 教练提问，获取场景化指导（如「遇到杠精怎么办」「冷场了怎么救」）", { numbering: { reference: "bullets2", level: 0 } }));
children.push(p("氛围诊断：实时显示当前直播间氛围状态（热烈/平稳/冷场）", { numbering: { reference: "bullets2", level: 0 } }));
children.push(p("打赏节奏监控：显示当前打赏活跃度和累计金额", { numbering: { reference: "bullets2", level: 0 } }));
children.push(p("冷场急救：一键触发急救话术推荐", { numbering: { reference: "bullets2", level: 0 } }));

children.push(heading("3.2.3 模拟用户系统", HeadingLevel.HEADING_3));
children.push(p("系统内置 7 类模拟用户角色，自动在公屏发送不同风格的消息，制造真实练习场景："));
children.push(makeTable(
  ["角色", "消息风格", "训练目的"],
  [
    ["甜心宝贝", "夸赞型、点歌型", "练习互动回应"],
    ["深夜孤独者", "倾诉型、求陪伴", "练习情感共鸣"],
    ["土豪大佬", "送礼型、要求上Boss麦", "练习VIP接待"],
    ["杠精小王", "挑衅型、比较型", "练习杠精应对"],
    ["话痨小妹", "活跃型、附和型", "练习节奏把控"],
    ["沉默路人", "极简回复型", "练习沉默用户激活"],
    ["新来的小白", "提问型、求助型", "练习新人引导"],
  ],
  [2000, 3513, 3513]
));

children.push(heading("3.2.4 LLM 接入方案", HeadingLevel.HEADING_3));
children.push(p("已实现多 LLM 提供商适配，支持通过环境变量一键切换："));
children.push(makeTable(
  ["提供商", "模型", "免费额度", "推荐"],
  [
    ["智谱AI", "GLM-4-Flash", "注册即送500万tokens", "推荐（中文效果好）"],
    ["SiliconFlow", "Qwen2.5-7B-Instruct", "注册送14元额度", "备选"],
    ["DeepSeek", "deepseek-chat", "注册送500万tokens", "备选"],
  ],
  [1800, 2500, 2726, 2000]
));

children.push(emptyLine());

// 3.3 直播话术
children.push(heading("3.3 直播话术库（优先级 P0）", HeadingLevel.HEADING_2));
children.push(p("已完成 930 条话术的生成与入库，覆盖 30 个细分心理学标签，每个标签下 30+ 条话术。支持标签筛选、关键词搜索、收藏、一键复制、分页浏览。"));

children.push(heading("3.3.1 话术标签体系（30 个心理学标签）", HeadingLevel.HEADING_3));
children.push(makeTable(
  ["分组", "标签名称（含心理学原理）"],
  [
    ["开场暖场（6个）", "开场暖场·首因效应, 欢迎新人·归属感建立, 欢迎老师·峰终定律, 万能破冰·认知开放, 上麦破冰·社交焦虑缓解, 趣味互动·多巴胺触发"],
    ["深度互动（4个）", "深度话题·自我暴露互惠, 轻话题·渐进暴露, 季节节日·集体记忆唤醒, 冷场急救·模式中断"],
    ["礼物感恩（3个）", "感谢礼物·互惠强化, 引导关注·承诺一致性, 下播话术·峰终定律"],
    ["情感陪伴（4个）", "沉默上麦·安全感构建, 深度陪伴·情绪容器, 情绪价值·镜像神经元, 边界设定·温和坚定"],
    ["冲突应对（3个）", "负面情绪·情绪镜映, 留人换留·损失厌恶, 杠精应对·非暴力边界"],
    ["高阶技巧（10个）", "感恩引导·心理安全感, 冲突调解·共情去极化, 节奏把控·注意力曲线, 品息防御·稳定效应, Boss接待·尊重需求, 游戏互动·参与感激活, 深夜治愈·安全依附, 连麦PK·竞争乐趣, 回访用户·惊喜效应, 特殊场景·仪式感营造"],
  ],
  [2500, 6526]
));

children.push(emptyLine());

// 3.4 其他学习模块
children.push(heading("3.4 其他学习子模块", HeadingLevel.HEADING_2));
children.push(makeTable(
  ["模块", "核心内容", "数据规模"],
  [
    ["写作业灵感", "7类心理学分类（认知觉醒、情绪共鸣、社交破冰等）", "每类3-5个灵感方案"],
    ["打赏群体心理画像", "5类用户画像（榜一大哥、土豪闪现、固定陪伴等）", "每类30条话术，共150条"],
    ["今日热点话题", "35个AI热点话题 + 230个场景话题", "覆盖17个分类"],
    ["标杆课堂", "音频波形回放 + 时间线高光分析", "多个标杆案例"],
    ["危机应对手册", "6类危机场景（杠精、冷场、敏感话题等）", "分级应急方案"],
    ["主播成长地图", "3阶段成长路径（入门/进阶/精通）", "18个具体任务"],
  ],
  [2200, 4326, 2500]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 4. 技术架构 =====
children.push(heading("四、技术架构", HeadingLevel.HEADING_1));

children.push(heading("4.1 技术栈", HeadingLevel.HEADING_2));
children.push(makeTable(
  ["层级", "技术方案", "版本", "说明"],
  [
    ["构建工具", "Vite", "8.x", "极速 HMR 开发体验"],
    ["前端框架", "React", "19.x", "组件化 SPA"],
    ["CSS框架", "Tailwind CSS", "v4", "原子化样式，紫色主题"],
    ["路由", "React Router", "v6", "侧边栏 + 嵌套路由"],
    ["AI 能力", "LLM API（智谱/SiliconFlow/DeepSeek）", "-", "免费大模型，模拟直播 AI 教练"],
    ["状态管理", "React useState/useRef", "-", "轻量级，无需额外库"],
    ["数据存储", "前端静态数据（JS模块）", "-", "930条话术+265条话题"],
    ["部署", "Vercel / Netlify / Cloudflare Pages", "-", "免费静态托管"],
  ],
  [1800, 2700, 1000, 3526]
));

children.push(heading("4.2 项目结构", HeadingLevel.HEADING_2));
children.push(p("streamer-center/", { bold: true }));
children.push(p("  src/pages/          — 10个页面组件（Dashboard, LearnHub, Scripts, Studio 等）"));
children.push(p("  src/data/           — 静态数据文件（scripts-part1/2/3.js, topics-full.js）"));
children.push(p("  src/services/llm.js — LLM API 接入模块（多提供商适配）"));
children.push(p("  src/App.jsx         — 主布局（紫色侧边栏 + 路由）"));
children.push(p("  public/logo.png     — 捞月狗官方 Logo"));
children.push(p("  .env.example        — 环境变量模板（LLM API Key 配置）"));

children.push(heading("4.3 构建产物", HeadingLevel.HEADING_2));
children.push(p("生产构建验证结果（2026-06-23）："));
children.push(p("index.html:  0.46 KB（gzip 0.32 KB）", { numbering: { reference: "bullets3", level: 0 } }));
children.push(p("CSS bundle:  42.59 KB（gzip 7.20 KB）", { numbering: { reference: "bullets3", level: 0 } }));
children.push(p("JS bundle:   670.53 KB（gzip 215.91 KB）", { numbering: { reference: "bullets3", level: 0 } }));
children.push(p("构建耗时:    351ms", { numbering: { reference: "bullets3", level: 0 } }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 5. 部署方案 =====
children.push(heading("五、部署上线方案", HeadingLevel.HEADING_1));

children.push(heading("5.1 推荐方案：Vercel（免费）", HeadingLevel.HEADING_2));
children.push(p("Vercel 是最推荐的部署方式，完全免费，自带 CDN 加速和 HTTPS："));
children.push(p("将项目推送到 GitHub 仓库", { numbering: { reference: "numbers", level: 0 } }));
children.push(p("访问 vercel.com 并使用 GitHub 账号登录", { numbering: { reference: "numbers", level: 0 } }));
children.push(p("点击「Import Project」，选择你的 GitHub 仓库", { numbering: { reference: "numbers", level: 0 } }));
children.push(p("Framework Preset 选择「Vite」，Root Directory 填写「streamer-center」", { numbering: { reference: "numbers", level: 0 } }));
children.push(p("在 Environment Variables 中添加 VITE_LLM_PROVIDER 和 VITE_LLM_API_KEY", { numbering: { reference: "numbers", level: 0 } }));
children.push(p("点击「Deploy」，等待约 30 秒即可上线", { numbering: { reference: "numbers", level: 0 } }));
children.push(p("Vercel 会自动分配一个 .vercel.app 域名，也支持绑定自定义域名。每次 git push 代码会自动重新部署。"));

children.push(heading("5.2 备选方案：Netlify（免费）", HeadingLevel.HEADING_2));
children.push(p("Netlify 支持拖拽部署，无需 Git 操作："));
children.push(p("在项目目录运行 npm run build，生成 dist 文件夹", { numbering: { reference: "numbers2", level: 0 } }));
children.push(p("访问 app.netlify.com，将 dist 文件夹直接拖入部署区域", { numbering: { reference: "numbers2", level: 0 } }));
children.push(p("约 10 秒后自动部署上线", { numbering: { reference: "numbers2", level: 0 } }));

children.push(heading("5.3 备选方案：Cloudflare Pages（免费）", HeadingLevel.HEADING_2));
children.push(p("Cloudflare Pages 提供全球 CDN 节点，对国内访问速度较好："));
children.push(p("登录 Cloudflare Dashboard → Pages → Create a project", { numbering: { reference: "numbers3", level: 0 } }));
children.push(p("连接 GitHub 仓库，构建命令填 npm run build，输出目录填 dist", { numbering: { reference: "numbers3", level: 0 } }));
children.push(p("部署完成后分配 .pages.dev 域名", { numbering: { reference: "numbers3", level: 0 } }));

children.push(heading("5.4 SPA 路由配置", HeadingLevel.HEADING_2));
children.push(p("由于本项目使用 React Router（BrowserRouter），所有路由都需要回落到 index.html。需要在部署平台配置重写规则："));
children.push(p("Vercel：在项目根目录创建 vercel.json，配置 rewrites 规则", { numbering: { reference: "bullets4", level: 0 } }));
children.push(p("Netlify：在 public 目录创建 _redirects 文件，内容为 /* /index.html 200", { numbering: { reference: "bullets4", level: 0 } }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 6. 设计规范 =====
children.push(heading("六、设计规范", HeadingLevel.HEADING_1));

children.push(heading("6.1 视觉风格", HeadingLevel.HEADING_2));
children.push(makeTable(
  ["元素", "规范"],
  [
    ["主色调", "深紫渐变 #4A1D8E → #6B21A8（侧边栏）+ 白色内容区"],
    ["Logo", "捞月狗官方 Logo（绿色圆角图标 + 黑字），白底圆角容器内展示"],
    ["卡片风格", "圆角 12px + 轻投影 shadow-sm"],
    ["进度指示", "彩色渐变进度条（蓝/绿/紫）"],
    ["字体", "系统默认中文字体（Microsoft YaHei / PingFang SC）"],
    ["图标风格", "SVG 线性图标 + 品牌色点缀"],
    ["整体调性", "专业但不严肃，有科技感但亲切"],
    ["模拟直播间", "深紫背景 #1a0533，霓虹风格，沉浸感"],
  ],
  [2500, 6526]
));

children.push(heading("6.2 导航结构", HeadingLevel.HEADING_2));
children.push(p("侧边栏导航（固定 240px 宽），包含以下菜单项："));
children.push(p("个人中心（首页）", { numbering: { reference: "bullets5", level: 0 } }));
children.push(p("学习（可展开，含 7 个子模块）", { numbering: { reference: "bullets5", level: 0 } }));
children.push(p("上岗考核", { numbering: { reference: "bullets5", level: 0 } }));
children.push(p("模拟直播间", { numbering: { reference: "bullets5", level: 0 } }));
children.push(p("底部显示用户头像和昵称"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 7. 数据规模 =====
children.push(heading("七、数据规模与内容统计", HeadingLevel.HEADING_1));
children.push(makeTable(
  ["内容类型", "数量", "组织方式"],
  [
    ["直播话术", "930 条", "3个数据文件（各300/300/330），30个心理学标签"],
    ["热点话题", "35 条", "按日期分组，含来源标识和 3 条直播引入话术"],
    ["场景话题", "230 条", "17个分类（破冰/共鸣/辩论/音乐/游戏等）"],
    ["用户画像", "5 类", "每类含30条针对性话术，共150条"],
    ["危机场景", "6 类", "分级应急方案"],
    ["成长任务", "18 个", "3阶段（入门/进阶/精通）"],
    ["模拟用户", "7 类", "自动发消息制造练习场景"],
  ],
  [2500, 1500, 5026]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 8. 用户旅程 =====
children.push(heading("八、用户旅程", HeadingLevel.HEADING_1));

children.push(heading("8.1 新主播首次使用", HeadingLevel.HEADING_2));
children.push(p("打开网页链接 → 进入个人中心 → 查看学习进度和今日任务 → 进入学习中心浏览各模块 → 进入话术库收藏常用话术 → 进入模拟直播间开始练习 → AI 教练实时指导。"));

children.push(heading("8.2 老主播日常使用", HeadingLevel.HEADING_2));
children.push(p("路径 A：话术库 → 按标签筛选 → 搜索关键词 → 一键复制使用", { numbering: { reference: "bullets6", level: 0 } }));
children.push(p("路径 B：模拟直播间 → 开始模拟 → AI 生成话术建议 → 练习互动 → 向 Luna 提问", { numbering: { reference: "bullets6", level: 0 } }));
children.push(p("路径 C：热点话题 → 查看今日热点 → 获取直播素材", { numbering: { reference: "bullets6", level: 0 } }));
children.push(p("路径 D：危机手册 → 遇到问题时查阅应对方案", { numbering: { reference: "bullets6", level: 0 } }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 9. 待确认与后续规划 =====
children.push(heading("九、待确认事项与后续规划", HeadingLevel.HEADING_1));

children.push(heading("9.1 待确认事项", HeadingLevel.HEADING_2));
children.push(makeTable(
  ["项目", "描述", "优先级"],
  [
    ["用户身份方案", "当前无登录系统，后期可考虑手机号/邀请码轻量注册", "中"],
    ["话术内容合规", "930条话术内容需运营/法务审核后正式上线", "高"],
    ["LLM API Key 管理", "生产环境建议通过后端代理转发 API 请求，避免前端暴露 Key", "高"],
    ["数据持久化", "纯前端存储有丢失风险，后期需接后端数据库", "中"],
    ["内容更新机制", "话术/题库/课程的持续更新需配套运营后台", "中"],
    ["移动端适配", "当前为桌面端设计（min-width 1024px），后期需响应式适配", "中"],
  ],
  [2500, 4526, 2000]
));

children.push(heading("9.2 后续迭代规划", HeadingLevel.HEADING_2));
children.push(makeTable(
  ["阶段", "内容", "预估周期"],
  [
    ["P2 - 上岗考核", "合规题库 + 考试系统 + 成绩记录", "1-2周"],
    ["P2 - 积分体系", "学习/训练行为积分 + 积分排行榜", "1周"],
    ["P3 - 后端接入", "用户注册/登录 + 数据持久化 + API 代理", "2-3周"],
    ["P3 - 移动端适配", "响应式布局 + 移动端导航", "1-2周"],
    ["P3 - AI 个性化推荐", "根据使用数据推荐话术和训练场景", "2周"],
    ["P4 - 运营后台", "话术管理/活动发布/数据看板", "3-4周"],
  ],
  [2500, 4526, 2000]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ===== 10. 成功指标 =====
children.push(heading("十、成功指标", HeadingLevel.HEADING_1));
children.push(makeTable(
  ["指标", "目标值", "衡量方式"],
  [
    ["主播访问率", "上线1个月内 > 60%", "UV / 全体主播数"],
    ["模拟训练周活跃率", "> 40%", "周活跃用户 / 总访问用户"],
    ["话术复制次数", "人均 > 5次/周", "复制按钮点击埋点"],
    ["AI 教练使用率", "> 30%", "发送问题的用户占比"],
    ["页面平均停留时长", "> 5分钟", "页面停留时间统计"],
    ["NPS 满意度", "> 7分", "用户调查问卷"],
  ],
  [2500, 3013, 3513]
));

children.push(emptyLine());
children.push(emptyLine());

// Footer note
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 600 },
  children: [new TextRun({ text: "文档版本：v1.0  |  最后更新：2026-06-23  |  捞月狗直播平台", font: "Microsoft YaHei", size: 18, color: "999999", italics: true })],
}));

// ── Assemble document ──
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Microsoft YaHei", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei", color: PURPLE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei", color: "333333" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Microsoft YaHei", color: "555555" },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 }
      },
    ]
  },
  numbering: numberingConfig,
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "捞月狗主播中心 Web App — PRD v1.0", font: "Microsoft YaHei", size: 16, color: "999999" }),
            new TextRun("\t"),
            new TextRun({ text: "机密文档", font: "Microsoft YaHei", size: 16, color: "999999" }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 16, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16, color: "999999" }),
            new TextRun({ text: " 页", font: "Microsoft YaHei", size: 16, color: "999999" }),
          ]
        })]
      })
    },
    children,
  }]
});

Packer.toBuffer(doc).then(buf => {
  const outPath = process.argv[2] || "PRD.docx";
  fs.writeFileSync(outPath, buf);
  console.log("Generated: " + outPath + " (" + (buf.length / 1024).toFixed(1) + " KB)");
});
