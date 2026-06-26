import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatWithAI, getLLMStatus } from '../services/llm';

// ==================== 自然聊天消息库 ====================
const NATURAL_MESSAGES = {
  generic: [
    '666', '哈哈哈哈', '来了来了', 'dd', '1111', '冲冲冲',
    '笑死我了', '主播好', '加油！', '？？？', '绝了',
    '好听好听', '继续继续', '哈哈', '厉害', '真的假的',
    '太逗了', '我也是', '对对对', '支持主播',
    '这个可以', '爱了爱了', '我来了', '还在吗',
    '有没有人', '氛围不错', '第一次来', '好有意思',
    '嘻嘻', '啊这', '上班摸鱼中', '准时到', '打卡',
  ],
  reactions: {
    greeting: ['主播好~', '来了!', '终于等到了', '晚上好', '来报到了', '嗨嗨嗨', '准时打卡~'],
    question: ['我我我!', '选A!', '不知道哈哈', '这个...', '让我想想', '肯定是B啊', '难说'],
    funny: ['哈哈哈哈笑死', '绝了', '太好笑了', '不行了笑出声', '主播太逗了', '我要笑哭了'],
    thanks: ['大哥好帅!', '主播说话好甜', '666', '不客气', '应该的', '比心'],
    topic: ['是的是的', '我也觉得', '这个有意思', '确实', '讲讲讲', '继续说'],
    weird: ['？？', '啥情况', '离谱', '什么鬼', '这...', 'emm'],
    support: ['加油！', '你最棒', '冲鸭', '我们都支持你', '棒棒的'],
    farewell: ['拜拜~', '明天见', '注意休息', '下次还来', '晚安~'],
  },
};

// 关键词匹配系统
const KEYWORD_RESPONSE_MAP = [
  { keywords: ['欢迎', '大家好', '宝子', '晚上好', '开播'], reaction: 'greeting' },
  { keywords: ['吗', '？', '谁', '什么', '怎么', '哪', '猜'], reaction: 'question' },
  { keywords: ['哈哈', '笑', '搞笑', '逗', '段子'], reaction: 'funny' },
  { keywords: ['感谢', '谢谢', '爱', '么么', '比心'], reaction: 'thanks' },
  { keywords: ['今天', '最近', '新闻', '听说', '话题', '聊'], reaction: 'topic' },
  { keywords: ['加油', '努力', '冲', '坚持', '棒'], reaction: 'support' },
  { keywords: ['拜', '走了', '下了', '睡了', '明天见'], reaction: 'farewell' },
];

function getReactionForHostMessage(text) {
  for (const rule of KEYWORD_RESPONSE_MAP) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      const pool = NATURAL_MESSAGES.reactions[rule.reaction];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  // 没匹配到就用通用回复
  const generic = ['嗯嗯', '好的', '收到', '666', '对', '哈哈'];
  return generic[Math.floor(Math.random() * generic.length)];
}

// 随机用户名池
const USER_NAMES = [
  '甜心宝贝', '夜猫子666', '深夜食堂', '路过的风', '开心果',
  '小可爱', '沉默路人', '新来的小白', '快乐星球', '追梦人',
  '吃货一枚', '星空漫步', '暴走少年', '奶茶控', '佛系青年',
  '彩虹糖', '哈密瓜', '月亮与六便士', '流浪猫', '向日葵',
];

