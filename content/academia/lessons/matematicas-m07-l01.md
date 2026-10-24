---
id: matematicas-m07-l01
course: matematicas
module: M07
level: N2
title: Distancia entre puntos, punto medio y pendiente
learning_objectives:
  - Calcular la distancia entre dos puntos del plano y del espacio
  - Hallar el punto medio, puntos simétricos y puntos que dividen un segmento en una razón
  - Calcular la pendiente y el ángulo de inclinación de un segmento y comprobar si tres puntos están alineados
prerequisites: [matematicas-m06-l01, matematicas-m04-l01, matematicas-m05-l01]
skill_ids: [distance_midpoint, slope_alignment]
exam_alignment: [geometria]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La geometría analítica traduce figuras en números: un punto es un par (o un trío) de coordenadas, y las propiedades geométricas (longitudes, puntos medios, inclinaciones, alineaciones) se calculan con operaciones. En esta lección verás las herramientas básicas que usarás en todo el módulo: distancia, punto medio, división de un segmento y pendiente. Con ellas se clasifican triángulos, se calculan perímetros y áreas y se preparan las ecuaciones de rectas y planos (M07-L02, M07-L03).

## 2. Lo que necesitas saber antes

- Vectores, componentes y módulo (M06-L01): $\vec{AB}=B-A$, $|\vec v|=\sqrt{v_1^2+v_2^2}$.
- Pendiente de una recta (M04-L01).
- Tangente de un ángulo y ángulos notables (M05-L01).

## 3. Idea intuitiva

Para ir del punto $A$ al punto $B$ en un plano cuadriculado, te mueves $\Delta x$ en horizontal y $\Delta y$ en vertical. La distancia en línea recta es la hipotenusa de ese triángulo rectángulo: Pitágoras. El punto medio está exactamente a mitad de camino en cada dirección: es la media de las coordenadas.

La pendiente dice cuánto sube el segmento por cada paso horizontal. Tres puntos están en la misma recta si, al ir de uno a otro, la pendiente no cambia.

## 4. Definición precisa

Sean $A(x_1,y_1)$ y $B(x_2,y_2)$ en el plano (en el espacio, se añade la coordenada $z$).

- **Vector** $\vec{AB}=(x_2-x_1,\ y_2-y_1)$.
- **Distancia**: $d(A,B)=|\vec{AB}|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$. En el espacio, con un tercer término $(z_2-z_1)^2$.
- **Punto medio**: $M=\left(\dfrac{x_1+x_2}{2},\ \dfrac{y_1+y_2}{2}\right)$.
- **Simétrico** de $A$ respecto de un punto $M$: el punto $A'$ tal que $M$ es el punto medio de $AA'$, es decir, $A'=2M-A$.
- **Punto que divide el segmento** $AB$ en la razón $t$ (con $0\le t\le1$, medido desde $A$): $P=A+t\,\vec{AB}$. Para dividirlo en tres partes iguales, $t=\tfrac13$ y $t=\tfrac23$.
- **Baricentro** (centro de gravedad) del triángulo $ABC$: $G=\dfrac{A+B+C}{3}$ (media de las coordenadas).
- **Pendiente** del segmento $AB$ (si $x_1\neq x_2$): $m=\dfrac{y_2-y_1}{x_2-x_1}$. Si $x_1=x_2$, el segmento es vertical y la pendiente no existe.
- **Ángulo de inclinación** $\alpha$ (con el semieje $X$ positivo, entre 0° y 180°): $\tan\alpha=m$.
- **Puntos alineados**: $A$, $B$ y $C$ están alineados si $\vec{AB}$ y $\vec{AC}$ son paralelos (componentes proporcionales), o si la pendiente de $AB$ coincide con la de $AC$. Otra forma: el «área» $\tfrac12\left|\det(\vec{AB},\vec{AC})\right|$ vale 0.

**Área de un triángulo con coordenadas.** Con $\vec{AB}=(u_1,u_2)$ y $\vec{AC}=(v_1,v_2)$:
$$\text{Área}=\frac12\left|u_1v_2-u_2v_1\right|.$$
Es la mitad del área del paralelogramo que forman los dos vectores (el determinante de M06-L03).

**Clasificar triángulos.** Por los lados: calcula las tres distancias (equilátero, isósceles o escaleno). Por los ángulos: compara el cuadrado del lado mayor con la suma de los cuadrados de los otros dos (igual → rectángulo; menor → acutángulo; mayor → obtusángulo), o usa el producto escalar de los vectores de cada vértice.

**Lugares geométricos.** Las fórmulas de distancia permiten describir conjuntos de puntos con una condición. Por ejemplo, los puntos que están a la misma distancia de $A$ y de $B$ forman la **mediatriz** del segmento $AB$: al igualar $d(P,A)=d(P,B)$ y elevar al cuadrado, los términos $x^2$ e $y^2$ se cancelan y queda la ecuación de una recta. Del mismo modo, los puntos a distancia $r$ de un centro forman una circunferencia.

