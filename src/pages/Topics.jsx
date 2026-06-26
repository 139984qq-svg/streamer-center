import { useState } from 'react';
import { Link } from 'react-router-dom';
import { hotTopics, sceneTopics, sceneTopicCategories } from '../data/topics';

export default function Topics() {
  const [dateTab, setDateTab] = useState('最新');
  const [sceneCategory, setSceneCategory] = useState('全部');
  const [expandedTopic, setExpandedTopic] = useState(null);

  // Date filtering logic
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const filteredHot = (() => {
    switch (dateTab) {
      case '今天':
        return hotTopics.filter((t) => t.date === today);
      case '昨天':
        return hotTopics.filter((t) => t.date === yesterday);
      case '本周':
        return hotTopics.filter((t) => t.date >= weekAgo);
      default:
        return hotTopics;
    }
  })();
  const filteredScene = sceneCategory === '全部'
    ? sceneTopics
    : sceneTopics.filter((t) => t.category === sceneCategory);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/learn" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← 返回学习中心
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>💡</span> 今日热点话题
        </h1>
        <p className="text-sm text-gray-500 mt-1">不知道和用户聊什么？AI 每天结合最新热点，帮你准备好今晚的聊天话题</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI热点话题 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔥</span>
            <h2 className="font-bold text-gray-800">AI热点话题</h2>
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">联网实时</span>
            <button className="text-xs text-gray-400 ml-auto hover:text-purple-500">🔄 刷新</button>
          </div>

          <div className="flex gap-2 mb-4">
            {['最新', '今天', '昨天', '本周'].map((tab) => (
              <button
                key={tab}
                onClick={() => setDateTab(tab)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  dateTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
            {filteredHot.map((topic) => (
              <div key={topic.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded text-xs font-medium">
                    {topic.source}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-3 leading-relaxed">{topic.content}</p>

                {/* Extended Prompts */}
                <div className="border-t border-gray-50 pt-2 mt-2">
                  <p className="text-xs text-gray-400 mb-2">延伸话术</p>
                  <div className="space-y-1.5">
                    {topic.extendedPrompts.map((prompt, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold text-xs mt-0.5">{i + 1}</span>
                        <p className="text-xs text-gray-600 leading-relaxed">{prompt}</p>
                        <button className="text-gray-300 hover:text-purple-500 flex-shrink-0 ml-auto">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 场景话题 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💬</span>
            <h2 className="font-bold text-gray-800">场景话题</h2>
            <span className="text-xs text-purple-500 font-medium">{sceneTopics.length}条</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {sceneTopicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSceneCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  sceneCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2">
            {filteredScene.map((topic) => (
              <div
                key={topic.id}
                className="bg-white border border-gray-100 rounded-lg p-3 hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              >
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs flex-shrink-0">
                    {topic.category}
                  </span>
                  <p className="text-sm text-gray-700 flex-1">{topic.content}</p>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedTopic === topic.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {expandedTopic === topic.id && topic.subPrompts && (
                  <div className="mt-2 pl-8 space-y-1">
                    {topic.subPrompts.map((sub, i) => (
                      <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="text-purple-400">→</span> {sub}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
