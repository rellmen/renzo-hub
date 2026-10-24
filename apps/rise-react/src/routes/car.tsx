import {createFileRoute,redirect} from '@tanstack/react-router';
import {pageHead} from '@/lib/seo';
// Car vive ahora dentro de Money → Gastos como «Gastos fijos · Coche» (decisión de Renzo, 24-10-2026).
// La URL /car se mantiene para enlaces y favoritos antiguos y lleva directamente a esa sección.
export const Route=createFileRoute('/car')({
 head:()=>pageHead('Coche','Gastos fijos del coche, dentro de Gastos.'),
 beforeLoad:()=>{throw redirect({to:'/gastos',hash:'coche',replace:true});},
});
