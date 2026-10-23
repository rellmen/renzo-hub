import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { APPS, appForPath, searchApps } from '@/lib/apps';
import { NAV } from '@/lib/nav';
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
  expect(searchApps('', 'bienestar').every(a=>a.category==='bienestar')).toBe(true);
  expect(searchApps('does-not-exist')).toEqual([]);
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
