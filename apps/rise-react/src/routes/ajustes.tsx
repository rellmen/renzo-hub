import {createFileRoute,Link} from "@tanstack/react-router";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {KeyRound,LogOut,RefreshCw,ShieldCheck,UserRound} from "lucide-react";
import {toast} from "sonner";
import {pageHead} from "@/lib/seo";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {useAuth} from "@/lib/auth/AuthProvider";
import {refreshVisiblePrivateData} from "@/lib/private-data-refresh";
import {DataBackupPanel} from "@/components/rise/DataBackupPanel";
import {NotificationsPanel} from "@/components/rise/NotificationsPanel";

export const Route=createFileRoute("/ajustes")({
  head:()=>pageHead("Ajustes y privacidad","Tu sesión, privacidad y estado de la migración Rise React."),
  component:Settings
});
/** Ajustes limpio (6-11-2026): cuenta, avisos, copias y privacidad. El estado de la migración y las notas de PWA
 * ya no aplican (Nocturne está en producción desde el 24-10) y el catálogo vive en «Todas las apps». */
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
  return <div className="space-y-5">
    <PageHeader eyebrow="AJUSTES" title="Preferencias"/>
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard eyebrow="Cuenta" title="Sesión y sincronización" accent="var(--gold)">
        <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-raised p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-wine-gradient text-gold"><UserRound className="h-5 w-5"/></span>
          <div className="min-w-0"><p className="text-xs text-muted-foreground">Correo de sesión</p>
            <p className="break-all text-sm font-medium">{user?.email||"Sin correo verificado"}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-ghost flex min-h-11 items-center" disabled={syncBusy} onClick={()=>void refreshDevice()}>
            <RefreshCw className={"h-4 w-4 "+(syncBusy?"animate-spin":"")}/>
            {syncBusy?"Actualizando datos…":"Actualizar datos de este dispositivo"}
          </button>
          <button type="button" className="btn-ghost flex min-h-11 items-center" disabled={busy} onClick={()=>void logout()}>
            <LogOut className="h-4 w-4"/> {busy?"Cerrando sesión…":"Cerrar sesión"}
          </button>
        </div>
        {syncMessage&&<p role={syncError?"alert":"status"} className="mt-3 text-xs text-muted-foreground">{syncMessage}</p>}
      </SectionCard>
      <NotificationsPanel/>
      <DataBackupPanel/>
      <SectionCard eyebrow="Privacidad" title="Tus datos" accent="var(--gold)">
        <div className="flex items-start gap-3 text-sm text-platinum/80">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold"/>
          <p>Todo lo que ves en Rise es privado y está vinculado a tu cuenta en Supabase. Las cifras salen solo de tus registros: si falta un dato, aparece «—» o «Sin datos», nunca un ejemplo.</p>
        </div>
        <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0"/> Nunca guardes contraseñas o claves dentro de las notas.
        </p>
        <Link to="/migracion" className="mt-4 inline-flex text-xs text-gold underline">Datos y copias avanzadas</Link>
      </SectionCard>
    </div>
  </div>;
}
