---
id: matematicas-m00-l05
course: matematicas
module: M00
level: N0
title: Decimales y porcentajes
learning_objectives:
  - Pasar de fracción a decimal y de decimal a fracción, incluidos los periódicos sencillos
  - Calcular porcentajes, aumentos y descuentos con el índice de variación
  - Encadenar variaciones porcentuales y calcular la cantidad inicial a partir de la final
prerequisites: [matematicas-m00-l04]
skill_ids: [decimals, percentages, percent_change]
exam_alignment: [arithmetica-algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Los decimales y los porcentajes son la forma en que el mundo real expresa las fracciones: precios, impuestos, tipos de interés, tasas de error, rebajas. En esta lección aprenderás a convertir entre fracciones y decimales, a calcular porcentajes sin errores y, sobre todo, a manejar **aumentos y descuentos encadenados** con el índice de variación. En el examen de Matemáticas +25 aparecen en problemas de contexto y en el interés compuesto (M03-L04); en Economía de la Empresa están en casi todos los ejercicios.

## 2. Lo que necesitas saber antes

- Operar fracciones (M00-L04) y simplificar (M00-L03).
- Multiplicar y dividir por 10, 100 y 1000 moviendo la coma.
- Leer la fracción como cociente: $\dfrac{3}{8}=3:8$.

## 3. Idea intuitiva

Un porcentaje es una fracción con denominador 100: «el 15 %» significa «15 de cada 100». Por eso calcular el 15 % de algo es multiplicar por $\dfrac{15}{100}=0{,}15$.

Cuando algo **sube un 20 %**, no hace falta calcular el 20 % y sumarlo: el resultado es el 100 % original más el 20 %, es decir, el 120 %, que se obtiene multiplicando por $1{,}20$. Cuando **baja un 20 %**, queda el 80 %: se multiplica por $0{,}80$. Ese número por el que multiplicas se llama **índice de variación**, y con él todo se vuelve una sola multiplicación, también cuando hay varias variaciones seguidas.

## 4. Definición precisa

**Fracción y decimal.**
- Fracción → decimal: se divide numerador entre denominador. $\dfrac{3}{8}=0{,}375$ (exacto); $\dfrac{2}{3}=0{,}666\ldots=0{,}\overline{6}$ (periódico).
- Una fracción irreducible da un decimal **exacto** si su denominador solo tiene los factores primos 2 y 5; si tiene otros, da un decimal **periódico**.
- Decimal exacto → fracción: $0{,}375=\dfrac{375}{1000}=\dfrac{3}{8}$.
- Periódico puro → fracción: $0{,}\overline{6}$: si $x=0{,}666\ldots$, entonces $10x=6{,}666\ldots$; restando, $9x=6$ y $x=\dfrac{2}{3}$. En general, $0{,}\overline{ab}=\dfrac{ab}{99}$.

**Porcentajes.**
- $p\,\%$ de $C$: $\dfrac{p}{100}\cdot C$.
- Qué porcentaje es $A$ de $B$: $\dfrac{A}{B}\cdot100$.
- **Índice de variación** $I$: aumento del $p\,\%$ → $I=1+\dfrac{p}{100}$; disminución del $p\,\%$ → $I=1-\dfrac{p}{100}$. Cantidad final $=$ cantidad inicial $\cdot\,I$.
- **Variaciones encadenadas**: se multiplican los índices. Subir un 10 % y luego bajar un 10 % da $1{,}10\cdot0{,}90=0{,}99$: el resultado final es un **1 % menor**, no igual.
- **Cantidad inicial** a partir de la final: $C_0=\dfrac{C_f}{I}$. Si un precio con IVA del 21 % es 242 €, la base es $\dfrac{242}{1{,}21}=200$ €.
- **Variación porcentual** entre dos valores: $\dfrac{\text{final}-\text{inicial}}{\text{inicial}}\cdot100$.

**Puntos porcentuales frente a porcentaje.** Si un tipo de interés pasa del 4 % al 5 %, ha subido **1 punto porcentual**, pero ha subido un **25 %** respecto a su valor anterior ($\dfrac{1}{4}$). Confundir ambos es un error frecuente al interpretar datos.

**Redondeo.** Para redondear a dos decimales, mira la tercera cifra: si es 5 o más, sube la segunda. $3{,}14159\to3{,}14$; $2{,}675\to2{,}68$. En el examen, redondea solo al final; si redondeas en cada paso, acumulas error.

**Margen sobre coste y margen sobre venta.** Si compras a 80 € y vendes a 100 €, ganas 20 €. Ese beneficio es un 25 % **sobre el coste** ($\dfrac{20}{80}$), pero un 20 % **sobre el precio de venta** ($\dfrac{20}{100}$). Ninguno es incorrecto: la clave es saber siempre **de qué cantidad** se calcula el porcentaje. En los enunciados, la expresión «el $p\,\%$ de…» indica la base: lo que va detrás de «de» es el 100 %.

**Porcentajes mayores que 100.** Pasar de 40 a 100 es un aumento del 150 %, y el valor final es el 250 % del inicial. Un porcentaje de aumento no tiene límite, pero una disminución nunca puede superar el 100 % (quedaría una cantidad negativa).

**Por qué el índice funciona.** $C+\dfrac{p}{100}C=C\left(1+\dfrac{p}{100}\right)$: es solo sacar factor común. Por eso un aumento seguido de otro equivale a multiplicar por ambos factores.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Decimal periódico a fracción
Escribe $0{,}\overline{45}$ como fracción irreducible.

1. $x=0{,}4545\ldots$; el periodo tiene 2 cifras → multiplica por 100: $100x=45{,}4545\ldots$
2. Resta: $99x=45$ → $x=\dfrac{45}{99}$.
3. Simplifica (MCD 9): $\dfrac{5}{11}$. Comprobación: $5:11=0{,}4545\ldots$ ✔
:::

:::ejemplo Ejemplo 2 · Descuento y luego IVA
Un artículo cuesta 80 € sin IVA. Tiene un descuento del 15 % y después se aplica un IVA del 21 %. ¿Precio final?

Índice total: $0{,}85\cdot1{,}21=1{,}0285$. Precio: $80\cdot1{,}0285=82{,}28$ €. El orden no importa porque la multiplicación es conmutativa.
:::

:::ejemplo Ejemplo 3 · Valor inicial
Tras una subida del 8 %, el alquiler de una nave es de 2.700 € al mes. ¿Cuánto era antes?

$C_0=\dfrac{2700}{1{,}08}=2500$ €. Comprobación: $2500\cdot1{,}08=2700$. ✔ (Restar el 8 % de 2.700 daría 2.484 €, que es incorrecto.)
:::

:::error Error típico
Pensar que un aumento del 20 % seguido de una rebaja del 20 % deja el precio igual. $1{,}2\cdot0{,}8=0{,}96$: el precio final es un 4 % menor. Otro error: calcular el valor sin IVA restando el 21 % al precio final.
:::

## 6. Ejercicio guiado

Las ventas de un mes fueron 48.000 €. Al mes siguiente bajaron un 12 % y al siguiente subieron un 12 %. ¿Cuál fue la variación porcentual total?

:::pista Primera pista
Escribe los dos índices: bajar un 12 % y subir un 12 %.
:::

:::pista Segunda pista
Multiplica $0{,}88\cdot1{,}12$ y compara el resultado con 1.
:::

:::solucion Solución guiada
$0{,}88\cdot1{,}12=0{,}9856$. Ventas finales: $48.000\cdot0{,}9856=47.308{,}80$ €. Variación total: $0{,}9856-1=-0{,}0144$ → **bajada del 1,44 %**.
:::

## 7. Práctica

**Fáciles**

1. Escribe $\dfrac{7}{20}$ como decimal y como porcentaje.
2. Calcula el 35 % de 640.
3. ¿Qué porcentaje es 18 de 72?

**Medios**

4. Escribe $0{,}\overline{3}$ y $1{,}25$ como fracciones irreducibles.
5. Un precio de 150 € sube un 6 % y luego otro 4 %. ¿Precio final y aumento porcentual total?

**Tipo examen / transferencia**

6. La tasa de error de un almacén pasó del 2,5 % al 2 % de las líneas preparadas. ¿Cuántos puntos porcentuales ha bajado? ¿En qué porcentaje se ha reducido la tasa de error? Si se preparan 40.000 líneas al mes, ¿cuántos errores menos hay?

:::solucion Soluciones paso a paso
1. $7:20=0{,}35=35\,\%$.
2. $0{,}35\cdot640=224$.
3. $\dfrac{18}{72}\cdot100=25\,\%$.
4. $0{,}\overline{3}=\dfrac{3}{9}=\dfrac{1}{3}$; $1{,}25=\dfrac{125}{100}=\dfrac{5}{4}$.
5. $150\cdot1{,}06\cdot1{,}04=150\cdot1{,}1024=165{,}36$ €; aumento total $10{,}24\,\%$ (no 10 %).
6. Baja $0{,}5$ puntos porcentuales. Reducción relativa: $\dfrac{2-2{,}5}{2{,}5}\cdot100=-20\,\%$. Errores: $0{,}025\cdot40.000=1000$ frente a $0{,}02\cdot40.000=800$ → **200 errores menos** al mes.
:::

## 8. Cómo revisar tus errores

- Comprueba si el resultado tiene sentido: tras una subida, la cantidad debe ser mayor.
- Para recuperar un valor inicial, **divide** por el índice; después multiplica para comprobar.
- No sumes porcentajes encadenados: multiplica los índices.
- Redondea solo al final y escribe las unidades (€, %, puntos).

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Fracción → decimal dividiendo; periódico puro $0{,}\overline{ab}=\dfrac{ab}{99}$.
- $p\,\%$ de $C=\dfrac{p}{100}C$; índice $1\pm\dfrac{p}{100}$; encadenar = multiplicar índices.
- Valor inicial $=\dfrac{\text{final}}{I}$; puntos porcentuales ≠ porcentaje.

**Vocabulario:** decimal exacto, decimal periódico, periodo, porcentaje, índice de variación, variación porcentual, punto porcentual, base imponible.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un problema de IVA inverso y uno de dos variaciones encadenadas.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N0 (rescate, 1.º–2.º ESO). Base del interés simple y compuesto (M03-L04) y de la aritmética aplicada de Economía de la Empresa (B00).
