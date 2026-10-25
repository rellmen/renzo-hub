---
id: matematicas-m01-l07
course: matematicas
module: M01
level: N1
title: Leer y plantear problemas con ecuaciones
learning_objectives:
  - Aplicar un método de cinco pasos para pasar de un enunciado a una ecuación
  - Elegir bien la incógnita y expresar las demás cantidades en función de ella
  - Resolver problemas tipo (edades, mezclas, móviles, trabajo conjunto, porcentajes) y validar la respuesta en el contexto
prerequisites: [matematicas-m01-l02, matematicas-m01-l04]
skill_ids: [problem_modeling, solution_check]
exam_alignment: [algebra, problemas]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

En el examen de Matemáticas +25, los dos problemas de 4 puntos casi siempre empiezan con un texto: hay que entender la situación, elegir la incógnita y escribir la ecuación o el sistema. Muchos candidatos saben resolver ecuaciones pero no saben **plantearlas**. Esta lección cierra el módulo de preálgebra con un método de lectura y planteamiento que podrás aplicar después a sistemas (M02-L06), a funciones y a optimización con derivadas (M08-L07).

## 2. Lo que necesitas saber antes

- Lenguaje algebraico: traducir frases a expresiones (M01-L01).
- Resolver ecuaciones de primer grado (M01-L02) y despejar (M01-L03).
- Proporcionalidad y porcentajes (M01-L04, M00-L05).

## 3. Idea intuitiva

Un problema verbal es una ecuación disfrazada. Tu trabajo es quitarle el disfraz: identificar qué se pregunta, qué datos tienes y qué **relación** los une. Esa relación suele estar escondida en una frase con «es igual a», «en total», «el doble de», «cuando se encuentran», «la mezcla tiene».

Un buen truco es imaginar que **ya conoces la respuesta** y comprobar si es correcta. Por ejemplo, si te preguntan una edad, prueba con 30: ¿qué cálculos harías para comprobarlo? Esos mismos cálculos, con $x$ en lugar de 30, son la ecuación.

## 4. Definición precisa

**Método en cinco pasos:**
1. **Comprender:** lee dos veces. Subraya la pregunta y escribe los datos con sus unidades.
2. **Elegir la incógnita:** normalmente, lo que se pregunta. Escribe con palabras qué representa: «$x$ = número de horas que trabaja la segunda máquina».
3. **Expresar** todas las demás cantidades en función de $x$ (una tabla ayuda mucho).
4. **Plantear y resolver:** busca la frase que da la igualdad y escribe la ecuación.
5. **Comprobar y responder:** sustituye en el **enunciado** (no en tu ecuación) y responde con una frase completa y unidades. Descarta soluciones sin sentido (edades negativas, número de personas no entero).

**Modelos frecuentes:**

| Tipo | Relación clave |
|---|---|
| Edades | dentro de $n$ años todos tienen $n$ años más |
| Mezclas y medias ponderadas | cantidad total de soluto = suma de las cantidades; precio de la mezcla × total = suma de importes |
| Móviles | distancia = velocidad × tiempo; al encontrarse, las distancias suman la separación (sentidos opuestos) o son iguales (mismo punto de salida) |
| Trabajo conjunto | si uno tarda $a$ horas, hace $\dfrac1a$ del trabajo por hora; juntos, $\dfrac1a+\dfrac1b=\dfrac1t$ |
| Porcentajes | final = inicial × índice (M00-L05) |
| Números consecutivos | $x$, $x+1$, $x+2$; pares consecutivos $2n$, $2n+2$ |

**Por qué escribir qué es $x$ con palabras.** La mitad de los errores de planteamiento consisten en usar $x$ para una cosa en una línea y para otra en la siguiente. Anotarlo obliga a ser coherente y, en el examen, el corrector ve tu razonamiento y puede darte puntos parciales aunque falle una cuenta.

**¿Una incógnita o dos?** Si el problema pregunta por dos cantidades relacionadas por una frase sencilla («una vale el triple que la otra»), usa una sola incógnita. Si hay dos relaciones independientes, plantea un sistema con dos incógnitas (M02-L06).

**Validar en el contexto.** Una ecuación puede dar una solución matemáticamente correcta que no tiene sentido: 3,5 camiones, un tiempo negativo, un porcentaje mayor que 100 en una mezcla. Si aparece, revisa el planteamiento o explica por qué se descarta.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Edades
Una madre tiene 34 años y su hija 10. ¿Dentro de cuántos años la madre tendrá el doble de edad que la hija?

- $x$ = años que han de pasar.
- Dentro de $x$ años: madre $34+x$, hija $10+x$.
- Ecuación: $34+x=2(10+x)$ → $34+x=20+2x$ → $x=14$.
- Comprobación: madre 48, hija 24; $48=2\cdot24$. ✔ **Dentro de 14 años.**
:::

