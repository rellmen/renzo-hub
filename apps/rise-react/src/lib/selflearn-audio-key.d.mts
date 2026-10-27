export type AudioLang = "nl" | "en";
export declare const AUDIO_LANGS: AudioLang[];
export declare const AUDIO_BASE: string;
export declare function audioText(text: unknown): string;
export declare function audioKey(lang: AudioLang, text: unknown): string;
export declare function audioUrl(lang: AudioLang, text: unknown): string;
