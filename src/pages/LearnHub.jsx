import { Link } from 'react-router-dom';

export default function LearnHub() {
  const featureCards = [
    {
      title: '直播话术',
      desc: '30+场景话术模板，即学即用',
      icon: '🎙️',
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      link: '/learn/scripts',
    },
    {
      title: '写作业|灵感',
      desc: '心理学驱动的粉丝召回话术',
      icon: '✍️',
      color: 'from-red-500 to-rose-600',
      bgLight: 'bg-red-50',
      link: '/learn/homework',
    },
    {
      title: '题库|训练',
      desc: '打赏群体画像与应对策略',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      link: '/learn/personas',
    },
    {
      title: '模拟直播间练习',
      desc: 'AI陪练实战模拟',
      icon: '🎬',
      color: 'from-orange-500 to-amber-600',
      bgLight: 'bg-orange-50',
      link: '/studio',
    },
  ];

  const toolboxItems = [
    { title: '主播成长地图', desc: '三阶段18项任务', icon: '🗺️', link: '/learn/growth' },
    { title: '危机应对手册', desc: '6大高频场景', icon: '🚨', link: '/learn/crisis' },
    { title: '互动游戏库', desc: '50+互动小游戏', icon: '🎮', link: '#' },
    { title: '开播前 Checklist', desc: '一键检查清单', icon: '✅', link: '#' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">学习中心</h1>

      {/* Feature Cards */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {featureCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`${card.bgLight} rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow group`}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-lg mb-3`}>
              {card.icon}
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">{card.title}</h3>
            <p className="text-xs text-gray-500 mb-3">{card.desc}</p>
            <span className="text-xs text-purple-600 font-medium group-hover:underline">进入 →</span>
          </Link>
        ))}
      </div>

      {/* 今日热点话题 */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">今日热点话题</h2>
          <Link to="/learn/topics" className="text-sm text-purple-600 hover:underline">查看全部 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Left: AI热点话题 */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔥</span>
              <h3 className="font-bold text-gray-800 text-sm">AI热点话题</h3>
              <div className="flex gap-1 ml-auto">
                <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded text-xs">最新</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">今天</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">昨天</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-red-500 font-medium mr-2">微博热搜</span>
                <span className="text-sm text-gray-700">AI已经能写歌了，主播还需要唱歌吗？</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-pink-500 font-medium mr-2">抖音</span>
                <span className="text-sm text-gray-700">00后整顿职场又出新梗</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-orange-500 font-medium mr-2">小红书</span>
                <span className="text-sm text-gray-700">多巴胺穿搭已经过时了，现在流行"静奢风"</span>
              </div>
            </div>
          </div>

          {/* Right: 场景话题 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💬</span>
              <h3 className="font-bold text-gray-800 text-sm">场景话题</h3>
              <span className="text-xs text-gray-400 ml-1">475条</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['破冰', '共鸣', '争论', '深谈', '音乐', '影视', '美食', '旅行'].map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <span className="text-sm text-gray-700">你最近一次笑到肚子疼是因为什么？</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <span className="text-sm text-gray-700">有没有一首歌每次听都会让你想到某个人？</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标杆课堂 */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-gray-800">标杆课堂</h2>
          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">NEW</span>
          <Link to="/learn/masterclass" className="text-sm text-purple-600 hover:underline ml-auto">查看全部 →</Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: '小月月', topic: '如何暖场让人瞬间放松', level: '高手范本', color: 'from-purple-400 to-purple-600' },
            { name: '甜心姐姐', topic: '大哥互动的最高境界', level: '进阶', color: 'from-pink-400 to-rose-500' },
            { name: '夜话女王', topic: '深夜场控的艺术', level: '高手范本', color: 'from-indigo-400 to-purple-500' },
          ].map((item) => (
            <div key={item.name} className={`bg-gradient-to-br ${item.color} rounded-xl p-5 text-white`}>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{item.level}</span>
                <span className="text-xs opacity-70">3:24</span>
              </div>
              <h4 className="font-bold text-sm mb-1">{item.topic}</h4>
              <p className="text-xs opacity-80">by {item.name} · 5处拆解</p>
            </div>
          ))}
        </div>
      </div>

      {/* 主播工具箱 */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">主播工具箱</h2>
        <p className="text-xs text-gray-400 mb-4">Host Toolbox</p>
        <div className="grid grid-cols-4 gap-4">
          {toolboxItems.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-2 block">{item.icon}</span>
              <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
