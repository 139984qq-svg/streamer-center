import { useState } from 'react';
import { Link } from 'react-router-dom';

const phases = [
  {
    id: 1,
    name: '入门期',
    period: '0-3个月',
    status: 'current',
    progress: '1/6',
    tasks: [
      { id: 1, text: '完成平台规则学习并通过基础考核', done: true, judgeType: '系统自动判定' },
      { id: 2, text: '学完全部"开场暖场"话术模块', done: false, judgeType: '系统自动判定' },
      { id: 3, text: '模拟直播间累计练习30分钟', done: false, judgeType: '系统自动判定' },
      { id: 4, text: '掌握3种以上互动引导话术', done: false, judgeType: 'AI评分≥70' },
      { id: 5, text: '完成"打赏群体画像"全部学习', done: false, judgeType: '手动标记' },
      { id: 6, text: '通过入门期上岗考核', done: false, judgeType: '考核系统' },
    ],
  },
  {
    id: 2,
    name: '成长期',
    period: '3-6个月',
    status: 'locked',
    progress: '0/6',
    tasks: [
      { id: 7, text: '连续直播7天，每场≥1小时', done: false, judgeType: '系统自动判定' },
      { id: 8, text: '获得AI平均评分≥80', done: false, judgeType: 'AI评分' },
      { id: 9, text: '完成"危机应对手册"全部学习', done: false, judgeType: '系统自动判定' },
      { id: 10, text: '标杆课堂完成5个以上影子练习', done: false, judgeType: '系统自动判定' },
      { id: 11, text: '模拟直播间获得"冷场救急"评分≥85', done: false, judgeType: 'AI评分≥85' },
      { id: 12, text: '通过成长期考核', done: false, judgeType: '考核系统' },
    ],
  },
  {
    id: 3,
    name: '进阶期',
    period: '6个月+',
    status: 'locked',
    progress: '1/6',
    tasks: [
      { id: 13, text: '累计直播100场', done: true, judgeType: '系统自动判定' },
      { id: 14, text: '培养3个以上稳定粉丝（模拟）', done: false, judgeType: 'AI评估' },
      { id: 15, text: '所有场景AI评分平均≥90', done: false, judgeType: 'AI评分' },
      { id: 16, text: '完成1次完整PK模拟', done: false, judgeType: '系统自动判定' },
      { id: 17, text: '掌握全部"专属感"话术并灵活运用', done: false, judgeType: 'AI评分≥85' },
      { id: 18, text: '通过进阶期终极考核', done: false, judgeType: '考核系统' },
    ],
  },
];

export default function Growth() {
  const [expandedPhase, setExpandedPhase] = useState(1);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link to="/learn" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← 返回学习中心
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">主播成长地图</h1>
        <p className="text-sm text-gray-500 mt-1">三阶段 18 项任务，从入门到进阶，每一步都有迹可循</p>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`border rounded-xl overflow-hidden ${
              phase.status === 'current' ? 'border-purple-200 bg-white' : 'border-gray-100 bg-gray-50'
            }`}
          >
            {/* Phase Header */}
            <div
              className={`p-5 cursor-pointer flex items-center justify-between ${
                phase.status === 'locked' ? 'opacity-60' : ''
              }`}
              onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  phase.status === 'current'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {phase.id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{phase.name}</h3>
                    <span className="text-xs text-gray-400">({phase.period})</span>
                    {phase.status === 'current' && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">当前阶段</span>
                    )}
                    {phase.status === 'locked' && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded text-xs">未解锁</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">进度 {phase.progress}</p>
                </div>
              </div>

              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedPhase === phase.id ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Phase Tasks */}
            {expandedPhase === phase.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                <div className="space-y-3">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        task.done ? 'bg-green-50' : 'bg-white border border-gray-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        task.done ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                        {task.done && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {task.text}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        {task.judgeType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
