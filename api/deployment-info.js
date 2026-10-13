export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  response.setHeader("Cache-Control", "no-store, max-age=0");
  return response.status(200).json({
    environment: process.env.VERCEL_ENV || "unknown",
    project: process.env.VERCEL_PROJECT_NAME || "renzo-hub",
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
  });
}
