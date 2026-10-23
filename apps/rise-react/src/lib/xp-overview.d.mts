import type {SupabaseClient} from '@supabase/supabase-js';
export type XPEvent={id:string;sourceId:string;date:string;kind:string;points:number};
export type XPProgress={level:number;next:number;toNext:number;rank:string;percent:number};
export type XPOverview={events:XPEvent[];points:number;duplicates:number;sourceCount:number;progress:XPProgress};
export declare function verifiedLevelFor(points:number):XPProgress;
export declare function summarizeVerifiedXP(rows?:Record<string,unknown>[]):XPOverview;
export declare function loadVerifiedXP(client:SupabaseClient,uid:string):Promise<XPOverview>;
