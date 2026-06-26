import { useState, useEffect } from 'react';

// ─── Question Data ───────────────────────────────────────────────────────────

const questionBank = {
  opening: {
    name: '开播暖场',
    description: '如何在开播前几分钟快速活跃气氛，让观众留下来',
    difficulty: '初级',
    questions: [
      {
        question: '开播后30秒内只有3个观众在线，你应该怎么做？',
        options: [
          '沉默等待更多观众进来',
          '热情打招呼并介绍今天直播内容预告，制造期待感',
          '直接说"人太少了，等人多了再开始"',
          '立刻开始抽奖吸引人气',
        ],
        correctIndex: 1,
        explanation:
          '开播初期应该主动热情开场，用内容预告制造期待感。说"人少"会让在场观众感到不被重视，沉默会导致观众流失。抽奖虽能吸引人但不适合一开始就用。',
      },
      {
        question: '一个老粉丝进入直播间并发了"来了来了"，最佳回应是？',
        options: [
          '不理会，继续自己的话题',
          '"欢迎欢迎"然后继续讲',
          '叫出对方昵称，提及上次互动细节，让对方感到被记住',
          '"你怎么才来，等你半天了"（开玩笑语气）',
        ],
        correctIndex: 2,
        explanation:
          '叫出昵称并提及互动细节能极大增强粉丝归属感和忠诚度。这种个性化回应比泛泛的"欢迎"更有温度，比开玩笑更安全。',
      },
      {
        question: '开播暖场时，以下哪种话术最能留住新观众？',
        options: [
          '"今天就是随便聊聊"',
          '"今天给大家准备了三个超实用的内容，第一个就能帮你省500块"',
          '"不关注的赶紧关注啊"',
          '"我们直播间东西很便宜的"',
        ],
        correctIndex: 1,
        explanation:
          '具体的内容预告+利益点能有效勾住新观众好奇心。"随便聊聊"没有明确预期，催关注太急促，单纯说便宜缺乏吸引力。',
      },
    ],
  },
  giftThanks: {
    name: '礼物感谢',
    description: '收到观众礼物时如何得体且有创意地感谢',
    difficulty: '初级',
    questions: [
      {
        question: '一个新用户送了一个小礼物（价值1元），你应该？',
        options: [
          '忽略不提，太小了',
          '简单说声"谢谢"然后继续',
          '真诚感谢并叫出昵称，说"第一次见面就送礼物，太暖了"',
          '说"才1块钱的礼物也好意思送"开玩笑',
        ],
        correctIndex: 2,
        explanation:
          '无论礼物大小都应真诚感谢。对新用户尤其要让ta感到被重视，这可能是ta第一次在直播间消费，好的体验会促进后续互动。',
      },
      {
        question: '大哥连续刷了10个火箭（高价值礼物），你的第一反应应该是？',
        options: [
          '立刻站起来鞠躬感谢，语气激动',
          '先稳住情绪，真诚感谢并点名，然后自然过渡回内容',
          '说"大哥理性消费啊"',
          '直接问"大哥还刷不刷了"',
        ],
        correctIndex: 1,
        explanation:
          '面对大额礼物要稳重真诚，过度激动会显得谄媚，建议理性消费可能让对方不舒服，追问是否继续刷太功利。稳住情绪、点名感谢、自然过渡是最专业的做法。',
      },
      {
        question: '同时有多个人送礼物，你来不及一一感谢怎么办？',
        options: [
          '只感谢送最多的那个人',
          '统一说"谢谢大家的礼物"一笔带过',
          '先集中感谢并承诺"稍后一个个念到"，然后在自然间隙逐一点名',
          '不感谢了，继续直播内容',
        ],
        correctIndex: 2,
        explanation:
          '承诺逐一感谢既照顾了所有送礼物的观众，又不打断直播节奏。只感谢最多的会让小额送礼者失落，统一感谢缺乏个性化。',
      },
    ],
  },
  coldRoom: {
    name: '冷场应对',
    description: '直播间突然没人说话时如何重新带起互动',
    difficulty: '中级',
    questions: [
      {
        question: '直播间已经3分钟没有任何弹幕了，你应该？',
        options: [
          '继续自顾自讲，假装没注意到',
          '直接说"怎么都不说话了？"',
          '抛出一个简单的二选一问题让观众扣1或扣2来参与',
          '开始放音乐填充时间',
        ],
        correctIndex: 2,
        explanation:
          '低门槛互动（扣1扣2）是打破冷场最有效的方式，参与成本极低。直接说"不说话了"会让气氛更尴尬，自顾自讲无法重建互动。',
      },
      {
        question: '你讲了一个话题但观众明显不感兴趣（无互动），怎么办？',
        options: [
          '坚持讲完，不能虎头蛇尾',
          '立刻停下来说"看来大家不喜欢这个话题"',
          '自然收尾并无缝切换到一个已验证的热门话题，顺便抛出互动问题',
          '开始做表情包逗大家笑',
        ],
        correctIndex: 2,
        explanation:
          '自然过渡是关键——既不生硬中断，也不死磕冷门话题。"大家不喜欢"这种说法会让已有观众尴尬，坚持讲完可能继续流失观众。',
      },
      {
        question: '冷场时以下哪种互动方式最有效？',
        options: [
          '讲一个很长的个人故事',
          '问"有没有人在？打个1让我看看"',
          '发起一个有争议但安全的话题投票，如"你们觉得早起好还是晚睡好"',
          '开始抱怨平台流量分配不公',
        ],
        correctIndex: 2,
        explanation:
          '有争议但安全的话题投票能激发观众表达欲，是最佳破冰方式。"有没有人在"暴露了冷场事实，长故事没有互动性，抱怨平台是大忌。',
      },
    ],
  },
  vipInteraction: {
    name: '大哥互动',
    description: '如何与高价值用户建立关系又不忽视普通观众',
    difficulty: '高级',
    questions: [
      {
        question: '大哥在公屏上说"今天心情不好"，你应该怎么回应？',
        options: [
          '不理会，避免涉及私人话题',
          '立刻追问"怎么了发生什么事了"',
          '温暖回应"大哥辛苦了，来直播间就放松一下，我给你唱首歌/讲个开心的"',
          '说"送个礼物开心一下呗"',
        ],
        correctIndex: 2,
        explanation:
          '温暖关怀+提供情绪价值是最佳回应。不要追问隐私，不要引导消费，给对方一个轻松的情绪出口即可。',
      },
      {
        question: '大哥和另一个观众在公屏上起了争执，你应该？',
        options: [
          '站在大哥这边，毕竟大哥消费多',
          '假装没看见',
          '幽默化解紧张气氛，转移话题，必要时私信安抚双方',
          '直接让管理员禁言争执方',
        ],
        correctIndex: 2,
        explanation:
          '作为主播应保持中立并化解矛盾。站队会失去其他观众信任，无视会让事态升级，直接禁言太生硬。幽默转移+私下安抚是最有智慧的处理方式。',
      },
      {
        question: '一个大哥暗示想加你私人微信，你应该？',
        options: [
          '直接给微信号，维护好大客户',
          '委婉拒绝说"平台有规定不能给私人联系方式，但在直播间随时能找到我"',
          '说"加微信要送XX礼物才行"',
          '假装没看到这条消息',
        ],
        correctIndex: 1,
        explanation:
          '平台通常禁止私下联系，违规可能被封号。委婉拒绝既遵守规则又不伤害对方面子。用礼物做条件会显得功利，假装没看到可能让对方反复追问。',
      },
    ],
  },
  sensitive: {
    name: '敏感话题',
    description: '遇到敏感言论或不当要求时如何妥善处理',
    difficulty: '高级',
    questions: [
      {
        question: '有观众在公屏发了涉及政治敏感的言论，你应该？',
        options: [
          '附和几句表示赞同',
          '明确反驳对方观点',
          '不做评价，快速转移话题，必要时让管理员处理弹幕',
          '朗读出来并发表看法',
        ],
        correctIndex: 2,
        explanation:
          '涉及政治话题零参与是铁律。不赞同不反驳不朗读，快速跳过并让管理员处理。任何公开讨论都可能导致直播间被警告甚至封禁。',
      },
      {
        question: '有观众持续发低俗弹幕骚扰你，怎么处理？',
        options: [
          '对骂回去以示强势',
          '哭诉表示委屈博同情',
          '不给予情绪反应，冷静让管理员禁言，继续正常直播内容',
          '关闭直播下播',
        ],
        correctIndex: 2,
        explanation:
          '不给骚扰者情绪反馈是最有效的应对——他们要的就是你的反应。冷静处理展示专业度，对骂或哭诉都是"上钩"。除非极端情况不必下播。',
      },
      {
        question: '观众问你的真实年龄/住址/感情状况，你应该？',
        options: [
          '如实回答，拉近距离',
          '编一个假的信息糊弄过去',
          '用幽默方式模糊回答，如"我永远18岁~"，然后自然转移话题',
          '严厉地说"这是我的隐私不要问"',
        ],
        correctIndex: 2,
        explanation:
          '幽默模糊是最优雅的处理方式——既保护隐私又不伤害提问者面子。如实回答有安全风险，编假信息可能被揭穿，严厉拒绝会让气氛尴尬。',
      },
    ],
  },
  emotional: {
    name: '情绪安抚',
    description: '当观众情绪低落或出现负面情绪时如何安抚引导',
    difficulty: '中级',
    questions: [
      {
        question: '一个观众连发多条弹幕说"活着好累不想活了"，你应该？',
        options: [
          '说"别这样想，开心点"简单安慰',
          '忽略，可能是开玩笑',
          '认真回应表示关心，引导正向情绪，并私下让管理员关注该用户后续状态',
          '说"你去看医生吧"',
        ],
        correctIndex: 2,
        explanation:
          '任何涉及轻生的言论都应该被认真对待。公开表示关心+私下持续关注是负责任的做法。简单说"开心点"显得敷衍，"看医生"可能刺激对方。',
      },
      {
        question: '观众说"刚被老板骂了很郁闷来直播间散心"，最佳回应是？',
        options: [
          '"你老板真过分"帮着一起骂',
          '"职场就这样，忍忍吧"',
          '先共情"辛苦了，被批评确实不好受"，再给予正向鼓励并自然引入轻松话题',
          '忽略这条弹幕继续直播',
        ],
        correctIndex: 2,
        explanation:
          '先共情再引导是情绪安抚的黄金法则。帮着骂不够中立，"忍忍"太敷衍，忽略会让对方觉得不被关心。共情+鼓励+转移是完整的情绪疏导链路。',
      },
      {
        question: '直播间氛围突然变得很丧（多人表达负面情绪），你该怎么办？',
        options: [
          '跟着一起丧，表示理解',
          '强行要求"大家都开心点好不好"',
          '先简短共情群体情绪，然后通过节目环节/互动游戏/温暖话题逐步引导氛围回暖',
          '立刻换个欢快的BGM',
        ],
        correctIndex: 2,
        explanation:
          '群体性负面情绪需要先被看见（共情），再被引导（转向）。强行要求正面或跟着沉沦都不好，换BGM太突兀。温和引导是主播控场能力的体现。',
      },
    ],
  },
  compliance: {
    name: '合规应答',
    description: '遵守平台规则和法律法规的应答技巧',
    difficulty: '高级',
    questions: [
      {
        question: '有观众问你推荐的产品"能不能治病/减肥有没有效果"，你应该？',
        options: [
          '为了促成销售说"很多人用了都说有效"',
          '明确回答"我不是医生/专业人士，不能做功效承诺，建议咨询专业人士"',
          '模糊回答"反正我自己用了觉得还行"',
          '直接说"能治"让观众自己判断',
        ],
        correctIndex: 1,
        explanation:
          '涉及健康/功效类声明必须合规，不能做任何疗效承诺。明确免责声明+引导咨询专业人士是唯一正确做法，违反可能面临法律处罚。',
      },
      {
        question: '直播中不小心露出了其他品牌的logo，你应该？',
        options: [
          '无所谓，继续直播',
          '立刻遮挡或调整镜头角度，避免后续继续露出',
          '特意给品牌logo一个特写',
          '口头说"这不是广告"就行了',
        ],
        correctIndex: 1,
        explanation:
          '未经授权展示其他品牌logo可能涉及侵权或违反平台广告规则。发现后应立即调整，避免产生法律或平台合规风险。',
      },
      {
        question: '有观众发送了疑似诈骗链接/信息在公屏上，你应该？',
        options: [
          '帮忙点开看看是什么',
          '不管它，不是我的责任',
          '立即提醒其他观众不要点击，让管理员删除并禁言该用户',
          '把链接念出来让大家判断',
        ],
        correctIndex: 2,
        explanation:
          '主播有义务维护直播间安全环境。及时警告+管理员介入是正确操作。点击或朗读链接都会扩大风险，不理会则默许了风险存在。',
      },
    ],
  },
  rhythm: {
    name: '节奏控场',
    description: '如何把控直播节奏，让内容紧凑又不累人',
    difficulty: '中级',
    questions: [
      {
        question: '你正在讲一个重要话题，但弹幕突然被一个无关的热点话题带偏了，你应该？',
        options: [
          '立刻放弃自己的话题跟着弹幕走',
          '完全无视弹幕继续自己的话题',
          '简短回应弹幕热点（1-2句），然后巧妙过渡回自己的话题',
          '批评观众"不要跑题"',
        ],
        correctIndex: 2,
        explanation:
          '兼顾互动性和内容节奏是控场的核心。简短回应表示你在关注弹幕，过渡回来保证内容完整性。完全跟随会失去节奏，完全无视会失去互动。',
      },
      {
        question: '直播已经进行了2小时，你感觉状态下滑但还想继续，怎么办？',
        options: [
          '强撑着继续，不能让观众看出疲态',
          '直接说"我好累啊"博同情',
          '切换到轻松互动环节（问答/游戏/点歌），给自己喘息空间同时保持观众参与',
          '立刻下播休息',
        ],
        correctIndex: 2,
        explanation:
          '合理编排直播节奏段落很重要。长时间高强度输出后切换到轻互动环节，既让自己休息又保持直播活跃度。强撑会影响质量，说累会降低氛围。',
      },
      {
        question: '以下哪种直播节奏安排最合理（3小时直播）？',
        options: [
          '开场暖场→3小时纯讲内容→结束',
          '暖场(15min)→主题1(30min)→互动(10min)→主题2(30min)→游戏(15min)→主题3(30min)→总结预告(10min)',
          '前1小时猛烈互动→后2小时沉默带货',
          '全程做游戏不讲任何内容',
        ],
        correctIndex: 1,
        explanation:
          '有节奏的段落化编排是专业主播的标配。内容段+互动段交替可以维持观众注意力，有明确的结构也方便观众选择性观看。',
      },
    ],
  },
};

