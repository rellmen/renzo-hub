import {createFileRoute,Link} from "@tanstack/react-router";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {ChevronRight,Database,ExternalLink,KeyRound,LogOut,RefreshCw,ShieldCheck,Smartphone,UserRound} from "lucide-react";
import {toast} from "sonner";
import {pageHead} from "@/lib/seo";
import {NAV} from "@/lib/nav";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {useAuth} from "@/lib/auth/AuthProvider";
import {refreshVisiblePrivateData} from "@/lib/private-data-refresh";
import {DataBackupPanel} from "@/components/rise/DataBackupPanel";

export const Route=createFileRoute("/ajustes")({
  head:()=>pageHead("Ajustes y privacidad","Tu sesión, privacidad y estado de la migración Rise React."),
  component:Settings
});
const MODULES:{name:string;status:string;details:string}[]=[
  {name:"Inicio",status:"lectura",details:"Proyectos y actividad verificados"},
  {name:"Proyectos",status:"operativo parcial",details:"Tareas reales y edición limitada"},
  {name:"Ares Center",status:"operativo parcial",details:"Consultas, decisiones y monitor histórico; sin ejecución de agentes"},
  {name:"SelfLearn",status:"operativo parcial",details:"Práctica y progreso; acreditación según contrato del entorno"},
  {name:"Gym",status:"operativo parcial",details:"Sesiones, plan y borrador; funciones avanzadas en migración"},
  {name:"Payroll y turnos",status:"lectura",details:"Historial original; importar y editar en la versión clásica"},
  {name:"Money",status:"lectura",details:"Bancos y patrimonio registrados; sin operaciones"},
  {name:"Skin Routine",status:"operativo parcial",details:"Rutinas y notas, inventario sin editar"},
  {name:"Copia de datos",status:"preparado",details:"Exportación privada; validación autenticada pendiente"},
  {name:"Sistema completo",status:"pendiente",details:"Paridad de módulos y pruebas PWA aún por completar"}
];

