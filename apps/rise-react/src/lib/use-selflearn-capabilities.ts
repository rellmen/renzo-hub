import {useQuery} from '@tanstack/react-query';
import type {SupabaseClient} from '@supabase/supabase-js';
// A flag never proves that a production migration exists. Probe under the user's JWT.
export function useSelfLearnCapabilities(client:SupabaseClient|null,uid:string){
 return useQuery({queryKey:['selflearn-capabilities',uid],enabled:!!client&&!!uid,
  staleTime:0,refetchOnWindowFocus:true,retry:false,
  queryFn:async()=>{try{const {data,error}=await client!.rpc('selflearn_capabilities');
   return !error&&data?.version===1&&data?.ready===true;}catch{return false;}}
 }).data===true;
}
