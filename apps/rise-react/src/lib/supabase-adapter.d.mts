import type {SupabaseClient} from '@supabase/supabase-js';
export type PublicSupabaseConfig={readonly supabaseUrl:string;readonly publishableKey:string};
export declare function fetchSupabaseConfig(options?:{fetcher?:typeof fetch;timeoutMs?:number}):Promise<PublicSupabaseConfig>;
export declare function getReactSupabaseClient(options?:{createClient?:typeof import('@supabase/supabase-js').createClient}):Promise<SupabaseClient>;
