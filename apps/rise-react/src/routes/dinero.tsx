import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useEffect,useState} from "react";
import {ArrowDownLeft,ArrowUpRight,Landmark,PiggyBank,RefreshCw,ShieldCheck,Wallet} from "lucide-react";
import img from "@/assets/money.jpg";
import {pageHead} from "@/lib/seo";
import {PageHero} from "@/components/rise/PageHero";
import {SectionCard,EmptyState,Bar} from "@/components/rise/primitives";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadRealMoney,moneyMonthView,type MoneySummary} from "@/lib/money-records.mjs";

export const Route=createFileRoute("/dinero")({
  head:()=>pageHead("Money","Ingresos, gastos y patrimonio conocidos a partir de tus registros financieros privados."),
  component:Money,
});
const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const euro=(v:number|null|undefined)=>v==null?"Sin datos":eur.format(v);
function displayMonth(month:string){
  const [y,m]=month.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(y!,m!-1,15)));
}
function BankSummary({data}:{data:MoneySummary}){
  if(data.worth.total===null)return <div className="space-y-2">
    <p className="font-display text-4xl text-gold-gradient">Sin saldo confirmado</p>
    <p className="text-sm text-platinum/80">Importa un extracto que incluya saldo de cierre o registra tus valoraciones para ver patrimonio conocido.</p>
  </div>;
  return <div className="space-y-2">
    <p className="text-xs text-platinum/75">Patrimonio conocido · no equivale al saldo disponible</p>
    <p className="font-display text-5xl text-gold-gradient">{euro(data.worth.total)}</p>
    <p className="text-xs text-platinum/75">Valor registrado de cuentas e inversiones menos deudas declaradas; puede estar incompleto.</p>
  </div>;
}
function Money(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const [month,setMonth]=useState("");
  const key=["money-real",uid];
  const state=useQuery({queryKey:key,enabled:!!client&&!!uid,
    queryFn:()=>loadRealMoney(client!,uid),staleTime:60_000,refetchOnWindowFocus:true});
  useEffect(()=>{if(state.data&&!state.data.months.includes(month))setMonth(state.data.month||"");},[state.data,month]);
  const data=state.data;
  const view=data&&month?moneyMonthView(data,month):data?.monthSummary;
  const categories=(view?.categories||[]).slice(0,6);
  const largest=Math.max(1,...categories.map(c=>c.total));
  return <div className="space-y-6">
    <PageHero image={img} eyebrow="MY FINANCE · PRIVADO"
      title="Capital con intención."
      subtitle="Solo movimientos bancarios importados y valoraciones que has registrado. Sin cifras de demostración."
      color="var(--money)" priority>
      {data?<BankSummary data={data}/>:<p className="text-sm text-platinum/75">Consultando datos privados…</p>}
    </PageHero>

    {state.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">
      No se pudieron cargar los movimientos bancarios: {state.error instanceof Error?state.error.message:"Error desconocido"}. No mostraremos balances ficticios.
    </p>}
    {state.isLoading&&<p role="status" className="surface p-5">Cargando información financiera privada…</p>}

    {data&&<>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-money"/> Origen: extractos y registros privados de RISE HUB
        </p>
        <button type="button" className="btn-ghost" disabled={state.isFetching}
          onClick={()=>void state.refetch()}><RefreshCw className={"h-4 w-4 "+(state.isFetching?"animate-spin":"")}/> Actualizar datos</button>
      </div>
      {data.noRevolutStatement&&<p className="rounded-2xl border border-money/30 bg-money/[0.08] p-4 text-sm text-platinum/85">
        No consta un extracto Revolut en estos registros. Si has operado con esa cuenta, los gastos y balances podrían estar incompletos.
      </p>}
      {data.worth.stale>0&&<p className="rounded-2xl border border-money/25 p-4 text-sm text-platinum/75">
        Hay {data.worth.stale} saldo(s) o valoración(es) con más de 45 días de antigüedad. Verifica antes de tomar decisiones financieras.
      </p>}
      {!data.txCount&&<SectionCard eyebrow="Sin movimientos importados" title="Tu dinero, sin estimaciones">
        <EmptyState icon={<Wallet className="h-5 w-5"/>} title="No hay movimientos bancarios"
          text="Cuando importes movimientos desde las herramientas de RISE HUB, aquí aparecerá tu historial real. No se crearán transacciones de ejemplo."/>
      </SectionCard>}
      {data.txCount>0&&<>
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <SectionCard eyebrow={<span className="text-money">Flujo real</span>}
            title="Ingresos y gastos" accent="var(--money)"
            action={data.months.length>0?<label className="text-xs text-muted-foreground">
              <span className="sr-only">Mes</span>
              <select className="min-h-11 rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
                value={month||data.months[0]} onChange={e=>setMonth(e.target.value)}>
                {data.months.map(m=><option key={m} value={m}>{displayMonth(m)}</option>)}
              </select>
            </label>:null}>
            {view?<div className="space-y-5">
              <dl className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Ingresos</dt><dd className="mt-2 break-words text-lg font-semibold text-money">{euro(view.earned)}</dd></div>
                <div className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Gastos</dt><dd className="mt-2 break-words text-lg font-semibold text-gym">{euro(view.spent)}</dd></div>
                <div className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">Neto</dt><dd className="mt-2 break-words text-lg font-semibold">{euro(view.savings)}</dd></div>
              </dl>
              <p className="text-xs text-muted-foreground">{view.count} movimientos registrados · traspasos internos excluidos del flujo. {view.uncategorized?view.uncategorized+" sin categoría.":""}</p>
              {categories.length>0&&<ul className="space-y-4">{categories.map(c=>
                <li key={c.id} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2 text-sm"><span>{c.name}</span><span className="tabular-nums">{euro(c.total)}</span></div>
                  <Bar value={Math.max(0,Math.min(100,c.total/largest*100))} color="var(--money)"/>
                </li>)}</ul>}
              {!categories.length&&<p className="text-sm text-muted-foreground">No hay gastos categorizados para este mes.</p>}
            </div>:<p className="text-sm text-muted-foreground">Sin movimientos para el periodo seleccionado.</p>}
          </SectionCard>
          <SectionCard eyebrow="Cuentas" title="Saldos importados" accent="var(--gold)">
            {data.worth.accounts.length?<ul className="divide-y divide-hairline">
              {data.worth.accounts.map(a=><li key={a.key} className="flex items-center justify-between gap-3 py-3">
                <span className="flex min-w-0 items-center gap-2"><Landmark className="h-4 w-4 shrink-0 text-money"/><span className="truncate text-sm">{a.bank}</span></span>
                <span className="text-right"><span className="block text-sm font-semibold tabular-nums">{euro(a.balance)}</span><span className="text-[10px] text-muted-foreground">{a.date}{a.stale?" · Antiguo":""}</span></span>
              </li>)}
            </ul>:<EmptyState icon={<Landmark className="h-5 w-5"/>} title="Sin saldo bancario"
              text="Los movimientos sin saldo de cierre no permiten calcular un balance."/>}
            {Object.entries(data.bankUpdatedThrough).length>0&&<p className="mt-4 text-xs text-muted-foreground">Último movimiento por banco: {Object.entries(data.bankUpdatedThrough).map(([bank,date])=>bank+" "+date).join(" · ")}</p>}
          </SectionCard>
        </div>
      </>}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Patrimonio" title="Activos y deudas conocidos" accent="var(--money)">
          <dl className="space-y-4">
            {([
              ["Efectivo bancario conocido",data.worth.accounts.length?euro(data.worth.cash):"Sin saldo"],
              ["Inversiones declaradas",data.worth.investments.length?euro(data.worth.invested):"Sin valoraciones"],
              ["Deudas declaradas",data.worth.debts.length?euro(data.worth.owed):"Sin valoraciones"]
            ] as const).map(([name,value])=><div key={name} className="flex flex-wrap justify-between gap-3 border-b border-hairline pb-3">
              <dt className="text-sm text-muted-foreground">{name}</dt><dd className="text-sm font-semibold">{value}</dd>
            </div>)}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">No incluye automáticamente deuda, patrimonio ni cuentas que no hayas registrado.</p>
        </SectionCard>
        <SectionCard eyebrow="Objetivos registrados" title="Metas financieras" accent="var(--gold)">
          {data.goals.length?<ul className="space-y-3">
            {data.goals.map(goal=><li key={goal.id} className="rounded-xl border border-hairline bg-raised p-4">
              <p className="font-medium">{goal.title}</p><p className="mt-1 text-xs text-muted-foreground">Tipo: {goal.type||"No identificado"} · Progreso pendiente de cálculo verificado</p>
            </li>)}
          </ul>:<EmptyState icon={<PiggyBank className="h-5 w-5"/>} title="Sin objetivos financieros registrados"
              text="Los objetivos aparecerán cuando los guardes en RISE HUB."/>}
        </SectionCard>
      </div>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/> El resumen utiliza transacciones verificadas. <Link to="/gastos" className="text-gold underline">Editar categorías de gastos en React</Link>. La importación bancaria y algunas funciones avanzadas siguen pendientes.
      </p>
    </>}
  </div>;
}
