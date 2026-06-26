// 直播话术数据 - 合并所有分片
import scriptsPart1 from './scripts-part1.js';
import scriptsPart2 from './scripts-part2.js';
import scriptsPart3 from './scripts-part3.js';

// 30+ 细分标签体系
export const scriptTags = [
  '全部场景',
  '开场暖场·首因效应',
  '欢迎新人·归属感建立',
  '欢迎老师·峰终定律',
  '万能破冰·认知开放',
  '上麦破冰·社交焦虑缓解',
  '趣味互动·多巴胺触发',
  '深度话题·自我暴露互惠',
  '轻话题·渐进暴露',
  '季节节日·集体记忆唤醒',
  '冷场急救·模式中断',
  '感谢礼物·互惠强化',
  '引导关注·承诺一致性',
  '下播话术·峰终定律',
  '沉默上麦·安全感构建',
  '深度陪伴·情绪容器',
  '情绪价值·镜像神经元',
  '边界设定·温和坚定',
  '负面情绪·情绪镜映',
  '留人换留·损失厌恶',
  '杠精应对·非暴力边界',
  '感恩引导·心理安全感',
  '冲突调解·共情去极化',
  '节奏把控·注意力曲线',
  '品息防御·稳定效应',
  'Boss接待·尊重需求',
  '游戏互动·参与感激活',
  '深夜治愈·安全依附',
  '连麦PK·竞争乐趣',
  '回访用户·惊喜效应',
  '特殊场景·仪式感营造',
];

// 合并所有 930 条话术
export const scripts = [
  ...scriptsPart1.map(s => ({ ...s, favorite: false })),
  ...scriptsPart2.map(s => ({ ...s, favorite: false })),
  ...scriptsPart3.map(s => ({ ...s, favorite: false })),
];
