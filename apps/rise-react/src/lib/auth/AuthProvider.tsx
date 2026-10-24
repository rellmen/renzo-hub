import {createContext,useCallback,useContext,useEffect,useMemo,useState,type FormEvent,type ReactNode} from 'react';
import type {Session,SupabaseClient,User} from '@supabase/supabase-js';
import {getReactSupabaseClient} from '../supabase-adapter.mjs';
import {productionRedirectUrl} from '../nocturne-environment.mjs';
import {backendEnvironmentForHost} from '../nocturne-environment.mjs';

type AuthStatus='loading'|'signed-in'|'signed-out'|'error';
type AuthState={status:AuthStatus;client:SupabaseClient|null;session:Session|null;user:User|null;error:string|null};
type AuthContextValue=AuthState&{
  signIn:(email:string,password:string)=>Promise<void>;
  signOut:()=>Promise<void>;
  retry:()=>void;
};
const INITIAL:AuthState={status:'loading',client:null,session:null,user:null,error:null};

// Keep backend details out of the UI and distinguish user errors from staging outages.
// Authentication and user identities are isolated from the production environment.
function currentEnvironment(): 'production'|'staging'{
  const target=import.meta.env?.['VITE_NOCTURNE_RELEASE_TARGET'];
  if(target==='production')return 'production';
  if(typeof window!=='undefined'&&backendEnvironmentForHost(window.location.hostname)==='production')return 'production';
  return 'staging';
}
export function loginErrorMessage(error:unknown,env:'production'|'staging'='staging'):string{
  const detail=(error&&typeof error==='object')?error as {code?:unknown;message?:unknown;status?:unknown}:{};
  const code=typeof detail.code==='string'?detail.code.toLowerCase():'';
  const message=typeof detail.message==='string'?detail.message.toLowerCase():'';
  if(code==='invalid_credentials'||message.includes('invalid login credentials'))
    return env==='production'
      ? 'Correo o contraseña no válidos para tu cuenta de RISE HUB.'
      : 'Correo o contraseña no válidos para este entorno de pruebas. Comprueba tus credenciales de staging.';
  if(code==='email_not_confirmed'||message.includes('email not confirmed'))
    return 'Confirma el correo de esta cuenta de pruebas antes de entrar.';
  if(detail.status===429||code.includes('rate_limit')||message.includes('rate limit'))
    return 'Demasiados intentos. Espera un momento antes de volver a entrar.';
  if(message.includes('failed to fetch')||message.includes('network')||message.includes('timeout')||message.includes('fetch failed'))
    return 'No se pudo contactar con el servicio de acceso. Comprueba la conexión e inténtalo de nuevo.';
  return env==='production'
    ? 'No se pudo iniciar sesión en RISE HUB. Inténtalo de nuevo.'
    : 'No se pudo iniciar sesión en staging. Inténtalo de nuevo o comunica el error al equipo.';
}
const AuthContext=createContext<AuthContextValue|null>(null);

export function AuthProvider({children,onAccountChange}:{children:ReactNode;onAccountChange?:(userId:string|null)=>void}){
  const [state,setState]=useState<AuthState>(INITIAL);
  const [generation,setGeneration]=useState(0);
  useEffect(()=>{
    let mounted=true;
    let unsubscribe:undefined|(()=>void);
    let previousUserId:string|null=null;
    let authEventReceived=false;
    const receive=(client:SupabaseClient,session:Session|null)=>{
      if(!mounted)return;
      const id=session?.user?.id??null;
      if(id!==previousUserId){
        previousUserId=id;
        onAccountChange?.(id); // caller must clear its user-scoped query cache on changes
      }
      setState({status:session?'signed-in':'signed-out',client,session,user:session?.user??null,error:null});
    };
    if(typeof window!=='undefined'){
      const target=productionRedirectUrl({hostname:window.location.hostname,releaseTarget:import.meta.env?.['VITE_NOCTURNE_RELEASE_TARGET']||'',
        pathname:window.location.pathname,search:window.location.search,hash:window.location.hash});
      if(target){window.location.replace(target);return ()=>{mounted=false;};}
    }
    (async()=>{
      try{
        const client=await getReactSupabaseClient();
        if(!mounted)return;
        const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{
          authEventReceived=true;
          receive(client,session);
        });
        unsubscribe=()=>subscription.unsubscribe();
        const {data,error}=await client.auth.getSession();
        if(error)throw error;
        // INITIAL_SESSION/SIGNED_IN may arrive while getSession is pending. The
        // event is newer than this snapshot and must not be overwritten.
        if(!authEventReceived)receive(client,data.session);
      }catch(error){
        if(!mounted)return;
        setState({status:'error',client:null,session:null,user:null,
          error:'No se pudo preparar el acceso privado. Comprueba la conexión y reintenta.'});
      }
    })();
    return ()=>{mounted=false;unsubscribe?.();};
  },[generation,onAccountChange]);
  const signIn=useCallback(async(email:string,password:string)=>{
    if(!state.client)throw new Error('La sesión no está disponible');
    const {error}=await state.client.auth.signInWithPassword({email:email.trim(),password});
    if(error)throw error;
  },[state.client]);
  const signOut=useCallback(async()=>{
    if(!state.client)throw new Error('La sesión no está disponible');
    const {error}=await state.client.auth.signOut();
    if(error)throw error;
    setState({status:'signed-out',client:state.client,session:null,user:null,error:null});
  },[state.client]);
  const retry=useCallback(()=>{setState(INITIAL);setGeneration(x=>x+1);},[]);
  const value=useMemo(()=>({...state,signIn,signOut,retry}),[state,signIn,signOut,retry]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth():AuthContextValue{
  const ctx=useContext(AuthContext);
  if(!ctx)throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthGate({children}:{children:ReactNode}){
  const auth=useAuth();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [formError,setFormError]=useState('');
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setBusy(true);setFormError('');
    try{await auth.signIn(email,password);}catch(err){setFormError(loginErrorMessage(err,currentEnvironment()));}
    finally{setBusy(false);setPassword('');}
  };
  const isProduction=currentEnvironment()==='production';
  if(auth.status==='loading')return <div role="status" className="grid min-h-screen place-items-center bg-background text-platinum">Preparando acceso seguro…</div>;
  if(auth.status==='error')return <main className="grid min-h-screen place-items-center bg-background p-6"><div className="surface max-w-md space-y-4 p-8"><h1 className="font-display text-3xl">No se pudo preparar el acceso</h1><p role="alert">{auth.error}</p><button className="btn-gold" onClick={auth.retry}>Reintentar</button></div></main>;
  if(auth.status==='signed-in')return <>{children}</>;
  return <main className="grid min-h-screen place-items-center bg-background p-6"><form onSubmit={submit} className="surface w-full max-w-md space-y-5 p-8"><p className="eyebrow">RISE HUB · NOCTURNE</p><h1 className="font-display text-4xl">Tu espacio privado.</h1><p className="text-sm text-muted-foreground">{isProduction
     ? 'Accede con tu cuenta de RISE HUB. El entorno de producción utiliza sus propios datos privados.'
     : 'Accede con una cuenta habilitada en staging. Este entorno no utiliza la base de datos de producción.'}</p><label className="block space-y-2 text-sm">Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className="h-12 w-full rounded-xl border border-input bg-raised px-4 text-foreground"/></label><label className="block space-y-2 text-sm">Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-input bg-raised px-4 text-foreground"/></label>{formError&&<p role="alert" className="text-sm text-destructive">{formError}</p>}<button disabled={busy} type="submit" className="btn-gold w-full">{busy?'Comprobando…':'Entrar'}</button></form></main>;
}
