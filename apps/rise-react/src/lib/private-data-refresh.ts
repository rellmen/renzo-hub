import type {QueryClient} from '@tanstack/react-query';

/**
 * Pull current private records from Supabase when the user explicitly requests it.
 * Cached pages not currently mounted are marked stale so they refresh on revisit.
 * This does not promise offline writes, realtime delivery or conflict-free merges.
 * The root AuthProvider clears the entire cache when the user account changes.
 */
export async function refreshVisiblePrivateData(client:QueryClient,userId:string|null|undefined):Promise<number>{
  if(!userId)throw Error('Inicia sesión para actualizar tus datos.');
  await client.invalidateQueries({refetchType:'none'});
  await client.refetchQueries({type:'active'},{throwOnError:true});
  return client.getQueryCache().findAll({type:'active'}).length;
}
