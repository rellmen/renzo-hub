export type AcademyToday={
  languages:{nlDue:number;enDue:number;nlDone:number;enDone:number}|null;
  exam:{due:number;next:{course:string;lesson:{id:string;title:string;estimated_minutes?:number};inProgress:boolean}[]}|null;
  totalDue:number|null;partial:boolean;
};
export declare function academyToday(src?:{
  learning?:{reviewDue:{nl:number;en:number};completed:{nl:string[];en:string[]}}|null;
  uoc?:{due:unknown[];next:{course:string;lesson:{id:string;title:string;estimated_minutes?:number};inProgress:boolean}[]}|null;
}):AcademyToday;
