// RISE HUB React: VERBATIM catalog from legacy microapps/skin/skin.js.
// Keep exact step ordering/indices to preserve all historical skin_routine_logs.
export const PRODUCTS=[["Arencia Fresh Green Rice Mochi Cleanser", "Limpiador principal", "Diario", "assets/skin_6.jpeg"], ["CeraVe Foaming Cleanser", "Limpiador alternativo", "Si notas más grasa", "assets/skin_7.jpeg"], ["Eucerin DermoPure Clinical Correcting Cleanser 2%", "Limpiador exfoliante", "Pausar durante descamación; no combinar con otros exfoliantes", "assets/skin_8.jpeg"], ["COSRX Advanced Snail 96 Mucin Power Essence", "Hidratación", "Mañana y noche", "assets/skin_1.jpeg"], ["SKIN1004 Madagascar Centella Tone Brightening Capsule Ampoule", "Calmante y tono", "Opcional si la piel lo tolera", "assets/skin_1.jpeg"], ["Paula’s Choice Skin Perfecting 2% BHA Liquid", "Puntos negros", "Pausar durante descamación; no usar en noches de retinal", "assets/skin_2.jpeg"], ["Dr. Althea Vitamin C Boosting Serum", "Luminosidad", "Pausar hasta recuperar barrera; retomar solo si toleras", "assets/skin_2.jpeg"], ["Anua Niacinamide 10% + TXA 4%", "Manchas y tono", "Posponer hasta recuperación; no combinar activos al iniciar retinal", "assets/skin_2.jpeg"], ["ILLIYOON Ceramide Ato Concentrate Cream", "Barrera", "Principalmente noche", "assets/skin_3.jpeg"], ["AXIS-Y Dark Spot Correcting Glow Serum", "Antimanchas alternativo", "Alternativa al Anua", "assets/skin_3.jpeg"], ["Heliocare 360 Pigment Solution Fluid SPF50+", "Protector solar", "Cada mañana", "assets/skin_4.jpeg"], ["Avène Sunsimed Pigment", "Protector solar alternativo", "Alternativa al Heliocare", "assets/skin_4.jpeg"], ["celimax Retinal Shot Tightening Booster", "Retinoide nocturno", "Pausar con descamación; introducir gradualmente cuando la barrera se recupere", "assets/skin_3.jpeg"], ["NUXE Zinc Power", "Imperfecciones", "Pausar durante descamación", "assets/skin_3.jpeg"], ["Isntree Hyaluronic Acid Toner Plus", "Tónico hidratante", "Opcional: evita duplicar demasiadas capas hidratantes", "assets/skin_1.jpeg"], ["AXIS-Y Vegan Collagen Eye Serum", "Contorno de ojos", "Opcional; no necesario para manchas faciales", "assets/skin_3.jpeg"], ["Ondo Beauty 36.5 Dark Spot Treatment", "Tratamiento de manchas", "Reservar como alternativa, no combinar múltiples activos inicialmente", "assets/skin_2.jpeg"], ["Differin 0.1% (adapaleno)", "Retinoide alternativo", "No combinar con retinal Celimax; consultar indicación y tolerancia", "assets/skin_3.jpeg"], ["Aceite de ricino Deliplus", "Aceite", "Fuera de la rutina facial principal", "assets/skin_3.jpeg"]];
  // Barrier-first for reported dryness/flaking. Retinal may be resumed only when comfortable.
export const AM=[["Limpiar suavemente","Arencia Fresh Green Rice Mochi Cleanser · sin limpiadores exfoliantes"],
    ["Calmar (opcional)","SKIN1004 Centella Tone Brightening Capsule Ampoule"],
    ["Hidratar (opcional)","COSRX Snail 96 · si lo toleras"],
    ["Reforzar barrera","ILLIYOON Ceramide Ato Concentrate Cream"],
    ["Protección imprescindible","Heliocare 360 Pigment Solution SPF50+ · aplicar cantidad suficiente y reaplicar durante exposición"]];
const BASE=[["Limpiar","Arencia Fresh Green Rice Mochi Cleanser"],
    ["Calmar e hidratar","SKIN1004 Centella o COSRX Snail 96 · elegir según tolerancia"],
    ["Reparar barrera","ILLIYOON Ceramide Ato Concentrate Cream"]];
export const PM={
    0:BASE,1:BASE,2:BASE,3:BASE,4:BASE,
    5:[BASE[0],["Retinal opcional (solo piel recuperada)","celimax Retinal Shot Tightening Booster · cantidad pequeña, sobre piel seca. Empezar una noche/semana; no usar con descamación o irritación. Evitar durante embarazo."],BASE[2]],
    6:BASE
  };

export function stepsFor(date,session,barrierFirst=true){
  if(!(date instanceof Date)||Number.isNaN(date.valueOf()))throw Error("Fecha inválida");
  if(session!=="am"&&session!=="pm")throw Error("Sesión desconocida");
  const steps=session==="am"?AM:PM[date.getDay()];
  return steps.map(([title,product])=>{
    if(barrierFirst&&title==="Retinal opcional (solo piel recuperada)")
      return ["Pausar este activo","Rutina suave: omite este producto hoy"];
    return [title,product];
  });
}
/** Hora local a la que empieza el "día" de la rutina de piel: lo marcado de madrugada
 * (antes de las 05:00) cuenta para la noche anterior. */
export const SKIN_DAY_START_HOUR=5;
/** Mediodía local del día de rutina al que pertenece `at` (estable para getDay()). */
export function skinRoutineDay(at=new Date(),startHour=SKIN_DAY_START_HOUR){
  if(!(at instanceof Date)||Number.isNaN(at.valueOf()))throw Error("Fecha inválida");
  const shifted=new Date(at.getFullYear(),at.getMonth(),at.getDate(),at.getHours()-startHour,at.getMinutes());
  return new Date(shifted.getFullYear(),shifted.getMonth(),shifted.getDate(),12);
}
export function dateKeyLocal(date){
  if(!(date instanceof Date)||Number.isNaN(date.valueOf()))throw Error("Fecha inválida");
  return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
}
