import {afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import type {SupabaseClient} from '@supabase/supabase-js';
// Component interaction tests exercise retry semantics; the production/staging
// hostname gate is separately validated in tests/nocturne-release-isolation.test.mjs.
vi.mock('../lib/use-selflearn-capabilities',()=>({useSelfLearnCapabilities:()=>true}));
vi.mock('../lib/nocturne-environment.mjs',()=>({
 officialSelfLearnAwardsEnabled:(enabled:boolean)=>enabled
}));
import {SelfLearnVocabularyReview} from '../components/rise/SelfLearnVocabularyReview';
const uid='22222222-2222-4222-8222-222222222222';
const card={id:'33333333-3333-4333-8333-333333333333',course:'nl',front:'de winkel',back:'la tienda',area:'Dutch',updatedAt:'2026-10-22T00:00:00Z',nextReview:'2020-01-01',repetitions:0};
function mount(rpc:ReturnType<typeof vi.fn>,legacyActive=false){
 const client={rpc} as unknown as SupabaseClient;
 return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}>
  <SelfLearnVocabularyReview client={client} uid={uid} course="nl" cards={[card]} legacyActive={legacyActive}/>
 </QueryClientProvider>);
}
afterEach(()=>{cleanup();vi.unstubAllEnvs()});
describe('SelfLearn vocabulary review',()=>{
 it('hides review writes in default builds',()=>{
  vi.stubEnv('VITE_ENABLE_SELFLEARN_AWARDS','');const rpc=vi.fn();mount(rpc);
  expect(screen.queryByRole('button')).toBeNull();expect(rpc).not.toHaveBeenCalled();
 });
 it('keeps grade and retry ID after losing the first response',async()=>{
  vi.stubEnv('VITE_ENABLE_SELFLEARN_AWARDS','true');
  const rpc=vi.fn().mockResolvedValueOnce({error:{message:'Respuesta perdida'}}).mockImplementation(async(_name,args)=>({data:{id:card.id,reviewId:args.p_review,repetitions:1},error:null}));
  mount(rpc);fireEvent.click(screen.getByRole('button',{name:'Mostrar respuesta'}));
  expect(screen.getByText('la tienda')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Bien'}));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button',{name:'Bien'}));
  await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('confirmado'));
  expect(rpc).toHaveBeenCalledTimes(2);
  expect(rpc.mock.calls[0]?.[1]).toEqual(rpc.mock.calls[1]?.[1]);
 });
 it('blocks review during a classic session',()=>{
  vi.stubEnv('VITE_ENABLE_SELFLEARN_AWARDS','true');const rpc=vi.fn();mount(rpc,true);
  expect(screen.queryByRole('button')).toBeNull();expect(rpc).not.toHaveBeenCalled();
 });
});
