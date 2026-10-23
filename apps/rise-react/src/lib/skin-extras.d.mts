export interface SkinWarning {level:'conflict'|'caution'|'info';text:string;products:number[]}
export declare function skinCompatibility(inventory?:Record<string,string>,barrierFirst?:boolean):SkinWarning[];
export declare function loadSkinHistory(client:any,uid:string,o?:{days?:number;at?:Date}):Promise<{day:string;am:number;pm:number;note:string}[]>;
export declare function listSkinPhotos(client:any,uid:string):Promise<{path:string;created:string}[]>;
export declare function uploadSkinPhoto(client:any,uid:string,file:File,id?:string):Promise<string>;
export declare function skinPhotoUrls(client:any,uid:string,paths:string[],expiresIn?:number):Promise<Record<string,string>>;
export declare function deleteSkinPhoto(client:any,uid:string,path:string):Promise<void>;
