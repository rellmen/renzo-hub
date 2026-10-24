import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { APPS, appForPath, searchApps } from '@/lib/apps';
import { NAV } from '@/lib/nav';
import { HUBS, HUB_OF_APP, hubOfApp } from '@/lib/hubs';
import { DEFAULT_PREFS, NavPrefsProvider, pushRecent, sanitizePrefs, useNavPrefs } from '@/lib/nav-prefs';

afterEach(() => { cleanup(); localStorage.clear(); });
describe('production app registry', () => {
 it('covers every implemented route with unique ids', () => {
  expect(new Set(APPS.map(a => a.id)).size).toBe(APPS.length);
  for (const route of NAV) expect(APPS.some(a => a.kind === 'live' && a.to === route.to)).toBe(true);
  expect(appForPath('/quest')?.id).toBe('quests');
  expect(appForPath('/unknown')).toBeUndefined();
 });
 it('opens Gastos, Car, AI Inbox and Money natively; any remaining classic link uses the backup domain', () => {
  for(const [id,path] of [['gastos','/gastos'],['car','/car'],['ai-inbox','/inbox'],['dinero','/dinero']] as const){
   const a=APPS.find(x=>x.id===id);
   expect(a?.kind).toBe('live');
   if(a?.kind==='live')expect(a.to).toBe(path);
  }
  expect(new Set(APPS.map(a=>a.id)).size).toBe(APPS.length);
  expect(searchApps('my finance').map(a=>a.id)).toContain('dinero');
  const classic=APPS.filter(a=>a.kind==='classic');
  for(const a of classic) if(a.kind==='classic') {
   expect(new URL(a.href).hostname).toBe('rise-hub-classic-renzojesus99-1996.vercel.app');
   expect(new URL(a.href).searchParams.has('app')).toBe(true);
  }
 });
 it('finds bilingual and accent-insensitive aliases and filters categories',()=>{
  expect(searchApps('NOMINA').some(a=>a.id==='nominas')).toBe(true);
  expect(searchApps('dutch').map(a=>a.id)).toContain('aprender');
  expect(searchApps('', 'body').every(a=>a.category==='body')).toBe(true);
  expect(searchApps('uoc').map(a=>a.id)).toContain('academia');
  expect(searchApps('power bi').map(a=>a.id)).toContain('career');
  expect(searchApps('does-not-exist')).toEqual([]);
 });
});
describe('7 hubs (opción B, 24-10-2026)',()=>{
 it('every app belongs to exactly one hub and every hub section is a real app',()=>{
  expect(HUBS.map(h=>h.id)).toEqual(['inicio','academy','body','money','trabajo','ares','ajustes']);
  const sections=HUBS.flatMap(h=>h.sections.map(s=>s.appId));
  expect(new Set(sections).size).toBe(sections.length);
  for(const a of APPS){expect(HUB_OF_APP[a.id]).toBe(a.category);}
  for(const id of sections) expect(APPS.some(a=>a.id===id)).toBe(true);
  expect(sections.length).toBe(APPS.length);
 });
 it('groups the sections Renzo asked for',()=>{
  const ids=(h:string)=>HUBS.find(x=>x.id===h)!.sections.map(s=>s.appId);
  expect(ids('academy')).toEqual(['academy','academia','aprender','career','news']);
  expect(ids('money')).toEqual(['dinero','gastos','nominas','car']);
  // Car pertenece a Money pero sin pestaña: vive dentro de Gastos (24-10-2026).
  expect(HUBS.find(x=>x.id==='money')!.sections.filter(s=>s.tab!==false).map(s=>s.label)).toEqual(['Resumen','Gastos','Nóminas']);
  expect(ids('body')).toEqual(['gym','food','piel','body']);
  expect(hubOfApp(appForPath('/nominas')?.id)?.id).toBe('money');
  expect(hubOfApp(appForPath('/aprender')?.id)?.id).toBe('academy');
  expect(appForPath('/academy')?.id).toBe('academy');
 });
});
describe('local navigation preferences',()=>{
 it('rejects unknown, prototype and malformed stored ids',()=>{
  expect(sanitizePrefs({favorites:['gym','gym','__proto__','missing'],shortcut:'ares',recents:['missing','gym']})).toEqual({favorites:['gym'],shortcut:'gym',recents:['gym']});
  expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
 });
 it('deduplicates and bounds recents',()=>{
  expect(pushRecent(['gym','ares'],'ares')).toEqual(['ares','gym']);
  expect(pushRecent(['a','b','c','d','e','f'],'g')).toHaveLength(6);
 });
 function Controls(){const {prefs,toggleFavorite,setShortcut,addRecent}=useNavPrefs();return <><output data-testid="prefs">{JSON.stringify(prefs)}</output><button onClick={()=>{toggleFavorite('notas');setShortcut('notas');addRecent('notas');}}>Update</button></>;}
 it('restores saved preferences before persisting and isolates accounts',async()=>{
  const key='risehub.nocturne.nav.account-a';
  const saved={favorites:['piel'],shortcut:'piel',recents:['gym']};localStorage.setItem(key,JSON.stringify(saved));
  const view=render(<NavPrefsProvider key="a" userKey="account-a"><Controls/></NavPrefsProvider>);
  await waitFor(()=>expect(JSON.parse(screen.getByTestId('prefs').textContent!)).toEqual(saved));
  expect(JSON.parse(localStorage.getItem(key)!)).toEqual(saved);
  fireEvent.click(screen.getByText('Update'));
  await waitFor(()=>expect(JSON.parse(localStorage.getItem(key)!).shortcut).toBe('notas'));
  view.rerender(<NavPrefsProvider key="b" userKey="account-b"><Controls/></NavPrefsProvider>);
  await waitFor(()=>expect(JSON.parse(screen.getByTestId('prefs').textContent!)).toEqual(DEFAULT_PREFS));
  expect(JSON.parse(localStorage.getItem(key)!).shortcut).toBe('notas');
 });
 it('recovers from corrupt storage',async()=>{
  localStorage.setItem('risehub.nocturne.nav.corrupt','{');
  render(<NavPrefsProvider userKey="corrupt"><Controls/></NavPrefsProvider>);
  await waitFor(()=>expect(JSON.parse(localStorage.getItem('risehub.nocturne.nav.corrupt')!)).toEqual(DEFAULT_PREFS));
 });
});
