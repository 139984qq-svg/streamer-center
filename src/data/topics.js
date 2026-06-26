// 今日热点话题数据 - 使用完整数据集
import { hotTopics as fullHotTopics, sceneTopics as fullSceneTopics } from './topics-full.js';

export const hotTopics = fullHotTopics;

export const sceneTopicCategories = [
  '全部', '破冰', '共鸣', '辩论', '深谈', '音乐', '影视', '美食', '旅行',
  '宠物', '盲盒', '脑洞', '游戏', '节日', '热点', 'MBTI/星座', '日常', '未来',
];

export const sceneTopics = fullSceneTopics;
