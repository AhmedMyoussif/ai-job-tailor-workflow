import { useState } from 'react';
import Dashboard from './features/dashboard/Dashboard';
import { analyzeApplication } from './Services/api';
import { ExternalLink, Mail, Sparkles, X, Copy } from 'lucide-react';
import EmailOutput from './features/dashboard/EmailOutput'; // تأكد من مسار الملف الصحيح

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [fullResponse, setFullResponse] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const extractAnalysisOutput = (response) => {
    if (!response) return null;
    if (response.output) return response.output;
    if (Array.isArray(response) && response.length > 0) return response[0].output || response[0];
    return response;
  };

  const handleAnalyze = async (jobDescription, cvFile) => {
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const response = await analyzeApplication('', jobDescription, cvFile);
      setFullResponse(response);
      const output = extractAnalysisOutput(response);

      if (!output) {
        setAnalysisError('Analysis completed but no usable output was returned.');
        return null;
      }

      setAnalysisResult(output);
      return output;
    } catch (err) {
      setAnalysisError(err?.message || 'Failed to connect to analysis service.');
      return null;
    }
  };

  const handleCloseResult = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  
  const score = analysisResult?.score ?? '0/10';
  const suggestions = analysisResult?.suggestions ?? [];
  const coldEmail = analysisResult?.cold_email ?? '';
  
  const emailLink =
  Array.isArray(fullResponse)
    ? fullResponse.find(item => item.emailLink)?.emailLink
    : fullResponse?.emailLink || '';

    console.log("fullResponse =", fullResponse);
    console.log("emailLink =", emailLink);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Dashboard onAnalyze={handleAnalyze} />

      {(analysisResult || analysisError) && (
        <section className="relative mx-auto -mt-8 w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-5">
              <h2 className="text-3xl font-bold">Analysis Result</h2>
              <button onClick={handleCloseResult} className="p-2 hover:bg-white/10 rounded-xl"><X /></button>
            </div>

            {analysisError && <div className="text-rose-400 p-4">{analysisError}</div>}

            {analysisResult && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 p-6 border border-white/10 rounded-[1.5rem]">
                  <p className="text-slate-400">Matching Score</p>
                  <div className="mt-2 text-3xl font-black text-blue-200">{score}</div>
                  <div className="mt-6 space-y-3">
                    {suggestions.map((s, i) => <div key={i} className="p-4 bg-slate-900 rounded-xl text-sm">{s}</div>)}
                  </div>
                </div>

                <div className="lg:col-span-8 p-6 border border-white/10 rounded-[1.5rem]">
                  <EmailOutput 
                    emailText={coldEmail} 
                    emailLink={emailLink} 
                    copied={copied}
                    onCopy={async () => {
                        await navigator.clipboard.writeText(coldEmail || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );

}