import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const scenarios = [
  {
    id: 'warmup',
    title: '开场暖场训练',
    description: '练习开播自我介绍和暖场技巧',
    difficulty: '初级',
    gradient: 'from-green-400 to-emerald-600',
    watermark: '暖',
    image: '/sim/warmup.png',
  },
  {
    id: 'cold-rescue',
    title: '冷场急救训练',
    description: '房间冷场时如何快速活跃气氛',
    difficulty: '中级',
    gradient: 'from-blue-400 to-blue-600',
    watermark: '救',
    image: '/sim/cold-rescue.png',
  },
  {
    id: 'boss-reception',
    title: '用户留存训练',
    description: '用户进房后的留存互动技巧',
    difficulty: '高级',
    gradient: 'from-amber-400 to-yellow-600',
    watermark: '留',
    image: '/sim/boss-reception.png',
  },
  {
    id: 'troll-handling',
    title: '用户违规行为处理',
    description: '遇到违规/不当言论时的合规应对',
    difficulty: '中级',
    gradient: 'from-red-400 to-red-600',
    watermark: '规',
    image: '/sim/troll-handling.png',
  },
  {
    id: 'newbie-guide',
    title: '新人引导训练',
    description: '引导新用户上麦互动、关注直播间',
    difficulty: '初级',
    gradient: 'from-teal-400 to-teal-600',
    watermark: '引',
    image: '/sim/newbie-guide.png',
  },
  {
    id: 'user-retention',
    title: '用户挽留训练',
    description: '发现用户要退出时的挽留技巧',
    difficulty: '中级',
    gradient: 'from-purple-400 to-purple-600',
    watermark: '留',
    image: '/sim/user-retention.png',
  },
  {
    id: 'sensitive-topic',
    title: '敏感话题处理',
    description: '涉黄/政治敏感/线下索联等合规应对',
    difficulty: '高级',
    gradient: 'from-rose-700 to-red-900',
    watermark: '慎',
    image: '/sim/sensitive-topic.png',
  },
  {
    id: 'minor-protection',
    title: '未成年保护',
    description: '疑似未成年用户的合规操作',
    difficulty: '高级',
    gradient: 'from-orange-400 to-orange-600',
    watermark: '护',
    image: '/sim/minor-protection.png',
  },
  {
    id: 'emotion-comfort',
    title: '情绪安抚训练',
    description: '用户情绪低落时的陪伴与引导',
    difficulty: '中级',
    gradient: 'from-pink-400 to-pink-600',
    watermark: '抚',
    image: '/sim/emotion-comfort.png',
  },
  {
    id: 'pk-battle',
    title: '连麦PK训练',
    description: '与其他主播连麦PK时的控场技巧',
    difficulty: '中级',
    gradient: 'from-indigo-400 to-indigo-600',
    watermark: '战',
    image: '/sim/pk-battle.png',
  },
  {
    id: 'gift-thanks',
    title: '礼物感恩训练',
    description: '收到礼物时的即时感恩互动',
    difficulty: '初级',
    gradient: 'from-yellow-300 to-amber-500',
    watermark: '谢',
    image: '/sim/gift-thanks.png',
  },
  {
    id: 'late-night-heal',
    title: '深夜治愈训练',
    description: '深夜时段的治愈系陪伴互动',
    difficulty: '中级',
    gradient: 'from-slate-600 to-purple-900',
    watermark: '愈',
    image: '/sim/late-night-heal.png',
  },
];

const difficultyColor = {
  '初级': 'bg-green-100 text-green-700',
  '中级': 'bg-yellow-100 text-yellow-700',
  '高级': 'bg-red-100 text-red-700',
};

const filterTabs = ['全部', '初级', '中级', '高级'];

export default function SimExam() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('全部');

  const filteredScenarios =
    activeFilter === '全部'
      ? scenarios
      : scenarios.filter((s) => s.difficulty === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">模拟考核</h1>
        <p className="mt-2 text-gray-500 text-base">
          选择场景，开始模拟训练。
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === tab
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            onClick={() => navigate('/sim/' + scenario.id)}
          >
            {/* Card Image */}
            <div
              className={`relative h-[200px] bg-gradient-to-br ${scenario.gradient} flex items-center justify-center overflow-hidden`}
            >
              <img
                src={scenario.image}
                alt={scenario.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Card Body */}
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {scenario.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[scenario.difficulty]}`}
                >
                  {scenario.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {scenario.description}
              </p>
              <button
                className="mt-auto w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/sim/' + scenario.id);
                }}
              >
                开始模拟
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
