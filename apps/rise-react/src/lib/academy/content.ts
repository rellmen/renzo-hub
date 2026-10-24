// Contenido público generado por tools/academy/build.mjs (sin claves de corrección).
import catalogJson from "@/content/academia/catalog.json";
import bankJson from "@/content/academia/bank.json";
import profilesJson from "@/content/academia/exam-profiles.json";
import type {Catalog,ExamProfile} from "./engine.mjs";

export type PublicQuestion={id:string;lesson_id:string;course:string;kind:"multiple_choice"|"numeric"|"short_text"|"essay";difficulty:number;
  skill_ids:string[];prompt_md:string;role:"exit"|"bank";choices?:{id:string;text:string}[];hint_md?:string;unit?:string;
  words?:number[]|null;rubric?:Record<string,unknown>|string[]|null;model_md?:string|null};
export type LessonDoc={id:string;course:string;module:string;level:string;title:string;status:string;pilot:boolean;objectives:string[];
  prerequisites:string[];skill_ids:string[];estimated_minutes:number;content_version:number;source_kind:string;source_urls:string[];
  body:string;exit:PublicQuestion[];quality:{theory_words:number;examples:number;practice_items:number;exit_questions:number;meets_standard:boolean;gaps:string[]}};

export const CATALOG=catalogJson as unknown as Catalog;
export const BANK=(bankJson as unknown as {questions:PublicQuestion[]}).questions;
export const PROFILES=(profilesJson as unknown as {profiles:ExamProfile[];global_notice:string;year:number});

const loaders=import.meta.glob<LessonDoc>("../../content/academia/lessons/*.json",{import:"default"});
export async function loadLesson(id:string):Promise<LessonDoc|null>{
  if(!/^[a-z0-9-]{3,64}$/.test(id))return null;
  const load=loaders[`../../content/academia/lessons/${id}.json`];
  return load?await load():null;
}
export function courseTitle(slug:string){return CATALOG.courses.find(c=>c.slug===slug)?.title||slug;}
export function lessonMeta(id:string){
  for(const c of CATALOG.courses)for(const m of c.modules)for(const l of m.lessons)if(l.id===id)return {...l,course:c.slug,course_title:c.title,module:m.id,module_title:m.title};
  return null;
}
