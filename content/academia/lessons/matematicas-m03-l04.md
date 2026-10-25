---
id: matematicas-m03-l04
course: matematicas
module: M03
level: N2
title: Interés simple y compuesto, TAE y amortización de préstamos
learning_objectives:
  - Calcular intereses y capitales finales en capitalización simple y compuesta
  - Convertir un tipo nominal con capitalización periódica en TAE y comparar ofertas
  - Calcular la cuota constante de un préstamo (sistema francés) e interpretar su cuadro de amortización
prerequisites: [matematicas-m03-l02, matematicas-m03-l03, matematicas-m00-l05]
skill_ids: [simple_interest, compound_interest, loan_amortization]
exam_alignment: [sucesiones, matematica-financiera]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Esta lección aplica las progresiones al dinero. El **interés simple** crece como una progresión aritmética; el **compuesto**, como una geométrica. Aprenderás a calcular cuánto vale una inversión al cabo de unos años, a comparar ofertas bancarias con la **TAE** y a entender cómo se calcula la cuota de un préstamo o una hipoteca y qué parte de cada cuota son intereses. Es contenido directamente útil en tu vida, aparece en problemas de contexto del examen de Matemáticas +25 y enlaza con el VAN y la TIR de Economía de la Empresa (B05).

## 2. Lo que necesitas saber antes

- Porcentajes e índice de variación (M00-L05): subir un 4 % es multiplicar por $1{,}04$.
- Progresiones aritméticas y geométricas (M03-L02) y sus sumas (M03-L03).
- Potencias de exponente negativo (M00-L06): $1{,}06^{-3}=\dfrac{1}{1{,}06^3}$.

## 3. Idea intuitiva

Si depositas 1.000 € al 5 % de **interés simple**, cada año cobras 50 €, siempre calculados sobre los 1.000 € iniciales. Al cabo de 10 años tienes 1.500 €: crecimiento en línea recta.

Con **interés compuesto**, los intereses de cada año se suman al capital y al año siguiente también generan intereses («intereses de los intereses»). El primer año ganas 50 €, el segundo 52,50 €, el tercero 55,13 €… Al cabo de 10 años tienes 1.628,89 €. Al principio la diferencia es pequeña, pero con muchos años se dispara. Lo mismo ocurre, en sentido contrario, con las deudas de tarjetas de crédito.

Un préstamo funciona al revés: el banco te adelanta el capital y tú lo devuelves con cuotas. En el sistema más común (francés), todas las cuotas son iguales, pero al principio casi toda la cuota son intereses y al final casi toda es capital.

## 4. Definición precisa

Notación: $C_0$ capital inicial, $i$ tipo de interés por periodo (en tanto por uno: 5 % → $0{,}05$), $n$ número de periodos, $C_n$ capital final.

**Capitalización simple**
- Intereses: $I=C_0\cdot i\cdot n$.
- Capital final: $C_n=C_0(1+i\,n)$. Los capitales forman una PA de diferencia $C_0\,i$.
- Se usa en operaciones a corto plazo (menos de un año).

**Capitalización compuesta**
- Capital final: $C_n=C_0(1+i)^{n}$. Los capitales forman una PG de razón $1+i$.
- Capital inicial (actualizar o descontar): $C_0=\dfrac{C_n}{(1+i)^n}=C_n(1+i)^{-n}$. Es exactamente lo que se hace al calcular el VAN.
- **El tipo y el periodo deben coincidir.** Si el tipo es anual y se capitaliza cada mes, el tipo mensual es $\dfrac{i_{\text{anual}}}{12}$ y el número de periodos es $12\cdot$años.

**TAE (tasa anual equivalente).** Es el tipo anual que, con capitalización anual, produce lo mismo que la oferta real. Si el tipo nominal anual $j$ se capitaliza $m$ veces al año:
$$\text{TAE}=\left(1+\frac{j}{m}\right)^{m}-1.$$
Sirve para **comparar** ofertas con distintas frecuencias de capitalización. En España, las entidades están obligadas a informar de la TAE de sus productos.

**Préstamo con cuota constante (sistema francés).** Un préstamo $C$ a devolver en $n$ cuotas iguales al tipo $i$ por periodo tiene cuota
$$a=\frac{C\cdot i}{1-(1+i)^{-n}}.$$
En cada periodo: **intereses** = capital pendiente × $i$; **amortización** (capital devuelto) = cuota − intereses; el capital pendiente baja en esa amortización. Por eso la parte de intereses disminuye y la de capital aumenta con el tiempo.

**Por qué la fórmula de la cuota.** El valor actual de todas las cuotas debe igualar el préstamo: $C=\dfrac{a}{1+i}+\dfrac{a}{(1+i)^2}+\dots+\dfrac{a}{(1+i)^n}$. Es una suma geométrica de razón $\dfrac{1}{1+i}$ (M03-L03); al sumarla y despejar $a$ se obtiene la fórmula. Es decir: un préstamo es un problema de progresiones.

**Regla práctica del 72.** Un capital al $p\,\%$ compuesto se duplica en unos $\dfrac{72}{p}$ periodos. Al 6 %, unos 12 años. Es una estimación rápida; el valor exacto se calcula con logaritmos (M04-L06).

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Simple frente a compuesto
Se invierten 5.000 € al 4 % anual durante 3 años. Compara capitalización simple y compuesta.

