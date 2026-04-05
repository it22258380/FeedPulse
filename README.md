# FeedPulse
FeedPulse is a lightweight internal tool that lets teams collect product feedback and feature requests from users, then uses Google Gemini AI to automatically categorise, prioritise, and summarise them -- giving product teams instant clarity on what to build next.

## Testing
- Automated tests are not yet checked in. Until they exist, run a quick smoke pass before releasing:
  - Backend: start the API with your usual command (for example `npm run start` or `node dist/server.js`), hit a simple endpoint (health/root) to confirm 200s, then create a sample feedback item and verify the response includes the AI-generated category/summary.
  - Frontend: start the web app (for example `npm run dev`), submit a new feedback entry through the UI, confirm it appears in the list, and check that prioritisation/summaries render without errors.
- When you add automated suites later, standardise on `npm test` in each package so CI/CD can run them consistently.
