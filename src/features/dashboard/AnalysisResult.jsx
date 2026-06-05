import React from 'react';

export default function AnalysisResult({ score, suggestions = [] }) {
  // تحديد لون الـ Score بناءً على النسبة لتسهيل القراءة بالعين
  const getScoreColor = (scoreStr) => {
    const num = parseInt(scoreStr, 10) || 0;
    if (num >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (num >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
           تقييم الـ CV واقتراحات التحسين
        </h2>
        <div className={`px-4 py-2 rounded-full font-bold text-lg border ${getScoreColor(score)}`}>
          نسبة التوافق: {score}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          التوصيات والكلمات المفتاحية الناقصة:
        </h3>
        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-sm">الـ CV متوافق بشكل ممتاز ولا توجد اقتراحات إضافية!</p>
        ) : (
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700 text-sm leading-relaxed">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}