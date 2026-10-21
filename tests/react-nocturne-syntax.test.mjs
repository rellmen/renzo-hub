import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';
const base=new URL('../apps/rise-react/src/',import.meta.url);
const files=['routes/index.tsx','routes/gym.tsx','routes/piel.tsx','routes/proyectos.tsx','routes/ares.tsx','components/rise/AppShell.tsx','lib/auth/AuthProvider.tsx','routes/__root.tsx'];
test('React Nocturne: new authenticated screens and shell parse as TSX',()=>{
 for(const path of files){
   const source=readFileSync(new URL(path,base),'utf8');
   const out=transformSync(source,{loader:'tsx',format:'esm',sourcefile:path,jsx:'automatic',target:'es2022'});
   assert(out.code.length>100,'empty transform for '+path);
   assert(!out.warnings.length,'warnings in '+path+': '+JSON.stringify(out.warnings));
 }
});
test('Real Ares and Projects cannot display Lovable demo responses or seed tasks',()=>{
 const read=path=>readFileSync(new URL(path,base),'utf8');
 const p=read('routes/proyectos.tsx'),a=read('routes/ares.tsx'),home=read('routes/index.tsx'),skin=read('routes/piel.tsx'),gym=read('routes/gym.tsx');
 assert.match(p,/loadWorkRecords/);
 assert.match(p,/createWorkTask/);
 assert.match(p,/updateWorkTaskStatus/);
 assert.doesNotMatch(p,/useLocalStorage|DemoDataBadge|\bSEED\b/);
 assert.match(a,/loadAresRecords/);
 assert.match(a,/answerAresFromRecords/);
 assert.doesNotMatch(a,/useAresChat|ARES_SUGGESTIONS|RESPUESTA SIMULADA|setProps/);
 assert.match(home,/loadAresRecords/);
 assert.match(home,/loadWorkRecords/);
 assert.match(gym,/loadGymRecords/);
 assert.doesNotMatch(gym,/DemoDataBadge|\bEXERCISES\s*=|\bPROGRAM\s*=/);
 assert.match(skin,/loadSkinState/);
 assert.match(skin,/setSkinSteps/);
 assert.match(skin,/setSkinNote/);
 assert.doesNotMatch(skin,/DemoDataBadge|useLocalStorage|\bROUTINES\s*=|\bINVENTORY\s*=/);
 assert.doesNotMatch(home,/DemoDataBadge|\bKPIS\b|AresDemoPanel|TaskTimeline|\bWEEK\b/);
 assert.match(read('routes/__root.tsx'),/<AuthGate>/);
 assert.match(read('components/rise/AppShell.tsx'),/auth\.signOut\(\)/);
});
