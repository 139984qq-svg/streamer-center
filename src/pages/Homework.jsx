import { useState } from 'react';
import { Link } from 'react-router-dom';
import { homeworkItems, homeworkCategories } from '../data/homework';

export default function Homework() {
  const [activeCategory, setActiveCategory] = useState('全部');

  const filtered = activeCategory === '全部'
    ? homeworkItems
    : homeworkItems.filter((item) => item.category === activeCategory);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link to="/learn" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← 返回学习中心
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">写作业 | 灵感</h1>
          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
            {homeworkItems.length} 条话术
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          基于心理学原理设计的粉丝召回与互动话术，让每一句话都有据可依
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100">
        {homeworkCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeCategory === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs mb-3">
              {item.category}
            </span>
            <p className="text-sm text-gray-800 leading-relaxed mb-3 font-medium">
              "{item.content}"
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="text-purple-600 font-medium">心理学原理：</span>
                {item.principle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>暂无数据</p>
        </div>
      )}
    </div>
  );
}
