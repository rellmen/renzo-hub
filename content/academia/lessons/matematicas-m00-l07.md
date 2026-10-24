---
id: matematicas-m00-l07
course: matematicas
module: M00
level: N0
title: Razones, regla de tres, unidades y errores de medida
learning_objectives:
  - Expresar y simplificar razones y resolver proporciones
  - Distinguir magnitudes directa e inversamente proporcionales y aplicar la regla de tres simple
  - Convertir unidades con factores de conversión y calcular errores absoluto y relativo
prerequisites: [matematicas-m00-l06]
skill_ids: [ratios, rule_of_three, measurement_error]
exam_alignment: [arithmetica-algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Muchos problemas del examen empiezan con una relación entre dos cantidades: «a más horas, más producción», «a más operarios, menos tiempo», «la escala del plano es 1:200». En esta lección aprenderás a escribir esas relaciones como razones y proporciones, a decidir si dos magnitudes son directa o inversamente proporcionales, a resolverlas con la regla de tres, a convertir unidades sin perder ceros y a medir lo buena que es una aproximación con el error absoluto y el relativo. Es la última pieza del bloque de rescate aritmético.

## 2. Lo que necesitas saber antes

- Fracciones equivalentes y productos cruzados (M00-L03): $\dfrac{a}{b}=\dfrac{c}{d}\iff ad=bc$.
- Decimales, porcentajes y redondeo (M00-L05).
- Potencias de 10 y notación científica (M00-L06).

## 3. Idea intuitiva

Si una receta pide 2 tazas de harina por cada 3 huevos, la **razón** harina:huevos es 2:3. Si quieres hacer más, mantienes la razón: 4 tazas con 6 huevos. Esa igualdad de razones, $\dfrac{2}{3}=\dfrac{4}{6}$, es una **proporción**.

Dos magnitudes son **directamente proporcionales** si al duplicar una se duplica la otra (kilos y precio). Son **inversamente proporcionales** si al duplicar una la otra se reduce a la mitad (número de máquinas iguales y tiempo para terminar un trabajo fijo). Antes de calcular, pregúntate siempre: «si una aumenta, ¿la otra aumenta o disminuye?».

## 4. Definición precisa

- **Razón** entre $a$ y $b$ ($b\neq0$): el cociente $\dfrac{a}{b}$, también escrito $a:b$. Compara dos cantidades.
- **Proporción**: igualdad de dos razones, $\dfrac{a}{b}=\dfrac{c}{d}$. Se cumple $a\cdot d=b\cdot c$, lo que permite hallar un término desconocido.
- **Escala**: razón entre una medida en el plano y la real. Escala $1:200$ → 1 cm en el plano son 200 cm (2 m) en la realidad.
- **Proporcionalidad directa**: $\dfrac{y}{x}=k$ constante. Si $x$ se multiplica por un número, $y$ se multiplica por el mismo.
- **Proporcionalidad inversa**: $x\cdot y=k$ constante. Si $x$ se multiplica por un número, $y$ se divide por él.
- **Regla de tres simple directa**: si $a\to b$, entonces $c\to x$ con $x=\dfrac{b\cdot c}{a}$.
- **Regla de tres simple inversa**: si $a\to b$, entonces $c\to x$ con $x=\dfrac{a\cdot b}{c}$.
- **Factor de conversión**: fracción igual a 1 con unidades distintas, por ejemplo $\dfrac{1000\text{ m}}{1\text{ km}}$. Se coloca de modo que la unidad que quieres eliminar quede en el denominador.
- **Error absoluto**: $E_a=|\text{valor medido o aproximado}-\text{valor real}|$. Tiene unidades.
- **Error relativo**: $E_r=\dfrac{E_a}{|\text{valor real}|}$, sin unidades; suele darse en porcentaje. Mide la calidad de la aproximación: un error de 1 cm es enorme al medir un tornillo y despreciable al medir una nave.
- **Cota de error del redondeo**: al redondear a las décimas, el error absoluto es como máximo $0{,}05$; a las centésimas, $0{,}005$.

**Por qué la regla de tres directa funciona.** En proporcionalidad directa, $\dfrac{b}{a}=\dfrac{x}{c}$ (misma constante), y despejando $x=\dfrac{bc}{a}$. En la inversa, $a\cdot b=c\cdot x$ (mismo producto), y $x=\dfrac{ab}{c}$. No hay que memorizar flechas: basta con saber qué se conserva, el cociente o el producto.

**Unidades compuestas.** Velocidades (km/h), caudales (L/min) o precios (€/kg) son razones entre dos magnitudes. Para convertirlas, convierte por separado el numerador y el denominador con un factor cada uno, como en el ejercicio de toneladas por hora a kilogramos por minuto.

**Atención**: no todas las relaciones son proporcionales. Una tarifa con cuota fija (5 € + 2 €/km) no lo es: 10 km cuestan 25 €, pero 20 km no cuestan 50 €. Comprueba siempre si el cociente (o el producto) es constante.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Regla de tres directa
Una carretilla consume 6 kWh en 4 horas. ¿Cuánto consume en 10 horas al mismo ritmo?

Más horas → más consumo: directa. $x=\dfrac{6\cdot10}{4}=15$ kWh.
:::

:::ejemplo Ejemplo 2 · Regla de tres inversa
Cinco operarios descargan un contenedor en 6 horas. ¿Cuánto tardarían 3 operarios al mismo ritmo?

Menos operarios → más tiempo: inversa. Se conserva el producto $5\cdot6=30$ horas-operario. $x=\dfrac{30}{3}=10$ horas.
:::

:::ejemplo Ejemplo 3 · Conversión y error relativo
Se estima que un palé mide 1,2 m de largo; la medida exacta es 118 cm. Calcula los errores absoluto y relativo.

1. Mismas unidades: $1{,}2\text{ m}=120$ cm.
2. $E_a=|120-118|=2$ cm.
3. $E_r=\dfrac{2}{118}\approx0{,}0169$ → $1{,}69\,\%$.
:::

:::error Error típico
Aplicar una regla de tres directa a una relación inversa: «si 5 operarios tardan 6 h, 3 operarios tardan $\dfrac{6\cdot3}{5}=3{,}6$ h». El resultado dice que menos gente termina antes, lo que no tiene sentido. Otro error: calcular el error relativo dividiendo por el valor aproximado en lugar del real.
:::

## 6. Ejercicio guiado

En un plano a escala $1:250$, un pasillo mide 6,4 cm. ¿Cuántos metros mide en la realidad?

:::pista Primera pista
1 cm del plano equivale a 250 cm reales. Multiplica 6,4 por 250.
:::

:::pista Segunda pista
Obtienes centímetros. Pasa a metros dividiendo entre 100.
:::

:::solucion Solución guiada
$6{,}4\cdot250=1600$ cm $=16$ m. Comprobación de sentido: un pasillo de 16 m en una nave es razonable.
:::

## 7. Práctica

**Fáciles**

1. Simplifica la razón $45:60$.
2. Halla $x$ en $\dfrac{3}{8}=\dfrac{x}{56}$.
3. Si 3 kg de un producto cuestan 7,50 €, ¿cuánto cuestan 8 kg?

**Medios**

4. Un trabajo lo hacen 4 máquinas iguales en 15 días. ¿Cuántos días tardarían 6 máquinas?
5. Convierte 2,5 toneladas por hora a kilogramos por minuto.

**Tipo examen / transferencia**

6. Un inventario estima 2.450 unidades en una ubicación y el recuento real da 2.500. Otro estima 96 y el real es 100. Calcula los errores absoluto y relativo de cada uno y explica cuál es mejor estimación.

:::solucion Soluciones paso a paso
1. MCD 15 → $3:4$.
2. $3\cdot56=8x$ → $x=21$.
3. Directa: $\dfrac{7{,}50\cdot8}{3}=20$ €.
4. Inversa: $4\cdot15=60$ → $\dfrac{60}{6}=10$ días.
5. $2{,}5\,\dfrac{\text{t}}{\text{h}}\cdot\dfrac{1000\text{ kg}}{1\text{ t}}\cdot\dfrac{1\text{ h}}{60\text{ min}}=\dfrac{2500}{60}\approx41{,}67$ kg/min.
6. Primero: $E_a=50$ unidades, $E_r=\dfrac{50}{2500}=2\,\%$. Segundo: $E_a=4$ unidades, $E_r=\dfrac{4}{100}=4\,\%$. Aunque el primer error absoluto es mayor, la **primera** estimación es mejor porque su error relativo es menor.
:::

## 8. Cómo revisar tus errores

- Antes de calcular, decide si la relación es directa, inversa o ninguna, y comprueba el sentido del resultado.
- Escribe las unidades en cada factor de conversión y comprueba que se simplifican.
- El error relativo se calcula sobre el valor real y no tiene unidades.
- Comprueba una proporción con productos cruzados.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Razón $\dfrac ab$; proporción $\dfrac ab=\dfrac cd\iff ad=bc$.
- Directa: cociente constante, $x=\dfrac{bc}{a}$. Inversa: producto constante, $x=\dfrac{ab}{c}$.
- Conversión con factores iguales a 1.
- $E_a=|\text{aprox}-\text{real}|$; $E_r=\dfrac{E_a}{|\text{real}|}$.

**Vocabulario:** razón, proporción, escala, magnitudes directa e inversamente proporcionales, constante de proporcionalidad, factor de conversión, error absoluto, error relativo.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, inventa un problema directo y otro inverso con datos de tu trabajo y comprueba si el resultado tiene sentido.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N0 (rescate, 1.º–2.º ESO). Base de la proporcionalidad algebraica (M01-L04), de la lectura de problemas (M01-L07) y del cálculo de errores en Física (F01-L04).
