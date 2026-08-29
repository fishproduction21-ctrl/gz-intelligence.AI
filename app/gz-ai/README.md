# GZ AI

Realtime GZ Intelligence chat interface. The API is exposed at `/api/gz-chat` and uses the Vercel AI Gateway through the AI SDK.

Production requires AI Gateway to be enabled for the linked Vercel project. On Vercel, authentication uses the platform OIDC integration; no provider key is hard-coded in the repository.
