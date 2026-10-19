// Ejercicios de gramática explícitos: corrección estricta y explicación en español.
export const GRAMMAR_DRILLS = Object.freeze({
 nl:[
 {id:"nl-v2",level:"A1",rule:"Verbo en segunda posición (V2)",prompt:"Completa: Vandaag ____ ik in het magazijn.",options:["werk","werken","werkt"],answer:"werk",explanation:"Tras Vandaag, el verbo conjugado va en segunda posición: Vandaag werk ik."},
 {id:"nl-inversion",level:"A2",rule:"Inversión",prompt:"Completa: Morgen ____ we vroeg.",options:["beginnen","we beginnen","begint"],answer:"beginnen",explanation:"Si la frase empieza por Morgen, el verbo va delante del sujeto: Morgen beginnen we vroeg."},
 {id:"nl-subordinate",level:"B1",rule:"Subordinadas con omdat",prompt:"Completa: Ik blijf thuis omdat ik ziek ____.",options:["ben","zijn","is"],answer:"ben",explanation:"En una subordinada con omdat, el verbo conjugado va al final."},
 {id:"nl-article",level:"A1",rule:"Artículos de/het",prompt:"Completa: ____ huis is groot.",options:["Het","De","Een de"],answer:"Het",explanation:"Huis es una palabra con artículo het: het huis."},
 {id:"nl-separable",level:"A2",rule:"Verbos separables",prompt:"Completa: Ik ____ de computer ____.",options:["zet / aan","aanzet / —","zetten / aan"],answer:"zet / aan",explanation:"Aanzetten se separa en la oración principal: ik zet ... aan."}
 ],
 en:[
 {id:"en-present-perfect",level:"B1",rule:"Present perfect",prompt:"Complete: I ____ here since 2024.",options:["have worked","work","am work"],answer:"have worked",explanation:"Con since y una situación que continúa hasta hoy se usa present perfect."},
 {id:"en-articles",level:"B1",rule:"Articles",prompt:"Complete: She is ____ inventory controller.",options:["an","a","the an"],answer:"an",explanation:"Inventory comienza con sonido vocálico, por eso se usa an."},
 {id:"en-conditional",level:"B2",rule:"Second conditional",prompt:"Complete: If I had more time, I ____ more.",options:["would study","will study","studied"],answer:"would study",explanation:"En el segundo condicional: if + past simple, would + infinitivo."},
 {id:"en-prepositions",level:"B1",rule:"Prepositions",prompt:"Complete: I am responsible ____ stock accuracy.",options:["for","of","to"],answer:"for",explanation:"La combinación habitual es responsible for."},
 {id:"en-word-order",level:"B2",rule:"Indirect questions",prompt:"Complete: Could you tell me ____?",options:["where the shipment is","where is the shipment","where does the shipment is"],answer:"where the shipment is",explanation:"Las preguntas indirectas mantienen orden de afirmación: where the shipment is."}
 ]
});
export function grammarDrills(courseId){return GRAMMAR_DRILLS[courseId] || [];}
export function checkGrammar(drill,choice){return !!drill && typeof choice==="string" && choice.trim()===drill.answer;}
