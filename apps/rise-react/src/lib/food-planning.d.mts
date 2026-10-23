export declare const SHOPPING_BASE:readonly (readonly [string,string])[];
export declare function shopKey(uid:string,month:string):string;
export declare function readShop(uid:string,month:string,storage?:Storage):string[];
export declare function toggleShop(uid:string,month:string,item:string,on:boolean,storage?:Storage):string[];
export declare function updateMeal(client:any,uid:string,row:any,input:{meal:string;kcal:string;protein:string}):Promise<any>;
export declare function deleteMeal(client:any,uid:string,row:any):Promise<true>;
export declare function loadTodayMeals(client:any,uid:string,day:string):Promise<{id:string;payload:any;updated_at:string}[]>;
