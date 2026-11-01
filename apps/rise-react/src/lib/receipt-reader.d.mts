export declare function compressPhoto(file:File,max?:number,quality?:number):Promise<Blob>;
export declare function readOnDevice(blob:Blob,onProgress?:(pct:number)=>void):Promise<string>;
export declare function blobToDataUrl(blob:Blob):Promise<string>;
export declare function receiptAiStatus(fetcher?:typeof fetch):Promise<boolean>;
export declare function askReceiptItems(token:string,dataUrl:string,opts?:{allowCollection?:boolean;fetcher?:typeof fetch}):Promise<{items:Array<{name:string;qty:number;price:number}>;total:number|null;model:string;privacy:"deny"|"allow"}>;
