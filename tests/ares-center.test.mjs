import test from "node:test";
import assert from "node:assert/strict";
import {summarizeRecords,ARES_TYPES,isInboxPending,isDecisionPending,isTaskOpen,isAgentEvent,isOperationPending} from "../microapps/ares-center/ares.js";

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

// Guardrail: keep Ares Center visually native to the published RISE HUB theme.
test("visual identity of RISE HUB is inherited without global restyling", async () => {
  const {readFileSync} = await import("node:fs");
  const {fileURLToPath} = await import("node:url");
  const css = readFileSync(fileURLToPath(new URL("../microapps/ares-center/ares.css", import.meta.url)), "utf8");
  assert.match(css, /--rise-panel/);
  assert.match(css, /--accent/);
  assert.match(css, /--accent2/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /(?:^|[;{])\s*backdrop-filter\s*:/m);
});

test("Ares only monitors canonical RISE HUB types", () => {
  assert.deepEqual(ARES_TYPES,["renzo_project","renzo_task","renzo_inbox","renzo_event","ares_decision","ares_agent_run","ares_operation"]);
});
test("Inbox excludes reviewed and archived legacy items", () => {
  assert.equal(isInboxPending({record_type:"renzo_inbox",payload:{status:"needs_review"}}),true);
  assert.equal(isInboxPending({record_type:"renzo_inbox",payload:{status:"reviewed"},status:"needs_review"}),false);
  assert.equal(isInboxPending({record_type:"renzo_inbox",payload:{status:"archived"}}),false);
});
test("Task statuses match Work semantics", () => {
  assert.equal(isTaskOpen({record_type:"renzo_task",payload:{status:"Today"}}),true);
  assert.equal(isTaskOpen({record_type:"renzo_task",payload:{status:"Completed"}}),false);
});
test("Only pending decisions can be accepted", () => {
  assert.equal(isDecisionPending({record_type:"ares_decision",status:"pending"}),true);
  assert.equal(isDecisionPending({record_type:"ares_decision",status:"approved"}),false);
});
test("Agent activity is evidence only, not fabricated online status", () => {
  assert.equal(isAgentEvent({record_type:"renzo_event",source:"automation",payload:{}}),true);
  assert.equal(isAgentEvent({record_type:"renzo_event",source:"manual",payload:{}}),false);
  assert.equal(isAgentEvent({record_type:"ares_agent_run",source:"manual",payload:{}}),true);
});

test("Agent operation approvals are separate from execution",()=>{assert.equal(isOperationPending({record_type:"ares_operation",status:"pending_approval"}),true);assert.equal(isOperationPending({record_type:"ares_operation",status:"approved"}),false);assert.equal(isOperationPending({record_type:"ares_decision",status:"pending_approval"}),false);});
