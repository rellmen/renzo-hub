// SelfLearn · indicaciones articulatorias locales, sin grabación ni evaluación automática.
export const PRONUNCIATION_DRILLS = Object.freeze({
 nl:[
  {id:"nl-g",title:"G y CH",level:"A1",example:"goedemorgen",tip:"Practica una fricción suave en la parte posterior de la boca. Evita sustituirla por una g española fuerte.",contrast:"goed · hoed"},
  {id:"nl-ui",title:"Diptongo UI",level:"A2",example:"huis",tip:"Redondea los labios y cambia la posición de la lengua durante el diptongo. Escucha el modelo antes de repetir.",contrast:"huis · hoes"},
  {id:"nl-eu",title:"Vocal EU",level:"A2",example:"deur",tip:"Mantén los labios redondeados y la lengua adelantada; no la conviertas en una e española.",contrast:"deur · dier"},
  {id:"nl-ij",title:"IJ y EI",level:"B1",example:"tijd",tip:"Practica el deslizamiento del diptongo y evita pronunciar cada letra por separado.",contrast:"tijd · tuin"},
  {id:"nl-length",title:"Vocales largas y cortas",level:"A1",example:"maan",tip:"Contrasta duración y calidad vocálica escuchando cada ejemplo.",contrast:"man · maan"}
 ],
 en:[
  {id:"en-th",title:"TH sonora y sorda",level:"B1",example:"think",tip:"Sitúa suavemente la punta de la lengua entre los dientes; deja pasar aire sin sustituirlo por t o s.",contrast:"think · sink"},
  {id:"en-schwa",title:"Schwa /ə/",level:"B1",example:"about",tip:"Relaja la lengua y reduce la vocal átona; evita pronunciar todas las sílabas con la misma fuerza.",contrast:"about · a bout"},
  {id:"en-stress",title:"Acento de palabra",level:"B2",example:"record",tip:"Compara el sustantivo REcord y el verbo reCORD; cambia el acento, no solo el volumen.",contrast:"a record · to record"},
  {id:"en-vowels",title:"Vocales cortas y largas",level:"B1",example:"ship",tip:"Escucha la calidad de la vocal, no solo la duración; relaja la mandíbula al contrastar.",contrast:"ship · sheep"},
  {id:"en-rhythm",title:"Ritmo y palabras débiles",level:"C1",example:"I should have called",tip:"Marca las palabras informativas y reduce las auxiliares en habla conectada.",contrast:"should have · should've"}
 ]
});
export function pronunciationDrills(courseId){return PRONUNCIATION_DRILLS[courseId] || [];}
