import {describe,it,expect} from 'vitest';
import {renderHook,waitFor} from '@testing-library/react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import type {SupabaseClient} from '@supabase/supabase-js';
import {useSelfLearnCapabilities} from '../lib/use-selflearn-capabilities';
describe('SelfLearn backend capabilities',()=>{
 for(const [label,response,ready] of [
  ['missing migration',{data:null,error:{message:'not found'}},false],
  ['incompatible contract',{data:{version:2,ready:true},error:null},false],
  ['disabled trigger',{data:{version:1,ready:false},error:null},false],
  ['compatible contract',{data:{version:1,ready:true},error:null},true],
 ] as const)it(label,async()=>{
  let called=false;
  const client={rpc:async()=>{called=true;return response;}} as unknown as SupabaseClient;
  const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});
  const {result,unmount}=renderHook(()=>useSelfLearnCapabilities(client,'synthetic-owner'),{
   wrapper:({children})=><QueryClientProvider client={qc}>{children}</QueryClientProvider>
  });
  await waitFor(()=>expect(called).toBe(true));
  await waitFor(()=>expect(qc.getQueryState(['selflearn-capabilities','synthetic-owner'])?.status).toBe('success'));
  expect(result.current).toBe(ready);unmount();qc.clear();
 });
});
