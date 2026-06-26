/**
 * 免费大模型 API 接入模块
 * 
 * 支持以下免费 LLM：
 * 1. 智谱 GLM-4-Flash (推荐，中文效果好，免费)
 * 2. 硅基流动 SiliconFlow (免费额度)
 * 3. DeepSeek (免费试用)
 * 
 * 使用方式：
 * 在 .env 文件中配置 API Key：
 *   VITE_LLM_PROVIDER=zhipu          (zhipu | siliconflow | deepseek)
 *   VITE_LLM_API_KEY=your_api_key
 */

// LLM 提供商配置
const PROVIDERS = {
  zhipu: {
    name: '智谱AI (GLM-4-Flash)',
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
    freeInfo: '免费，注册即送500万tokens → https://open.bigmodel.cn',
  },
  siliconflow: {
    name: 'SiliconFlow',
    url: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    freeInfo: '免费额度，注册送14元 → https://siliconflow.cn',
  },
  deepseek: {
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    freeInfo: '注册送500万tokens → https://platform.deepseek.com',
  },
};

// 系统提示词 — 模拟直播间 AI 教练
const SYSTEM_PROMPT = `你是"Luna"，捞月狗直播平台的AI主播教练。你正在一个模拟直播间中实时辅导主播练习。

你的角色定位：
- 你是一个经验丰富的直播间运营教练，熟悉语音厅直播（一卡八麦位+Boss麦）的所有场景
- 你善于分析直播间氛围、观众互动，给出即时可用的话术建议
- 你的语言风格亲和、专业、简洁，像一个在耳边轻声指导的教练

你的核心能力：
1. 话术推荐：根据当前直播场景（开场、互动、冷场、感谢打赏等），提供3条适合的话术
2. 氛围诊断：判断当前直播间氛围（热烈/平稳/冷场），给出调节建议
3. 应急处理：遇到杠精、冷场、尴尬等情况，快速给出化解方案
4. 用户分析：分析上麦用户的互动风格，给出个性化接待建议

回复要求：
- 每次回复控制在100字以内，简洁实用
- 话术建议直接给出可以念的原文，用引号标出
- 多用口语化表达，符合直播间的轻松氛围
- 如果被问到非直播相关问题，礼貌引导回直播话题`;

/**
 * 获取当前 LLM 配置
 */
function getConfig() {
  const provider = import.meta.env.VITE_LLM_PROVIDER || 'zhipu';
  const apiKey = import.meta.env.VITE_LLM_API_KEY || '';
  const config = PROVIDERS[provider] || PROVIDERS.zhipu;
  return { ...config, apiKey, provider };
}

/**
 * 发送消息到 LLM
 * @param {Array} messages - 对话历史 [{role: 'user'|'assistant', content: '...'}]
 * @param {Object} options - 可选参数
 * @returns {Promise<string>} AI 回复内容
 */
export async function chatWithAI(messages, options = {}) {
  const config = getConfig();
  
  if (!config.apiKey) {
    return `[AI 未配置] 请在项目根目录创建 .env 文件并配置：\n\nVITE_LLM_PROVIDER=${config.provider}\nVITE_LLM_API_KEY=你的API密钥\n\n推荐使用${config.name}（${config.freeInfo}）`;
  }

  const payload = {
    model: config.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: options.temperature || 0.8,
    max_tokens: options.maxTokens || 300,
    stream: false,
  };

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 请求失败 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '抱歉，AI暂时无法回复';
  } catch (error) {
    console.error('LLM API Error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return '[网络错误] 无法连接到AI服务，请检查网络连接';
    }
    return `[AI错误] ${error.message}`;
  }
}

/**
 * 生成场景化话术建议
 * @param {string} scene - 当前场景描述
 * @param {Array} chatHistory - 最近的聊天记录
 * @returns {Promise<string>} AI 生成的话术建议
 */
export async function getSceneSuggestion(scene, chatHistory = []) {
  const contextMsg = chatHistory.length > 0
    ? `\n\n最近的公屏消息：\n${chatHistory.map(m => `${m.user}: ${m.msg}`).join('\n')}`
    : '';

  return chatWithAI([
    {
      role: 'user',
      content: `当前直播间场景：${scene}${contextMsg}\n\n请给我3条适合当前场景的话术建议，每条用序号标出，直接给出可以念的话术原文。`,
    },
  ]);
}

/**
 * 获取 LLM 服务状态
 */
export function getLLMStatus() {
  const config = getConfig();
  return {
    provider: config.name,
    configured: !!config.apiKey,
    freeInfo: config.freeInfo,
  };
}

export { PROVIDERS };