:::ejemplo Ejemplo 2 · Mezcla
Se mezclan 30 kg de café de 8 €/kg con cierta cantidad de café de 12 €/kg para obtener una mezcla de 9,50 €/kg. ¿Cuántos kilos del segundo café hacen falta?

| | kg | €/kg | importe |
|---|---|---|---|
| Café A | 30 | 8 | 240 |
| Café B | $x$ | 12 | $12x$ |
| Mezcla | $30+x$ | 9,50 | $9{,}5(30+x)$ |

$240+12x=9{,}5(30+x)$ → $240+12x=285+9{,}5x$ → $2{,}5x=45$ → $x=18$ kg.
Comprobación: $(240+216)/48=9{,}50$ €/kg. ✔
:::

:::ejemplo Ejemplo 3 · Trabajo conjunto
Una máquina embala un pedido en 6 horas y otra en 3 horas. ¿Cuánto tardan juntas?

Por hora hacen $\dfrac16$ y $\dfrac13$ del pedido. Juntas: $\dfrac16+\dfrac13=\dfrac12$ → tardan **2 horas**. (Sumar los tiempos, 9 horas, no tiene sentido: juntas deben tardar menos que la más rápida.)
:::

:::error Error típico
Plantear con la información en el orden en que aparece en lugar de buscar la relación. En «dentro de $x$ años la madre tendrá el doble que la hija», escribir $2\cdot34=10+x$. Otro error: no comprobar en el enunciado y dar por buena una solución que no responde a la pregunta (por ejemplo, dar la edad de la hija cuando se pregunta por los años que faltan).
:::

## 6. Ejercicio guiado

Dos furgonetas salen a la vez de dos almacenes separados 210 km y van una hacia la otra a 80 km/h y 60 km/h. ¿Cuánto tardan en cruzarse y a qué distancia del primer almacén?

:::pista Primera pista
Sea $t$ el tiempo en horas. Distancias recorridas: $80t$ y $60t$. ¿Qué ocurre con la suma de esas distancias cuando se cruzan?
:::

:::pista Segunda pista
Suman la separación: $80t+60t=210$.
:::

:::solucion Solución guiada
$140t=210$ → $t=1{,}5$ h (1 h 30 min). La primera recorre $80\cdot1{,}5=120$ km. Comprobación: la segunda recorre 90 km y $120+90=210$. ✔ Se cruzan a 120 km del primer almacén.
:::

## 7. Práctica

**Fáciles**

1. La suma de tres números consecutivos es 87. ¿Cuáles son?
2. Un número aumentado en su 20 % da 84. ¿Qué número es?
3. Un rectángulo tiene 46 m de perímetro y el largo mide 5 m más que el ancho. Calcula sus dimensiones.

**Medios**

4. Un grifo llena un depósito en 4 horas y otro en 12. ¿Cuánto tardan juntos?
5. ¿Cuántos litros de agua hay que añadir a 20 L de una disolución al 30 % para que quede al 20 %?

**Tipo examen / transferencia**

6. Un operario cobra 14 € por hora normal y 21 € por hora extra. Una semana trabajó 46 horas en total y cobró 707 €. ¿Cuántas horas extra hizo? Plantea, resuelve, comprueba y responde con una frase.

:::solucion Soluciones paso a paso
1. $x+(x+1)+(x+2)=87$ → $3x=84$ → $x=28$: 28, 29 y 30.
2. $1{,}2x=84$ → $x=70$.
3. $2x+2(x+5)=46$ → $4x=36$ → ancho 9 m, largo 14 m.
4. $\dfrac14+\dfrac1{12}=\dfrac{4}{12}=\dfrac13$ → 3 horas.
5. Soluto: $0{,}3\cdot20=6$ L, que no cambia. $\dfrac{6}{20+x}=0{,}2$ → $6=4+0{,}2x$ → $x=10$ L de agua.
6. $x$ = horas extra; normales $46-x$. $14(46-x)+21x=707$ → $644+7x=707$ → $x=9$. Comprobación: $37\cdot14+9\cdot21=518+189=707$. ✔ **Hizo 9 horas extra.**
:::

## 8. Cómo revisar tus errores

- ¿Has escrito con palabras qué es $x$?
- ¿Tu ecuación tiene las mismas unidades en los dos miembros?
- Comprueba en el **enunciado** y responde exactamente a lo que se pregunta.
- Haz una estimación previa: ¿el resultado está en un rango razonable?

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Comprender → elegir incógnita → expresar en función de ella → plantear y resolver → comprobar y responder.
- Una tabla ordena los datos de mezclas, móviles y precios.
- Trabajo conjunto: se suman las fracciones de trabajo por hora, no los tiempos.

**Vocabulario:** incógnita, planteamiento, modelo, media ponderada, soluto, trabajo conjunto.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un problema de un tipo distinto de la tabla y escribe la respuesta con una frase completa.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1 (ESO). Alineado con la resolución de problemas del temario oficial de Matemáticas +25; prepara los sistemas (M02-L06) y la optimización (M08-L07).
