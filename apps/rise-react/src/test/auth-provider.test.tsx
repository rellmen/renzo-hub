import {afterEach,describe,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import type {Session,SupabaseClient} from '@supabase/supabase-js';
import {AuthGate,AuthProvider,loginErrorMessage} from '../lib/auth/AuthProvider';

const getClient=vi.hoisted(()=>vi.fn());
vi.mock('../lib/supabase-adapter.mjs',()=>({getReactSupabaseClient:getClient}));

function mockAuthClient(options?:{getSession?:()=>Promise<unknown>}){
 let listener:((event:string,session:Session|null)=>void)|undefined;
 const auth={
   onAuthStateChange:vi.fn((callback:(event:string,session:Session|null)=>void)=>{
     listener=callback;
     return {data:{subscription:{unsubscribe:vi.fn()}}};
   }),
   getSession:vi.fn(options?.getSession??(async()=>({data:{session:null},error:null}))),
   signInWithPassword:vi.fn(async()=>({data:{session:null,user:null},error:null})),
   signOut:vi.fn(async()=>({error:null})),
 };
 return {client:{auth} as unknown as SupabaseClient,auth,emit:(event:string,session:Session|null)=>listener?.(event,session)};
}
function mount(){
 return render(<AuthProvider><AuthGate><h1>Zona privada de pruebas</h1></AuthGate></AuthProvider>);
}
afterEach(()=>{cleanup();getClient.mockReset();});

describe('React Nocturne staging authentication',()=>{
 it('never exposes raw backend errors or suggests production credentials',()=>{
   expect(loginErrorMessage({code:'invalid_credentials',message:'Invalid login credentials'}))
     .toContain('credenciales de staging');
   expect(loginErrorMessage({code:'unexpected_failure',message:'sensitive internal backend trace'}))
     .not.toContain('sensitive');
   expect(loginErrorMessage({status:429})).toContain('Demasiados intentos');
   expect(loginErrorMessage({message:'Failed to fetch'})).toContain('conexión');
 });
 it('shows a safe actionable error for rejected staging credentials',async()=>{
   const {client,auth}=mockAuthClient();
   auth.signInWithPassword.mockImplementation(async()=>({
     data:{session:null,user:null},error:{code:'invalid_credentials',message:'Invalid login credentials'}
   }));
   getClient.mockResolvedValue(client);
   mount();
   await screen.findByRole('button',{name:'Entrar'});
   expect(screen.getByText(/Este entorno no utiliza la base de datos de producción/)).toBeTruthy();
   fireEvent.change(screen.getByLabelText('Correo electrónico'),{target:{value:'qa@example.test'}});
   fireEvent.change(screen.getByLabelText('Contraseña'),{target:{value:'incorrect'}});
   fireEvent.click(screen.getByRole('button',{name:'Entrar'}));
   const alert=await screen.findByRole('alert');
   expect(alert.textContent).toContain('credenciales de staging');
   expect(alert.textContent).not.toContain('Invalid login credentials');
   await waitFor(()=>expect((screen.getByLabelText('Contraseña') as HTMLInputElement).value).toBe(''));
 });
 it('does not replace a newer signed-in event with a stale getSession response',async()=>{
   let resolveSession:(value:unknown)=>void=()=>{};
   const pending=new Promise<unknown>(resolve=>{resolveSession=resolve;});
   const {client,auth,emit}=mockAuthClient({getSession:()=>pending});
   getClient.mockResolvedValue(client);
   mount();
   await waitFor(()=>expect(auth.getSession).toHaveBeenCalledTimes(1));
   const session={user:{id:'22222222-2222-4222-8222-222222222222'}} as Session;
   await act(async()=>{emit('SIGNED_IN',session);});
   expect(screen.getByRole('heading',{name:'Zona privada de pruebas'})).toBeTruthy();
   await act(async()=>{resolveSession({data:{session:null},error:null});await pending;});
   expect(screen.getByRole('heading',{name:'Zona privada de pruebas'})).toBeTruthy();
   expect(screen.queryByRole('button',{name:'Entrar'})).toBeNull();
   await act(async()=>{emit('SIGNED_OUT',null);});
   expect(screen.getByRole('button',{name:'Entrar'})).toBeTruthy();
 });
 it('shows a retry action when the staging client cannot initialize',async()=>{
   getClient.mockRejectedValueOnce(Error('private config stack detail'));
   mount();
   await screen.findByRole('heading',{name:'No se pudo preparar el acceso'});
   expect(screen.getByRole('alert').textContent).not.toContain('stack detail');
   const {client}=mockAuthClient();
   getClient.mockResolvedValueOnce(client);
   fireEvent.click(screen.getByRole('button',{name:'Reintentar'}));
   await screen.findByRole('button',{name:'Entrar'});
   expect(getClient).toHaveBeenCalledTimes(2);
 });
});
