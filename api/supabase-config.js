export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    return response.status(503).json({ error: "Supabase environment is not configured" });
  }

  response.setHeader("Cache-Control", "no-store, max-age=0");
  return response.status(200).json({ supabaseUrl, publishableKey });
}
