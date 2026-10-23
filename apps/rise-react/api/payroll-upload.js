// Nocturne Vercel function: exact audited classic handler, never exposes service secrets.
export { default } from '../server/payroll-upload.mjs';
export const config = { maxDuration: 60 };
