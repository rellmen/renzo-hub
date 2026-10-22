export interface AresAvailability{enabled:boolean;reason?:string;provider?:string;model?:string;sharing?:string}
export interface AresModelAnswer{text:string;source:string}
export declare function aresPreviewStatus(options?:{fetcher?:typeof fetch}):Promise<AresAvailability>;
export declare function isPrivateAresPrompt(question:string):boolean;
export declare function askAresPreview(question:string,accessToken:string,options?:{fetcher?:typeof fetch;timeoutMs?:number}):Promise<AresModelAnswer>;
