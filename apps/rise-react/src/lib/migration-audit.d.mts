import type {SupabaseClient} from "@supabase/supabase-js";
export declare const MIGRATION_TABLES:Readonly<Record<string,string>>;
export declare const MIGRATION_BUCKETS:readonly string[];
export type MigrationAudit={counts:Record<string,number>;errors:Array<{table:string;message:string}>;complete:boolean};
export declare function verifyMigrationOwner(client:SupabaseClient,uid:string):Promise<string>;
export declare function auditPrivateTables(client:SupabaseClient,uid:string,options?:{verifyOwner?:(client:SupabaseClient,uid:string)=>Promise<unknown>;onProgress?:(message:string)=>void}):Promise<MigrationAudit>;
export declare function buildMigrationBackup(client:SupabaseClient,uid:string,options?:{verifyOwner?:(client:SupabaseClient,uid:string)=>Promise<unknown>;onProgress?:(message:string)=>void;now?:()=>Date}):Promise<{
 format:"renzo-hub-export";version:number;taken_at:string;user_id:string;project:string;release:string;
 tables:Record<string,Record<string,unknown>[]>;files:Array<{bucket:string;path:string;size:number;content_type:string;base64:string}>;
 counts:Record<string,number>;errors:unknown[]
}>;
export declare function legacyLocalKeys(uid:string,storage:{getItem:(key:string)=>string|null}|null|undefined):Array<{
 key:string;present:boolean;valid?:boolean;modifiedAt?:string|null;counts?:Record<string,number>
}>;
export declare function comparisonAgainstExport(backup:unknown,audit:MigrationAudit,uid:string):{
 comparisons:Array<{table:string;backupCount:number|null;currentCount:number|null;match:boolean}>;equal:boolean;warning:string
};

export declare function compareMigrationRows(client:SupabaseClient,uid:string,backup:unknown,options?:{verifyOwner?:(client:SupabaseClient,uid:string)=>Promise<unknown>;onProgress?:(message:string)=>void}):Promise<{
 comparisons:Array<{table:string;backupCount:number|null;currentCount:number|null;missing:number;added:number;changed:number;match:boolean}>;
 equal:boolean;warning:string
}>;
