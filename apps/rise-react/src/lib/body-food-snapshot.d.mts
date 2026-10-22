export interface RecordedWeight{date:string;value:number}
export interface BodySummary {
  today:string;
  weight:{current:RecordedWeight|null;change:number|null;points:RecordedWeight[];goal:null|{target:number;left:number;pct:number};count:number};
  gym:{week:number;perWeek:number|null;last:null|{date:string;title:string}};
  food:null|{meals:number;kcal:number;protein:number};
  skin:{am:number;pm:number};
}
export interface FoodMeal{id:string;title:string;kcal:number|null;protein:number|null}
export interface NutritionProgress{pct:number|null;state:'none'|'under'|'in'|'over';left:number|null;target:string|null;minPct?:number}
export interface BodyFoodSnapshot {
  today:string;body:BodySummary;meals:FoodMeal[];
  profile:Record<string,unknown>;nutrition:{meals:number;kcal:number;protein:number};
  kcalProgress:NutritionProgress;proteinProgress:NutritionProgress
}
export declare function loadBodyFoodSnapshot(client:import('@supabase/supabase-js').SupabaseClient,
 user:import('@supabase/supabase-js').User,options?:{at?:Date}):Promise<BodyFoodSnapshot>;
