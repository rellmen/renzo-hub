import {Fragment,useMemo,type ReactNode} from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import {AlertTriangle,BookOpenCheck,KeyRound,Lightbulb} from "lucide-react";
import {parseBlocks,parseInline,type Block,type Inline} from "@/lib/academy/markdown.mjs";

// KaTeX escapa el TeX y no permite \href ni HTML (trust:false); el contenido procede solo del repositorio.
function Math({tex,display=false}:{tex:string;display?:boolean}){
  const html=useMemo(()=>{
    try{return katex.renderToString(tex,{displayMode:display,throwOnError:false,trust:false,strict:"ignore",output:"htmlAndMathml"});}
    catch{return null;}
  },[tex,display]);
  if(html===null)return <code>{tex}</code>;
  return display
    ?<div className="my-3 overflow-x-auto py-1" dangerouslySetInnerHTML={{__html:html}}/>
    :<span dangerouslySetInnerHTML={{__html:html}}/>;
}

export function InlineMd({text}:{text:string}){return <>{renderInline(parseInline(text))}</>;}
function renderInline(tokens:Inline[]):ReactNode{
  return tokens.map((t,i)=>{
    switch(t.t){
      case "text":return <Fragment key={i}>{t.v}</Fragment>;
      case "code":return <code key={i} className="rounded bg-foreground/10 px-1 py-0.5 text-[0.92em]">{t.v}</code>;
      case "math":return <Math key={i} tex={t.v}/>;
      case "strong":return <strong key={i} className="font-semibold text-foreground">{renderInline(t.v)}</strong>;
      case "em":return <em key={i}>{renderInline(t.v)}</em>;
      case "link":return <a key={i} href={t.href} target="_blank" rel="noopener noreferrer" className="text-learn underline underline-offset-2">{t.v}</a>;
    }
  });
}

const CALLOUT={
  ejemplo:{icon:BookOpenCheck,cls:"border-learn/35 bg-learn/[0.06]",label:"Ejemplo"},
  error:{icon:AlertTriangle,cls:"border-gym/40 bg-gym/[0.06]",label:"Error típico"},
  nota:{icon:Lightbulb,cls:"border-hairline bg-foreground/[0.03]",label:"Nota"},
} as const;

export function AcademyMarkdown({md,evaluation,onSection}:{md:string;evaluation?:ReactNode|undefined;onSection?:((id:string)=>void)|undefined}){
  const blocks=useMemo(()=>parseBlocks(md),[md]);
  return <div className="academy-prose space-y-3 text-[15px] leading-relaxed text-platinum/90">{blocks.map((b,i)=><BlockView key={i} b={b} evaluation={evaluation} onSection={onSection}/>)}</div>;
}

function BlockView({b,evaluation,onSection}:{b:Block;evaluation?:ReactNode|undefined;onSection?:((id:string)=>void)|undefined}):ReactNode{
  switch(b.type){
    case "heading":{
      const id="sec-"+(/^(\d+)\./.exec(b.text)?.[1]||b.text.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,40));
      if(b.level<=2)return <h2 id={id} className="scroll-mt-24 pt-4 font-display text-2xl leading-tight text-foreground" onClick={()=>onSection?.(id)}><InlineMd text={b.text}/></h2>;
      return <h3 className="pt-2 text-base font-semibold text-foreground"><InlineMd text={b.text}/></h3>;
    }
    case "paragraph":return <p><InlineMd text={b.text}/></p>;
    case "hr":return <hr className="border-hairline"/>;
    case "math":return <Math tex={b.tex} display/>;
    case "evaluation":return evaluation?<div>{evaluation}</div>:null;
    case "list":{
      const items=b.items.map((it,k)=><li key={k} className="pl-1"><InlineMd text={it}/></li>);
      return b.ordered?<ol start={b.start} className="list-decimal space-y-1.5 pl-6">{items}</ol>:<ul className="list-disc space-y-1.5 pl-6">{items}</ul>;
    }
    case "quote":return <blockquote className="space-y-3 rounded-xl border-l-2 border-learn/60 bg-foreground/[0.03] px-4 py-3 italic text-platinum/85">{b.children.map((c,k)=><BlockView key={k} b={c}/>)}</blockquote>;
    case "table":return <div className="overflow-x-auto rounded-xl border border-hairline">
      <table className="w-full text-left text-[13px] hyphens-auto sm:text-sm">
        {b.head&&<thead className="bg-foreground/[0.05]"><tr>{b.head.map((h,k)=><th key={k} scope="col" className="px-2 py-2 font-semibold text-foreground sm:px-3"><InlineMd text={h}/></th>)}</tr></thead>}
        <tbody>{b.rows.map((r,k)=><tr key={k} className="border-t border-hairline">{r.map((c,j)=><td key={j} className="px-2 py-2 align-top sm:px-3"><InlineMd text={c}/></td>)}</tr>)}</tbody>
      </table></div>;
    case "callout":{
      if(b.kind==="pista"||b.kind==="solucion"){
        const Icon=b.kind==="pista"?Lightbulb:KeyRound;
        return <details className="group rounded-2xl border border-hairline bg-obsidian/60 p-0">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-foreground">
            <Icon className="h-4 w-4 text-learn" aria-hidden/>{b.title||(b.kind==="pista"?"Ver pista":"Ver solución")}
            <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">Mostrar</span>
          </summary>
          <div className="space-y-3 border-t border-hairline px-4 py-3">{b.children.map((c,k)=><BlockView key={k} b={c}/>)}</div>
        </details>;
      }
      const meta=CALLOUT[b.kind];const Icon=meta.icon;
      return <div className={"rounded-2xl border p-4 "+meta.cls}>
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><Icon className="h-4 w-4" aria-hidden/>{b.title||meta.label}</p>
        <div className="space-y-3">{b.children.map((c,k)=><BlockView key={k} b={c}/>)}</div>
      </div>;
    }
  }
}
