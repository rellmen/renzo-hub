---
id: fisica-f08-l01
course: fisica
module: F08
level: N2
title: Corriente eléctrica, ley de Ohm y circuitos
learning_objectives:
  - Relacionar intensidad, diferencia de potencial y resistencia con la ley de Ohm
  - Calcular resistencias equivalentes en serie y en paralelo
  - Calcular potencia y energía disipada (efecto Joule) y aplicar la ley de Ohm generalizada con FEM y resistencia interna
prerequisites: [fisica-f01-l01]
skill_ids: [ohm_law, resistor_networks, joule_power]
exam_alignment: [electricidad]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/fisica/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Cada aparato que enchufas es un circuito: una fuente de energía empuja cargas a través de elementos que la transforman en luz, calor o movimiento. En esta lección aprenderás las magnitudes eléctricas básicas, la ley de Ohm, cómo combinar resistencias en serie y en paralelo, cómo calcular la potencia y la energía consumida, y cómo tener en cuenta la resistencia interna de un generador. Los problemas de circuitos del examen de Física +25 se resuelven casi siempre con estas herramientas y un esquema bien dibujado.

## 2. Lo que necesitas saber antes

- Unidades SI y prefijos (F01-L01): $1\text{ mA}=10^{-3}$ A, $1\text{ k}\Omega=10^3\ \Omega$.
- Operar con fracciones y sus inversas (M00-L04): $\dfrac{1}{6}+\dfrac{1}{3}=\dfrac{1}{2}$.
- Despejar en una fórmula de tres letras.

## 3. Idea intuitiva

Piensa en una red de tuberías. La **diferencia de potencial** (voltaje) es como la diferencia de presión que empuja el agua; la **intensidad** es el caudal (cuánta agua pasa por segundo); la **resistencia** es lo estrecha que es la tubería. Con más presión pasa más caudal; con una tubería más estrecha pasa menos. Eso es la ley de Ohm.

Si pones dos tuberías estrechas **una detrás de otra** (serie), el agua tiene más dificultad: las resistencias se suman. Si las pones **una al lado de otra** (paralelo), el agua tiene dos caminos y pasa más fácilmente: la resistencia total baja, por debajo incluso de la menor de ellas.

## 4. Definición precisa

- **Intensidad de corriente:** carga que atraviesa una sección por unidad de tiempo, $I=\dfrac{Q}{t}$. Unidad: amperio (A) = C/s.
- **Diferencia de potencial** (tensión) $V$ entre dos puntos: energía por unidad de carga. Unidad: voltio (V) = J/C.
- **Resistencia** $R$: oposición al paso de la corriente. Unidad: ohmio (Ω).
- **Ley de Ohm** (para un conductor óhmico): $V=I\cdot R$.
- **Resistencias en serie** (misma intensidad por todas): $R_{eq}=R_1+R_2+\dots$. La tensión total se reparte: $V=V_1+V_2+\dots$
- **Resistencias en paralelo** (misma tensión en todas): $\dfrac{1}{R_{eq}}=\dfrac{1}{R_1}+\dfrac{1}{R_2}+\dots$. La intensidad se reparte: $I=I_1+I_2+\dots$ Para dos resistencias: $R_{eq}=\dfrac{R_1R_2}{R_1+R_2}$.
- **Potencia eléctrica:** $P=V\cdot I=I^2R=\dfrac{V^2}{R}$, en vatios (W).
- **Energía:** $E=P\cdot t$, en julios (J). En facturas se usa el kWh: $1\text{ kWh}=3{,}6\cdot10^6$ J.
- **Efecto Joule:** la energía eléctrica que se transforma en calor en una resistencia, $E=I^2Rt$.
- **Generador real:** tiene una **fuerza electromotriz** $\varepsilon$ (V) y una **resistencia interna** $r$. La intensidad del circuito es $I=\dfrac{\varepsilon}{R_{ext}+r}$ (ley de Ohm generalizada) y la tensión en sus bornes es $V=\varepsilon-I\,r$.
- **Leyes de Kirchhoff:** (1) **nudos:** la suma de intensidades que entran en un nudo es igual a la suma de las que salen (la carga se conserva); (2) **mallas:** en un camino cerrado, la suma de FEM es igual a la suma de las caídas de tensión $I\cdot R$ (la energía se conserva). Las fórmulas de serie y paralelo son consecuencias de estas dos leyes.

**Por qué la resistencia en paralelo es menor que la menor de ellas.** Añadir una rama en paralelo abre un camino más para la corriente: con la misma tensión, la intensidad total aumenta y, por la ley de Ohm, la resistencia equivalente $V/I$ disminuye.

**Procedimiento con circuitos mixtos:** dibuja el esquema; reduce primero los grupos que estén claramente en paralelo o en serie; calcula la intensidad total con la resistencia equivalente; vuelve hacia atrás repartiendo tensiones e intensidades.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Serie
Una pila de 12 V alimenta $R_1=4\ \Omega$ y $R_2=8\ \Omega$ en serie. Calcula $I$ y la tensión en cada resistencia.

1. $R_{eq}=12\ \Omega$; $I=\dfrac{12}{12}=1$ A.
2. $V_1=1\cdot4=4$ V; $V_2=1\cdot8=8$ V. Suma $12$ V. ✔
:::

:::ejemplo Ejemplo 2 · Paralelo
Las mismas resistencias se conectan en paralelo a la pila de 12 V. Calcula $R_{eq}$, la intensidad en cada rama y la total.