// ─── Category metadata for display ──────────────────────────────────────────

const categories = [
  { key: 'opening', icon: '🎬', color: '#E8DEF8' },
  { key: 'giftThanks', icon: '🎁', color: '#FFD8E4' },
  { key: 'coldRoom', icon: '🧊', color: '#D0E8FF' },
  { key: 'vipInteraction', icon: '👑', color: '#FFE08A' },
  { key: 'sensitive', icon: '⚠️', color: '#FFDAD6' },
  { key: 'emotional', icon: '💝', color: '#E8DEF8' },
  { key: 'compliance', icon: '📋', color: '#C3E7C0' },
  { key: 'rhythm', icon: '🎵', color: '#D0E8FF' },
];

const difficultyColors = {
  '初级': { bg: '#C3E7C0', text: '#1B5E20' },
  '中级': { bg: '#FFE08A', text: '#7C5800' },
  '高级': { bg: '#FFDAD6', text: '#BA1A1A' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Practice() {
  const [view, setView] = useState('categories'); // 'categories' | 'quiz' | 'results'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]); // { questionIndex, selected, correct }
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [stats, setStats] = useState({ totalAnswered: 0, totalCorrect: 0, streak: 0 });

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('practice-stats');
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('practice-stats', JSON.stringify(stats));
  }, [stats]);

  const startQuiz = (categoryKey) => {
    setCurrentCategory(categoryKey);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setStartTime(Date.now());
    setEndTime(null);
    setView('quiz');
  };

  const handleAnswer = (optionIndex) => {
    if (showExplanation) return; // already answered
    const questions = questionBank[currentCategory].questions;
    const isCorrect = optionIndex === questions[currentQuestionIndex].correctIndex;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    setAnswers((prev) => [
      ...prev,
      { questionIndex: currentQuestionIndex, selected: optionIndex, correct: isCorrect },
    ]);
    // Update stats
    setStats((prev) => ({
      totalAnswered: prev.totalAnswered + 1,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  const nextQuestion = () => {
    const questions = questionBank[currentCategory].questions;
    if (currentQuestionIndex + 1 >= questions.length) {
      setEndTime(Date.now());
      setView('results');
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const quitQuiz = () => {
    setView('categories');
    setCurrentCategory(null);
  };

  const retryQuiz = () => {
    startQuiz(currentCategory);
  };

  const backToCategories = () => {
    setView('categories');
    setCurrentCategory(null);
  };

  // ─── Render: Category Selection ────────────────────────────────────────────

  if (view === 'categories') {
    const accuracy =
      stats.totalAnswered > 0
        ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
        : 0;

    return (
      <div className="min-h-screen p-6" style={{ background: '#FFFBFE' }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">日常练习</h1>
            <p className="text-gray-600">选择一个场景分类，开始答题训练</p>
          </div>

          {/* Stats Bar */}
          <div
            className="rounded-3xl p-5 mb-8 flex items-center gap-8"
            style={{ background: '#F3EDF7' }}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold" style={{ color: '#6750A4' }}>
                {stats.totalAnswered}
              </span>
              <span className="text-xs text-gray-600">已答题数</span>
            </div>
            <div className="w-px h-10 bg-gray-300" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold" style={{ color: '#6750A4' }}>
                {accuracy}%
              </span>
              <span className="text-xs text-gray-600">正确率</span>
            </div>
            <div className="w-px h-10 bg-gray-300" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold" style={{ color: '#6750A4' }}>
                {stats.streak}
              </span>
              <span className="text-xs text-gray-600">连续正确</span>
            </div>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const data = questionBank[cat.key];
              const diff = difficultyColors[data.difficulty];
              return (
                <div
                  key={cat.key}
                  className="rounded-3xl p-5 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                  style={{ background: '#F3EDF7' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{cat.icon}</span>
                    <span
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={{ background: diff.bg, color: diff.text }}
                    >
                      {data.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
                  <p className="text-sm text-gray-600 flex-1">{data.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{data.questions.length} 题</span>
                    <button
                      onClick={() => startQuiz(cat.key)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium text-white transition-all duration-150 hover:shadow-md active:scale-95"
                      style={{ background: '#6750A4' }}
                    >
                      开始练习
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Quiz Mode ─────────────────────────────────────────────────────

  if (view === 'quiz') {
    const questions = questionBank[currentCategory].questions;
    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen p-6" style={{ background: '#FFFBFE' }}>
        <div className="max-w-3xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={quitQuiz}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 hover:shadow-md active:scale-95"
              style={{ background: '#F3EDF7', color: '#6750A4' }}
            >
              退出练习
            </button>
            <span className="text-sm font-medium text-gray-700">
              {questionBank[currentCategory].name}
            </span>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full mb-8" style={{ background: '#E8DEF8' }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: '#6750A4' }}
            />
          </div>

          {/* Question Card */}
          <div className="rounded-3xl p-6 mb-6" style={{ background: '#F3EDF7' }}>
            <p className="text-lg font-medium text-gray-900 leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-6">
            {question.options.map((option, idx) => {
              let optionStyle = { background: '#FFFFFF', border: '2px solid #E8DEF8' };
              let textColor = '#1C1B1F';

              if (showExplanation) {
                if (idx === question.correctIndex) {
                  optionStyle = { background: '#D4EDDA', border: '2px solid #28A745' };
                  textColor = '#155724';
                } else if (idx === selectedAnswer && idx !== question.correctIndex) {
                  optionStyle = { background: '#FFDAD6', border: '2px solid #BA1A1A' };
                  textColor = '#BA1A1A';
                } else {
                  optionStyle = { background: '#F8F8F8', border: '2px solid #E0E0E0' };
                  textColor = '#999';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showExplanation}
                  className="w-full text-left p-4 rounded-2xl transition-all duration-150 hover:scale-[1.01] hover:shadow-sm active:scale-95 disabled:cursor-default disabled:hover:scale-100 disabled:hover:shadow-none"
                  style={{ ...optionStyle, color: textColor }}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="rounded-3xl p-5 mb-6" style={{ background: '#E8DEF8' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#6750A4' }}>
                解析
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {showExplanation && (
            <div className="flex justify-end">
              <button
                onClick={nextQuestion}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-150 hover:shadow-lg active:scale-95"
                style={{ background: '#6750A4' }}
              >
                {currentQuestionIndex + 1 >= questions.length ? '查看结果' : '下一题'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Results ───────────────────────────────────────────────────────

  if (view === 'results') {
    const questions = questionBank[currentCategory].questions;
    const correctCount = answers.filter((a) => a.correct).length;
    const totalCount = answers.length;
    const timeTaken = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const wrongAnswers = answers.filter((a) => !a.correct);
    const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return (
      <div className="min-h-screen p-6" style={{ background: '#FFFBFE' }}>
        <div className="max-w-3xl mx-auto">
          {/* Score Card */}
          <div className="rounded-3xl p-8 mb-6 text-center" style={{ background: '#F3EDF7' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">练习完成!</h2>
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="flex flex-col items-center">
                <span
                  className="text-4xl font-bold"
                  style={{ color: scorePercent >= 70 ? '#28A745' : '#BA1A1A' }}
                >
                  {correctCount}/{totalCount}
                </span>
                <span className="text-sm text-gray-600 mt-1">正确数</span>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold" style={{ color: '#6750A4' }}>
                  {scorePercent}%
                </span>
                <span className="text-sm text-gray-600 mt-1">正确率</span>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold" style={{ color: '#6750A4' }}>
                  {minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`}
                </span>
                <span className="text-sm text-gray-600 mt-1">用时</span>
              </div>
            </div>
          </div>

          {/* Wrong Answers Review */}
          {wrongAnswers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">错题回顾</h3>
              <div className="flex flex-col gap-4">
                {wrongAnswers.map((wa, idx) => {
                  const q = questions[wa.questionIndex];
                  return (
                    <div
                      key={idx}
                      className="rounded-3xl p-5"
                      style={{ background: '#F3EDF7' }}
                    >
                      <p className="text-sm font-medium text-gray-900 mb-3">
                        {wa.questionIndex + 1}. {q.question}
                      </p>
                      <div className="flex flex-col gap-2 mb-3">
                        <div
                          className="text-sm px-3 py-2 rounded-xl"
                          style={{ background: '#FFDAD6', color: '#BA1A1A' }}
                        >
                          <span className="font-medium">你的回答: </span>
                          {q.options[wa.selected]}
                        </div>
                        <div
                          className="text-sm px-3 py-2 rounded-xl"
                          style={{ background: '#D4EDDA', color: '#155724' }}
                        >
                          <span className="font-medium">正确答案: </span>
                          {q.options[q.correctIndex]}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="font-medium">解析: </span>
                        {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={retryQuiz}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-150 hover:shadow-md active:scale-95"
              style={{ background: '#E8DEF8', color: '#6750A4' }}
            >
              重新练习
            </button>
            <button
              onClick={backToCategories}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-150 hover:shadow-lg active:scale-95"
              style={{ background: '#6750A4' }}
            >
              返回分类
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
