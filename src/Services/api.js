import axios from 'axios';

// Use environment variables so production/deployments can configure the URL/path
// Set in Netlify (or Vite) as VITE_N8N_URL and optional VITE_N8N_WEBHOOK_PATH
const DEFAULT_N8N_URL = 'https://ahmedhamouda.app.n8n.cloud';
const DEFAULT_WEBHOOK_PATH = '/webhook/analyze-application';
//const TestUrl = 'https://ahmedhamouda.app.n8n.cloud/webhook-test/analyze-application';

const PRODUCTION_URL = import.meta.env.VITE_N8N_URL || DEFAULT_N8N_URL;
const WEBHOOK_PATH = import.meta.env.VITE_N8N_WEBHOOK_PATH || DEFAULT_WEBHOOK_PATH;
const API_URL = `${PRODUCTION_URL.replace(/\/$/, '')}${WEBHOOK_PATH.startsWith('/') ? WEBHOOK_PATH : `/${WEBHOOK_PATH}`}`;
//const TEST_API_URL = TestUrl;

export const analyzeApplication = async (cvText, jobDescription, cvFile = null) => {
  try {
    console.log('analyzeApplication request', {
      apiUrl: API_URL,
      hasCvFile: Boolean(cvFile),
      cvFileName: cvFile?.name,
      cvFileSize: cvFile?.size,
      cvTextLength: cvText?.trim?.().length || 0,
      jobDescriptionLength: jobDescription?.trim?.().length || 0
    });

    let response;
    if (cvFile) {
      const formData = new FormData();
      
      try {
       
        const fileBuffer = await cvFile.arrayBuffer();
        const secureBlob = new Blob([fileBuffer], { type: cvFile.type || 'application/pdf' });
        
        // تأكد من أن اسم الحقل 'cv_file' يطابق تماماً ما تتوقعه في نود الـ Webhook في n8n
        formData.append('cv_file', secureBlob, cvFile.name || 'resume.pdf');
      } catch (fileError) {
        console.warn('Fallback to direct file object due to reading error:', fileError);
        formData.append('cv_file', cvFile);
      }

      formData.append('job_description', jobDescription || '');
      formData.append('cv_text', cvText || '');

      console.log('Posting multipart FormData to n8n safely');
      
      // نرسل الـ formData باستخدام Axios بشكل طبيعي
      response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      console.log('Posting JSON to n8n');
      response = await axios.post(API_URL, {
        cv_text: cvText,
        job_description: jobDescription
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error connecting to n8n Webhook', {
      url: API_URL,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const analyzeJobApplication = analyzeApplication;