1. $R_{eq}=\dfrac{4\cdot8}{4+8}=\dfrac{32}{12}\approx2{,}67\ \Omega$ (menor que 4 Ω).
2. $I_1=\dfrac{12}{4}=3$ A; $I_2=\dfrac{12}{8}=1{,}5$ A; $I=4{,}5$ A.
Comprobación: $\dfrac{12}{2{,}67}\approx4{,}5$ A. ✔
:::

:::ejemplo Ejemplo 3 · Potencia y coste
Un radiador de 2000 W funciona 3 horas al día durante 30 días. El kWh cuesta 0,25 €. ¿Cuánto cuesta? Si está conectado a 230 V, ¿qué intensidad consume?

1. Energía: $2\text{ kW}\cdot90\text{ h}=180$ kWh → $180\cdot0{,}25=45$ €.
2. $I=\dfrac{P}{V}=\dfrac{2000}{230}\approx8{,}7$ A.
:::

:::error Error típico
Sumar directamente las resistencias en paralelo ($4+8=12\ \Omega$) o sumar sus inversas y olvidar invertir el resultado: $\dfrac14+\dfrac18=\dfrac38$, así que $R_{eq}=\dfrac{8}{3}\ \Omega$, no $\dfrac{3}{8}\ \Omega$. Otro error: usar mA o kΩ en la ley de Ohm sin convertir.
:::

## 6. Ejercicio guiado

Una batería de $\varepsilon=9$ V y $r=0{,}5\ \Omega$ alimenta una resistencia de $4\ \Omega$. Calcula la intensidad, la tensión en bornes y la potencia disipada en la resistencia exterior.

:::pista Primera pista
Ley de Ohm generalizada: la resistencia interna se suma a la exterior.
:::

:::pista Segunda pista
$I=\dfrac{9}{4+0{,}5}$. Después, $V=\varepsilon-Ir$ y $P=I^2R$.
:::

:::solucion Solución guiada
$I=\dfrac{9}{4{,}5}=2$ A. $V=9-2\cdot0{,}5=8$ V (comprobación: $2\cdot4=8$ V ✔). $P=2^2\cdot4=16$ W.
:::

## 7. Práctica

**Fáciles**

1. Por una resistencia de 220 Ω circulan 50 mA. ¿Qué tensión hay entre sus extremos?
2. Calcula la resistencia equivalente de 10 Ω, 20 Ω y 30 Ω en serie.
3. Una bombilla de 230 V consume 0,26 A. ¿Qué potencia tiene?

**Medios**

4. Calcula la resistencia equivalente de 6 Ω y 3 Ω en paralelo y la intensidad total si se conectan a 12 V.
5. Una resistencia de 6 Ω en serie con un paralelo de 6 Ω y 3 Ω se conecta a 24 V. Calcula la intensidad total y la intensidad por la rama de 3 Ω.

**Tipo examen / transferencia**

6. Un cargador de carretillas eléctricas funciona a 230 V y 13 A durante 6 horas por noche, 22 noches al mes. Calcula la potencia, la energía mensual en kWh y el coste a 0,22 €/kWh.

:::solucion Soluciones paso a paso
1. $V=0{,}05\cdot220=11$ V.
2. $60\ \Omega$.
3. $P=230\cdot0{,}26=59{,}8$ W ≈ 60 W.
4. $R_{eq}=\dfrac{18}{9}=2\ \Omega$; $I=\dfrac{12}{2}=6$ A.
5. Paralelo: $2\ \Omega$; total $6+2=8\ \Omega$; $I=\dfrac{24}{8}=3$ A. Tensión en el paralelo: $3\cdot2=6$ V; rama de 3 Ω: $\dfrac{6}{3}=2$ A (y la de 6 Ω, 1 A; suma 3 A ✔).
6. $P=230\cdot13=2990$ W $\approx2{,}99$ kW. Horas: $6\cdot22=132$ h. Energía: $2{,}99\cdot132\approx394{,}7$ kWh. Coste: $394{,}7\cdot0{,}22\approx86{,}83$ €.
:::

## 8. Cómo revisar tus errores

- La resistencia equivalente en paralelo debe ser **menor** que la menor de las ramas; en serie, mayor que la mayor.
- Comprueba con Kirchhoff: en serie, las tensiones suman la total; en paralelo, las intensidades suman la total.
- Convierte mA, kΩ y kW antes de sustituir.
- Revisa la unidad final: V, A, Ω, W, J o kWh.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $V=IR$; serie $R_{eq}=\sum R_i$; paralelo $\dfrac{1}{R_{eq}}=\sum\dfrac{1}{R_i}$.
- $P=VI=I^2R=\dfrac{V^2}{R}$; $E=Pt$; $1\text{ kWh}=3{,}6\cdot10^6$ J.
- Generador real: $I=\dfrac{\varepsilon}{R+r}$, $V=\varepsilon-Ir$.
- Kirchhoff: conservación de la carga (nudos) y de la energía (mallas).

**Vocabulario:** intensidad, tensión, resistencia, ohmio, serie, paralelo, resistencia equivalente, potencia, efecto Joule, fuerza electromotriz, resistencia interna, nudo, malla.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un circuito mixto y calcula el coste de un aparato de casa.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (Bachillerato). Alineado con el bloque de corriente eléctrica del temario oficial de Física +25; enlaza con electrostática (F07) y magnetismo (F09).
