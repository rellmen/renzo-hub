export interface HubNote {id:string;title:string|null;payload:{body?:string;[key:string]:unknown};occurred_at?:string;created_at?:string;updated_at?:string;status?:string}
export interface RecordStore<T extends HubNote=HubNote> {
  readonly domain:string;readonly type:string;
  list(options?:{limit?:number;status?:string}):Promise<T[]>;
  add(fields:{title:string;payload:{body:string}}):Promise<T>;
  update(id:string,fields:{title:string;payload:{body:string;[key:string]:unknown}}):Promise<T>;
  remove(id:string):Promise<void>;
}
export declare const RECORD_DOMAINS:readonly string[];
export declare function createRecords(db:import('@supabase/supabase-js').SupabaseClient,
  getUser:()=>{id:string}|null|undefined,ctx:{domain:string;type:string}):RecordStore;