function Settings(){
  const {user,signOut}=useAuth();
  const qc=useQueryClient();
  const [busy,setBusy]=useState(false);
  const [syncBusy,setSyncBusy]=useState(false);
  const [syncMessage,setSyncMessage]=useState("");
  const [syncError,setSyncError]=useState(false);
  async function refreshDevice(){
    setSyncBusy(true);setSyncError(false);setSyncMessage("");
    try{
      const active=await refreshVisiblePrivateData(qc,user?.id);
      setSyncMessage(active
        ?"Datos visibles recuperados de Supabase. Los demás módulos se actualizarán al abrirlos."
        :"Datos en caché marcados para actualizarse cuando abras cada módulo.");
    }catch{
      setSyncError(true);
      setSyncMessage("No se pudieron actualizar todos los datos. Revisa la conexión y vuelve a intentarlo.");
    }finally{setSyncBusy(false);}
  }
  async function logout(){
    setBusy(true);
    try{await signOut();qc.clear();}
    catch(e){toast.error(e instanceof Error?e.message:"No se pudo cerrar la sesión.");}
    finally{setBusy(false);}
  }
  return <div className="space-y-6">
    <PageHeader eyebrow="SISTEMA · ACCESO PRIVADO" title="Ajustes y privacidad"
      subtitle="Tu cuenta real de Rise y el estado verificable de la transición a React."/>
    <div className="grid gap-6 lg:grid-cols-2">
      <DataBackupPanel/>
      <SectionCard eyebrow="Identidad" title="Cuenta conectada" accent="var(--gold)">
        <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-raised p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-wine-gradient text-gold"><UserRound className="h-5 w-5"/></span>
          <div className="min-w-0"><p className="text-xs text-muted-foreground">Correo de sesión</p>
            <p className="break-all text-sm font-medium">{user?.email||"Sin correo verificado"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Autenticación gestionada por Supabase.</p>
          </div>
        </div>
        <button type="button" className="btn-ghost mt-4 flex min-h-11 items-center" disabled={busy} onClick={()=>void logout()}>
          <LogOut className="h-4 w-4"/> {busy?"Cerrando sesión…":"Cerrar sesión"}
        </button>
      </SectionCard>
      <SectionCard eyebrow="Protección" title="Privacidad y datos" accent="var(--gold)">
        <div className="flex items-start gap-3 rounded-2xl border border-gold/25 bg-gold/[0.06] p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold"/>
          <div className="space-y-2 text-sm text-platinum/80">
            <p><strong className="text-foreground">Datos vinculados a tu cuenta.</strong> La interfaz React consulta el Supabase de este mismo entorno, protegido mediante las reglas de acceso existentes.</p>
            <p>El frontend React todavía no sustituye a toda la aplicación anterior. Las funciones no migradas siguen allí; no se ha hecho ninguna migración destructiva de la base de datos.</p>
          </div>
        </div>
        <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0"/> Nunca compartas contraseñas o claves de servicio dentro de las notas de la aplicación.
        </p>
      </SectionCard>
      <SectionCard eyebrow="Actualización entre dispositivos" title="Tus datos más recientes" accent="var(--learn)">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Los registros confirmados se guardan en Supabase para tu cuenta. Al volver a Nocturne,
          las vistas consultan los cambios; también puedes solicitar una actualización en este dispositivo.
          El contenido no guardado y los cambios simultáneos de todos los módulos no se fusionan automáticamente.
        </p>
        <button type="button" className="btn-ghost mt-4 flex min-h-11 items-center"
          disabled={syncBusy} onClick={()=>void refreshDevice()}>
          <RefreshCw className={"h-4 w-4 "+(syncBusy?"animate-spin":"")}/>
          {syncBusy?"Actualizando datos…":"Actualizar datos de este dispositivo"}
        </button>
        {syncMessage&&<p role={syncError?"alert":"status"} className="mt-3 text-xs text-muted-foreground">{syncMessage}</p>}
      </SectionCard>
      <SectionCard eyebrow="Navegación" title="Microapps disponibles" accent="var(--ares)">
        <ul className="divide-y divide-hairline">
          {NAV.filter(n=>n.to!=="/ajustes").map(n=><li key={n.to}>
            <Link to={n.to} className="flex min-h-12 items-center gap-3 text-sm transition hover:text-gold">
              <n.icon className="h-4 w-4 shrink-0" style={{color:n.accent}}/>
              <span className="flex-1">{n.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground"/>
            </Link>
          </li>)}
        </ul>
      </SectionCard>
      <SectionCard eyebrow="Estado real" title="Migración Nocturne" accent="var(--projects)">
        <p className="mb-4 text-sm text-muted-foreground">Estas etiquetas describen lo que se está migrando. No significan que todo funcione ya en producción.</p>
        <ul className="space-y-3">{MODULES.map(m=><li key={m.name}
          className="flex flex-col gap-1 rounded-xl border border-hairline bg-raised p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div><p className="text-sm font-medium">{m.name}</p><p className="mt-1 text-xs text-muted-foreground">{m.details}</p></div>
          <span className="shrink-0 self-start rounded-full border border-hairline px-2.5 py-1 text-[11px] text-platinum/75">{m.status}</span>
        </li>)}</ul>
      </SectionCard>
      <SectionCard eyebrow="Uso" title="Aplicación web progresiva" accent="var(--skin)" className="lg:col-span-2">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex gap-3"><Smartphone className="h-6 w-6 shrink-0 text-skin"/>
            <div><h3 className="text-sm font-semibold">Experiencia móvil</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">La nueva interfaz sigue la composición de Lovable. Interfaz probada por el propietario en iPhone. Instalación PWA y comportamiento offline no verificados técnicamente.</p></div>
          </div>
          <div className="flex gap-3"><Database className="h-6 w-6 shrink-0 text-skin"/>
            <div><h3 className="text-sm font-semibold">Continuidad de datos</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tus registros originales permanecen en las tablas actuales. No borres datos para cambiar de diseño.</p></div>
          </div>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">Referencia de diseño: <a className="inline-flex items-center gap-1 text-gold underline" href="https://lovable.dev/projects/ca43e152-f7c7-4c8e-b925-01476b9053da" target="_blank" rel="noopener noreferrer">Lovable Nocturne <ExternalLink className="h-3 w-3"/></a></p>
      </SectionCard>
    </div>
  </div>;
}
