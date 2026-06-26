import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// 语音风格配置
const VOICE_PROFILES = {
  gentle: {
    label: '温柔女声',
    emoji: '🌸',
    description: '轻柔舒缓，适合治愈系直播',
    pitch: 1.05,
    rate: 0.82,
    voiceKeywords: ['female', 'woman', '女', 'Xiaoxiao', 'Yunxi'],
  },
  mature: {
    label: '御姐音',
    emoji: '👑',
    description: '低沉磁性，气场全开',
    pitch: 0.72,
    rate: 0.85,
    voiceKeywords: ['female', 'woman', '女', 'Xiaoyi', 'Yunyang'],
  },
  sweet: {
    label: '甜妹音',
    emoji: '🍬',
    description: '活泼甜美，元气满满',
    pitch: 1.38,
    rate: 1.02,
    voiceKeywords: ['female', 'woman', '女', 'Xiaoxiao', 'Yunxi'],
  },
};

const masterclassData = [
  {
    id: 1,
    category: '开播暖场',
    streamer: '小月月',
    description: '如何在开播30秒内让人感到放松和被欢迎',
    level: '高手范本',
    duration: '3:24',
    breakdowns: 5,
    color: 'from-purple-400 to-purple-600',
    transcript: [
      { time: '0:00', label: '开场问好', text: '哈喽，欢迎来到直播间，我是小月月。今天天气好冷啊，大家有没有喝热水呀？来来来，先给大家比个心，你们能看到我吗？看到的扣个1哦。', score: 95 },
      { time: '0:15', label: '热度提升', text: '哇，好多人来了，我看到老粉丝了！宝子们，今天我们一起聊聊天，我给大家准备了好多有趣的话题。', score: 88 },
      { time: '0:35', label: '互动引导', text: '新来的朋友记得点点关注哦，我们直播间超级温馨的。有什么想聊的可以打在公屏上，我都会看到的。', score: 92 },
      { time: '1:00', label: '氛围营造', text: '来，咱们先活跃一下气氛。大家今天心情怎么样？开心的扣开心，不开心的跟我说，姐姐陪你聊。', score: 90 },
      { time: '1:30', label: '节奏稳定', text: '好的好的，我看到好多宝贝了。那我们今天的直播就正式开始啦，今天会陪大家到很晚哦，准备好了吗？', score: 87 },
    ],
  },
  {
    id: 2,
    category: '开播暖场',
    streamer: '暖暖姐',
    description: '用背景音乐和慢节奏打造治愈系开场',
    level: '进阶',
    duration: '2:50',
    breakdowns: 4,
    color: 'from-violet-400 to-fuchsia-500',
    transcript: [
      { time: '0:00', label: '轻声开场', text: '嗨，你来了。今天外面下雨了，我泡了一杯热可可，你那边呢？有没有给自己倒杯热的？', score: 96 },
      { time: '0:20', label: '场景构建', text: '我今天放了一首很轻柔的钢琴曲，大家听着舒服吗？就这样慢慢的，不急，咱们慢慢聊。', score: 91 },
      { time: '0:45', label: '情感连接', text: '我发现每天这个时候来的宝贝们，都是忙了一天终于可以歇一歇的。辛苦了，今天在这里就放松下来吧。', score: 93 },
      { time: '1:20', label: '话题过渡', text: '好，人越来越多了。那我们今天聊点什么呢？我想到一个特别温暖的话题，你们小时候最喜欢吃的零食是什么？', score: 88 },
    ],
  },
  {
    id: 3,
    category: '礼物回应',
    streamer: '甜心姐姐',
    description: '大额打赏的感谢话术层次设计',
    level: '高手范本',
    duration: '4:12',
    breakdowns: 7,
    color: 'from-pink-400 to-rose-500',
    transcript: [
      { time: '0:00', label: '即时反应', text: '哇！天哪天哪！我看到了什么！感谢大哥送的嘉年华，全直播间都亮了！大家快来谢谢大哥！', score: 97 },
      { time: '0:12', label: '情感升温', text: '真的，我现在手都在抖。大哥你太宠我了，我都不知道说什么好了，眼眶有点红了。', score: 93 },
      { time: '0:30', label: '全场带动', text: '来来来，所有人帮我一起感谢一下咱们家最帅的大哥！666刷起来！大哥永远第一！', score: 90 },
      { time: '0:50', label: '个人化感谢', text: '大哥，我记得你上次说最近工作压力大。你能来我直播间我就很开心了，真的不用这样破费的。', score: 95 },
      { time: '1:10', label: '真诚表达', text: '说真的，不是因为礼物，是因为你一直在，我才有动力每天播。你对我的支持，我都记在心里。', score: 96 },
      { time: '1:35', label: '回馈承诺', text: '今天既然大哥这么给力，那我今天加播一小时！而且我给大家唱首歌，大哥你想听什么？你点！', score: 89 },
      { time: '2:00', label: '平稳过渡', text: '好，感谢大哥。那我们继续今天的内容，待会儿有更精彩的节目等着大家哦。', score: 85 },
    ],
  },
  {
    id: 4,
    category: '礼物回应',
    streamer: '萌萌',
    description: '小礼物连击时的自然互动与持续感谢',
    level: '进阶',
    duration: '3:05',
    breakdowns: 5,
    color: 'from-rose-400 to-pink-600',
    transcript: [
      { time: '0:00', label: '连击识别', text: '哎呀，谁在刷小心心呀？我看到了我看到了！一个两个三个，停不下来了！', score: 88 },
      { time: '0:15', label: '点名感谢', text: '是阳光少年对吧？宝贝谢谢你，每次来都给我刷，我真的好感动。你是不是今天心情特别好呀？', score: 92 },
      { time: '0:35', label: '群体互动', text: '还有月亮姐姐、小白兔、大风车，哇今天好多人送礼物！你们是不是商量好的呀，太可爱了！', score: 90 },
      { time: '0:55', label: '情感回馈', text: '你们的每一个小心心我都收到了，虽然不贵但是心意满满的。我把它们都攒起来，像攒星星一样。', score: 94 },
      { time: '1:20', label: '自然衔接', text: '好嘞，感谢所有送礼物的宝贝。那我们继续刚才的话题，说到哪了来着？对对对……', score: 86 },
    ],
  },
  {
    id: 5,
    category: '情绪陪伴',
    streamer: '夜话女王',
    description: '深夜场控——从低沉到治愈的氛围转换',
    level: '高手范本',
    duration: '5:38',
    breakdowns: 6,
    color: 'from-indigo-400 to-purple-500',
    transcript: [
      { time: '0:00', label: '低声开启', text: '今晚好安静啊。我知道这个点还没睡的人，心里可能都有点事。没关系，我在这里陪你们。', score: 97 },
      { time: '0:25', label: '共情表达', text: '有人说睡不着，有人说心里堵得慌。我懂的，有时候白天装得太好了，夜里才敢做真实的自己。', score: 95 },
      { time: '0:55', label: '安全感营造', text: '这里没有人会judge你。想哭就哭，想说就说，不想说就静静听我说也行。我给你们放首歌好不好？', score: 96 },
      { time: '1:40', label: '正向引导', text: '你知道吗，能熬过今天的人都很厉害。不管今天遇到了什么，你已经很努力了，要给自己一个拥抱。', score: 93 },
      { time: '2:30', label: '互动治愈', text: '来，跟我做一个深呼吸。吸气——好——慢慢呼出来。感觉到了吗？世界还在，你也还在，这就够了。', score: 94 },
      { time: '3:30', label: '温暖收束', text: '好了宝贝们，夜已经深了。记得给自己倒杯温水，盖好被子。明天又是新的一天，我们明天见好吗？', score: 91 },
    ],
  },
  {
    id: 6,
    category: '情绪陪伴',
    streamer: '心心',
    description: '观众倾诉负面情绪时的回应和引导',
    level: '高手范本',
    duration: '4:20',
    breakdowns: 5,
    color: 'from-blue-400 to-indigo-500',
    transcript: [
      { time: '0:00', label: '接住情绪', text: '我看到有宝贝说今天被领导骂了，心里很委屈。来，跟姐姐说说怎么回事？我听着呢。', score: 95 },
      { time: '0:20', label: '共情回应', text: '唉，被误解的感觉真的很难受。你明明很努力了对不对？有些话说了也没人懂，憋着更难受。', score: 96 },
      { time: '0:50', label: '肯定价值', text: '但是你要知道，别人怎么看你不重要。你自己心里清楚你付出了多少，这就够了。你已经很棒了。', score: 92 },
      { time: '1:20', label: '转移注意', text: '来，现在把那些不开心的事暂时放一放。我给你讲个我上周的糗事，保证让你笑。你们准备好了吗？', score: 89 },
      { time: '2:00', label: '能量注入', text: '看，笑了吧！生活就是这样，有难过的时候，也有傻开心的时候。记住今天在直播间笑过的感觉哦。', score: 91 },
    ],
  },
  {
    id: 7,
    category: '节奏控场',
    streamer: '直播一哥',
    description: '冷场到热场的3步回血术',
    level: '进阶',
    duration: '2:55',
    breakdowns: 4,
    color: 'from-blue-400 to-cyan-500',
    transcript: [
      { time: '0:00', label: '识别冷场', text: '哎？怎么突然安静了？你们是不是都在吃东西呀？行行行，我知道了，是我刚才太无聊了对吧？', score: 88 },
      { time: '0:18', label: '自嘲破冰', text: '好吧好吧，是我的错。那我给大家表演一个绝活吧，你们绝对没见过的那种。先扣个想看！', score: 92 },
      { time: '0:40', label: '强互动拉回', text: '来来来，我出一个问题。一分钟之内答对的人，我私信给你发红包！准备好了吗？倒计时开始！', score: 95 },
      { time: '1:20', label: '节奏锁定', text: '哇，你们打字好快！太厉害了！这氛围对了嘛。接下来咱们玩个更刺激的，你们说好不好？', score: 90 },
    ],
  },
  {
    id: 8,
    category: '节奏控场',
    streamer: '小鱼',
    description: '高峰期多人同时发言的有序管理',
    level: '高手范本',
    duration: '3:45',
    breakdowns: 5,
    color: 'from-cyan-400 to-blue-600',
    transcript: [
      { time: '0:00', label: '人数暴涨', text: '哇塞，突然好多人进来了！欢迎欢迎！大家先别急，我一个一个看你们的消息哈！', score: 90 },
      { time: '0:20', label: '分流引导', text: '好，我看到有人问穿搭的，有人问护肤的，还有人说想听唱歌。这样，我们一个一个来好不好？先说穿搭的宝贝举个手！', score: 93 },
      { time: '0:50', label: '节奏把控', text: '穿搭的问题我回答完了哈。然后护肤的宝贝们，你们的问题是什么？我看看公屏。对对对，这个我知道！', score: 91 },
      { time: '1:30', label: '重要信息强调', text: '等一下等一下，有个重要的事说三遍！待会儿八点半有抽奖！八点半！抽奖！不要走开！', score: 94 },
      { time: '2:10', label: '过渡衔接', text: '好的，基本都回答完了。想听唱歌的宝贝们准备好，下面就是你们的时间了！给我刷个想听！', score: 89 },
    ],
  },
  {
    id: 9,
    category: '合规化解',
    streamer: '安全姐',
    description: '敏感话题的优雅转向技巧',
    level: '进阶',
    duration: '3:10',
    breakdowns: 5,
    color: 'from-green-400 to-teal-500',
    transcript: [
      { time: '0:00', label: '问题出现', text: '哎，这位朋友问的这个问题嘛，emmm怎么说呢，这个话题其实挺复杂的。', score: 85 },
      { time: '0:12', label: '轻松化解', text: '不过呢，在直播间里我们还是聊点开心的比较好哈。毕竟大家来这里是放松的对不对？', score: 92 },
      { time: '0:30', label: '巧妙转向', text: '说到这个，我倒想起来一个特别有意思的事。你们知道吗？就是上次我去逛街的时候……', score: 94 },
      { time: '0:55', label: '注意力转移', text: '哈哈哈是不是很搞笑？好了好了，我们说回正题。刚才有宝贝问我今天的妆容是怎么画的对吧？', score: 90 },
      { time: '1:20', label: '安全区锁定', text: '来来来，我给大家分享一下这个眼妆的小技巧，超级简单的，手残党也能学会。看好了哦！', score: 88 },
    ],
  },
  {
    id: 10,
    category: '危机应对',
    streamer: '老张',
    description: '恶意挑衅的四两拨千斤回应',
    level: '高手范本',
    duration: '4:45',
    breakdowns: 8,
    color: 'from-orange-400 to-red-500',
    transcript: [
      { time: '0:00', label: '挑衅出现', text: '嗯？有人说我是什么什么？哈哈哈，行吧，每天总有这样的朋友来活跃气氛的嘛。', score: 93 },
      { time: '0:15', label: '幽默化解', text: '这位朋友，你这么有精力来我直播间，说明你对我还是很关注的嘛。来，先坐下喝杯茶。', score: 96 },
      { time: '0:35', label: '全场共识', text: '大家不用理他哈，咱们直播间的老粉都知道，我是什么人你们最清楚了对吧？爱你们哦。', score: 91 },
      { time: '0:55', label: '价值重塑', text: '其实呢，有人不喜欢你很正常。说明你有特点，说明你不是那种谁都觉得无所谓的人。', score: 94 },
      { time: '1:15', label: '正向转化', text: '反而谢谢这位朋友，让直播间多了点话题。好了，我们继续我们的精彩内容！', score: 90 },
      { time: '1:35', label: '管理员配合', text: '管管帮我看一下哈，如果后面还有不友善的发言就帮我处理一下。好，我们继续！', score: 87 },
      { time: '1:55', label: '氛围修复', text: '来来来，刚才说到哪了？对！我们继续聊那个超级搞笑的事情。你们绝对想不到结局……', score: 89 },
      { time: '2:30', label: '能量回升', text: '哈哈哈哈是不是超好笑？好了气氛回来了！这才是我们直播间该有的样子嘛，开开心心的！', score: 92 },
    ],
  },
  {
    id: 11,
    category: '大哥互动',
    streamer: '妙妙',
    description: '与高价值用户建立长期情感连接',
    level: '高手范本',
    duration: '4:00',
    breakdowns: 6,
    color: 'from-amber-400 to-orange-500',
    transcript: [
      { time: '0:00', label: '进场欢迎', text: '哎呀！我们家大哥来了！所有人起立欢迎！大哥今天怎么这么晚才来呀，我等你好久了。', score: 95 },
      { time: '0:18', label: '专属关注', text: '大哥上次说最近在出差对吧？辛苦了辛苦了，出差在外面吃得好不好啊？有没有想我呀？', score: 93 },
      { time: '0:40', label: '记忆细节', text: '对了大哥，你上次说喜欢听那首歌，我这几天专门练了。等会儿唱给你听好不好？专属定制哦。', score: 97 },
      { time: '1:05', label: '群体尊重', text: '大家也都认识咱们家大哥了对吧？他是真的人好又帅，每次来都带着好心情给大家。一起谢谢大哥！', score: 90 },
      { time: '1:30', label: '情感升华', text: '说真心话，大哥你不只是支持我直播，你更像是我的朋友。不管你来不来、送不送，我都开心的。', score: 96 },
      { time: '2:00', label: '自然延续', text: '好啦，大哥你先听着。我跟大家继续聊啊，有什么想说的随时打字哦，我会留意你的消息的！', score: 88 },
    ],
  },
  {
    id: 12,
    category: '深夜治愈',
    streamer: '晚安电台',
    description: '凌晨场的低声陪伴与助眠引导',
    level: '高手范本',
    duration: '6:00',
    breakdowns: 6,
    color: 'from-slate-500 to-indigo-600',
    transcript: [
      { time: '0:00', label: '低语开场', text: '嘘……已经凌晨一点了。还没睡的宝贝，今天是不是有心事？没关系，我用最轻的声音陪你。', score: 97 },
      { time: '0:30', label: '环境营造', text: '我把灯光调暗了一点，放一首很轻很轻的音乐。你可以闭上眼睛，不用看屏幕，就听我说话就好。', score: 95 },
      { time: '1:10', label: '呼吸引导', text: '跟我一起深呼吸好吗？慢慢吸气，一二三四……然后慢慢呼出来，一二三四五六……再来一次。', score: 94 },
      { time: '2:00', label: '故事时间', text: '给你们讲个小故事吧。从前有一片森林，森林里住着一只总是睡不着的小熊……', score: 92 },
      { time: '3:30', label: '正念引导', text: '感受一下你现在躺着的床，柔软的被子，房间里安静的声音。这一刻什么都不用想，你很安全。', score: 96 },
      { time: '5:00', label: '轻声结束', text: '好了，我要慢慢把声音放低了。希望你今晚做个好梦。明天醒来，一切都会好的。晚安，宝贝。', score: 93 },
    ],
  },
];

