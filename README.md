# AI Job Application Tailor

An AI-powered workflow that analyzes a CV and a job description, then generates:

- a match analysis score
- improvement suggestions
- a tailored cold email

The frontend is built with React + Vite and sends requests to an n8n webhook.

## Features

- Upload a CV as PDF or paste CV text manually
- Paste a job description
- Extract PDF text in the browser
- Send data to n8n for analysis
- Display analysis results and a generated cold email

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Axios
- pdfjs-dist
- n8n

## Project Structure

```text
src/
  App.jsx
  main.jsx
  index.css
  Services/
    api.js
  components/
    Button.jsx
    Input.jsx
  features/
    dashboard/
      Dashboard.jsx
      JobForm.jsx
      AnalysisResult.jsx
      EmailOutput.jsx
```

## Requirements

- Node.js 18 or later
- npm
- An active n8n workflow with a webhook endpoint

## Setup

Clone the repository and install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root and set:

```bash
VITE_N8N_URL=https://ahmedhamouda.app.n8n.cloud
VITE_N8N_WEBHOOK_PATH=/webhook/analyze-application
```

If you skip these variables, the app uses the default n8n Cloud URL already defined in `src/Services/api.js`.

## Available Scripts

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## n8n Webhook Payload

The frontend sends one of these payloads depending on the input:

- With a PDF file: multipart form data with `cv_file`, `job_description`, and `cv_text`
- Without a file: JSON with `cv_text` and `job_description`

Your n8n workflow should be prepared to read:

- `cv_file` for binary upload handling
- `cv_text` for extracted text
- `job_description` for the target role description

## Deployment Notes

- Make sure the production site URL is allowed in the n8n CORS configuration.
- Rebuild and redeploy the frontend after changing environment variables.
- If you update the webhook path in n8n, update `VITE_N8N_WEBHOOK_PATH` accordingly.

## License

No license has been specified yet.