import type {SupabaseClient} from '@supabase/supabase-js';
export interface SavedBodyFoodRecord{id:string;title:string|null;payload:Record<string,unknown>;occurred_at:string;updated_at:string}
export declare function saveBodyWeight(client:SupabaseClient,uid:string,raw:string|number,options?:{at?:Date}):Promise<SavedBodyFoodRecord>;
export declare function saveFoodMeal(client:SupabaseClient,uid:string,input:{meal:string;kcal:string|number|null;protein:string|number|null},options?:{at?:Date}):Promise<SavedBodyFoodRecord>;
