import {Link,useRouterState} from "@tanstack/react-router";
import {CalendarClock,FileSpreadsheet,Receipt,Wallet} from "lucide-react";
const sections=[
 {to:"/dinero" as const,label:"Resumen",icon:Wallet},
 {to:"/gastos" as const,label:"Movimientos",icon:Receipt},
 {to:"/nominas" as const,label:"Nóminas",icon:FileSpreadsheet},
 {to:"/turnos" as const,label:"Turnos",icon:CalendarClock}
];
/** Same app shell and routes, one clear financial navigation inside My Finance. */
export function FinanceSections(){
 const pathname=useRouterState({select:s=>s.location.pathname});
 return <nav aria-label="Secciones de My Finance" className="overflow-x-auto rounded-2xl border border-hairline bg-raised p-2">
  <ul className="flex min-w-max items-center gap-2">
   {sections.map(({to,label,icon:Icon})=>{
    const selected=pathname===to||pathname.startsWith(to+"/");
    return <li key={to}><Link to={to} aria-current={selected?"page":undefined}
     className={"inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors "+
       (selected?"border border-money/35 bg-money/15 text-foreground":"text-platinum/75 hover:bg-foreground/[0.05] hover:text-foreground")}>
     <Icon className="h-4 w-4"/>{label}
    </Link></li>;
   })}
  </ul>
 </nav>;
}