const categories = ['全部场景', '开播暖场', '礼物回应', '情绪陪伴', '节奏控场', '合规化解', '危机应对', '大哥互动', '深夜治愈'];

export default function Masterclass() {
  const [activeCategory, setActiveCategory] = useState('全部场景');
  const [selectedClass, setSelectedClass] = useState(null);

  const filtered = activeCategory === '全部场景'
    ? masterclassData
    : masterclassData.filter((m) => m.category === activeCategory);

  if (selectedClass) {
    return <MasterclassDetail item={selectedClass} onBack={() => setSelectedClass(null)} />;
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto" style={{ backgroundColor: '#FFFBFE' }}>
      {/* Back */}
      <Link to="/learn" className="text-sm font-medium hover:underline mb-4 inline-block" style={{ color: '#6750A4' }}>
        ← 返回学习中心
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">标杆课堂</h1>
          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">NEW</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">顶级主播实录拆解，跟着高手学表达</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all active:scale-95 ${
              activeCategory === cat
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:bg-purple-50'
            }`}
            style={
              activeCategory === cat
                ? { backgroundColor: '#6750A4' }
                : { backgroundColor: '#F3EDF7' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masterclass Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <MasterclassCard key={item.id} item={item} onClick={() => setSelectedClass(item)} />
        ))}
      </div>
    </div>
  );
}

function MasterclassCard({ item, onClick }) {
  const [waveHeights, setWaveHeights] = useState(() =>
    Array.from({ length: 20 }, () => Math.random() * 16 + 8)
  );
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isHovered) {
      intervalRef.current = setInterval(() => {
        setWaveHeights(Array.from({ length: 20 }, () => Math.random() * 20 + 6));
      }, 150);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-gradient-to-br ${item.color} rounded-3xl p-5 text-white cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300`}
    >
      {/* Audio waveform visual */}
      <div className="flex items-center gap-0.5 mb-3 h-6">
        {waveHeights.map((h, i) => (
          <div
            key={i}
            className="w-1 bg-white/40 rounded-full transition-all duration-150"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      <div className="flex justify-between items-start mb-3">
        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{item.level}</span>
        <span className="text-xs opacity-70">{item.duration}</span>
      </div>

      <h3 className="font-bold text-sm mb-2">{item.description}</h3>
      <div className="flex justify-between items-center">
        <p className="text-xs opacity-80">by {item.streamer}</p>
        <span className="text-xs opacity-70">{item.breakdowns} 处拆解</span>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <button className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center hover:bg-white/50 transition-colors active:scale-95">
          <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="text-xs underline opacity-70">查看拆解</span>
      </div>
    </div>
  );
}

function MasterclassDetail({ item, onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState(null); // 'listen' or 'shadow'
  const [voiceProfile, setVoiceProfile] = useState('gentle');
  const [waveHeights, setWaveHeights] = useState(() =>
    Array.from({ length: 30 }, () => Math.random() * 20 + 8)
  );
  const utteranceRef = useRef(null);
  const playingRef = useRef(false);
  const segmentIndexRef = useRef(-1);
  const waveIntervalRef = useRef(null);
  const isCancelledRef = useRef(false);
  const voicesRef = useRef([]);

  // 加载可用语音列表
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const stopPlayback = useCallback(() => {
    isCancelledRef.current = true;
    playingRef.current = false;
    setIsPlaying(false);
    setCurrentSegmentIndex(-1);
    setProgress(0);
    setMode(null);
    window.speechSynthesis.cancel();
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
  }, []);

  const startWaveAnimation = useCallback(() => {
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    waveIntervalRef.current = setInterval(() => {
      setWaveHeights(Array.from({ length: 30 }, () => Math.random() * 24 + 6));
    }, 120);
  }, []);

  const stopWaveAnimation = useCallback(() => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
  }, []);

  const speakSegment = useCallback((text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';

      // 应用语音风格参数
      const profile = VOICE_PROFILES[voiceProfile];
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;

      // 尝试匹配最佳中文女声
      const voices = voicesRef.current;
      if (voices.length > 0) {
        // 优先找中文语音
        const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
        // 尝试匹配关键字
        let matched = zhVoices.find(v =>
          profile.voiceKeywords.some(kw => v.name.includes(kw))
        );
        if (!matched) matched = zhVoices.find(v => v.name.includes('female') || v.name.includes('女'));
        if (!matched && zhVoices.length > 0) matched = zhVoices[0];
        if (matched) utterance.voice = matched;
      }

      utteranceRef.current = utterance;

      utterance.onend = () => resolve('ended');
      utterance.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') {
          resolve('cancelled');
        } else {
          resolve('error');
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [voiceProfile]);

  const playFromIndex = useCallback(async (startIndex, playMode) => {
    const sessionId = Date.now();
    isCancelledRef.current = false;
    playingRef.current = true;
    setIsPlaying(true);
    setMode(playMode);
    startWaveAnimation();

    const totalSegments = item.transcript.length;

    for (let i = startIndex; i < totalSegments; i++) {
      if (isCancelledRef.current) break;

      segmentIndexRef.current = i;
      setCurrentSegmentIndex(i);
      setProgress(((i + 0.5) / totalSegments) * 100);

      const segment = item.transcript[i];
      const result = await speakSegment(segment.text);

      if (isCancelledRef.current || result === 'cancelled') break;

      setProgress(((i + 1) / totalSegments) * 100);

      // Shadow mode: pause between segments
      if (playMode === 'shadow' && i < totalSegments - 1 && !isCancelledRef.current) {
        stopWaveAnimation();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (isCancelledRef.current) break;
        startWaveAnimation();
      }
    }

    if (!isCancelledRef.current) {
      playingRef.current = false;
      setIsPlaying(false);
      setCurrentSegmentIndex(-1);
      setProgress(100);
      setMode(null);
      stopWaveAnimation();
      setTimeout(() => setProgress(0), 1500);
    }
  }, [item.transcript, speakSegment, startWaveAnimation, stopWaveAnimation]);

  const handleListenOnly = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    playFromIndex(0, 'listen');
  };

  const handleShadowPractice = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    playFromIndex(0, 'shadow');
  };

  const handleTimelineClick = (index) => {
    stopPlayback();
    setTimeout(() => {
      playFromIndex(index, mode || 'listen');
    }, 100);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto" style={{ backgroundColor: '#FFFBFE' }}>
      {/* Back */}
      <button
        onClick={() => { stopPlayback(); onBack(); }}
        className="text-sm font-medium hover:underline mb-4 inline-block active:scale-95 transition-transform"
        style={{ color: '#6750A4' }}
      >
        ← 返回标杆课堂
      </button>

      {/* Header Card */}
      <div className={`bg-gradient-to-br ${item.color} rounded-3xl p-6 text-white mb-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">{item.level}</span>
          <span className="text-sm opacity-80">{item.duration}</span>
        </div>
        <h1 className="text-xl font-bold mb-2">{item.description}</h1>
        <p className="text-sm opacity-80">by {item.streamer} · {item.category}</p>

        {/* Waveform */}
        <div className="mt-4 flex items-center gap-0.5 h-8">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-100"
              style={{
                height: `${h}px`,
                backgroundColor: isPlaying ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: '#6750A4',
            }}
          />
        </div>

        {/* Status */}
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs opacity-70">
            {isPlaying
              ? mode === 'shadow' ? '影子练习中...' : '播放中...'
              : progress === 100 ? '播放完成' : '准备就绪'}
          </span>
          {currentSegmentIndex >= 0 && (
            <span className="text-xs opacity-70">
              {item.transcript[currentSegmentIndex]?.label}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="rounded-3xl p-6 mb-6 border" style={{ backgroundColor: '#F3EDF7', borderColor: '#E8DEF8' }}>
        <h2 className="font-bold text-gray-800 text-lg mb-3">练习模式</h2>
        <p className="text-sm text-gray-600 mb-4">
          {mode === 'shadow'
            ? '影子练习：每段语音后会暂停2秒，请跟读模仿'
            : '跟着标杆主播的节奏和语气练习，模仿是最好的学习方式'}
        </p>

        {/* Voice Profile Selector */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">选择语音风格</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(VOICE_PROFILES).map(([key, profile]) => {
              const isActive = voiceProfile === key;
              return (
                <button
                  key={key}
                  onClick={() => { if (!isPlaying) setVoiceProfile(key); }}
                  disabled={isPlaying}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 ${
                    isPlaying ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#6750A4' : 'white',
                    color: isActive ? 'white' : '#49454F',
                    border: isActive ? 'none' : '1px solid #CAC4D0',
                    boxShadow: isActive ? '0 2px 8px rgba(103,80,164,0.3)' : 'none',
                  }}
                >
                  {profile.emoji} {profile.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {VOICE_PROFILES[voiceProfile].description}
            {isPlaying && ' · 播放中无法切换'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleListenOnly}
            className="px-5 py-2.5 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: '#6750A4' }}
          >
            {isPlaying && mode === 'listen' ? '⏹ 停止播放' : '🎧 只听不练'}
          </button>
          <button
            onClick={handleShadowPractice}
            className="px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all active:scale-95 hover:shadow-md"
            style={{
              borderColor: '#6750A4',
              color: '#6750A4',
              backgroundColor: isPlaying && mode === 'shadow' ? '#F3EDF7' : 'white',
            }}
          >
            {isPlaying && mode === 'shadow' ? '⏹ 停止练习' : '🗣 影子练习'}
          </button>
        </div>
      </div>

      {/* AI时间轴拆解 */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-800 text-lg mb-4">AI时间轴拆解</h2>
        <p className="text-sm text-gray-500 mb-4">点击任意节点可从该位置开始播放</p>
        <div className="space-y-3">
          {item.transcript.map((node, i) => {
            const isActive = currentSegmentIndex === i;
            return (
              <div
                key={i}
                onClick={() => handleTimelineClick(i)}
                className={`flex gap-4 rounded-3xl p-4 shadow-sm cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] ${
                  isActive ? 'ring-2 shadow-md' : 'border'
                }`}
                style={{
                  backgroundColor: isActive ? '#F3EDF7' : 'white',
                  borderColor: isActive ? '#6750A4' : '#f3f4f6',
                  ringColor: isActive ? '#6750A4' : undefined,
                  boxShadow: isActive ? '0 0 0 2px #6750A4' : undefined,
                }}
              >
                <div className="text-center flex-shrink-0 w-12">
                  <span
                    className="text-sm font-mono font-bold"
                    style={{ color: isActive ? '#6750A4' : '#7c3aed' }}
                  >
                    {node.time}
                  </span>
                  {isActive && (
                    <div className="mt-1 flex justify-center gap-0.5">
                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: '#6750A4' }} />
                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: '#6750A4', animationDelay: '0.2s' }} />
                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: '#6750A4', animationDelay: '0.4s' }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className="font-bold text-sm"
                      style={{ color: isActive ? '#6750A4' : '#1f2937' }}
                    >
                      {node.label}
                    </h4>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">{node.score}分</span>
                    {isActive && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs text-white animate-pulse"
                        style={{ backgroundColor: '#6750A4' }}
                      >
                        播放中
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{node.text}</p>
                </div>
                <div className="flex-shrink-0 flex items-center">
                  {isActive ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#6750A4' }}
                    >
                      <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2" style={{ borderColor: '#CAC4D0' }}>
                      <svg className="w-3 h-3" fill="#6750A4" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="rounded-3xl p-6 border" style={{ backgroundColor: '#F3EDF7', borderColor: '#E8DEF8' }}>
        <h2 className="font-bold text-gray-800 text-lg mb-3">学习建议</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#6750A4' }}>1</span>
            <span>先完整听一遍，感受整体节奏和情绪流动</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#6750A4' }}>2</span>
            <span>使用影子练习，跟读模仿语气和停顿</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#6750A4' }}>3</span>
            <span>点击时间轴节点，反复练习薄弱环节</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white" style={{ backgroundColor: '#6750A4' }}>4</span>
            <span>注意高分段落的表达技巧，尝试融入自己的风格</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
