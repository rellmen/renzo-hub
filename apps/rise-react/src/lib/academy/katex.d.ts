declare module "katex" {
  type Options={displayMode?:boolean;throwOnError?:boolean;trust?:boolean;strict?:boolean|string;output?:"html"|"mathml"|"htmlAndMathml"};
  const katex:{renderToString(tex:string,options?:Options):string};
  export default katex;
}
