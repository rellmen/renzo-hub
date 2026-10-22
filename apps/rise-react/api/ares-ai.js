// Vercel discovers functions relative to this app root; TanStack dev uses src/server.ts.
// Both transports reuse the exact same authenticated server implementation.
export { default } from '../../../api/ares-ai.js';
