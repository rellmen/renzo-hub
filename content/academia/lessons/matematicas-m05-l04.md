---
id: matematicas-m05-l04
course: matematicas
module: M05
level: N2
title: Aplicaciones de la trigonometría a la geometría
learning_objectives:
  - Calcular áreas de polígonos regulares, paralelogramos y sectores circulares con trigonometría
  - Descomponer un vector o una fuerza en componentes horizontal y vertical
  - Resolver problemas de distancias inaccesibles con doble observación y con el teorema del seno
prerequisites: [matematicas-m05-l02, matematicas-m05-l01]
skill_ids: [trig_geometry, vector_components, inaccessible_distances]
exam_alignment: [trigonometria, geometria]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Esta lección cierra el módulo de trigonometría aplicándolo a problemas geométricos y físicos: el área de figuras que no son rectángulos, la longitud y el área de un sector circular, la descomposición de fuerzas y velocidades en componentes, y el cálculo de alturas y anchuras a las que no se puede llegar directamente (un río, un edificio lejano). Son problemas típicos del examen de Matemáticas +25 y preparan la geometría con vectores (M06, M07) y la dinámica de Física (F03).

## 2. Lo que necesitas saber antes

- Radianes y longitud de arco (M05-L01).
- Resolución de triángulos, teoremas del seno y del coseno, área con dos lados y el ángulo (M05-L02).
- Vectores y sus componentes (M06-L01).

## 3. Idea intuitiva

Casi cualquier figura se puede dividir en triángulos, y de un triángulo ya sabes calcular todo. Un hexágono regular son seis triángulos equiláteros; un paralelogramo, dos triángulos iguales. Un sector circular es como un trozo de pizza: su área es una fracción del círculo proporcional al ángulo.

Una fuerza inclinada se puede pensar como dos fuerzas: una que empuja en horizontal y otra que tira hacia arriba. Las razones trigonométricas dicen cuánto vale cada una. Y para medir algo inaccesible, la estrategia es siempre la misma: construir un triángulo con algún lado medible y ángulos que se puedan observar.

## 4. Definición precisa

**Áreas con trigonometría:**
- **Triángulo**: $\dfrac12\,a\,b\,\sin C$.
- **Paralelogramo** de lados $a$ y $b$ que forman un ángulo $\alpha$: $a\,b\,\sin\alpha$ (dos triángulos iguales).
- **Polígono regular** de $n$ lados de longitud $l$: se divide en $n$ triángulos isósceles con vértice en el centro, cuyo ángulo central es $\dfrac{360^\circ}{n}$. La **apotema** (altura de esos triángulos) es $ap=\dfrac{l}{2\tan\left(\frac{180^\circ}{n}\right)}$ y el área es $\dfrac{\text{perímetro}\cdot ap}{2}$.
- **Hexágono regular** de lado $l$: seis triángulos equiláteros, área $\dfrac{3\sqrt3}{2}\,l^2$.

**Sector circular** de radio $r$ y ángulo central $\theta$ **en radianes**:
$$\text{arco}=r\,\theta,\qquad \text{área}=\frac12\,r^2\,\theta.$$
(Con $\theta=2\pi$ se recuperan la longitud $2\pi r$ y el área $\pi r^2$.)

**Componentes de un vector.** Un vector de módulo $F$ que forma un ángulo $\alpha$ con el eje horizontal tiene componentes
$$F_x=F\cos\alpha,\qquad F_y=F\sin\alpha.$$
Al revés, de las componentes se obtienen el módulo $F=\sqrt{F_x^2+F_y^2}$ y el ángulo con $\tan\alpha=\dfrac{F_y}{F_x}$ (mirando el cuadrante).

**Distancias inaccesibles.**
- **Doble observación** (altura de un objeto cuya base no se puede alcanzar): desde dos puntos alineados con la base y separados $d$, se miden ángulos de elevación $\alpha<\beta$. Con $h$ la altura y $x$ la distancia del punto más cercano a la base: $h=x\tan\beta$ y $h=(x+d)\tan\alpha$. Resolviendo el sistema, $h=\dfrac{d}{\cot\alpha-\cot\beta}$, donde $\cot=\dfrac1{\tan}$.
- **Puntos al otro lado de un obstáculo**: se mide una base $AB$ en tu lado y los ángulos que forman las visuales hacia el punto $T$; el triángulo $ABT$ se resuelve con el teorema del seno.

**Por qué el área del sector es $\frac12r^2\theta$.** El sector ocupa la fracción $\dfrac{\theta}{2\pi}$ del círculo completo, así que su área es $\dfrac{\theta}{2\pi}\cdot\pi r^2=\dfrac12r^2\theta$. Por eso conviene trabajar en radianes: la fórmula queda limpia, igual que la del arco.

**Estrategia general para problemas geométricos.** (1) Haz un dibujo grande y rotula los datos. (2) Busca triángulos, mejor rectángulos. (3) Decide qué teorema usar según los datos (M05-L02). (4) Calcula con todos los decimales y redondea al final. (5) Comprueba el orden de magnitud con el dibujo.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Hexágono regular
Calcula el área de un hexágono regular de lado 4 cm.

