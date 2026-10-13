import test from "node:test";
import assert from "node:assert/strict";
import {summarizeRecords} from "../microapps/command-center/command-center.js";

test("summarizeRecords uses only returned rows", () => {
  const result = summarizeRecords([
    {domain:"work",requires_review:true,occurred_at:"2026-10-10T10:00:00Z"},
    {domain:"work",requires_review:false,occurred_at:"2026-10-11T10:00:00Z"},
    {domain:"system",requires_review:true,occurred_at:"2026-10-12T10:00:00Z"}
  ]);
  assert.deepEqual(result,{total:3,work:2,events:1,pending:2,lastActivity:"2026-10-12T10:00:00Z"});
});

test("empty and invalid data have no fabricated counts", () => {
  assert.deepEqual(summarizeRecords(null),{total:0,work:0,events:0,pending:0,lastActivity:null});
  assert.deepEqual(summarizeRecords([]),{total:0,work:0,events:0,pending:0,lastActivity:null});
});

test("never treats all rows as pending without the true flag", () => {
  const result=summarizeRecords([{domain:"system",requires_review:"true"},{domain:"personal",requires_review:false}]);
  assert.equal(result.pending,0);
  assert.equal(result.work,0);
  assert.equal(result.events,1);
});

// Guardrail: keep Command Center visually native to the published RISE HUB theme.
test("visual identity of RISE HUB is inherited without global restyling", async () => {
  const {readFileSync} = await import("node:fs");
  const {fileURLToPath} = await import("node:url");
  const css = readFileSync(fileURLToPath(new URL("../microapps/command-center/command-center.css", import.meta.url)), "utf8");
  assert.match(css, /--rise-panel/);
  assert.match(css, /--accent/);
  assert.match(css, /--accent2/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /(?:^|[;{])\s*backdrop-filter\s*:/m);
});
