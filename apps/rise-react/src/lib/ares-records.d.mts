export interface AresRecord { id:string;record_type:string;title?:string;status?:string;occurred_at?:string;source?:string;payload?:Record<string,unknown>;requires_review?:boolean }
export interface AresSummary {projects:AresRecord[];tasks:AresRecord[];approvals:AresRecord[];agents:AresRecord[];records:number;partial:boolean}
export declare function summarizeAresRecords(rows?:AresRecord[]):AresSummary;
export declare function loadAresRecords(client:import('@supabase/supabase-js').SupabaseClient,uid:string):Promise<AresSummary>;
export declare function answerAresFromRecords(question:string,summary:AresSummary):string;
