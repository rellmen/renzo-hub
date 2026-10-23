export interface GymGoals {priority:string;sessionsPerWeek:number;targetWeight:number|null}
export declare const GYM_GOALS_DEFAULT:GymGoals;
export declare function validateGymGoals(raw:any):GymGoals;
export declare function getGymGoals(owner:string|null,userMetadata:any):GymGoals;
