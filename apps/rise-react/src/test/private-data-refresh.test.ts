import {describe,expect,it} from 'vitest';
import {QueryClient,QueryObserver} from '@tanstack/react-query';
import {refreshVisiblePrivateData} from '../lib/private-data-refresh';

const uid='22222222-2222-4222-8222-222222222222';
function createDevice(read:()=>Promise<{step:number}>){
 const queryClient=new QueryClient({defaultOptions:{queries:{retry:false}}});
 const observer=new QueryObserver(queryClient,{
   queryKey:['selflearn-snapshot',uid],queryFn:read,staleTime:60000,
 });
 const unsubscribe=observer.subscribe(()=>{});
 return {queryClient,observer,unsubscribe};
}
describe('manual private data refresh (isolated two-device simulation)',()=>{
 it('fetches changes made elsewhere into this device without sharing local caches',async()=>{
   const server={step:0};
   const read=async()=>({step:server.step});
   const a=createDevice(read),b=createDevice(read);
   try{
     await Promise.all([a.observer.refetch(),b.observer.refetch()]);
     expect(a.observer.getCurrentResult().data?.step).toBe(0);
     expect(b.observer.getCurrentResult().data?.step).toBe(0);
     // A makes a confirmed remote write; B remains stale until it refreshes.
     server.step=1;
     expect(b.observer.getCurrentResult().data?.step).toBe(0);
     expect(await refreshVisiblePrivateData(b.queryClient,uid)).toBe(1);
     expect(b.observer.getCurrentResult().data?.step).toBe(1);
     // B did not mutate A's local cache.
     expect(a.observer.getCurrentResult().data?.step).toBe(0);
     await refreshVisiblePrivateData(a.queryClient,uid);
     expect(a.observer.getCurrentResult().data?.step).toBe(1);
   }finally{a.unsubscribe();b.unsubscribe();a.queryClient.clear();b.queryClient.clear();}
 });
 it('invalidates inactive modules for the next visit without starting remote writes',async()=>{
   const queryClient=new QueryClient();
   try{
     queryClient.setQueryData(['skin-real',uid,'2026-10-22'],{steps:[1]});
     const n=await refreshVisiblePrivateData(queryClient,uid);
     expect(n).toBe(0);
     const q=queryClient.getQueryCache().find({queryKey:['skin-real',uid,'2026-10-22']});
     expect(q?.state.isInvalidated).toBe(true);
     expect(q?.state.data).toEqual({steps:[1]});
   }finally{queryClient.clear();}
 });
 it('never refreshes private records without an active user',async()=>{
   const queryClient=new QueryClient();
   await expect(refreshVisiblePrivateData(queryClient,null)).rejects.toThrow(/Inicia sesión/);
 });
});
