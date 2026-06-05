import { useState } from 'react';
import JobForm from './JobForm';
import AnalysisResult from './AnalysisResult';
import EmailOutput from './EmailOutput';
import { analyzeJobApplication } from '../../Services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (cvText, jobDescription, cvFile = null) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeJobApplication(cvText, jobDescription, cvFile);
      
      // 1. قفش أول عنصر في المصفوفة لأن الـ n8n بيبعت array
      const firstItem = Array.isArray(data) ? data[0] : data;
      
      // 2. الدخول لعقل الـ JSON (response -> output)
      const targetOutput = firstItem?.response?.output || firstItem?.output || firstItem;

      if (targetOutput) {
        // 3. تسكين البيانات في الـ State بالـ Keys الصح
        setResult({
          score: targetOutput.score || "0/10",
          suggestions: targetOutput.suggestions || [],
          cold_email: targetOutput.cold_email || ""
        });
      } else {
        setError('البيانات الراجعة مش كاملة، اتأكد من إعدادات الـ Parser في n8n.');
      }

    } catch (err) {
      console.error('Analyze request failed:', err);
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'حصلت مشكلة أثناء الاتصال بالسيرفر.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormError = (message) => {
    console.error('Form error:', message);
    setError(message);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">AI Job Application Tailor</h1>
        <p className="text-gray-500 mt-2">حسن الـ CV بتاعك وجهز الـ Cold Email في ثواني</p>
      </header>

      {/* الـ Form الأساسي */}
      <JobForm onSubmit={handleAnalyze} onError={handleFormError} isLoading={loading} />

      {/* حالة التحميل */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">الـ AI بيحلل البيانات دلوقتي، ثواني ويكون جاهز...</p>
        </div>
      )}

      {/* عرض الأخطاء إن وجدت */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
          {error}
        </div>
      )}

      {/* النتائج */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalysisResult score={result.score} suggestions={result.suggestions} />
          <EmailOutput emailText={result.cold_email} />
        </div>
      )}
    </div>
  );
}