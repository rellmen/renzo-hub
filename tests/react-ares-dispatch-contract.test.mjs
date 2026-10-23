import test from "node:test";
import assert from "node:assert/strict";
import handler from "../apps/rise-react/server/ares-dispatch.mjs";
import api from "../apps/rise-react/api/ares-dispatch.js";
import {TOOLS, evaluateOperation, publicContract, toolEnabled} from "../apps/rise-react/server/ares-tool-policy.mjs";

const OP = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const OTHER = "44444444-4444-4444-8444-444444444444";
const STAMP = "2026-10-23T10:00:00.123456+00:00";
const baseEnv = {
  VERCEL_ENV: "preview",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "public-test",
  ARES_JARVIS_DISPATCH_ENABLED: "true",
  JARVIS_WEBHOOK_URL: "https://example.invalid/jarvis",
  JARVIS_OUTBOUND_TOKEN: "test-outbound"
};
const row = (over = {}) => ({
  id: OP, owner_id: USER, record_type: "ares_operation", title: "Preparar resumen semanal", status: "approved", updated_at: STAMP,
  ...over,
  payload: {agent: "Jarvis", details: "Lista de tareas de la semana", executionStatus: "not_connected", executed: false, approvedBy: "owner", ...(over.payload || {})}
});

async function invoke({stored = row(), reserve = true, accepted = true, owner = USER, config = baseEnv, method = "POST", access = "Bearer token", body = {operationId: OP}} = {}) {
  const keys = Object.keys(baseEnv);
  const previous = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  const oldFetch = global.fetch;
  for (const k of keys) delete process.env[k];
  Object.assign(process.env, config);
  const calls = [];
  global.fetch = async (url, opt = {}) => {
    const u = String(url), m = opt.method || "GET";
    calls.push({url: u, method: m, body: opt.body, headers: opt.headers});
    if (u.endsWith("/auth/v1/user")) return Response.json({id: owner});
    if (u.includes("/rest/v1/hub_records") && m === "GET") return Response.json(stored ? [stored] : []);
    if (u.includes("/rest/v1/hub_records") && m === "PATCH")
      return Response.json(calls.filter(c => c.method === "PATCH").length === 1 && !reserve ? [] : [{id: OP}]);
    if (u === "https://example.invalid/jarvis") return new Response(null, {status: accepted ? 202 : 500});
    throw Error("Unexpected network request: " + u);
  };
  const req = {method, headers: {authorization: access, host: "staging.example", origin: "https://staging.example"}, body};
  const res = {code: 0, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }};
  try { await handler(req, res); return {res, calls}; }
  finally {
    global.fetch = oldFetch;
    for (const [k, v] of Object.entries(previous)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
}

test("Vercel entry re-exports the Nocturne dispatch handler", () => assert.strictEqual(api, handler));

test("Tool contract is deny-by-default and only enables preview with explicit flag", () => {
  const tool = TOOLS["jarvis.capture_task"];
  assert.equal(Object.isFrozen(TOOLS), true);
  assert.equal(toolEnabled(tool, {VERCEL_ENV: "preview"}), false);
  assert.equal(toolEnabled(tool, {VERCEL_ENV: "production", ARES_JARVIS_DISPATCH_ENABLED: "true"}), false);
  assert.equal(toolEnabled(tool, {VERCEL_ENV: "preview", ARES_JARVIS_DISPATCH_ENABLED: "true"}), true);
  const pub = publicContract({});
  assert.deepEqual(pub.map(t => [t.id, t.enabled, t.attempts, t.requiresApproval]), [["jarvis.capture_task", false, 1, true]]);
  assert.equal(JSON.stringify(pub).includes("JARVIS"), false, "contract must not expose env names or destinations");
});

test("Policy rejects unknown tools, wrong agents, unapproved, executed, other owners and sensitive content", () => {
  assert.equal(evaluateOperation(row(), USER).ok, true);
  assert.equal(evaluateOperation(row({payload: {tool: "shell.exec"}}), USER).code, 422);
  assert.equal(evaluateOperation(row({payload: {agent: "Codex"}}), USER).code, 422);
  assert.equal(evaluateOperation(row({status: "pending_approval"}), USER).code, 409);
  assert.equal(evaluateOperation(row({payload: {approvedBy: "agent"}}), USER).code, 409);
  assert.equal(evaluateOperation(row({payload: {executed: true}}), USER).code, 409);
  assert.equal(evaluateOperation(row({payload: {executionStatus: "submitted"}}), USER).code, 409);
  assert.equal(evaluateOperation(row(), OTHER).code, 404);
  assert.equal(evaluateOperation(row({record_type: "renzo_task"}), USER).code, 404);
  assert.equal(evaluateOperation(row({title: "   "}), USER).code, 422);
  for (const text of ["Pagar factura", "Revisar nómina semana 43", "Enviar IBAN NL00", "rotar api key", "Propuesta Nodalys", "password reset"])
    assert.equal(evaluateOperation(row({title: text}), USER).code, 422, text);
  assert.equal(evaluateOperation(row({payload: {details: "adjunta el token"}}), USER).code, 422);
  // Classic approvals without approvedBy remain valid history.
  const legacy = row(); delete legacy.payload.approvedBy;
  assert.equal(evaluateOperation(legacy, USER).ok, true);
});

test("GET returns the public contract without network or secrets", async () => {
  const {res, calls} = await invoke({method: "GET"});
  assert.equal(res.code, 200); assert.equal(calls.length, 0);
  assert.equal(res.body.executesFinancialActions, false);
  assert.equal(res.body.tools[0].enabled, true);
});

test("Dispatch refuses production, missing flag, missing session and bad ids before any network", async () => {
  for (const [opts, code] of [
    [{config: {...baseEnv, VERCEL_ENV: "production"}}, 403],
    [{config: {...baseEnv, ARES_JARVIS_DISPATCH_ENABLED: "false"}}, 503],
    [{access: ""}, 401],
    [{body: {operationId: "x"}}, 400]
  ]) {
    const {res, calls} = await invoke(opts);
    assert.equal(res.code, code); assert.equal(calls.length, 0);
  }
});

test("Dispatch refuses sensitive or unapproved operations without contacting Jarvis", async () => {
  for (const stored of [row({title: "Pagar factura de luz"}), row({status: "pending_approval"}), null]) {
    const {res, calls} = await invoke({stored});
    assert.ok([404, 409, 422].includes(res.code));
    assert.equal(calls.some(c => c.url.includes("jarvis")), false);
    assert.equal(calls.some(c => c.method === "PATCH"), false);
  }
});

test("Dispatch claims with status+version CAS, sends once with idempotency key and never marks executed", async () => {
  const {res, calls} = await invoke();
  assert.equal(res.code, 200); assert.deepEqual(res.body, {ok: true, submitted: true, executed: false, status: "submitted"});
  const claim = calls.find(c => c.method === "PATCH");
  assert.match(claim.url, /status=eq\.approved/);
  assert.match(decodeURIComponent(claim.url), /updated_at=eq\.2026-10-23T10:00:00\.123456\+00:00/);
  const sent = calls.filter(c => c.url.includes("jarvis"));
  assert.equal(sent.length, 1);
  assert.equal(sent[0].headers["Idempotency-Key"], OP);
  const event = JSON.parse(sent[0].body);
  assert.equal(event.record.tool, "jarvis.capture_task");
  for (const c of calls.filter(c => c.method === "PATCH")) assert.equal(JSON.parse(c.body).payload.executed, false);
});

test("Lost claim race returns 409 and nothing is sent; failed delivery is recorded as unknown, not retried", async () => {
  const lost = await invoke({reserve: false});
  assert.equal(lost.res.code, 409);
  assert.equal(lost.calls.some(c => c.url.includes("jarvis")), false);
  const failed = await invoke({accepted: false});
  assert.equal(failed.res.code, 502); assert.equal(failed.res.body.status, "delivery_unknown");
  assert.equal(failed.calls.filter(c => c.url.includes("jarvis")).length, 1);
});

test("React client: contract fails closed and only approved, undelivered Jarvis operations can be handed off", async () => {
  const {aresToolContract, canHandOff, dispatchAresOperation} = await import("../apps/rise-react/src/lib/ares-dispatch-client.mjs");
  const {summarizeAresRecords} = await import("../apps/rise-react/src/lib/ares-records.mjs");
  assert.deepEqual(await aresToolContract({fetcher: async () => { throw Error("offline"); }}), {enabled: false, tools: []});
  assert.equal((await aresToolContract({fetcher: async () => Response.json({tools: [{id: "jarvis.capture_task", enabled: false}]})})).enabled, false);
  assert.equal((await aresToolContract({fetcher: async () => Response.json({tools: [{id: "jarvis.capture_task", enabled: true}]})})).enabled, true);
  assert.equal(canHandOff(row()), true);
  assert.equal(canHandOff(row({status: "submitted"})), false);
  assert.equal(canHandOff(row({payload: {executionStatus: "dispatching"}})), false);
  const summary = summarizeAresRecords([row(), row({id: "x", status: "pending_approval"}), row({id: "y", payload: {agent: "Codex"}})]);
  assert.deepEqual(summary.handoffs.map(r => r.id), [OP]);
  await assert.rejects(dispatchAresOperation("bad", "t"), /inválida/);
  await assert.rejects(dispatchAresOperation(OP, ""), /Sesión/);
  await assert.rejects(dispatchAresOperation(OP, "t", {fetcher: async () => { throw Error("net"); }}), /sin verificar/);
  await assert.rejects(dispatchAresOperation(OP, "t", {fetcher: async () => Response.json({error: "Contenido sensible"}, {status: 422})}), /sensible/);
  let sent;
  const ok = await dispatchAresOperation(OP, "t", {fetcher: async (u, o) => { sent = o; return Response.json({ok: true, submitted: true, executed: false, status: "submitted"}); }});
  assert.equal(ok.executed, false);
  assert.equal(JSON.parse(sent.body).operationId, OP);
  assert.equal(sent.headers.Authorization, "Bearer t");
});
