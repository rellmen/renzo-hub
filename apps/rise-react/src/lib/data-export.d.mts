import type {SupabaseClient} from '@supabase/supabase-js';
export const EXPORT_TABLES: Readonly<Record<string,string>>;
export const EXPORT_BUCKETS: readonly string[];
export const MAX_FILE_BYTES: number;
export type DataExport={format:string;version:number;taken_at:string;project:string;release:string;user_id:string;tables:Record<string,Record<string,unknown>[]>;files:Record<string,unknown>[];counts:Record<string,number>;errors:string[]};
export function buildExport(db:SupabaseClient,uid:string,options?:{release?:string;project?:string;onProgress?:(message:string)=>void;now?:()=>Date}):Promise<DataExport>;
