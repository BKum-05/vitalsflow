<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bf5630f9-75a5-47b7-9b3c-cdeea8db860a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Setup

1. Copy [.env.example](.env.example) to [.env.local](.env.local).
2. Fill in the Firebase values from your Firebase web app config.
3. In Firebase Console, enable Authentication and Cloud Firestore.
4. Deploy the rules from [firestore.rules](firestore.rules) or paste them into the Firestore Rules editor.
