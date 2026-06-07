import { useState } from 'react';
import Dashboard from './features/dashboard/Dashboard';
import { analyzeApplication } from './Services/api';
import { ExternalLink, Mail, Sparkles, X, Copy } from 'lucide-react';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [fullResponse, setFullResponse] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const extractAnalysisOutput = (response) => {
    // Try several common shapes returned by n8n or custom webhooks.
    // If multiple items are returned, prefer the most informative one.
    if (!response) return null;

    const normalizeOutput = (item) => {
      if (!item) return null;
      if (item.output) return item.output;
      if (item.response?.output) return item.response.output;
      if (item.json?.output) return item.json.output;
      if (item.json) return item.json;
      if (item.data) return item.data;
      return null;
    };

    // If top-level has direct output
    const direct = normalizeOutput(response);
    if (direct) return direct;

    // If response is an array, find the best candidate
    if (Array.isArray(response) && response.length > 0) {
      const candidates = response.map((it) => normalizeOutput(it)).filter(Boolean);

      if (candidates.length === 0) {
        // try fallback to raw items
        return response[response.length - 1] || null;
      }

      // Prefer a candidate with a meaningful score (not 'N/A' or falsy)
      for (let i = 0; i < candidates.length; i++) {
        const out = candidates[i];
        const score = String(out?.score ?? '').trim();
        const suggestions = Array.isArray(out?.suggestions) ? out.suggestions : [];
        const cold = String(out?.cold_email ?? out?.email ?? '').trim();

        const hasGoodScore = score && score.toLowerCase() !== 'n/a' && score !== '0' && score !== '0/10';
        const hasSuggestions = suggestions.length > 0;
        const hasLongEmail = cold.length > 50;

        if (hasGoodScore || hasSuggestions || hasLongEmail) {
          console.log('extractAnalysisOutput: selected candidate index', i, { score, suggestionsLength: suggestions.length, emailLength: cold.length });
          return out;
        }
      }

      // If none are particularly informative, return the last candidate
      return candidates[candidates.length - 1];
    }

    // If nested under response or data
    if (response.response?.output) return response.response.output;
    if (response.data?.output) return response.data.output;

    // Fall back to response itself
    return response;
  };

  const handleAnalyze = async (jobDescription, cvFile) => {
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const response = await analyzeApplication('', jobDescription, cvFile);
      console.log('analyzeApplication response:', response);
      setFullResponse(response);
      const output = extractAnalysisOutput(response);

      if (!output) {
        const message = 'Analysis completed but no usable output was returned. Check the n8n webhook response shape.';
        console.warn(message, { response });
        setAnalysisError(message);
        return null;
      }

      setAnalysisResult(output);
      return output;
    } catch (err) {
      console.error('handleAnalyze error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to connect to analysis service.';
      setAnalysisError(msg);
      return null;
    }
  };

  const handleCloseResult = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const score = analysisResult?.score ?? analysisResult?.matching_score ?? analysisResult?.match_score ?? '0/10';
  const suggestions = analysisResult?.suggestions ?? analysisResult?.recommendations ?? [];
  const coldEmail = analysisResult?.cold_email ?? analysisResult?.email ?? analysisResult?.message ?? '';
  const emailLink = analysisResult?.email_link ?? analysisResult?.gmail_link ?? analysisResult?.link ?? '';
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-slate-950 text-slate-100">
      <Dashboard onAnalyze={handleAnalyze} />

      {(analysisResult || analysisError) && (
        <section className="relative mx-auto -mt-8 w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_120px_rgba(2,6,23,0.75)] backdrop-blur-2xl sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  Analysis Result
                </div>
                <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                  Your tailored application is ready
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseResult}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            {analysisError && (
              <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {analysisError}
              </div>
            )}

            {analysisResult && (
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Matching Score
                  </p>
                  <div className="mt-3 inline-flex rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-3xl font-black text-blue-200 shadow-[0_0_40px_rgba(59,130,246,0.22)]">
                    {score}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-200 mb-3">Key suggestions</p>
                    <div className="space-y-3">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                          <div key={`${suggestion}-${index}`} className="rounded-2xl bg-slate-950/70 border border-white/5 p-4 text-sm text-slate-200 leading-7">
                            <div className="flex items-start gap-3">
                              <span className="mt-1 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
                              <div className="flex-1">{suggestion}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        (() => {
                          const numeric = parseInt(String(score).replace(/[^0-9]/g, ''), 10) || 0;
                          if (numeric <= 0) {
                            return (
                              <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4 text-sm text-slate-300 leading-7">
                                Resume Analysis Summary: To get a 10/10 score, ensure your CV explicitly mentions the key technologies listed in the job description.
                              </div>
                            );
                          }

                          return (
                            <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4 text-sm text-slate-400 leading-7">
                              No extra suggestions were returned in the response.
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>

                </div>

                <div className="lg:col-span-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 flex flex-col min-h-[360px]">
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
                    {coldEmail || 'No cold email text was returned in the response.'}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(coldEmail || '');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (err) {
                          console.error('Copy failed', err);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/6"
                    >
                      <Copy className="h-4 w-4 text-slate-200" />
                      {copied ? 'Copied' : 'Copy Email'}
                    </button>

                    {emailLink && (
                      <button
                        type="button"
                        onClick={() => window.open(emailLink, '_blank', 'noopener,noreferrer')}
                        className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:scale-[1.01]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in Gmail
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-span-full">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowRaw((s) => !s)}
                      className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"
                    >
                      {showRaw ? 'Hide raw response' : 'Show raw response'}
                    </button>
                  </div>

                  {showRaw && (
                    <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/60 p-3 text-xs text-slate-200">
                      {JSON.stringify(fullResponse ?? analysisResult, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}