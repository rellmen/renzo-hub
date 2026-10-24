// Parser Markdown mínimo y seguro para las lecciones de Academia (contenido del repositorio).
// Produce un árbol de bloques; el renderizado React no usa HTML arbitrario: solo KaTeX para fórmulas.
// Soporta: #/##/### títulos, párrafos, listas -, 1., > cita, tablas |, $$ bloque $$, ---, bloques :::tipo título … ::: y ::evaluacion.

const CALLOUTS=new Set(["ejemplo","error","pista","solucion","nota"]);

export function parseBlocks(md){
  const lines=String(md||"").replace(/\r\n?/g,"\n").split("\n");
  const {blocks}=parseLines(lines,0,false);
  return blocks;
}

function parseLines(lines,start,nested){
  const blocks=[];let i=start;
  while(i<lines.length){
    const line=lines[i];
    if(nested&&/^:::\s*$/.test(line))return {blocks,next:i+1};
    if(!line.trim()){i++;continue;}
    const fence=/^:::([a-z]+)\s*(.*)$/.exec(line);
    if(fence){
      const kind=CALLOUTS.has(fence[1])?fence[1]:"nota";
      const inner=parseLines(lines,i+1,true);
      blocks.push({type:"callout",kind,title:fence[2].trim(),children:inner.blocks});
      i=inner.next;continue;
    }
    if(/^::evaluacion\s*$/.test(line)){blocks.push({type:"evaluation"});i++;continue;}
    const h=/^(#{1,4})\s+(.*)$/.exec(line);
    if(h){blocks.push({type:"heading",level:h[1].length,text:h[2].trim()});i++;continue;}
    if(/^---+\s*$/.test(line)){blocks.push({type:"hr"});i++;continue;}
    if(/^\$\$/.test(line.trim())){
      let tex=line.trim().slice(2);
      if(tex.endsWith("$$")&&tex.length>=2){blocks.push({type:"math",tex:tex.slice(0,-2).trim()});i++;continue;}
      const acc=[tex];i++;
      while(i<lines.length&&!lines[i].trim().endsWith("$$")){acc.push(lines[i]);i++;}
      if(i<lines.length){acc.push(lines[i].trim().slice(0,-2));i++;}
      blocks.push({type:"math",tex:acc.join("\n").trim()});continue;
    }
    if(/^\s*\|/.test(line)){
      const rows=[];
      while(i<lines.length&&/^\s*\|/.test(lines[i])){rows.push(lines[i]);i++;}
      const cells=r=>r.trim().replace(/^\|/,"").replace(/\|$/,"").split(/(?<!\\)\|/).map(c=>c.trim().replace(/\\\|/g,"|"));
      const sepIdx=rows.findIndex(r=>/^\s*\|?\s*:?-{2,}/.test(r));
      const head=sepIdx===1?cells(rows[0]):null;
      const body=rows.filter((_,k)=>k!==sepIdx&&!(head&&k===0)).map(cells);
      blocks.push({type:"table",head,rows:body});continue;
    }
    if(/^>\s?/.test(line)){
      const acc=[];
      while(i<lines.length&&/^>\s?/.test(lines[i])){acc.push(lines[i].replace(/^>\s?/,""));i++;}
      blocks.push({type:"quote",children:parseLines(acc,0,false).blocks});continue;
    }
    const li=/^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if(li){
      const ordered=/\d/.test(li[2]);const items=[];
      while(i<lines.length){
        const m=/^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if(m&&/\d/.test(m[2])===ordered){items.push(m[3]);i++;continue;}
        if(lines[i].trim()&&/^\s{2,}\S/.test(lines[i])&&items.length){items[items.length-1]+=" "+lines[i].trim();i++;continue;}
        break;
      }
      const startNum=ordered?Number(/^\s*(\d+)/.exec(line)[1]):undefined;
      blocks.push({type:"list",ordered,start:startNum,items});continue;
    }
    const acc=[];
    while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|:::|::evaluacion|\s*\||>|---+\s*$|\$\$)/.test(lines[i])&&!/^(\s*)([-*]|\d+\.)\s+/.test(lines[i])){acc.push(lines[i].trim());i++;}
    if(acc.length)blocks.push({type:"paragraph",text:acc.join(" ")});
    else i++;
  }
  return {blocks,next:i};
}

/** Tokens en línea: texto, **negrita**, *cursiva*, `código`, $fórmula$, [enlace](https://…). */
export function parseInline(text){
  const out=[];const s=String(text||"");let i=0;let buf="";
  const flush=()=>{if(buf){out.push({t:"text",v:buf});buf="";}};
  while(i<s.length){
    const c=s[i];
    if(c==="\\"&&i+1<s.length&&"*$`_[]\\".includes(s[i+1])){buf+=s[i+1];i+=2;continue;}
    if(c==="$"){
      const j=s.indexOf("$",i+1);
      if(j>i+1){flush();out.push({t:"math",v:s.slice(i+1,j)});i=j+1;continue;}
    }
    if(c==="`"){
      const j=s.indexOf("`",i+1);
      if(j>i){flush();out.push({t:"code",v:s.slice(i+1,j)});i=j+1;continue;}
    }
    if(s.startsWith("**",i)){
      const j=s.indexOf("**",i+2);
      if(j>i+2){flush();out.push({t:"strong",v:parseInline(s.slice(i+2,j))});i=j+2;continue;}
    }
    if(c==="*"&&s[i+1]!==" "){
      const j=s.indexOf("*",i+1);
      if(j>i+1&&s[j-1]!==" "){flush();out.push({t:"em",v:parseInline(s.slice(i+1,j))});i=j+1;continue;}
    }
    if(c==="["){
      const m=/^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/.exec(s.slice(i));
      if(m){flush();out.push({t:"link",v:m[1],href:m[2]});i+=m[0].length;continue;}
    }
    buf+=c;i++;
  }
  flush();
  return out;
}
