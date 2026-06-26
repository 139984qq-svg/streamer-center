import { useState } from 'react';
import { Link } from 'react-router-dom';
import { personas } from '../data/personas';

export default function Personas() {
  const [selectedPersona, setSelectedPersona] = useState(null);

  if (selectedPersona) {
    return <PersonaDetail persona={selectedPersona} onBack={() => setSelectedPersona(null)} />;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link to="/learn" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← 返回题库首页
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">打赏群体心理画像</h1>
        <p className="text-sm text-gray-500 mt-2">
          了解5种典型打赏用户的核心心理需求，掌握差异化应对策略
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-5 gap-4">
        {personas.map((persona) => (
          <div
            key={persona.id}
            onClick={() => setSelectedPersona(persona)}
            className="cursor-pointer bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 text-center"
          >
            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-2xl mb-3`}>
              {persona.icon}
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">{persona.name}</h3>
            <p className="text-xs text-gray-500">{persona.type}</p>
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{persona.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonaDetail({ persona, onBack }) {
  const [showAllLines, setShowAllLines] = useState(false);
  const displayedLines = showAllLines ? persona.sampleLines : persona.sampleLines.slice(0, 10);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={onBack} className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        ← 返回画像列表
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-2xl`}>
          {persona.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{persona.name}</h1>
          <p className="text-sm text-gray-500">{persona.type}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">{persona.description}</p>
      </div>

      {/* 人格特质 */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-3">人格特质</h2>
        <div className="flex flex-wrap gap-2">
          {persona.traits.map((trait, i) => (
            <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm">
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* 核心心理需求 */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-3">核心心理需求</h2>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
          <p className="text-sm text-gray-700 leading-relaxed">{persona.coreNeed}</p>
        </div>
      </div>

      {/* 应对策略 */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-3">应对策略</h2>
        <div className="space-y-2">
          {persona.strategies.map((strategy, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg p-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{strategy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 正确做法 / 避免雷区 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-bold text-green-700 mb-3 flex items-center gap-1">
            <span className="text-green-500">✓</span> 正确做法
          </h3>
          <div className="space-y-2">
            {persona.doList.map((item, i) => (
              <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-1">
            <span className="text-red-500">✗</span> 避免雷区
          </h3>
          <div className="space-y-2">
            {persona.dontList.map((item, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 示范话术 */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">
          示范话术 <span className="text-sm font-normal text-gray-400">({persona.sampleLines.length}条)</span>
        </h2>
        <div className="space-y-2">
          {displayedLines.map((line, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg p-3 hover:bg-purple-50 transition-colors">
              <span className="text-xs text-gray-400 font-mono w-5 flex-shrink-0">{i + 1}.</span>
              <p className="text-sm text-gray-700">{line}</p>
            </div>
          ))}
        </div>
        {persona.sampleLines.length > 10 && (
          <button
            onClick={() => setShowAllLines(!showAllLines)}
            className="mt-3 text-sm text-purple-600 hover:underline"
          >
            {showAllLines ? '收起' : `查看全部 ${persona.sampleLines.length} 条 →`}
          </button>
        )}
      </div>
    </div>
  );
}
