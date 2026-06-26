import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const [tasks] = useState([
    { id: 1, text: '完成3条开场话术练习', done: false },
    { id: 2, text: '学习"大哥互动"模块', done: false },
    { id: 3, text: '模拟直播间练习15分钟', done: false },
    { id: 4, text: '完成今日热点话题阅读', done: false },
  ]);

  const modules = [
    {
      title: '学习中心',
      desc: '系统化学习直播技巧与话术',
      path: '/learn',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: '日常练习',
      desc: '每日话术与场景实战训练',
      path: '/practice',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      title: '模拟考核',
      desc: '仿真直播间模拟与AI评测',
      path: '/sim',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: '活动中心',
      desc: '参与挑战赛与社区互动',
      path: '/activity',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen p-8 max-w-6xl mx-auto" style={{ backgroundColor: '#FFFBFE' }}>
      {/* Background organic blur shapes */}
      <div className="absolute top-20 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ backgroundColor: '#EADDFF' }} />
      <div className="absolute top-64 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: '#D0BCFF' }} />
      <div className="absolute bottom-32 left-1/3 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ backgroundColor: '#CCC2DC' }} />

      {/* Welcome */}
      <div className="relative mb-8">
        <p className="text-sm mb-1" style={{ color: '#49454F' }}>今天也是认真练习的一天</p>
        <h1 className="text-2xl font-medium" style={{ color: '#1C1B1F' }}>欢迎回来, Nora</h1>
        <span
          className="inline-block mt-2 px-4 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#EADDFF', color: '#6750A4' }}
        >
          当前段位: 见习主播
        </span>
      </div>

      {/* Navigation Module Cards */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {modules.map((mod) => (
          <button
            key={mod.path}
            onClick={() => navigate(mod.path)}
            className="flex flex-col items-center gap-3 p-6 rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] text-left cursor-pointer border-0"
            style={{ backgroundColor: '#F3EDF7' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#EADDFF', color: '#6750A4' }}
            >
              {mod.icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: '#1C1B1F' }}>{mod.title}</p>
              <p className="text-xs mt-1" style={{ color: '#49454F' }}>{mod.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Progress Cards */}
      <div className="relative grid grid-cols-2 gap-6 mb-8">
        {/* 整体进度 */}
        <div
          className="rounded-3xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ backgroundColor: '#F3EDF7' }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium" style={{ color: '#1C1B1F' }}>整体进度</h3>
            <span className="text-2xl font-medium" style={{ color: '#6750A4' }}>0%</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ backgroundColor: '#E8DEF8' }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: '0%', backgroundColor: '#6750A4' }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: '#49454F' }}>开始学习吧，完成模块提升段位</p>
        </div>

        {/* 上岗准备度 */}
        <div
          className="rounded-3xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ backgroundColor: '#F3EDF7' }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium" style={{ color: '#1C1B1F' }}>上岗准备度</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-medium" style={{ color: '#6750A4' }}>0%</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#E8DEF8', color: '#6750A4' }}
              >
                未就绪
              </span>
            </div>
          </div>
          <div className="w-full rounded-full h-3" style={{ backgroundColor: '#E8DEF8' }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: '0%', backgroundColor: '#6750A4' }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: '#49454F' }}>达到60%即可申请上岗考核</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="relative grid grid-cols-4 gap-4 mb-8">
        <div
          className="rounded-3xl p-5 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ backgroundColor: '#F3EDF7' }}
        >
          <p className="text-3xl font-medium" style={{ color: '#6750A4' }}>0</p>
          <p className="text-xs mt-1" style={{ color: '#49454F' }}>完成题数</p>
        </div>
        <div
          className="rounded-3xl p-5 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ backgroundColor: '#F3EDF7' }}
        >
          <p className="text-3xl font-medium" style={{ color: '#6750A4' }}>0<span className="text-sm font-normal" style={{ color: '#49454F' }}>天</span></p>
          <p className="text-xs mt-1" style={{ color: '#49454F' }}>连续打卡</p>
        </div>
        <div
          className="rounded-3xl p-5 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ backgroundColor: '#F3EDF7' }}
        >
          <p className="text-3xl font-medium" style={{ color: '#6750A4' }}>0</p>
          <p className="text-xs mt-1" style={{ color: '#49454F' }}>AI平均评分</p>
        </div>
        <div
          className="rounded-3xl p-5 text-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
          style={{ backgroundColor: '#F3EDF7' }}
        >
          <p className="text-3xl font-medium" style={{ color: '#6750A4' }}>0</p>
          <p className="text-xs mt-1" style={{ color: '#49454F' }}>模拟狗粮</p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="relative mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-medium" style={{ color: '#1C1B1F' }}>今日任务</h2>
          <span
            className="px-3 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#E8DEF8', color: '#6750A4' }}
          >
            0/4
          </span>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-5 py-4 rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              style={{ backgroundColor: '#F3EDF7' }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: '#CAC4D0' }}
              />
              <span className="text-sm" style={{ color: '#1C1B1F' }}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Luna AI Card */}
      <div
        className="relative rounded-3xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{ backgroundColor: '#F3EDF7' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#6750A4' }}
          >
            <span className="text-white text-xs font-medium">AI</span>
          </div>
          <div>
            <h3 className="font-medium" style={{ color: '#1C1B1F' }}>Luna 学习诊断</h3>
            <span className="text-xs" style={{ color: '#49454F' }}>每周更新</span>
          </div>
        </div>
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#FFFBFE' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: '#1C1B1F' }}>
            <span className="font-medium">欢迎开始你的主播训练之旅！</span> 你还没有学习记录，Luna 将在你完成首次练习后为你生成个性化学习诊断报告。
            建议从「学习中心」开始，了解直播基础知识和话术技巧。
          </p>
          <p className="text-xs mt-3 font-medium" style={{ color: '#6750A4' }}>
            推荐下一步：前往学习中心，开始你的第一个课程模块
          </p>
        </div>
        <button
          onClick={() => navigate('/learn')}
          className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] border-0 cursor-pointer"
          style={{ backgroundColor: '#6750A4', color: '#FFFFFF' }}
        >
          开始学习
        </button>
      </div>
    </div>
  );
}
