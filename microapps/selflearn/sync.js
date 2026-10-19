// Pure reconciliation for SelfLearn snapshots; no network calls or destructive writes.
// The caller must load authenticated same-user snapshots and persist the result atomically.
import {newerRun} from "./engine.js";
const object=v=>v&&typeof v==="object"&&!Array.isArray(v);
const stamp=v=>{const n=Date.parse(v?.updatedAt||v?.date||"");return Number.isFinite(n)?n:0;};
const key=e=>typeof e?.id==="string"&&e.id.trim()?e.id:null;
export function mergeLearningEntries(local=[],remote=[]){
 const byId=new Map(),anonymous=new Map();
 for(const item of [...(Array.isArray(remote)?remote:[]),...(Array.isArray(local)?local:[])]){
  if(!object(item)){continue;}
  const id=key(item);
  if(!id){const signature=JSON.stringify(item);if(!anonymous.has(signature))anonymous.set(signature,item);continue;}
  const prev=byId.get(id);
  if(!prev||stamp(item)>stamp(prev))byId.set(id,item);
 }
 // Anonymous historical rows are preserved rather than silently discarded.
 return [...byId.values(),...anonymous.values()];
}
export function mergeLearningRuns(local={},remote={}){
 const a=object(local)?local:{},b=object(remote)?remote:{};
 return Object.fromEntries(["nl","en"].flatMap(course=>{
  const run=newerRun(a[course],b[course]);
  return run?[[course,run]]:[];
 }));
}
export function reconcileLearningSnapshots(local={},remote={}){
 const a=object(local)?local:{},b=object(remote)?remote:{};
 return {
  entries:mergeLearningEntries(a.entries,b.entries),
  learningRuns:mergeLearningRuns(a.learningRuns,b.learningRuns),
  // Other app fields intentionally remain outside this helper.
 };
}
export const SYNC_REQUIREMENTS=Object.freeze({
 sameAuthenticatedUser:true,
 atomicWriteRequired:true,
 remoteWritePerformed:false,
 deletionPropagation:false,
});
