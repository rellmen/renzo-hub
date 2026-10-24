export declare const SUPABASE_STAGING_URL:string;
export declare const SUPABASE_PRODUCTION_URL:string;
export declare const LEGACY_FALLBACK_URL:string;
export declare function backendEnvironmentForHost(hostname:string):'staging'|'production'|null;
export declare function verifyNocturneBackendIsolation<T extends {supabaseUrl:string}>(
 config:T,options?:{hostname?:string;releaseTarget?:string}
):T;
export declare function officialSelfLearnAwardsEnabled(
 flag:boolean,options?:{hostname?:string;releaseTarget?:string;backendReady?:boolean}
):boolean;
export declare const PRODUCTION_PUBLIC_ORIGIN:string;
export declare function productionRedirectUrl(options?:{hostname?:string;releaseTarget?:string;pathname?:string;search?:string;hash?:string}):string|null;
