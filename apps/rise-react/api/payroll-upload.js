// Nocturne Vercel function: exact audited classic handler, never exposes service secrets.
export { default } from '../../../api/payroll-upload.js';
export const config = { maxDuration: 60 };
