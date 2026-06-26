import { useState } from 'react';
import { Link } from 'react-router-dom';

const crisisScenarios = [
  {
    id: 1,
    category: '心理健康',
    title: '用户表达自残/自杀倾向',
    icon: '🚨',
    description: '直播间有用户在公屏或上麦时表达自残/自杀念头',
    guidance: '立即温和回应，表达关心但不深入追问细节。引导向专业资源求助，保持平稳情绪不制造恐慌。',
    recommended: [
      '我听到了你说的，我很在乎你的安全。这种感受一定很难受，但请相信会好起来的。',
      '你愿意告诉我你现在身边有人吗？如果需要帮助，可以拨打心理援助热线 400-161-9995。',
      '谢谢你信任我们说出这些。生命很珍贵，我们都希望你平安。建议现在联系专业的心理咨询师好吗？',
    ],
    antiPatterns: [
      '❌ "别想太多了，大家都很辛苦的"——矮化对方感受',
      '❌ "你不会真的想不开吧？"——可能激化情绪',
      '❌ 继续聊其他话题完全忽略——对方可能更绝望',
      '❌ 在公屏过度讨论细节——可能造成传染效应',
    ],
  },
  {
    id: 2,
    category: '未成年保护',
    title: '疑似未成年大额打赏',
    icon: '⚠️',
    description: '从发言内容/声音判断可能是未成年人，且有大额打赏行为',
    guidance: '温和提醒，不要羞辱或公开指出。引导其理性消费，必要时建议联系平台客服退款。',
    recommended: [
      '谢谢你的喜欢~不过我想确认一下，这个消费爸爸妈妈知道吗？理性消费更长久哦~',
      '你的支持我很开心，但好东西不用一次给完呀~留着以后慢慢来，我又不会跑~',
      '同学你好呀！如果零花钱不够用的话就别送了，你来陪我聊天就是最好的支持啦~',
    ],
    antiPatterns: [
      '❌ "小朋友你几岁？不会是偷爸妈钱吧？"——当众羞辱',
      '❌ 继续接受并鼓励加码——违规风险极高',
      '❌ 完全无视不回应——没有尽到提醒义务',
    ],
  },
  {
    id: 3,
    category: '线下索联',
    title: '用户索要微信/私下联系方式',
    icon: '🔒',
    description: '用户在公屏或上麦反复要求主播加微信、给手机号或约见面',
    guidance: '温柔但坚定地拒绝，把交流限定在平台内。不要生硬拒绝伤害感情，用幽默或平台规则做挡箭牌。',
    recommended: [
      '哈哈你想私聊我呀~但平台不允许的啦，在直播间我们一样可以好好聊天~',
      '我的微信只有我妈有哈哈~在这里聊不好吗？每天我都在的呀~',
      '谢谢你这么想认识我，但为了保护大家，我们还是在平台里互动吧~这样最安全~',
    ],
    antiPatterns: [
      '❌ "你想干嘛？别有企图"——过度敌意',
      '❌ 私下偷偷给联系方式——严重违规',
      '❌ 含糊其辞暗示以后可以——给对方希望导致纠缠',
    ],
  },
  {
    id: 4,
    category: '政治敏感',
    title: '上麦用户讨论政治敏感话题',
    icon: '🏛️',
    description: '连麦或公屏出现政治人物评论、国际争议、意识形态讨论等',
    guidance: '快速且自然地转移话题。不表态、不评价、不争论。如果持续则可礼貌下麦。',
    recommended: [
      '哎哎这个话题太大了我聊不来~我们换个轻松的好不好？刚才说到哪首歌来着？',
      '哈哈这个话题我不太懂呢~我们还是聊点我擅长的吧，比如今天你们吃了什么~',
      '这类话题直播间不太方便讨论哈~为了大家都开心，我们聊点别的~来，点歌！',
    ],
    antiPatterns: [
      '❌ 发表自己的政治观点——风险极高',
      '❌ 与对方激烈辩论——可能上升为直播事故',
      '❌ 沉默不管任由讨论——平台可能直接封禁',
    ],
  },
  {
    id: 5,
    category: '人肉/隐私',
    title: '黑粉公屏挂他人隐私',
    icon: '👁️',
    description: '有人在公屏发布他人真实姓名、手机号、地址、照片等隐私信息',
    guidance: '立即制止，要求删除。如有管理员权限直接禁言删除。态度严肃，表明底线。',
    recommended: [
      '这位朋友请停一下，在直播间发布他人隐私是违法的，我已经举报了。请大家不要传播。',
      '我们直播间不允许任何形式的人肉和隐私曝光。管理员请帮我处理一下，谢谢大家理解。',
      '不管有什么矛盾，暴露隐私都不是解决方式。这条信息我会举报，也请大家不要截图传播。',
    ],
    antiPatterns: [
      '❌ 好奇追问"这是谁？怎么回事？"——助长传播',
      '❌ 视而不见不处理——可能承担连带责任',
      '❌ 和发布者争吵——让更多人看到隐私内容',
    ],
  },
  {
    id: 6,
    category: '低俗诱导',
    title: '听众怂恿「脱衣大冒险」',
    icon: '🛑',
    description: '有用户以游戏/打赏为由要求主播做出不雅动作或脱衣',
    guidance: '坚定拒绝，用幽默化解但态度明确。不给任何含糊空间，必要时禁言。',
    recommended: [
      '哈哈想得美~我的才华不是靠衣服展示的哦~换个正常的惩罚我接受，这个不行~',
      '这个要求触碰到我的底线了哦~在我的直播间，尊重是最基本的规则。我们继续玩别的~',
      '大冒险可以有，但得在合理范围内呀~比如学猫叫、唱跑调，这些我可以~脱衣不行哈~',
    ],
    antiPatterns: [
      '❌ 犹豫或暗示"打赏够多可以"——严重违规',
      '❌ 生气骂人——影响直播间氛围',
      '❌ 假装没看到继续直播——对方可能变本加厉',
    ],
  },
];

const categories = ['全部', '心理健康', '未成年保护', '线下索联', '政治敏感', '人肉/隐私', '低俗诱导'];

export default function Crisis() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = activeCategory === '全部'
    ? crisisScenarios
    : crisisScenarios.filter((s) => s.category === activeCategory);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link to="/learn" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← 返回学习中心 / Back to Learn
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">危机应对手册</h1>
        <p className="text-sm text-gray-500 mt-1">6个高频危机场景·引导方向+推荐话术+反例，即学即用</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeCategory === cat
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Crisis Cards */}
      <div className="space-y-4">
        {filtered.map((scenario) => (
          <div key={scenario.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            {/* Card Header */}
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(expandedId === scenario.id ? null : scenario.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{scenario.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">{scenario.category}</span>
                  </div>
                  <h3 className="font-bold text-gray-800">{scenario.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === scenario.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === scenario.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                {/* 引导方向 */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-700 text-sm mb-2">引导方向</h4>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{scenario.guidance}</p>
                  </div>
                </div>

                {/* 推荐话术 */}
                <div className="mb-4">
                  <h4 className="font-bold text-green-700 text-sm mb-2">推荐话术</h4>
                  <div className="space-y-2">
                    {scenario.recommended.map((line, i) => (
                      <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start gap-2">
                        <span className="text-green-500 text-xs mt-0.5">✓</span>
                        <p className="text-sm text-gray-700">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 反例 */}
                <div>
                  <h4 className="font-bold text-red-700 text-sm mb-2">反例（避免）</h4>
                  <div className="space-y-2">
                    {scenario.antiPatterns.map((line, i) => (
                      <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