1. Simple: $I=5000\cdot0{,}04\cdot3=600$ € → $C_3=5.600$ €.
2. Compuesta: $C_3=5000\cdot1{,}04^3=5.624{,}32$ €.
3. Diferencia: 24,32 € a favor de la compuesta (los intereses de los intereses).
:::

:::ejemplo Ejemplo 2 · Capitalización mensual y TAE
Un depósito ofrece un 6 % nominal anual con capitalización mensual. Calcula su TAE.

Tipo mensual: $0{,}06:12=0{,}005$. $\text{TAE}=1{,}005^{12}-1\approx0{,}061678$ → **6,17 %**. Es algo mayor que el 6 % nominal porque los intereses se capitalizan cada mes.
:::

:::ejemplo Ejemplo 3 · Cuota y cuadro de amortización
Préstamo de 10.000 € al 6 % anual en 3 cuotas anuales iguales.

1. $a=\dfrac{10000\cdot0{,}06}{1-1{,}06^{-3}}\approx3.741{,}10$ €.
2. Cuadro:

| Año | Intereses | Amortización | Pendiente |
|---|---|---|---|
| 1 | 600,00 | 3.141,10 | 6.858,90 |
| 2 | 411,53 | 3.329,57 | 3.529,33 |
| 3 | 211,76 | 3.529,34 | ≈ 0 |

3. Total pagado: $3\cdot3741{,}10=11.223{,}30$ €; intereses totales ≈ 1.223,30 €. (La diferencia de un céntimo en la última fila se debe al redondeo.)
:::

:::error Error típico
Mezclar periodos: usar un tipo **anual** con $n$ en **meses**. Con 6 % anual mensual durante 3 años, $i=0{,}005$ y $n=36$, no $i=0{,}06$ y $n=36$. Otro error: calcular intereses compuestos sumando cada año el 4 % del capital **inicial**; eso es interés simple.
:::

## 6. Ejercicio guiado

¿Cuántos años completos tarda en duplicarse un capital al 5 % compuesto anual?

:::pista Primera pista
Plantea $C_0\cdot1{,}05^{\,n}=2C_0$, es decir, $1{,}05^{\,n}=2$.
:::

:::pista Segunda pista
Prueba valores: $1{,}05^{10}\approx1{,}63$, $1{,}05^{14}\approx1{,}98$, $1{,}05^{15}\approx2{,}08$. (Con logaritmos: $n=\dfrac{\log2}{\log1{,}05}$.)
:::

:::solucion Solución guiada
$n=\dfrac{\log2}{\log1{,}05}\approx14{,}2$. Hacen falta **15 años completos**. La regla del 72 estimaba $72:5=14{,}4$ años: muy cerca.
:::

## 7. Práctica

**Fáciles**

1. Intereses de 2.000 € al 3 % simple durante 5 años.
2. Capital final de 2.000 € al 3 % compuesto durante 5 años.
3. TAE de un 12 % nominal anual con capitalización mensual.

**Medios**

4. ¿Qué capital hay que invertir hoy al 5 % compuesto anual para tener 10.000 € dentro de 4 años?
5. Una ciudad de 50.000 habitantes crece un 2 % anual. ¿Cuántos tendrá en 10 años?

**Tipo examen / transferencia**

6. Un préstamo de 12.000 € al 5 % anual se devuelve en 4 cuotas anuales iguales. Calcula la cuota, el total de intereses y la parte de capital amortizada en la primera cuota. Explica por qué esa parte aumenta en las siguientes cuotas.

:::solucion Soluciones paso a paso
1. $2000\cdot0{,}03\cdot5=300$ €.
2. $2000\cdot1{,}03^5\approx2.318{,}55$ €.
3. $1{,}01^{12}-1\approx12{,}68\,\%$.
4. $C_0=\dfrac{10000}{1{,}05^4}\approx8.227{,}02$ €.
5. $50000\cdot1{,}02^{10}\approx60.950$ habitantes.
6. $a=\dfrac{12000\cdot0{,}05}{1-1{,}05^{-4}}\approx3.384{,}14$ €. Total pagado ≈ 13.536,57 €; intereses ≈ 1.536,57 €. Primer año: intereses $12000\cdot0{,}05=600$ €, amortización $3384{,}14-600=2.784{,}14$ €. Como el capital pendiente baja, los intereses de cada año son menores y, con cuota fija, la parte de capital crece.
:::

## 8. Cómo revisar tus errores

- Escribe $i$ en tanto por uno y comprueba que $i$ y $n$ usan el mismo periodo.
- Estima: el compuesto debe dar algo más que el simple con los mismos datos.
- En un cuadro de amortización, la suma de las amortizaciones debe ser el capital prestado.
- Redondea solo al final para evitar descuadres.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Simple: $C_n=C_0(1+in)$ (PA). Compuesto: $C_n=C_0(1+i)^n$ (PG).
- TAE $=(1+j/m)^m-1$ para comparar ofertas.
- Cuota francesa $a=\dfrac{Ci}{1-(1+i)^{-n}}$; intereses decrecientes, amortización creciente.

**Vocabulario:** capital, tipo de interés, capitalización simple y compuesta, actualizar, tipo nominal, TAE, cuota, amortización, capital pendiente, cuadro de amortización.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, compara dos ofertas con su TAE y calcula la cuota de un préstamo pequeño con su primera fila del cuadro.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de sucesiones y aplicaciones del temario oficial de Matemáticas +25; conecta con la financiación y la inversión de Economía de la Empresa (B04, B05). Ningún ejemplo es una recomendación financiera.
