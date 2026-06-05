import { useState } from 'react';

export default function JobForm({ onSubmit, onError, isLoading }) {
  const [cvText, setCvText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [parsing, setParsing] = useState(false);
  const [cvFile, setCvFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form', {
      hasCvFile: Boolean(cvFile),
      cvFileName: cvFile?.name,
      cvFileSize: cvFile?.size,
      cvTextLength: cvText.trim().length,
      jobDescLength: jobDesc.trim().length
    });

    if (!cvText.trim() || !jobDesc.trim()) {
      const message = 'من فضلك املأ البيانات المطلوبة (الـ CV والـ Job Description)';
      alert(message);
      onError?.(message);
      return;
    }

    console.log('Calling onSubmit with file:', cvFile?.name || 'no file');
    onSubmit(cvText, jobDesc, cvFile);
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    console.log('File selected:', file.name, file.size, file.type);

    if (file.type !== 'application/pdf') {
      const message = 'من فضلك ارفع ملف PDF';
      alert(message);
      onError?.(message);
      return;
    }

    setCvFile(file);
    setParsing(true);
    try {
      console.log('Starting PDF parsing');
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
      // Use CDN worker to avoid bundler worker issues
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer loaded');

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log('PDF parsed', { pages: pdf.numPages });

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((it) => it.str).join(' ');
        fullText += pageText + '\n\n';
      }

      setCvText(fullText.trim());
    } catch (err) {
      console.error('Error parsing PDF:', err);
      const message = err?.message || 'حصل خطأ أثناء قراءة ملف الـ PDF';
      alert(message);
      onError?.(message);
    } finally {
      setParsing(false);
      // reset file input value to allow re-uploading same file if needed
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نص الـ CV بتاعك:</label>
          <div className="mb-2 flex items-center gap-3">
            <input type="file" accept="application/pdf" onChange={handleFile} disabled={isLoading || parsing} />
            {parsing && <span className="text-sm text-gray-500">جاري قراءة الـ PDF...</span>}
          </div>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            rows="8"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="انسخ نص الـ CV هنا... أو ارفع ملف PDF"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وصف الوظيفة (Job Description):</label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            rows="8"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="انسخ متطلبات الوظيفة هنا..."
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || parsing}
        className={`w-full py-3 px-4 font-medium text-white rounded-lg transition-colors ${
          isLoading || parsing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'جاري التحليل...' : parsing ? 'قراءة الملف...' : 'ابدأ التحليل الذكي '}
      </button>
    </form>
  );
}