$\dfrac{3\sqrt3}{2}\cdot16=24\sqrt3\approx41{,}57$ cm². Comprobación con la apotema: $ap=\dfrac{4}{2\tan30^\circ}=2\sqrt3$; $\dfrac{24\cdot2\sqrt3}{2}=24\sqrt3$. ✔
:::

:::ejemplo Ejemplo 2 · Doble observación
Desde un punto se ve la cima de una torre con 30° de elevación; tras acercarse 20 m, con 45°. Calcula la altura.

$h=\dfrac{20}{\cot30^\circ-\cot45^\circ}=\dfrac{20}{\sqrt3-1}\approx27{,}32$ m. Comprobación: desde el segundo punto, $x=h=27{,}32$ (porque $\tan45^\circ=1$) y desde el primero $\dfrac{27{,}32}{47{,}32}\approx0{,}577=\tan30^\circ$. ✔
:::

:::ejemplo Ejemplo 3 · Sector circular
Calcula el arco y el área de un sector de radio 6 m y ángulo 60°.

$60^\circ=\dfrac\pi3$. Arco $=6\cdot\dfrac\pi3=2\pi\approx6{,}28$ m. Área $=\dfrac12\cdot36\cdot\dfrac\pi3=6\pi\approx18{,}85$ m².
:::

:::error Error típico
Usar el ángulo en grados en $\frac12r^2\theta$: con $\theta=60$ saldría un área de 1.080 m², absurda para un radio de 6 m. Otro error: confundir las componentes y escribir $F_x=F\sin\alpha$ cuando el ángulo se mide desde la horizontal.
:::

## 6. Ejercicio guiado

Se arrastra una caja con una cuerda que forma 30° con el suelo y una fuerza de 50 N. Calcula las componentes horizontal y vertical de la fuerza.

:::pista Primera pista
El ángulo se mide desde la horizontal: la componente horizontal lleva el coseno.
:::

:::pista Segunda pista
$F_x=50\cos30^\circ$ y $F_y=50\sin30^\circ$.
:::

:::solucion Solución guiada
$F_x\approx43{,}30$ N (la que mueve la caja) y $F_y=25$ N (la que tira hacia arriba). Comprobación: $\sqrt{43{,}30^2+25^2}\approx50$. ✔
:::

## 7. Práctica

**Fáciles**

1. Área de un sector de radio 10 cm y ángulo 1,2 rad.
2. Componentes de un vector de módulo 10 que forma 60° con la horizontal.
3. Área de un pentágono regular de lado 2 cm.

**Medios**

4. Área de un paralelogramo de lados 6 y 9 que forman 40°.
5. Un vector tiene componentes $(-3,4)$. Calcula su módulo y el ángulo que forma con el semieje horizontal positivo.

**Tipo examen / transferencia**

6. Para medir la anchura de un río, desde dos puntos A y B de la misma orilla, separados 50 m, se observa un árbol T de la otra orilla. Los ángulos $\widehat{TAB}=60^\circ$ y $\widehat{TBA}=80^\circ$. Calcula la distancia AT y la anchura del río (distancia de T a la recta AB).

:::solucion Soluciones paso a paso
1. $\dfrac12\cdot100\cdot1{,}2=60$ cm².
2. $(10\cos60^\circ,\ 10\sin60^\circ)=(5;\ 8{,}66)$.
3. $ap=\dfrac{2}{2\tan36^\circ}\approx1{,}376$; área $=\dfrac{10\cdot1{,}376}{2}\approx6{,}88$ cm².
4. $6\cdot9\cdot\sin40^\circ\approx34{,}71$.
5. Módulo $\sqrt{9+16}=5$. II cuadrante, referencia $\arctan\dfrac43\approx53{,}13^\circ$ → ángulo $\approx126{,}87^\circ$.
6. Ángulo en T: $40^\circ$. $AT=\dfrac{50\sin80^\circ}{\sin40^\circ}\approx76{,}60$ m. Anchura $=AT\sin60^\circ\approx66{,}34$ m.
:::

## 8. Cómo revisar tus errores

- En sectores, trabaja en radianes.
- Comprueba las componentes recomponiendo el módulo con Pitágoras.
- En problemas con dos observaciones, verifica el resultado con uno de los ángulos.
- Dibuja a escala aproximada para detectar resultados absurdos.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Áreas: triángulo $\frac12ab\sin C$; paralelogramo $ab\sin\alpha$; polígono regular $\frac{P\cdot ap}{2}$.
- Sector: arco $r\theta$, área $\frac12r^2\theta$ (radianes).
- Componentes: $F\cos\alpha$, $F\sin\alpha$.
- Distancias inaccesibles: doble observación o teorema del seno.

**Vocabulario:** apotema, polígono regular, sector circular, componente, módulo, doble observación, distancia inaccesible.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un problema de altura por doble observación y descompón una fuerza en componentes.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de trigonometría y geometría del temario oficial de Matemáticas +25; conecta con vectores (M06-L01) y con la dinámica de Física (F03).
