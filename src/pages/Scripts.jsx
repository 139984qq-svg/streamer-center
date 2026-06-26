import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { scripts, scriptTags } from '../data/scripts';

export default function Scripts() {
  const [selectedTag, setSelectedTag] = useState('');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 30;

  const toggleTag = (tag) => {
    if (tag === '全部场景') {
      setSelectedTag('');
    } else {
      // 单选：点击已选中的标签取消选中，否则切换到新标签
      setSelectedTag((prev) => prev === tag ? '' : tag);
    }
    setPage(1);
  };

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = useMemo(() => {
    return scripts.filter((s) => {
      if (showFavOnly && !favorites.has(s.id)) return false;
      if (selectedTag && s.subTag !== selectedTag) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.content.toLowerCase().includes(q) && !s.subTag.toLowerCase().includes(q) && !s.tag.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [scripts, selectedTag, search, showFavOnly, favorites]);

  const paginatedScripts = filtered.slice(0, page * perPage);
  const hasMore = paginatedScripts.length < filtered.length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/learn" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← 返回学习中心 / Back to Learn
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">直播话术</h1>
          <p className="text-sm text-gray-500 mt-1">基于社交心理学设计，每条话术标注底层心理机制，知其然更知其所以然</p>
        </div>
        <button
          onClick={() => { setShowFavOnly(!showFavOnly); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
            showFavOnly ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-purple-50'
          }`}
        >
          {showFavOnly ? '❤️' : '🤍'} 仅看收藏
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索话术关键字，如「欢迎」「拒绝」「暖场」"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
        />
      </div>

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-2 mb-6">
        {scriptTags.map((tag) => {
          const isAll = tag === '全部场景';
          const isActive = isAll ? selectedTag === '' : selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Count & Note */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-600">
          共 <strong className="text-purple-600">{filtered.length}</strong> 条话术
        </span>
        <span className="text-xs text-gray-400">·</span>
        <span className="text-xs text-gray-400">占位符: [昵称] [日期] [话题] [食物]，使用前替换为真实信息</span>
      </div>

      {/* Script Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedScripts.map((script) => (
          <div
            key={script.id}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                {script.subTag}
              </span>
              {script.tag !== script.subTag?.split('·')[0] && (
                <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-xs">
                  {script.tag}
                </span>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-gray-700 leading-relaxed mb-2 min-h-[60px]">
              {script.content}
            </p>

            {/* Psychology tag */}
            {script.psychology && (
              <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                <span>🧠</span> {script.psychology}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
              <button
                onClick={() => toggleFav(script.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  favorites.has(script.id)
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-400'
                }`}
              >
                {favorites.has(script.id) ? '❤️ 已收藏' : '🤍 收藏'}
              </button>
              <button
                onClick={() => copyToClipboard(script.content, script.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  copiedId === script.id
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                {copiedId === script.id ? '✅ 已复制' : '📋 复制'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2.5 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition-colors"
          >
            加载更多（剩余 {filtered.length - paginatedScripts.length} 条）
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg mb-2">暂无匹配话术</p>
          <p className="text-sm">试试调整筛选条件或搜索关键词</p>
        </div>
      )}
    </div>
  );
}
