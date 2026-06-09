import { Mail, ExternalLink, Copy } from 'lucide-react';

export default function EmailOutput({ emailText, emailLink, onCopy, copied }) {
  console.log("EmailOutput received:", emailLink);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Cold Email Draft</h3>
        </div>
        {emailLink && (
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
            Linked to Gmail
          </span>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-6 text-sm leading-7 text-slate-200">
        {emailText || 'No cold email text was returned.'}
      </div>

      <div className="mt-4 pt-4 border-t border-white/6 flex items-center gap-3">
        <button 
          onClick={onCopy} 
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/6"
        >
          <Copy className="h-4 w-4" /> 
          {copied ? 'Copied!' : 'Copy Email'}
        </button>

        {emailLink && (
          <button
            onClick={() => window.open(emailLink, '_blank', 'noopener,noreferrer')}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:scale-[1.01]"
          >
            <ExternalLink className="h-4 w-4" /> Open in Gmail
          </button>
        )}
      </div>
    </div>
  );
}