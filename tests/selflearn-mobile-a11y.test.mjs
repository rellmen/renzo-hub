import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const view=readFileSync(new URL("../microapps/selflearn/view.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../microapps/selflearn/selflearn.css",import.meta.url),"utf8");
test("quick session and review actions are present",()=>{
 assert.match(view,/data-sl="quick-start"/);assert.match(view,/data-sl="quick-review"/);
 assert.match(view,/if \(act === "quick-start"\)/);
 assert.match(view,/if \(act === "quick-review"\)/);
});
test("keyboard focus and reduced motion have accessible styles",()=>{
 assert.match(css,/:focus-visible/);assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/min-height:44px/);
});
test("reset releases microphone session",()=>{
 assert.match(view,/reset\(\) \{ speechSession\?\.cancel\(\)/);
});
