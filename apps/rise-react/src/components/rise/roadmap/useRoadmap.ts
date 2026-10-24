import {useMemo} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/lib/auth/AuthProvider";
import {backendEnvironmentForHost} from "@/lib/nocturne-environment.mjs";
import {academyEnvironmentAllowed} from "@/lib/academy/engine.mjs";
import {AcademyBackendMissing,loadAcademyState} from "@/lib/academy/records.mjs";
import {loadShiftState,shiftPreview} from "@/lib/shift-state.mjs";
import {autoSteps,findItem,loadPathProgress,localDate,pathMetrics,rowsByTask,saveItemSteps,studyWindow,todayView,type ItemRef} from "@/lib/career-path.mjs";

/** Un solo origen para Inicio y la página Roadmap: mismas claves de caché, mismo guardado. */
export function useRoadmap(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const qc=useQueryClient();
  const hostEnv=typeof window==="undefined"?null:backendEnvironmentForHost(window.location.hostname);
  const uocAllowed=academyEnvironmentAllowed({hostEnvironment:hostEnv,releaseTarget:import.meta.env["VITE_NOCTURNE_RELEASE_TARGET"]||"",flag:import.meta.env["VITE_ENABLE_ACADEMY"]==="true"});
  const key=["career-path-progress",uid];
  const progress=useQuery({queryKey:key,enabled:!!client&&!!uid,queryFn:()=>loadPathProgress(client!,uid),staleTime:15_000,refetchOnWindowFocus:true});
  const academy=useQuery({queryKey:["academy-state",uid],enabled:uocAllowed&&!!client&&!!uid,queryFn:()=>loadAcademyState(client!,uid),
    staleTime:15_000,retry:(n,e)=>!(e instanceof AcademyBackendMissing)&&n<2});
  const shifts=useQuery({queryKey:["shift-state",uid],enabled:!!client&&!!uid,queryFn:()=>loadShiftState(client!,uid),staleTime:60_000});
  const today=localDate();
  const academyProgress=academy.data?.progress??null;
  const rows=progress.data??[];
  const view=useMemo(()=>todayView(rows,{today,academyProgress}),[rows,today,academyProgress]);
  const metrics=useMemo(()=>pathMetrics(rows,{today,academyProgress}),[rows,today,academyProgress]);
  const by=useMemo(()=>rowsByTask(rows),[rows]);
  const shift=shifts.data?shiftPreview(shifts.data,today):undefined;
  const window_=studyWindow(shift,today);
  const save=useMutation({
    mutationFn:({item,steps}:{item:ItemRef;steps:string[]})=>{const base=findItem(item.id);if(!base)throw Error("La tarea no pertenece al roadmap.");return saveItemSteps(client!,uid,base,steps,by.get(item.id),{auto:autoSteps(base,academyProgress)});},
    onSuccess:()=>qc.invalidateQueries({queryKey:key}),
  });
  /** Marca o desmarca un paso concreto. */
  const toggleStep=(item:ItemRef,stepId:string,done:boolean)=>{
    const current=new Set(by.get(item.id)?.payload?.steps??[]);
    if(done)current.add(stepId);else current.delete(stepId);
    save.mutate({item,steps:[...current]});
  };
  /** Marca o desmarca la tarea entera. */
  const toggleAll=(item:ItemRef,done:boolean)=>save.mutate({item,steps:done?(findItem(item.id)?.steps??[]).map(s=>s.id):[]});
  return {ready:!!progress.data,loading:progress.isLoading,error:progress.error,refetch:progress.refetch,fetching:progress.isFetching,
    view,metrics,shift,window:window_,save,toggleStep,toggleAll,uocAllowed,by,academyProgress};
}
