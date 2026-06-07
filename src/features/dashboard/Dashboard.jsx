import { useState } from 'react';
import { ArrowRight, FileUp, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';

export default function Dashboard({ onAnalyze }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload your CV as a PDF file.');
      event.target.value = '';
      return;
    }

    setError(null);
    setCvFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!jobDescription.trim()) {
      setError('Add a job description before starting the analysis.');
      return;
    }

    if (!cvFile) {
      setError('Upload your CV in PDF format to continue.');
      return;
    }

    if (typeof onAnalyze !== 'function') {
      setError('Wire onAnalyze to your analyzeApplication function in App.jsx.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAnalyze(jobDescription.trim(), cvFile);
    } catch (error) {
      console.error('Analyze request failed:', error);
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Unable to start the analysis right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-12%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-14%] left-[24%] h-72 w-72 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_28%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-center">
        <div className="w-full">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-blue-400" />
              AI Job Application Tailor
            </div>

            <h1 className="text-balance text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
              Tailor Your Application in Seconds
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
              Drop in a job description and your CV file to generate a sharper,
              more relevant application workflow with a sleek, ATS-friendly experience.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Secure upload flow
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Premium glassmorphism UI
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative mx-auto mt-10 w-full max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_120px_rgba(2,6,23,0.75)] backdrop-blur-2xl sm:p-6 lg:p-8"
          >
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] bg-slate-900/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-t-blue-300 border-slate-700"></div>
                  <p className="text-sm text-slate-200">Analyzing — this may take a few seconds...</p>
                </div>
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
              <label className="block rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 transition duration-200 focus-within:border-blue-500/50 focus-within:bg-slate-950/55">
                <span className="text-sm font-semibold text-slate-200">Job Description</span>
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  rows={12}
                  placeholder="Paste the full job description here..."
                  className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-100 placeholder:text-slate-500 outline-none transition duration-200 focus:border-blue-500/60 focus:bg-white/10"
                  disabled={loading}
                />
              </label>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 transition duration-200 focus-within:border-blue-500/50 focus-within:bg-slate-950/55">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-semibold text-slate-200">CV File</span>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Upload a PDF resume and keep the flow fully centered on the analysis.
                      </p>
                    </div>
                    <FileUp className="h-5 w-5 shrink-0 text-blue-400" />
                  </div>

                  <input
                    id="cv-file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="sr-only"
                  />

                  <label
                    htmlFor="cv-file-upload"
                    className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-100 transition duration-200 hover:scale-[1.01] hover:border-blue-400/50 hover:bg-blue-500/15"
                  >
                    <UploadCloud className="h-4 w-4" />
                    {cvFile ? 'Replace CV PDF' : 'Upload CV PDF'}
                  </label>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    {cvFile ? (
                      <div className="flex items-center gap-2 text-blue-100">
                        <FileUp className="h-4 w-4 text-blue-400" />
                        <span className="truncate">{cvFile.name}</span>
                      </div>
                    ) : (
                      <span>PDF only. This keeps the upload flow clean and lightweight.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 text-sm leading-6 text-slate-300">
                  <p className="font-semibold text-slate-100">Ready for your analyzeApplication function</p>
                  <p className="mt-2">
                    In App.jsx, pass your existing function into <span className="text-blue-300">onAnalyze</span> and this hero will call it directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 px-6 py-4 text-base font-semibold text-slate-950 shadow-[0_0_50px_rgba(59,130,246,0.45)] transition duration-200 hover:scale-[1.02] hover:shadow-[0_0_70px_rgba(59,130,246,0.65)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Starting analysis...' : 'Start Analysis'}
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>

              {error && <p className="text-sm text-rose-300">{error}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}