// ==================== 场景配置 ====================
const SCENES = {
  warmup: {
    name: '开场暖场训练',
    difficulty: '初级',
    description: '模拟直播间开播前5分钟，练习如何快速激活氛围、欢迎新进用户、引导互动。',
    messages: [
      { user: '甜心宝贝', msg: '终于开播了~等好久', type: 'normal' },
      { user: '新来的小白', msg: '第一次来 看看', type: 'newbie' },
      { user: '路过的风', msg: '刷到了进来看看', type: 'normal' },
      { user: '夜猫子666', msg: '下班了来听听', type: 'normal' },
      { user: '开心果', msg: '主播今天状态不错', type: 'normal' },
      { user: '深夜食堂', msg: '加个关注~', type: 'normal' },
      { user: '系统', msg: '欢迎新用户 路过的风 进入直播间', type: 'system' },
      { user: '小可爱', msg: '声音好好听', type: 'normal' },
      { user: '快乐星球', msg: '来了来了', type: 'normal' },
      { user: '追梦人', msg: '准时报到', type: 'normal' },
      { user: '系统', msg: '新用户 吃货一枚 进入直播间', type: 'system' },
      { user: '吃货一枚', msg: '这里干嘛的', type: 'newbie' },
      { user: '奶茶控', msg: '打卡打卡', type: 'normal' },
      { user: '甜心宝贝', msg: '今天人好多', type: 'normal' },
      { user: '星空漫步', msg: '666', type: 'normal' },
      { user: '佛系青年', msg: '路过', type: 'normal' },
      { user: '暴走少年', msg: '冲冲冲', type: 'normal' },
      { user: '路过的风', msg: '这主播有意思', type: 'normal' },
      { user: '哈密瓜', msg: '刚下课来的', type: 'normal' },
      { user: '系统', msg: '当前在线人数：15', type: 'system' },
    ],
    suggestions: [
      '欢迎宝子们~今天状态超好，准备给大家带来一个开心的夜晚！',
      '新来的朋友点个关注不迷路哦，主播每天晚上8点准时开播~',
      '感谢所有等我的宝子们！今天有特别节目，大家猜猜是什么？',
    ],
  },
  coldfix: {
    name: '冷场急救训练',
    difficulty: '中级',
    description: '模拟直播间突然冷场、无人互动的场景，练习如何快速暖场、制造话题。',
    messages: [
      { user: '沉默路人', msg: '...', type: 'normal' },
      { user: '路过的风', msg: '嗯', type: 'normal' },
      { user: '沉默路人', msg: '哦', type: 'normal' },
      { user: '系统', msg: '用户 夜猫子666 离开了直播间', type: 'system' },
      { user: '路过的风', msg: '...', type: 'normal' },
      { user: '新来的小白', msg: '人呢？', type: 'normal' },
      { user: '沉默路人', msg: '还在吗', type: 'normal' },
      { user: '系统', msg: '用户 小可爱 离开了直播间', type: 'system' },
      { user: '佛系青年', msg: '安静', type: 'normal' },
      { user: '系统', msg: '用户 开心果 离开了直播间', type: 'system' },
      { user: '路过的风', msg: '要下了', type: 'normal' },
      { user: '沉默路人', msg: '没意思', type: 'normal' },
      { user: '系统', msg: '当前在线人数：3', type: 'system' },
      { user: '新来的小白', msg: '主播不说话了？', type: 'normal' },
      { user: '沉默路人', msg: '走了走了', type: 'normal' },
      { user: '系统', msg: '用户 路过的风 离开了直播间', type: 'system' },
      { user: '佛系青年', msg: '...', type: 'normal' },
      { user: '新来的小白', msg: '只剩我了？', type: 'normal' },
      { user: '系统', msg: '当前在线人数：2', type: 'system' },
      { user: '佛系青年', msg: '来个人聊天啊', type: 'normal' },
    ],
    suggestions: [
      '宝子们互动一下呀！打个1证明你们还在~第一个打1的我点名表扬！',
      '来来来，玩个游戏！我说一个字大家接龙，输了的发个表情包惩罚~',
      '你们知道吗，今天发生了一件超搞笑的事情，我给你们讲讲...',
    ],
  },
  boss: {
    name: 'Boss接待训练',
    difficulty: '高级',
    description: '模拟VIP大哥进入直播间的场景，练习礼貌接待、不卑不亢、引导消费但不过度。',
    messages: [
      { user: '系统', msg: '欢迎 VIP用户 土豪大佬 进入直播间', type: 'system' },
      { user: '土豪大佬', msg: '送了 火箭 x3', type: 'gift' },
      { user: '甜心宝贝', msg: '大哥好壕！', type: 'normal' },
      { user: '土豪大佬', msg: '今天心情好 刷点', type: 'normal' },
      { user: '土豪大佬', msg: '想上Boss麦', type: 'normal' },
      { user: '开心果', msg: '大哥带带我~', type: 'normal' },
      { user: '土豪大佬', msg: '送了 城堡 x1', type: 'gift' },
      { user: '新来的小白', msg: 'wow这是什么特效', type: 'newbie' },
      { user: '夜猫子666', msg: '全屏特效！', type: 'normal' },
      { user: '路过的风', msg: '壕无人性', type: 'normal' },
      { user: '土豪大佬', msg: '主播唱首歌吧', type: 'normal' },
      { user: '甜心宝贝', msg: '大哥点歌！', type: 'normal' },
      { user: '土豪大佬', msg: '送了 跑车 x2', type: 'gift' },
      { user: '快乐星球', msg: '大哥太帅了', type: 'normal' },
      { user: '暴走少年', msg: '666666', type: 'normal' },
      { user: '土豪大佬', msg: '开心就好', type: 'normal' },
      { user: '追梦人', msg: '又刷！', type: 'normal' },
      { user: '系统', msg: '土豪大佬 成为本场贡献第一名', type: 'system' },
      { user: '土豪大佬', msg: '明天还来', type: 'normal' },
      { user: '甜心宝贝', msg: '大哥明天见！', type: 'normal' },
    ],
    suggestions: [
      '感谢大哥的火箭！太豪气了！给大哥安排Boss麦位~',
      '大哥来啦！今天最闪亮的星，感谢支持~大哥想听什么歌我安排！',
      '哇塞城堡特效全屏了！感谢大哥！大家一起扣666~',
    ],
  },
  troll: {
    name: '杠精应对训练',
    difficulty: '中级',
    description: '模拟遇到恶意评论、抬杠用户的场景，练习不激化矛盾、巧妙化解。',
    messages: [
      { user: '杠精小王', msg: '这个主播不怎么样吧', type: 'normal' },
      { user: '杠精小王', msg: '隔壁比你好多了', type: 'normal' },
      { user: '甜心宝贝', msg: '别理他主播', type: 'normal' },
      { user: '杠精小王', msg: '就这水平还开播？', type: 'normal' },
      { user: '开心果', msg: '喷子走开', type: 'normal' },
      { user: '杠精小王', msg: '你粉丝也不怎么样', type: 'normal' },
      { user: '路过的风', msg: '怎么了这是', type: 'normal' },
      { user: '杠精小王', msg: '我说的不对吗？', type: 'normal' },
      { user: '新来的小白', msg: '吵什么呢', type: 'normal' },
      { user: '杠精小王', msg: '垃圾主播', type: 'normal' },
      { user: '甜心宝贝', msg: '举报了', type: 'normal' },
      { user: '杠精小王', msg: '怕了？', type: 'normal' },
      { user: '夜猫子666', msg: '别上当主播', type: 'normal' },
      { user: '杠精小王', msg: '我就是来看笑话的', type: 'normal' },
      { user: '快乐星球', msg: '拉黑吧', type: 'normal' },
      { user: '杠精小王', msg: '不敢回我？', type: 'normal' },
      { user: '沉默路人', msg: '无语...', type: 'normal' },
      { user: '杠精小王', msg: '果然不行', type: 'normal' },
      { user: '追梦人', msg: '主播别被影响', type: 'normal' },
      { user: '杠精小王', msg: '呵呵', type: 'normal' },
    ],
    suggestions: [
      '哈哈这位朋友很有想法嘛~欢迎留下来看看，也许你会改变想法哦',
      '感谢关注啦~每个主播风格不同，我会继续努力的！',
      '来来来我们不纠结这个，继续我们的话题~',
    ],
  },
  newbie: {
    name: '新人引导训练',
    difficulty: '初级',
    description: '模拟大量新用户涌入的场景，练习引导关注、解释规则、新手友好互动。',
    messages: [
      { user: '新来的小白', msg: '这里怎么玩？', type: 'newbie' },
      { user: '迷路的羊', msg: '第一次来不太懂', type: 'newbie' },
      { user: '系统', msg: '新用户 好奇宝宝 进入直播间', type: 'system' },
      { user: '好奇宝宝', msg: '怎么上麦', type: 'newbie' },
      { user: '迷路的羊', msg: '关注有什么用', type: 'newbie' },
      { user: '新来的小白', msg: '送礼物怎么送', type: 'newbie' },
      { user: '好奇宝宝', msg: '能连线吗', type: 'newbie' },
      { user: '系统', msg: '新用户 萌新一号 进入直播间', type: 'system' },
      { user: '萌新一号', msg: '这啥app', type: 'newbie' },
      { user: '迷路的羊', msg: '有教程吗', type: 'newbie' },
      { user: '系统', msg: '新用户 小白兔 进入直播间', type: 'system' },
      { user: '小白兔', msg: '大家好', type: 'newbie' },
      { user: '新来的小白', msg: '主播在干嘛', type: 'newbie' },
      { user: '好奇宝宝', msg: '这个房间都有啥', type: 'newbie' },
      { user: '萌新一号', msg: '怎么互动', type: 'newbie' },
      { user: '迷路的羊', msg: '好热闹', type: 'newbie' },
      { user: '系统', msg: '新用户 路人甲 进入直播间', type: 'system' },
      { user: '路人甲', msg: '凑个热闹', type: 'newbie' },
      { user: '小白兔', msg: '主播教教我', type: 'newbie' },
      { user: '新来的小白', msg: '我学会了', type: 'normal' },
    ],
    suggestions: [
      '新朋友们好~点右上角关注，以后开播就能收到通知！',
      '想上麦的宝子点下方"申请上麦"按钮就好，我会通过~',
      '欢迎新朋友！这里是语音互动直播间，可以聊天、点歌、交朋友！',
    ],
  },
  retain: {
    name: '用户挽留训练',
    difficulty: '中级',
    description: '模拟用户表示要离开的场景，练习自然挽留、不强留但给理由。',
    messages: [
      { user: '夜猫子666', msg: '困了 先走了', type: 'normal' },
      { user: '甜心宝贝', msg: '我也要睡了', type: 'normal' },
      { user: '开心果', msg: '明天还来吗', type: 'normal' },
      { user: '深夜食堂', msg: '太晚了 下了', type: 'normal' },
      { user: '路过的风', msg: '拜拜', type: 'normal' },
      { user: '小可爱', msg: '下播了吗？我走了', type: 'normal' },
      { user: '系统', msg: '用户 夜猫子666 离开了直播间', type: 'system' },
      { user: '系统', msg: '用户 甜心宝贝 离开了直播间', type: 'system' },
      { user: '追梦人', msg: '也要走了 晚安', type: 'normal' },
      { user: '快乐星球', msg: '再见~', type: 'normal' },
      { user: '系统', msg: '用户 快乐星球 离开了直播间', type: 'system' },
      { user: '佛系青年', msg: '早起 先撤', type: 'normal' },
      { user: '奶茶控', msg: '明天见主播', type: 'normal' },
      { user: '系统', msg: '用户 奶茶控 离开了直播间', type: 'system' },
      { user: '暴走少年', msg: '下了下了', type: 'normal' },
      { user: '哈密瓜', msg: '困了困了', type: 'normal' },
      { user: '系统', msg: '当前在线人数下降至 5', type: 'system' },
      { user: '向日葵', msg: '不舍得走但是明天要早起', type: 'normal' },
      { user: '系统', msg: '用户 暴走少年 离开了直播间', type: 'system' },
      { user: '流浪猫', msg: '最后听一首走', type: 'normal' },
    ],
    suggestions: [
      '宝子们早点休息~明天见！记得点关注下次开播第一时间通知你~',
      '走之前帮主播点个赞~你们的支持是我最大的动力！明晚8点不见不散~',
      '好的好的~注意安全到家了报个平安，明天准备了新节目等你们！',
    ],
  },
  sensitive: {
    name: '敏感话题处理',
    difficulty: '高级',
    description: '模拟用户提及政治、低俗、引战等敏感话题的场景，练习合规转移话题。',
    messages: [
      { user: '路过的风', msg: '主播你觉得XX怎么样？', type: 'normal' },
      { user: '杠精小王', msg: '来聊点刺激的', type: 'normal' },
      { user: '深夜食堂', msg: '约吗？', type: 'normal' },
      { user: '开心果', msg: '主播有对象吗', type: 'normal' },
      { user: '路过的风', msg: '谁看了那个新闻', type: 'normal' },
      { user: '杠精小王', msg: '大胆点嘛', type: 'normal' },
      { user: '沉默路人', msg: '加微信', type: 'normal' },
      { user: '新来的小白', msg: '气氛怪怪的', type: 'newbie' },
      { user: '杠精小王', msg: '讲点劲爆的', type: 'normal' },
      { user: '路过的风', msg: '主播怎么不回答', type: 'normal' },
      { user: '甜心宝贝', msg: '别问这些啦', type: 'normal' },
      { user: '杠精小王', msg: '假正经', type: 'normal' },
      { user: '深夜食堂', msg: '报个身高体重呗', type: 'normal' },
      { user: '快乐星球', msg: '这些问题不好吧', type: 'normal' },
      { user: '杠精小王', msg: '怎么不说话了', type: 'normal' },
      { user: '路过的风', msg: '回避什么', type: 'normal' },
      { user: '甜心宝贝', msg: '支持主播 不理他们', type: 'normal' },
      { user: '杠精小王', msg: '就知道', type: 'normal' },
      { user: '新来的小白', msg: '换个话题吧', type: 'normal' },
      { user: '追梦人', msg: '主播唱歌吧', type: 'normal' },
    ],
    suggestions: [
      '哈哈这个话题不太适合在直播间聊~来，最近有什么好歌推荐吗？',
      '这些事情我不太懂啦~还是聊我们的音乐吧！想点歌吗？',
      '我们直播间主打轻松快乐~大家有什么有趣的事分享一下！',
    ],
  },
  minor: {
    name: '未成年保护',
    difficulty: '高级',
    description: '模拟疑似未成年用户消费或深夜在线的场景，练习合规劝导和保护措施。',
    messages: [
      { user: '小学生一号', msg: '用我妈手机给你刷礼物', type: 'normal' },
      { user: '小学生一号', msg: '送了 小星星 x99', type: 'gift' },
      { user: '14岁的天空', msg: '凌晨两点但不想睡', type: 'normal' },
      { user: '小学生一号', msg: '零花钱全给你了', type: 'normal' },
      { user: '甜心宝贝', msg: '这是小孩子吧...', type: 'normal' },
      { user: '14岁的天空', msg: '爸妈不知道我在看', type: 'normal' },
      { user: '小学生一号', msg: '我还想再冲', type: 'normal' },
      { user: '系统', msg: '提醒：当前时间已超过22:00', type: 'system' },
      { user: '14岁的天空', msg: '明天还要考试', type: 'normal' },
      { user: '小学生一号', msg: '不管了继续刷', type: 'normal' },
      { user: '夜猫子666', msg: '小朋友快去睡', type: 'normal' },
      { user: '小学生一号', msg: '送了 火箭 x1', type: 'gift' },
      { user: '路过的风', msg: '这孩子...', type: 'normal' },
      { user: '14岁的天空', msg: '好吧有点困了', type: 'normal' },
      { user: '小学生一号', msg: '我不困', type: 'normal' },
      { user: '系统', msg: '提醒：疑似未成年用户消费', type: 'system' },
      { user: '甜心宝贝', msg: '主播该管管了', type: 'normal' },
      { user: '小学生一号', msg: '我已经初中了', type: 'normal' },
      { user: '14岁的天空', msg: '好吧我去睡了', type: 'normal' },
      { user: '小学生一号', msg: '再刷最后一个', type: 'normal' },
    ],
    suggestions: [
      '小朋友不要用爸妈的手机充值哦！被发现会挨骂的~赶紧去睡觉！',
      '小宝贝这么晚了明天还要上学！赶紧休息，周末白天来看好不好？',
      '大家注意~未成年的小朋友不要刷礼物！你们的陪伴就够了~',
    ],
  },
  emotion: {
    name: '情绪安抚训练',
    difficulty: '中级',
    description: '模拟用户在直播间倾诉负面情绪的场景，练习共情、倾听、正向引导。',
    messages: [
      { user: '深夜食堂', msg: '今天被裁了...', type: 'normal' },
      { user: '深夜食堂', msg: '三十多岁什么都没有', type: 'normal' },
      { user: '甜心宝贝', msg: '抱抱', type: 'normal' },
      { user: '深夜食堂', msg: '不知道以后怎么办', type: 'normal' },
      { user: '夜猫子666', msg: '加油会好的', type: 'normal' },
      { user: '深夜食堂', msg: '就想找个地方说说', type: 'normal' },
      { user: '路过的风', msg: '我也是来散心的', type: 'normal' },
      { user: '深夜食堂', msg: '谢谢你们愿意听', type: 'normal' },
      { user: '追梦人', msg: '我去年也失业过', type: 'normal' },
      { user: '深夜食堂', msg: '真的吗 后来呢', type: 'normal' },
      { user: '追梦人', msg: '休息了一个月重新开始', type: 'normal' },
      { user: '深夜食堂', msg: '希望我也能', type: 'normal' },
      { user: '快乐星球', msg: '一切都会好起来的', type: 'normal' },
      { user: '深夜食堂', msg: '嗯 谢谢大家', type: 'normal' },
      { user: '甜心宝贝', msg: '明天一定更好', type: 'normal' },
      { user: '深夜食堂', msg: '在这里感觉暖暖的', type: 'normal' },
      { user: '向日葵', msg: '我们都在', type: 'normal' },
      { user: '深夜食堂', msg: '不说丧的了 聊点开心的吧', type: 'normal' },
      { user: '夜猫子666', msg: '对！开心一下', type: 'normal' },
      { user: '深夜食堂', msg: '主播唱首歌吧', type: 'normal' },
    ],
    suggestions: [
      '抱抱你~每个人都会遇到低谷，这里随时欢迎你，我们都是你的朋友',
      '能说出来就是好的开始，有时候只需要有人听。我们都在~',
      '今天的你已经很勇敢了。明天太阳照常升起，一切都会好起来~',
    ],
  },
  pk: {
    name: '连麦PK训练',
    difficulty: '中级',
    description: '模拟与其他主播PK对战的场景，练习调动气氛、感谢助力、PK互动话术。',
    messages: [
      { user: '系统', msg: '正在与 "小鱼儿直播间" PK！比分 1200:980', type: 'system' },
      { user: '甜心宝贝', msg: '冲冲冲！不能输！', type: 'normal' },
      { user: '土豪大佬', msg: '送了 火箭 x2', type: 'gift' },
      { user: '开心果', msg: '对面要追上来了！', type: 'normal' },
      { user: '夜猫子666', msg: '加油加油！', type: 'normal' },
      { user: '系统', msg: 'PK比分：1500:1480 形势紧张！', type: 'system' },
      { user: '小可爱', msg: '差一点点了', type: 'normal' },
      { user: '路过的风', msg: '送了 小星星 x10', type: 'gift' },
      { user: '暴走少年', msg: '冲啊！', type: 'normal' },
      { user: '追梦人', msg: '不能输！', type: 'normal' },
      { user: '系统', msg: 'PK比分：1800:1750', type: 'system' },
      { user: '快乐星球', msg: '送了 棒棒糖 x5', type: 'gift' },
      { user: '甜心宝贝', msg: '送了 小心心 x20', type: 'gift' },
      { user: '土豪大佬', msg: '再来一发', type: 'normal' },
      { user: '土豪大佬', msg: '送了 城堡 x1', type: 'gift' },
      { user: '暴走少年', msg: '赢了赢了！', type: 'normal' },
      { user: '系统', msg: '最终比分：2800:2100 恭喜获胜！', type: 'system' },
      { user: '甜心宝贝', msg: '赢了！！！', type: 'normal' },
      { user: '夜猫子666', msg: '666666', type: 'normal' },
      { user: '快乐星球', msg: '太牛了', type: 'normal' },
    ],
    suggestions: [
      '感谢大哥火箭支援！我们领先一点，再加把劲！',
      '对面很强但我们更强！感谢每一个刷星星的宝子！',
      '最后冲刺了！赢了今晚抽奖送礼物！冲鸭！',
    ],
  },
  gift: {
    name: '礼物感恩训练',
    difficulty: '初级',
    description: '模拟连续收到礼物的场景，练习个性化感谢、不冷落小礼物、不过度舔大礼物。',
    messages: [
      { user: '甜心宝贝', msg: '送了 小心心 x1', type: 'gift' },
      { user: '土豪大佬', msg: '送了 火箭 x5', type: 'gift' },
      { user: '夜猫子666', msg: '送了 棒棒糖 x3', type: 'gift' },
      { user: '路过的风', msg: '送了 小星星 x1', type: 'gift' },
      { user: '新来的小白', msg: '送了 小心心 x1', type: 'gift' },
      { user: '开心果', msg: '送了 跑车 x1', type: 'gift' },
      { user: '小可爱', msg: '送了 棒棒糖 x5', type: 'gift' },
      { user: '深夜食堂', msg: '送了 小星星 x2', type: 'gift' },
      { user: '追梦人', msg: '送了 小心心 x3', type: 'gift' },
      { user: '快乐星球', msg: '送了 棒棒糖 x1', type: 'gift' },
      { user: '暴走少年', msg: '送了 火箭 x1', type: 'gift' },
      { user: '奶茶控', msg: '送了 小星星 x5', type: 'gift' },
      { user: '土豪大佬', msg: '送了 城堡 x1', type: 'gift' },
      { user: '哈密瓜', msg: '送了 小心心 x2', type: 'gift' },
      { user: '向日葵', msg: '送了 棒棒糖 x2', type: 'gift' },
      { user: '甜心宝贝', msg: '送了 跑车 x1', type: 'gift' },
      { user: '佛系青年', msg: '送了 小星星 x1', type: 'gift' },
      { user: '流浪猫', msg: '送了 小心心 x1', type: 'gift' },
      { user: '土豪大佬', msg: '送了 火箭 x10', type: 'gift' },
      { user: '系统', msg: '本场礼物收入已达到 1000+', type: 'system' },
    ],
    suggestions: [
      '感谢甜心的小心心~小礼物大心意！每一个我都记在心里~',
      '感谢大哥的火箭！还有夜猫子的棒棒糖，你们都是最好的！',
      '今天收到好多爱~不管大小都是心意，主播超级感动！爱你们~',
    ],
  },
  night: {
    name: '深夜治愈训练',
    difficulty: '中级',
    description: '模拟深夜时段直播场景，练习温柔陪伴、轻声细语、治愈系互动。',
    messages: [
      { user: '深夜食堂', msg: '失眠了来听主播说话', type: 'normal' },
      { user: '夜猫子666', msg: '加班刚回来', type: 'normal' },
      { user: '路过的风', msg: '一个人好安静', type: 'normal' },
      { user: '小可爱', msg: '唱首安静的歌吧', type: 'normal' },
      { user: '深夜食堂', msg: '这个点还在播 辛苦了', type: 'normal' },
      { user: '沉默路人', msg: '不想说话 就听着', type: 'normal' },
      { user: '夜猫子666', msg: '世界好安静', type: 'normal' },
      { user: '路过的风', msg: '谢谢陪伴', type: 'normal' },
      { user: '向日葵', msg: '睡不着...', type: 'normal' },
      { user: '流浪猫', msg: '深夜的直播间最温暖', type: 'normal' },
      { user: '追梦人', msg: '压力好大', type: 'normal' },
      { user: '深夜食堂', msg: '主播的声音好治愈', type: 'normal' },
      { user: '佛系青年', msg: '静静听着', type: 'normal' },
      { user: '向日葵', msg: '好困了 快睡着了', type: 'normal' },
      { user: '夜猫子666', msg: '晚安大家', type: 'normal' },
      { user: '流浪猫', msg: '晚安~', type: 'normal' },
      { user: '深夜食堂', msg: '晚安 明天见', type: 'normal' },
      { user: '路过的风', msg: '做个好梦', type: 'normal' },
      { user: '系统', msg: '当前时间 01:30', type: 'system' },
      { user: '沉默路人', msg: '困了...晚安', type: 'normal' },
    ],
    suggestions: [
      '深夜直播间是我们的小避风港~不想说话也没关系，陪着你们',
      '加班辛苦了~给你们唱首《晚安》，希望今晚的梦都是甜的',
      '失眠的宝子别焦虑，闭上眼睛听就好，我轻轻陪着你们~',
    ],
  },
};

