---
id: matematicas-m07-l02
course: matematicas
module: M07
level: N2
title: Rectas en el plano: ecuaciones, paralelismo, perpendicularidad y distancias
learning_objectives:
  - Escribir la ecuación de una recta en forma vectorial, paramétrica, continua, general y explícita, y pasar de una a otra
  - Decidir si dos rectas son paralelas, perpendiculares o secantes, y calcular su intersección y el ángulo que forman
  - Calcular la distancia de un punto a una recta
prerequisites: [matematicas-m07-l01, matematicas-m02-l06]
skill_ids: [line_equations_2d, parallel_perpendicular, point_line_distance]
exam_alignment: [geometria]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una recta queda determinada por un punto y una dirección. En esta lección aprenderás a escribir esa información de distintas formas (cada una útil para algo), a decidir si dos rectas son paralelas o perpendiculares, a calcular dónde se cortan y qué ángulo forman, y a medir la distancia de un punto a una recta. Son las herramientas que después se generalizan al espacio (M07-L03) y que aparecen en problemas de triángulos, alturas y áreas del examen de Matemáticas +25.

## 2. Lo que necesitas saber antes

- Vectores, producto escalar y perpendicularidad (M06-L01).
- Pendiente, distancia y punto medio (M07-L01).
- Sistemas 2×2 (M02-L06).

## 3. Idea intuitiva

Para describir el recorrido de una carretilla que va en línea recta, basta con decir dónde empieza y hacia dónde va: un punto $P$ y un **vector director** $\vec v$. Todos los puntos de la recta se obtienen como $P+t\vec v$ al variar $t$ (el tiempo, si quieres).

Otra forma de describir una recta es con un vector **perpendicular** a ella, el **vector normal**. La ecuación general $Ax+By+C=0$ esconde ese vector: es $(A,B)$. Con él, comprobar perpendicularidad y calcular distancias es inmediato.

## 4. Definición precisa

Recta que pasa por $P(x_0,y_0)$ con vector director $\vec v=(v_1,v_2)$:

| Forma | Ecuación |
|---|---|
| Vectorial | $(x,y)=(x_0,y_0)+t\,(v_1,v_2)$ |
| Paramétricas | $x=x_0+t\,v_1$, $y=y_0+t\,v_2$ |
| Continua | $\dfrac{x-x_0}{v_1}=\dfrac{y-y_0}{v_2}$ |
| General (implícita) | $Ax+By+C=0$ |
| Punto–pendiente | $y-y_0=m(x-x_0)$ con $m=\dfrac{v_2}{v_1}$ |
| Explícita | $y=mx+n$ |

**Relaciones entre formas.** En la general $Ax+By+C=0$: vector normal $\vec n=(A,B)$; vector director $\vec v=(-B,A)$ (o $(B,-A)$); pendiente $m=-\dfrac AB$ si $B\neq0$.

**Posiciones relativas** de $r:\ A_1x+B_1y+C_1=0$ y $s:\ A_2x+B_2y+C_2=0$:
- **Secantes** (se cortan en un punto): $\dfrac{A_1}{A_2}\neq\dfrac{B_1}{B_2}$. El punto de corte es la solución del sistema.
- **Paralelas**: $\dfrac{A_1}{A_2}=\dfrac{B_1}{B_2}\neq\dfrac{C_1}{C_2}$ (misma pendiente).
- **Coincidentes**: los tres cocientes iguales.

**Perpendicularidad**: $r\perp s\iff\vec n_r\cdot\vec n_s=0\iff A_1A_2+B_1B_2=0$. Con pendientes: $m_1\cdot m_2=-1$.

**Ángulo entre dos rectas** (el agudo):
$$\cos\alpha=\frac{|\vec v_r\cdot\vec v_s|}{|\vec v_r|\,|\vec v_s|}$$
(también con los vectores normales).

**Distancia de un punto** $P(x_0,y_0)$ a la recta $Ax+By+C=0$:
$$d(P,r)=\frac{|Ax_0+By_0+C|}{\sqrt{A^2+B^2}}.$$
**Distancia entre rectas paralelas**: se toma un punto de una y se calcula su distancia a la otra.

**Rectas paralelas y perpendiculares a una dada.** Una paralela a $Ax+By+C=0$ tiene la forma $Ax+By+C'=0$ (mismo normal); una perpendicular, la forma $Bx-Ay+C''=0$ (el normal pasa a ser director). La constante se calcula obligando a que pase por el punto pedido.

**Qué forma conviene en cada caso.** La forma paramétrica es la más cómoda para obtener puntos de la recta (dando valores a $t$) y para calcular intersecciones con otras curvas; la general, para distancias, paralelas y perpendiculares; la explícita, para leer la pendiente y la ordenada en el origen y dibujar. En el examen no se exige una forma concreta salvo que el enunciado lo pida, pero sí que la ecuación sea correcta y esté simplificada.

**Rectas notables de un triángulo.** Con estas herramientas se calculan las alturas (recta perpendicular a un lado que pasa por el vértice opuesto), las medianas (recta de un vértice al punto medio del lado opuesto) y las mediatrices (perpendicular a un lado por su punto medio). Sus puntos de corte son el ortocentro, el baricentro y el circuncentro, respectivamente, y aparecen con frecuencia en ejercicios de geometría analítica.

