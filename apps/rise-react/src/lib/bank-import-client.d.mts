import type {SupabaseClient} from "@supabase/supabase-js";
export declare const MAX_BANK_FILE_BYTES:number;
export type BankImportPreview={
 ownerId:string;fileName:string;bank:string;from:string;to:string;
 records:Array<{id:string;owner_id:string;domain:string;record_type:string;source:string;payload:Record<string,unknown>}>;
 total:number;alreadyImported:number;newCount:number;income:number;expenses:number;
 accounts:string[];skippedLines:Array<number|string>;balanceBreaks:string[];salaryMentions:number;
};
export declare function previewBankStatement(client:SupabaseClient,uid:string,file:File):Promise<BankImportPreview>;
export declare function saveBankStatement(client:SupabaseClient,uid:string,preview:BankImportPreview):Promise<{ok:boolean;recordsAttempted:number;duplicatesPrechecked:number}>;