**Por qué la fórmula de la distancia es Pitágoras.** Las diferencias $x_2-x_1$ e $y_2-y_1$ son los catetos de un triángulo rectángulo cuya hipotenusa es el segmento $AB$. En el espacio, se aplica Pitágoras dos veces: primero en el plano horizontal y después con la altura.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Distancia, punto medio y pendiente
Con $A(1,2)$ y $B(4,6)$, calcula $d(A,B)$, el punto medio y la pendiente.

1. $\vec{AB}=(3,4)$; $d=\sqrt{9+16}=5$.
2. $M=\left(\dfrac52,\ 4\right)$.
3. $m=\dfrac43$.
:::

:::ejemplo Ejemplo 2 · Punto simétrico
Halla el simétrico de $A(2,-1)$ respecto de $M(3,4)$.

$A'=2M-A=(6-2,\ 8-(-1))=(4,9)$. Comprobación: el punto medio de $A$ y $A'$ es $\left(\tfrac{6}{2},\tfrac{8}{2}\right)=(3,4)$. ✔
:::

:::ejemplo Ejemplo 3 · Triángulo
Clasifica el triángulo $A(0,0)$, $B(4,0)$, $C(0,3)$ y calcula su perímetro y su área.

Lados: $AB=4$, $AC=3$, $BC=\sqrt{16+9}=5$. Como $3^2+4^2=5^2$, es **rectángulo** en $A$. Perímetro 12; área $\tfrac12\cdot4\cdot3=6$ (o con la fórmula: $\tfrac12|4\cdot3-0\cdot0|=6$).
:::

:::error Error típico
Calcular el punto medio restando coordenadas en lugar de sumarlas: el punto medio es la **media**, $\dfrac{x_1+x_2}{2}$. Otro error: en la pendiente, restar en distinto orden arriba y abajo.
:::

## 6. Ejercicio guiado

Divide el segmento de extremos $A(1,1)$ y $B(7,4)$ en tres partes iguales.

:::pista Primera pista
$\vec{AB}=(6,3)$. Cada tercio es $\tfrac13\vec{AB}=(2,1)$.
:::

:::pista Segunda pista
$P_1=A+\tfrac13\vec{AB}$ y $P_2=A+\tfrac23\vec{AB}$.
:::

:::solucion Solución guiada
$P_1=(3,2)$ y $P_2=(5,3)$. Comprobación: $d(A,P_1)=d(P_1,P_2)=d(P_2,B)=\sqrt5$. ✔
:::

## 7. Práctica

**Fáciles**

1. Distancia entre $(-2,3)$ y $(4,-5)$.
2. Punto medio de $(-3,5)$ y $(7,1)$.
3. Pendiente y ángulo de inclinación del segmento de $(0,0)$ a $(2,2)$.

**Medios**

4. ¿Están alineados $(1,2)$, $(3,6)$ y $(5,10)$?
5. Halla $y$ para que la distancia de $(1,y)$ a $(4,5)$ sea 5.

**Tipo examen / transferencia**

6. Dado el triángulo $A(1,1)$, $B(5,1)$, $C(3,5)$: clasifícalo por sus lados, calcula su área y su baricentro.

:::solucion Soluciones paso a paso
1. $\sqrt{36+64}=10$.
2. $(2,3)$.
3. $m=1$ → $\alpha=45^\circ$.
4. $\vec{AB}=(2,4)$ y $\vec{AC}=(4,8)=2\vec{AB}$: sí, alineados.
5. $9+(5-y)^2=25$ → $(5-y)^2=16$ → $y=1$ o $y=9$.
6. $AB=4$, $AC=\sqrt{4+16}=\sqrt{20}$, $BC=\sqrt{4+16}=\sqrt{20}$: **isósceles**. Área $=\tfrac12|4\cdot4-0\cdot2|=8$. Baricentro $\left(3,\tfrac73\right)$.
:::

## 8. Cómo revisar tus errores

- Comprueba los resultados con un dibujo aproximado en papel cuadriculado.
- La distancia nunca es negativa; si te sale una raíz de negativo, revisa los cuadrados.
- Verifica un punto medio calculando las dos mitades.
- Para alineación, compara las proporciones de los vectores.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $d(A,B)=\sqrt{\Delta x^2+\Delta y^2}$; punto medio = media de coordenadas.
- Simétrico $A'=2M-A$; división $P=A+t\vec{AB}$; baricentro $=\frac{A+B+C}{3}$.
- Pendiente $m=\dfrac{\Delta y}{\Delta x}$, $\tan\alpha=m$; alineación por proporcionalidad.

**Vocabulario:** coordenadas, distancia, punto medio, punto simétrico, baricentro, pendiente, ángulo de inclinación, puntos alineados.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, clasifica un triángulo dado por coordenadas y calcula su área y su baricentro.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (Bachillerato). Alineado con el bloque de geometría del temario oficial de Matemáticas +25; base de las rectas en el plano (M07-L02) y en el espacio (M07-L03).