**Por qué la fórmula de la distancia.** La distancia es la longitud del segmento perpendicular desde $P$ a la recta, que tiene la dirección del normal $(A,B)$. Proyectando el vector de un punto de la recta a $P$ sobre el normal unitario $\dfrac{(A,B)}{\sqrt{A^2+B^2}}$ se obtiene exactamente la fórmula; el valor absoluto evita distancias negativas.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Todas las formas de una recta
Recta que pasa por $A(1,2)$ con vector director $\vec v=(3,-1)$.

- Paramétricas: $x=1+3t$, $y=2-t$.
- Continua: $\dfrac{x-1}{3}=\dfrac{y-2}{-1}$.
- General: $-(x-1)=3(y-2)$ → $x+3y-7=0$.
- Explícita: $y=-\dfrac{x}{3}+\dfrac73$. Comprobación con $A$: $1+6-7=0$. ✔
:::

:::ejemplo Ejemplo 2 · Paralela y perpendicular
Dada $r:\ 2x-y+3=0$, halla la paralela y la perpendicular que pasan por $P(1,4)$.

1. Paralela: $2x-y+C=0$; con $P$: $2-4+C=0$ → $C=2$: $2x-y+2=0$.
2. Perpendicular: $x+2y+C=0$; con $P$: $1+8+C=0$ → $C=-9$: $x+2y-9=0$. Comprobación: normales $(2,-1)\cdot(1,2)=0$. ✔
:::

:::ejemplo Ejemplo 3 · Distancia de un punto a una recta
Distancia de $P(3,1)$ a $3x+4y-3=0$.

$d=\dfrac{|9+4-3|}{\sqrt{9+16}}=\dfrac{10}{5}=2$.
:::

:::error Error típico
Usar el vector normal $(A,B)$ como director en las paramétricas: daría una recta perpendicular a la buscada. Otro error: olvidar el valor absoluto o la raíz del denominador en la fórmula de la distancia.
:::

## 6. Ejercicio guiado

Calcula el punto de corte de $x+y=5$ y $2x-y=1$, y el ángulo que forman.

:::pista Primera pista
Resuelve el sistema sumando las ecuaciones.
:::

:::pista Segunda pista
Para el ángulo, usa los normales $(1,1)$ y $(2,-1)$.
:::

:::solucion Solución guiada
$3x=6$ → $x=2$, $y=3$: punto $(2,3)$. $\cos\alpha=\dfrac{|2-1|}{\sqrt2\sqrt5}=\dfrac{1}{\sqrt{10}}\approx0{,}316$ → $\alpha\approx71{,}57^\circ$.
:::

## 7. Práctica

**Fáciles**

1. Ecuación general de la recta que pasa por $(2,3)$ y $(4,7)$.
2. Pendiente de $3x+6y-1=0$.
3. ¿Son paralelas $2x+4y=1$ y $x+2y=7$?

**Medios**

4. Recta perpendicular a $y=3x+1$ que pasa por el origen.
5. Distancia del origen a $x+y-4=0$.

**Tipo examen / transferencia**

6. Triángulo $A(0,0)$, $B(6,0)$, $C(2,4)$. Calcula la ecuación del lado $BC$, la altura desde $A$ (distancia de $A$ a $BC$) y el área usando esa altura. Comprueba el área con la fórmula de coordenadas.

:::solucion Soluciones paso a paso
1. $m=2$: $y-3=2(x-2)$ → $2x-y-1=0$.
2. $-\dfrac36=-\dfrac12$.
3. Sí: $\dfrac21=\dfrac42\neq\dfrac{1}{7}$ (misma pendiente, distinta recta).
4. Pendiente $-\dfrac13$: $y=-\dfrac{x}{3}$ (o $x+3y=0$).
5. $\dfrac{|0+0-4|}{\sqrt2}=2\sqrt2\approx2{,}83$.
6. $BC$: pendiente $\dfrac{4-0}{2-6}=-1$ → $x+y-6=0$. $h=\dfrac{|0+0-6|}{\sqrt2}=3\sqrt2$. $|BC|=\sqrt{16+16}=4\sqrt2$. Área $=\dfrac12\cdot4\sqrt2\cdot3\sqrt2=12$. Comprobación: $\dfrac12|6\cdot4-0\cdot2|=12$. ✔
:::

## 8. Cómo revisar tus errores

- Comprueba que los puntos dados cumplen la ecuación obtenida.
- Distingue vector director y vector normal en la forma general.
- Comprueba la perpendicularidad con el producto escalar.
- La distancia siempre es positiva.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Recta = punto + vector director; en la general, $(A,B)$ es normal.
- Paralelas: normales proporcionales. Perpendiculares: producto escalar de normales 0 ($m_1m_2=-1$).
- $d(P,r)=\dfrac{|Ax_0+By_0+C|}{\sqrt{A^2+B^2}}$.

**Vocabulario:** vector director, vector normal, ecuación vectorial, paramétrica, continua, general, explícita, rectas secantes, paralelas y coincidentes, distancia punto–recta.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, escribe una recta en todas sus formas y calcula la distancia de un punto a ella.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (Bachillerato). Alineado con el bloque de geometría del temario oficial de Matemáticas +25; se generaliza al espacio en M07-L03.
