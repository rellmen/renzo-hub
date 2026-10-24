export type Inline={t:"text"|"code"|"math";v:string}|{t:"strong"|"em";v:Inline[]}|{t:"link";v:string;href:string};
export type Block=
  |{type:"heading";level:number;text:string}
  |{type:"paragraph";text:string}
  |{type:"list";ordered:boolean;start?:number;items:string[]}
  |{type:"table";head:string[]|null;rows:string[][]}
  |{type:"quote";children:Block[]}
  |{type:"math";tex:string}
  |{type:"hr"}
  |{type:"evaluation"}
  |{type:"callout";kind:"ejemplo"|"error"|"pista"|"solucion"|"nota";title:string;children:Block[]};
export function parseBlocks(md:string):Block[];
export function parseInline(text:string):Inline[];
