# Auto Documentation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) that handles audio file transcription using Groq's API.

## Handling Large File Uploads on Vercel

This project implements a solution for handling large audio file uploads (up to 100MB) on Vercel, which normally has a 4.5MB request size limit. The approach uses Vercel Blob Storage to bypass Vercel's API route size limitations:

1. **Client-side**: 
   - Files are selected by the user
   - Files are uploaded directly to Vercel Blob using client-side upload
   - A progress bar shows the upload and processing status
   - After upload completes, the client calls the transcription API with the Blob URL

2. **API route**: 
   - Receives the Blob URL (not the actual file)
   - Downloads the file from Vercel Blob to a temporary location
   - Transcribes the audio using Groq API
   - Cleans up temporary files
   - Returns the transcription result directly to the client

### Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

For Vercel deployment, add these environment variables in your Vercel project settings.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
