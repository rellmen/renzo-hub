import type {SupabaseClient} from '@supabase/supabase-js';
import type {Capture} from './inbox-records.mjs';
export interface CarSnapshot {expenses:{id:string;title:string;date:string;amount:number;note:string;source:string}[];movements:{id:string;merchant:string;date:string;amount:number;category:string}[];pending:Capture[]}
export function loadCar(client:SupabaseClient,uid:string):Promise<CarSnapshot>;
