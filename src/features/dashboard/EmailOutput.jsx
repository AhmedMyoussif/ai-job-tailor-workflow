import { useState } from 'react';

export default function EmailOutput({ emailText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          ✉️ مسودة الـ Cold Email
        </h2>
        <button
          onClick={handleCopy}
          className={`px-4 py-1.5 text-xs font-medium rounded-md border transition-all ${
            copied
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {copied ? '✔️ تم النسخ!' : '📋 نسخ النص'}
        </button>
      </div>

      <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100 font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[350px]">
        {emailText || 'لم يتم إنشاء إيميل بعد.'}
      </div>
    </div>
  );
}