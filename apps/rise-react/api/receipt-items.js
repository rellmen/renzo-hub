// Vercel file-system entry: tickets, lectura de productos bajo demanda (apagada salvo RECEIPT_AI_ENABLED).
export { default } from '../server/receipt-items.mjs';
export const config = { maxDuration: 60 };