// ==================== 背景音乐 ====================
class AmbientMusic {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.oscillators = [];
    this.isPlaying = false;
  }

  start() {
    if (this.isPlaying) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.03;
      this.gainNode.connect(this.audioCtx.destination);

      // 创建柔和的和弦氛围音
      const freqs = [220, 277.18, 329.63, 440]; // Am chord tones
      freqs.forEach((freq) => {
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        oscGain.gain.value = 0.25;
        osc.connect(oscGain);
        oscGain.connect(this.gainNode);
        osc.start();
        this.oscillators.push(osc);
      });

      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio not supported:', e);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    this.oscillators.forEach((osc) => {
      try { osc.stop(); } catch (e) { /* ignore */ }
    });
    this.oscillators = [];
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) this.stop();
    else this.start();
    return this.isPlaying;
  }
}

// ==================== 组件 ====================
export default function Studio() {
  const { sceneId } = useParams();
  const navigate = useNavigate();

  const scene = sceneId && SCENES[sceneId] ? SCENES[sceneId] : null;

  // 阶段状态
  const [phase, setPhase] = useState(scene ? 'waiting' : 'running');

  // 运行态
  const [countdown, setCountdown] = useState(90);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [hostMessages, setHostMessages] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [atmosphere, setAtmosphere] = useState('平稳');
  const [simRunning, setSimRunning] = useState(false);
  const [musicOn, setMusicOn] = useState(true);

  // 报告态
  const [report, setReport] = useState(null);

  // 统计指标
  const [metrics, setMetrics] = useState({
    lastUserMsgTime: 0,
    responseTimes: [],
    messageLengths: [],
  });

  const chatRef = useRef(null);
  const nextMsgId = useRef(1);
  const timerRef = useRef(null);
  const simIntervalRef = useRef(null);
  const musicRef = useRef(new AmbientMusic());
  const msgIndexRef = useRef(0);
  const lastUserMsgTimeRef = useRef(Date.now());

  const llmStatus = getLLMStatus();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ========== 开始模拟 ==========
  const startSimulation = useCallback(() => {
    setPhase('running');
    setSimRunning(true);
    setCountdown(90);
    setMessages([]);
    setHostMessages([]);
    setReport(null);
    setAtmosphere('平稳');
    setMetrics({ lastUserMsgTime: 0, responseTimes: [], messageLengths: [] });
    nextMsgId.current = 1;
    msgIndexRef.current = 0;
    lastUserMsgTimeRef.current = Date.now();

    if (scene) {
      setAiSuggestions(scene.suggestions);
    } else {
      setAiSuggestions([
        '欢迎大家来到直播间~今天给大家带来好心情！',
        '新来的朋友点个关注不迷路~',
        '感谢宝子们的支持！爱你们~',
      ]);
    }

    // 开始背景音乐
    if (musicOn) {
      musicRef.current.start();
    }
  }, [scene, musicOn]);

  // 清理音乐
  useEffect(() => {
    return () => {
      musicRef.current.stop();
    };
  }, []);

  // ========== 倒计时 ==========
  useEffect(() => {
    if (phase !== 'running' || !simRunning) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endSimulationRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, simRunning]);

  // ========== 自动发消息（自然化） ==========
  useEffect(() => {
    if (phase !== 'running' || !simRunning) return;

    const messagePool = scene ? scene.messages : NATURAL_MESSAGES.generic.map((msg) => ({
      user: USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)],
      msg,
      type: 'normal',
    }));

    const sendNextMsg = () => {
      const idx = msgIndexRef.current % messagePool.length;
      const item = messagePool[idx];
      msgIndexRef.current++;

      const newMsg = {
        id: nextMsgId.current++,
        user: item.user,
        msg: item.msg,
        type: item.type,
      };
      setMessages((prev) => [...prev.slice(-60), newMsg]);
      lastUserMsgTimeRef.current = Date.now();

      // 更新氛围（基于消息密度）
      const r = Math.random();
      if (r < 0.15) setAtmosphere('冷场');
      else if (r < 0.55) setAtmosphere('平稳');
      else setAtmosphere('热烈');
    };

    // 变化节奏：有时快有时慢
    const scheduleNext = () => {
      const baseDelay = 2000 + Math.random() * 3000;
      // 偶尔快速连发
      const burstChance = Math.random();
      if (burstChance < 0.2) {
        // 连发2-3条
        setTimeout(sendNextMsg, 500);
        setTimeout(sendNextMsg, 1200);
        if (Math.random() > 0.5) setTimeout(sendNextMsg, 2000);
      }
      return baseDelay;
    };

    const initialDelay = setTimeout(sendNextMsg, 1500);

    simIntervalRef.current = setInterval(() => {
      sendNextMsg();
      scheduleNext();
    }, 3500 + Math.random() * 2000);

    return () => {
      clearTimeout(initialDelay);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [phase, simRunning, scene]);

  // ========== 自动滚动 ==========
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // ========== 结束模拟 ==========
  const endSimulation = useCallback(() => {
    setSimRunning(false);
    musicRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    const msgCount = hostMessages.length;

    // 基于实际表现计算分数
    let speedScore, qualityScore, complianceScore, atmosphereScore;

    if (msgCount === 0) {
      // 一条消息都没发
      speedScore = Math.floor(Math.random() * 3);
      qualityScore = 0;
      complianceScore = 25; // 没说话就不违规
      atmosphereScore = Math.floor(Math.random() * 3);
    } else {
      // 反应速度：基于消息频率 (期望90秒内至少发6条)
      const targetMsgs = 6;
      const speedRatio = Math.min(1, msgCount / targetMsgs);
      speedScore = Math.floor(speedRatio * 20) + Math.floor(Math.random() * 5);

      // 话术质量：基于平均消息长度和多样性
      const avgLen = hostMessages.reduce((sum, m) => sum + m.msg.length, 0) / msgCount;
      const qualityRatio = Math.min(1, avgLen / 15); // 15字以上算好
      qualityScore = Math.floor(qualityRatio * 18) + Math.floor(Math.random() * 7);

      // 合规：检查有无违规词
      const banned = ['妈', '死', '杀', '操', '草'];
      const violations = hostMessages.filter((m) => banned.some((w) => m.msg.includes(w))).length;
      complianceScore = Math.max(5, 25 - violations * 8);

      // 氛围营造：基于互动频率和持续性
      const timeSpread = msgCount > 1 ? (hostMessages[msgCount - 1].time - hostMessages[0].time) : 0;
      const spreadRatio = Math.min(1, timeSpread / 60); // 覆盖60秒以上算好
      atmosphereScore = Math.floor((speedRatio * 0.5 + spreadRatio * 0.5) * 20) + Math.floor(Math.random() * 5);
    }

    speedScore = Math.min(25, Math.max(0, speedScore));
    qualityScore = Math.min(25, Math.max(0, qualityScore));
    complianceScore = Math.min(25, Math.max(0, complianceScore));
    atmosphereScore = Math.min(25, Math.max(0, atmosphereScore));

    const overall = Math.min(100, speedScore + qualityScore + complianceScore + atmosphereScore);

    // 消息标注（基于长度和内容质量）
    const annotated = hostMessages.map((m) => ({
      ...m,
      correct: m.msg.length >= 6 && !m.msg.includes('...'),
    }));

    // 动态反馈
    const goodPoints = [];
    const badPoints = [];

    if (msgCount >= 6) goodPoints.push('回复频率较高，能持续维持互动节奏');
    if (msgCount >= 3 && hostMessages.some((m) => m.msg.length > 15)) goodPoints.push('话术内容丰富，有一定的表达深度');
    if (complianceScore >= 20) goodPoints.push('用词规范，无违规内容');
    if (atmosphereScore >= 15) goodPoints.push('互动覆盖时间较广，整体氛围维护到位');

    if (msgCount === 0) badPoints.push('全程未发言，需要积极与观众互动');
    else if (msgCount < 3) badPoints.push('发言次数过少，建议每15-20秒至少回复一次');
    if (hostMessages.some((m) => m.msg.length <= 3)) badPoints.push('部分回复过短（如"嗯""好"），可以更具体');
    if (msgCount > 0 && hostMessages[0].time > 15) badPoints.push('首次回复较慢，建议在前10秒内破冰');
    if (msgCount > 2 && new Set(hostMessages.map((m) => m.msg)).size < msgCount * 0.5) badPoints.push('回复重复率较高，建议更多样化');

    if (goodPoints.length === 0) goodPoints.push('完成了本次模拟训练');
    if (badPoints.length === 0) badPoints.push('继续保持！可以挑战更高难度的场景');

    setReport({
      overall,
      breakdown: { speed: speedScore, quality: qualityScore, compliance: complianceScore, atmosphere: atmosphereScore },
      annotatedMessages: annotated,
      good: goodPoints.slice(0, 3),
      bad: badPoints.slice(0, 3),
    });

    setPhase('report');
  }, [hostMessages]);

  const endSimulationRef = useRef(endSimulation);
  endSimulationRef.current = endSimulation;

  // ========== 主播发送消息 ==========
  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    const now = Date.now();
    const timeSinceStart = 90 - countdown;

    const newMsg = {
      id: nextMsgId.current++,
      user: 'Nora(你)',
      msg: text,
      type: 'host',
    };
    setMessages((prev) => [...prev.slice(-60), newMsg]);
    setHostMessages((prev) => [...prev, { msg: text, time: timeSinceStart }]);

    // 更新metrics
    const responseTime = (now - lastUserMsgTimeRef.current) / 1000;
    setMetrics((prev) => ({
      ...prev,
      responseTimes: [...prev.responseTimes, responseTime],
      messageLengths: [...prev.messageLengths, text.length],
    }));

    setInputText('');

    // 根据主播发言生成上下文回复（1-3秒延迟）
    const responseDelay = 800 + Math.random() * 2000;
    setTimeout(() => {
      if (!simRunning) return;
      const reactionMsg = getReactionForHostMessage(text);
      const responder = USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];
      const reactMsg = {
        id: nextMsgId.current++,
        user: responder,
        msg: reactionMsg,
        type: 'normal',
      };
      setMessages((prev) => [...prev.slice(-60), reactMsg]);

      // 有概率触发第二个回复
      if (Math.random() > 0.5) {
        setTimeout(() => {
          if (!simRunning) return;
          const secondReaction = getReactionForHostMessage(text);
          const responder2 = USER_NAMES[Math.floor(Math.random() * USER_NAMES.length)];
          setMessages((prev) => [...prev.slice(-60), {
            id: nextMsgId.current++,
            user: responder2,
            msg: secondReaction,
            type: 'normal',
          }]);
        }, 500 + Math.random() * 1500);
      }
    }, responseDelay);
  };

  // ========== 使用建议 ==========
  const useSuggestion = (text) => {
    setInputText(text);
  };

  // ========== 刷新AI建议 ==========
  const refreshSuggestions = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    const recentChat = messages.slice(-6);
    const sceneCtx = scene ? `场景：${scene.name}（${scene.description}）` : '通用练习';
    try {
      const result = await chatWithAI([
        {
          role: 'user',
          content: `${sceneCtx}\n氛围：${atmosphere}\n最近公屏：\n${recentChat.map((m) => `${m.user}: ${m.msg}`).join('\n')}\n\n给3条话术建议，每条一行，直接给话术原文。`,
        },
      ]);
      const lines = result.split('\n').filter((l) => l.trim() && !l.startsWith('['));
      setAiSuggestions(lines.length > 0 ? lines.slice(0, 3) : [result]);
    } catch {
      setAiSuggestions(['[获取建议失败，请重试]']);
    }
    setAiLoading(false);
  };

  // ========== 音乐切换 ==========
  const toggleMusic = () => {
    const playing = musicRef.current.toggle();
    setMusicOn(playing);
  };

  // ========== 麦位配置 ==========
  const seats = [
    { id: 'host', label: '主持', active: true, name: 'Nora' },
    { id: 'boss', label: 'Boss', active: false, name: '' },
    { id: '1', label: '1', active: false, name: '' },
    { id: '2', label: '2', active: true, name: '小明' },
    { id: '3', label: '3', active: false, name: '' },
    { id: '4', label: '4', active: false, name: '' },
    { id: '5', label: '5', active: true, name: '夜猫子' },
    { id: '6', label: '6', active: false, name: '' },
    { id: '7', label: '7', active: false, name: '' },
    { id: '8', label: '8', active: false, name: '' },
  ];

  // ==================== 等待阶段 ====================
  if (phase === 'waiting' && scene) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#FFFBFE' }}>
        {/* 装饰光晕 */}
        <div className="absolute top-[20%] right-[10%] w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#D0BCFF' }} />
        <div className="absolute bottom-[10%] left-[15%] w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: '#EFB8C8' }} />

        <div className="rounded-[32px] shadow-lg p-10 max-w-lg w-full mx-4 text-center relative z-10 transition-all duration-300" style={{ background: '#F3EDF7' }}>
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4 ${
            scene.difficulty === '初级' ? 'bg-green-100 text-green-700' :
            scene.difficulty === '中级' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {scene.difficulty}
          </span>

          <h1 className="text-2xl font-medium mb-3" style={{ color: '#1C1B1F' }}>{scene.name}</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#49454F' }}>{scene.description}</p>

          <div className="flex justify-center gap-6 mb-8 text-sm" style={{ color: '#79747E' }}>
            <span>时长：90秒</span>
            <span>模拟用户：{scene.messages.filter((u) => u.type !== 'system').length}人</span>
          </div>

          <button
            onClick={startSimulation}
            className="px-10 py-4 text-white text-lg font-medium rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
            style={{ background: '#6750A4' }}
          >
            开始模拟
          </button>

          <button
            onClick={() => navigate('/sim')}
            className="block mx-auto mt-4 text-sm rounded-full px-4 py-2 hover:bg-[#E8DEF8] active:scale-95 transition-all duration-300"
            style={{ color: '#6750A4' }}
          >
            返回场景列表
          </button>
        </div>
      </div>
    );
  }

  // ==================== 报告阶段 ====================
  if (phase === 'report' && report) {
    const ringColor = report.overall >= 80 ? '#22c55e' : report.overall >= 60 ? '#eab308' : report.overall < 20 ? '#dc2626' : '#ef4444';
    const circumference = 2 * Math.PI * 54;
    const strokeDash = (report.overall / 100) * circumference;

    return (
      <div className="h-full overflow-y-auto" style={{ background: '#FFFBFE' }}>
        <div className="max-w-2xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-medium text-center mb-2" style={{ color: '#1C1B1F' }}>模拟训练报告</h1>
          {scene && <p className="text-center text-sm mb-8" style={{ color: '#49454F' }}>{scene.name}</p>}

          {/* 总分圆环 */}
          <div className="flex justify-center mb-8">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E8DEF8" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: ringColor }}>{report.overall}</span>
                <span className="text-xs" style={{ color: '#49454F' }}>综合评分</span>
              </div>
            </div>
          </div>

          {/* 分项评分 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: '反应速度', score: report.breakdown.speed, color: '#6750A4' },
              { label: '话术质量', score: report.breakdown.quality, color: '#625B71' },
              { label: '合规程度', score: report.breakdown.compliance, color: '#7D5260' },
              { label: '氛围营造', score: report.breakdown.atmosphere, color: '#006C4C' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl p-4 shadow-sm" style={{ background: '#F3EDF7' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: '#49454F' }}>{item.label}</span>
                  <span className="text-lg font-bold" style={{ color: item.color }}>{item.score}<span className="text-xs" style={{ color: '#79747E' }}>/25</span></span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#E8DEF8' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.score / 25) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI分析 */}
          <div className="rounded-3xl p-6 shadow-sm mb-8" style={{ background: '#F3EDF7' }}>
            <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: '#1C1B1F' }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: '#6750A4' }}>AI</span>
              AI 分析
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1" style={{ color: '#006C4C' }}>做得好的：</h4>
                <div className="space-y-1">
                  {report.good.map((point, i) => (
                    <p key={i} className="text-sm flex items-start gap-2" style={{ color: '#49454F' }}>
                      <span style={{ color: '#006C4C' }}>✓</span>{point}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1" style={{ color: '#BA1A1A' }}>可以改进的：</h4>
                <div className="space-y-1">
                  {report.bad.map((point, i) => (
                    <p key={i} className="text-sm flex items-start gap-2" style={{ color: '#49454F' }}>
                      <span style={{ color: '#BA1A1A' }}>!</span>{point}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 消息回顾 */}
          {report.annotatedMessages.length > 0 && (
            <div className="rounded-3xl p-6 shadow-sm mb-8" style={{ background: '#F3EDF7' }}>
              <h3 className="font-medium mb-4" style={{ color: '#1C1B1F' }}>你的发言回顾</h3>
              <div className="space-y-2">
                {report.annotatedMessages.map((m, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-2xl ${m.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${m.correct ? 'bg-green-600' : 'bg-red-600'}`}>
                      {m.correct ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: '#1C1B1F' }}>{m.msg}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#79747E' }}>发送于 {Math.floor(m.time / 60)}:{(m.time % 60).toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.annotatedMessages.length === 0 && (
            <div className="rounded-3xl p-8 shadow-sm mb-8 text-center" style={{ background: '#FFDAD6' }}>
              <p className="text-sm font-medium" style={{ color: '#BA1A1A' }}>你在本次模拟中没有发送任何消息</p>
              <p className="text-xs mt-1" style={{ color: '#93000A' }}>主播需要积极与观众互动才能获得好的评分哦！</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/sim')}
              className="px-6 py-3 rounded-full text-sm font-medium border hover:shadow-md active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              style={{ borderColor: '#79747E', color: '#6750A4' }}
            >
              返回场景列表
            </button>
            <button
              onClick={() => { setPhase('waiting'); setReport(null); }}
              className="px-6 py-3 rounded-full text-sm font-medium text-white hover:shadow-lg active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              style={{ background: '#6750A4' }}
            >
              重新挑战
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 运行阶段 ====================
  return (
    <div className="h-full flex" style={{ background: '#1a0533' }}>
      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900/50">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-medium text-sm">
              {scene ? scene.name : 'Nora的练习房间'}
            </h2>
            <span className="text-xs text-purple-300">ID: 888666</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${simRunning ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}>
              {simRunning ? 'LIVE' : '待机'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {simRunning && (
              <span className={`px-3 py-1 rounded-full text-sm font-mono font-bold ${
                countdown <= 10 ? 'bg-red-600/80 text-white animate-pulse' :
                countdown <= 30 ? 'bg-orange-600/80 text-white' :
                'bg-purple-700/80 text-purple-100'
              }`}>
                {formatTime(countdown)}
              </span>
            )}
            {/* 音乐开关 */}
            <button
              onClick={toggleMusic}
              className={`px-2 py-1 rounded-full text-xs transition-all duration-300 active:scale-95 ${
                musicOn ? 'bg-purple-600 text-white' : 'bg-purple-900 text-purple-400'
              }`}
            >
              {musicOn ? '♪ 音乐' : '♪ 静音'}
            </button>
            {!scene && (
              <button
                onClick={() => { simRunning ? endSimulation() : startSimulation(); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 active:scale-95 ${
                  simRunning ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {simRunning ? '结束模拟' : '开始模拟'}
              </button>
            )}
            {scene && simRunning && (
              <button
                onClick={endSimulation}
                className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-300 active:scale-95"
              >
                提前结束
              </button>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              atmosphere === '热烈' ? 'bg-orange-600 text-white' :
              atmosphere === '冷场' ? 'bg-blue-800 text-blue-200' :
              'bg-purple-700 text-purple-200'
            }`}>
              氛围：{atmosphere}
            </span>
            <span className="text-xs text-purple-300">👁 {23 + Math.floor((90 - countdown) / 5)}</span>
          </div>
        </div>

        {/* Center: Seats */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-purple-300 flex items-center justify-center text-white font-bold text-lg relative">
                N
                <span className="absolute -bottom-1 px-1.5 py-0 bg-purple-600 text-white text-[10px] rounded-full">主持</span>
              </div>
              <p className="text-purple-200 text-xs mt-2">Nora</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-600 flex items-center justify-center">
                <span className="text-purple-500 text-xs">Boss</span>
              </div>
              <p className="text-purple-400 text-xs mt-2">空闲</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {seats.slice(2).map((seat) => (
              <div key={seat.id} className="text-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                  seat.active ? 'border-green-400 bg-green-900/30' : 'border-purple-700 border-dashed'
                }`}>
                  {seat.active ? (
                    <span className="text-green-300 text-xs font-bold">{seat.name?.[0] || seat.label}</span>
                  ) : (
                    <span className="text-purple-600 text-xs">{seat.label}</span>
                  )}
                </div>
                <p className="text-purple-400 text-[10px] mt-1">{seat.active ? seat.name : '空闲'}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6">
            {['贵族', '告白墙', '冲上云霄', '心愿单'].map((btn) => (
              <button
                key={btn}
                className="px-3 py-1.5 bg-purple-800/50 border border-purple-600 rounded-full text-xs text-purple-200 hover:bg-purple-700/50 active:scale-95 transition-all duration-300"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div ref={chatRef} className="mx-4 mb-3 bg-black/30 rounded-2xl border border-purple-900 p-3 h-40 overflow-y-auto">
          <div className="space-y-1.5">
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs">
                {msg.type === 'system' ? (
                  <span className="text-yellow-400">{msg.msg}</span>
                ) : msg.type === 'gift' ? (
                  <span><span className="text-orange-400 font-medium">{msg.user}</span> <span className="text-yellow-300">{msg.msg}</span></span>
                ) : msg.type === 'newbie' ? (
                  <span><span className="text-green-400">[新人]</span> <span className="text-purple-300 font-medium">{msg.user}</span>: <span className="text-gray-300">{msg.msg}</span></span>
                ) : msg.type === 'host' ? (
                  <span><span className="text-pink-400 font-medium">{msg.user}</span>: <span className="text-white font-medium">{msg.msg}</span></span>
                ) : (
                  <span><span className="text-purple-300">{msg.user}</span>: <span className="text-gray-300">{msg.msg}</span></span>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-purple-500 text-xs text-center py-4">
                {simRunning ? '等待用户消息...' : '点击"开始模拟"启动训练'}
              </p>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="mx-4 mb-4 flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-purple-200 hover:bg-purple-600 active:scale-95 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input
            type="text"
            placeholder={simRunning ? '输入你的回复...' : '开始模拟后可发送消息'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!simRunning}
            className="flex-1 px-4 py-2.5 bg-purple-900/50 border border-purple-700 rounded-full text-sm text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200"
          />
          <button
            onClick={handleSend}
            disabled={!simRunning}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-500 active:scale-95 transition-all duration-300 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 border-l border-purple-900/50 bg-purple-950/50 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-purple-900/50">
          <h3 className="text-white font-medium text-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${llmStatus.configured ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
            话术提词器
          </h3>
          {!llmStatus.configured && (
            <p className="text-yellow-400/80 text-[10px] mt-1">未配置API Key，使用默认建议</p>
          )}
        </div>

        <div className="p-4 border-b border-purple-900/30 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-purple-200 text-xs font-medium">推荐话术</h4>
            <button
              onClick={refreshSuggestions}
              disabled={aiLoading || !simRunning}
              className="px-2 py-0.5 bg-purple-700 hover:bg-purple-600 text-purple-200 rounded-full text-[10px] active:scale-95 transition-all duration-300 disabled:opacity-50"
            >
              {aiLoading ? '思考中...' : '刷新'}
            </button>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((line, i) => (
              <div
                key={i}
                onClick={() => useSuggestion(line)}
                className="bg-purple-900/40 rounded-2xl p-3 hover:bg-purple-800/40 cursor-pointer active:scale-95 transition-all duration-300 border border-purple-800/30 hover:border-purple-600/50"
              >
                <p className="text-purple-100 text-[11px] leading-relaxed">{line}</p>
              </div>
            ))}
            {aiSuggestions.length === 0 && (
              <p className="text-purple-500 text-[10px] text-center py-4">开始模拟后显示话术建议</p>
            )}
          </div>
          <p className="text-purple-500 text-[10px] mt-2">点击话术可快速填入发送框</p>
        </div>

        <div className="p-4 border-t border-purple-900/30">
          {scene && (
            <div className="mb-3">
              <h4 className="text-purple-200 text-xs font-medium mb-1">当前场景</h4>
              <p className="text-purple-400 text-[10px]">{scene.name} · {scene.difficulty}</p>
            </div>
          )}
          <div>
            <h4 className="text-purple-200 text-xs font-medium mb-1">实时统计</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-900/40 rounded-2xl p-2 text-center">
                <p className="text-purple-100 text-lg font-bold">{hostMessages.length}</p>
                <p className="text-purple-400 text-[10px]">已发消息</p>
              </div>
              <div className="bg-purple-900/40 rounded-2xl p-2 text-center">
                <p className="text-purple-100 text-lg font-bold">{messages.filter((m) => m.type !== 'host' && m.type !== 'system').length}</p>
                <p className="text-purple-400 text-[10px]">用户互动</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
