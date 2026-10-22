import type {SupabaseClient} from "@supabase/supabase-js";
export declare const SHIFT_MODES:readonly string[];
export type ShiftState={owner_id:string;state:Record<string,unknown>&{shifts?:Record<string,string>;shiftTemplates?:Record<string,string>};updated_at:string|null};
export declare function cleanShiftMode(mode:string):string;
export declare function nextShiftState(state:ShiftState["state"],date:string,mode:string):ShiftState["state"];
export declare function nextTemplateState(state:ShiftState["state"],day:string|number,mode:string):ShiftState["state"];
export declare function shiftPreview(snapshot:ShiftState,date:string):string;
export declare function loadShiftState(client:SupabaseClient,uid:string):Promise<ShiftState>;
export declare function saveShiftState(client:SupabaseClient,uid:string,original:ShiftState,newState:ShiftState["state"]):Promise<ShiftState>;
