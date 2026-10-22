import type {SupabaseClient} from '@supabase/supabase-js';
import type {AresRecord} from './ares-records.mjs';
export function reviewAresRequest(client:SupabaseClient,uid:string,row:AresRecord,decision:'approved'|'rejected',options?:{now?:()=>Date}):Promise<AresRecord>;
