import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotTopics } from '../data/topics';

// Icons
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const ChevronRight = ({ className = 'w-4 h-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

export default function Learn() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);

  // Click-to-copy handler
  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, []);

  // Preview data for 素材库
  const scriptPreviews = [
    { id: 's1', tag: '开场暖场', text: '哈喽，欢迎来到直播间！今天天气好冷啊，大家有没有喝热水呀？来来来，先给大家比个心～' },
    { id: 's2', tag: '留人话术', text: '新来的朋友先别划走，给我30秒，保证让你觉得没白来！' },
    { id: 's3', tag: '感谢关注', text: '感谢新关注的宝贝们，你们每一个关注对我来说都是莫大的鼓励！' },
    { id: 's4', tag: '互动引导', text: '有什么想聊的可以打在公屏上，我都会看到的，别害羞哦～' },
  ];

  const homeworkPreviews = [
    { id: 'h1', tag: '锚定效应', text: '「全网最低价我不敢说，但这个品质这个价格，你去对比一下就知道了」' },
    { id: 'h2', tag: '从众心理', text: '「已经有3000多个姐妹下单了，品质大家是有目共睹的」' },
    { id: 'h3', tag: '损失厌恶', text: '「今天不买明天就恢复原价了，到时候后悔可别来找我哦」' },
    { id: 'h4', tag: '互惠原理', text: '「我先给大家发一波福利，抽奖走起！中不中的都热闹热闹」' },
  ];

  const topicPreviews = (hotTopics || []).slice(0, 4).map((t, i) => ({
    id: `t${i}`,
    tag: t.source || '热搜',
    text: typeof t === 'string' ? t : (t.content || t.title || t.text || ''),
  }));

  // 3 module cards config
  const modules = [
    {
      key: 'material',
      title: '直播素材库',
      subtitle: '话术 · 灵感 · 热点，一站式直播内容支撑',
      icon: <MicIcon />,
      gradient: 'from-purple-500 via-indigo-500 to-violet-600',
      stats: [
        { value: '930+', label: '话术模板' },
        { value: '7', label: '心理机制' },
        { value: '35', label: '今日热点' },
      ],
      tabs: [
        { label: '直播话术', items: scriptPreviews, route: '/learn/scripts' },
        { label: '写作业灵感', items: homeworkPreviews, route: '/learn/homework' },
        { label: '今日热点', items: topicPreviews, route: '/learn/topics' },
      ],
    },
    {
      key: 'classroom',
      title: '主播课堂',
      subtitle: '标杆拆解 + 成长地图，系统进阶之路',
      icon: <BookIcon />,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      stats: [
        { value: '12', label: '标杆拆解' },
        { value: '3', label: '成长阶段' },
        { value: '18', label: '学习任务' },
      ],
      entries: [
        { label: '标杆课堂', desc: '音频波形回放 + 时间线拆解，模仿高手节奏', route: '/learn/masterclass' },
        { label: '成长地图', desc: '3阶段18项任务，从见习到王牌主播', route: '/learn/growth' },
      ],
    },
    {
      key: 'handbook',
      title: '直播间互动手册',
      subtitle: '5类用户画像 × 针对性互动策略',
      icon: <UsersIcon />,
      gradient: 'from-orange-400 via-rose-500 to-pink-600',
      stats: [
        { value: '5', label: '用户画像' },
        { value: '150+', label: '互动话术' },
        { value: '30', label: '应对策略' },
      ],
      route: '/learn/personas',
    },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#FFFBFE' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 p-8 lg:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">学习中心</h1>
            <p className="text-purple-100 text-sm lg:text-base max-w-lg">
              三大模块覆盖直播全场景：素材库提供即用话术，课堂助你系统进阶，互动手册教你读懂每一位观众。
            </p>
          </div>
        </div>

        {/* 3 Module Cards */}
        {modules.map((mod) => (
          <ModuleCard
            key={mod.key}
            mod={mod}
            navigate={navigate}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        ))}

      </div>
    </div>
  );
}

/* ─── Module Card Component ─── */
function ModuleCard({ mod, navigate, copiedId, onCopy }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      className="rounded-3xl overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-md"
      style={{ backgroundColor: 'white', borderColor: '#E8DEF8' }}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${mod.gradient} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {mod.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold">{mod.title}</h2>
              <p className="text-xs opacity-80 mt-0.5">{mod.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mt-4">
          {mod.stats.map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Type 1: 素材库 - has tabs with preview items */}
        {mod.tabs && (
          <>
            {/* Tab Bar */}
            <div className="flex gap-2 mb-4">
              {mod.tabs.map((tab, idx) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(idx)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95"
                  style={{
                    backgroundColor: activeTab === idx ? '#6750A4' : '#F3EDF7',
                    color: activeTab === idx ? 'white' : '#49454F',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Preview Items - click to copy */}
            <div className="space-y-2 mb-4">
              {mod.tabs[activeTab].items.map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onCopy(item.text, item.id)}
                    className="group flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98]"
                    style={{
                      backgroundColor: isCopied ? '#E8DEF8' : '#F9F7FC',
                    }}
                    title="点击复制"
                  >
                    <span
                      className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium mt-0.5"
                      style={{ backgroundColor: '#E8DEF8', color: '#6750A4' }}
                    >
                      {item.tag}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 leading-relaxed">
                      {item.text}
                    </span>
                    <span
                      className="flex-shrink-0 mt-0.5 transition-all duration-200"
                      style={{
                        color: isCopied ? '#4CAF50' : '#CAC4D0',
                        opacity: isCopied ? 1 : 0,
                      }}
                    >
                      {isCopied ? (
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#4CAF50' }}>
                          <CheckIcon /> 已复制
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Enter full page */}
            <button
              onClick={() => navigate(mod.tabs[activeTab].route)}
              className="w-full py-2.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 hover:shadow-md flex items-center justify-center gap-1"
              style={{ backgroundColor: '#F3EDF7', color: '#6750A4' }}
            >
              查看全部{mod.tabs[activeTab].label}
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Type 2: 课堂 - entry links */}
        {mod.entries && (
          <div className="space-y-3">
            {mod.entries.map((entry) => (
              <button
                key={entry.label}
                onClick={() => navigate(entry.route)}
                className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:shadow-md active:scale-[0.98]"
                style={{ backgroundColor: '#F3EDF7' }}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-800 mb-1 group-hover:underline">{entry.label}</h3>
                  <p className="text-xs text-gray-500">{entry.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Type 3: 互动手册 - single entry */}
        {mod.route && !mod.tabs && !mod.entries && (
          <button
            onClick={() => navigate(mod.route)}
            className="w-full group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:shadow-md active:scale-[0.98]"
            style={{ backgroundColor: '#F3EDF7' }}
          >
            <div className="flex-1 text-left">
              <h3 className="font-bold text-sm text-gray-800 mb-1 group-hover:underline">
                查看5类用户画像与应对策略
              </h3>
              <p className="text-xs text-gray-500">
                土豪型 · 情感型 · 社交型 · 猎奇型 · 路人型，每类30条针对性话术
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
