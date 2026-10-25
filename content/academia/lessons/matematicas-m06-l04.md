---
id: matematicas-m06-l04
course: matematicas
module: M06
level: N2
title: Sistemas 3×3, método de Gauss y discusión con parámetro
learning_objectives:
  - Resolver sistemas lineales de tres ecuaciones por el método de Gauss y por la regla de Cramer
  - Clasificar un sistema con el teorema de Rouché–Fröbenius usando rangos
  - Discutir y resolver un sistema que depende de un parámetro e interpretarlo geométricamente
prerequisites: [matematicas-m06-l03, matematicas-m02-l06]
skill_ids: [gauss_elimination, rouche, parametric_systems]
exam_alignment: [algebra-lineal]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La **discusión de un sistema 3×3 con un parámetro** es uno de los problemas más frecuentes del bloque de álgebra lineal del examen de Matemáticas +25. Combina todo lo del módulo: matrices, determinantes y rango. En esta lección aprenderás el **método de Gauss**, que funciona siempre y es el que usan los ordenadores, la **regla de Cramer**, cómodo cuando el sistema es determinado, y el **teorema de Rouché–Fröbenius**, que dice cuántas soluciones tiene un sistema sin necesidad de resolverlo.

## 2. Lo que necesitas saber antes

- Sistemas 2×2 y su clasificación (M02-L06).
- Determinantes y rango (M06-L03).
- Despejar y sustituir con soltura (M01-L03).

## 3. Idea intuitiva

El método de Gauss es la reducción de los sistemas 2×2 aplicada de forma ordenada: usas la primera ecuación para eliminar la $x$ de las otras dos, y después la segunda para eliminar la $y$ de la tercera. Te queda una «escalera» (sistema escalonado) que se resuelve de abajo arriba.

Geométricamente, cada ecuación con tres incógnitas es un **plano** en el espacio. Tres planos pueden cortarse en un único punto (solución única), en una recta común (infinitas soluciones, como las páginas de un libro abierto) o no tener ningún punto en común (sin solución, por ejemplo si dos son paralelos).

## 4. Definición precisa

Un sistema de 3 ecuaciones con 3 incógnitas se escribe $AX=B$, donde $A$ es la **matriz de coeficientes** y $A^*=(A\,|\,B)$ la **matriz ampliada**.

**Método de Gauss.** Con operaciones elementales de fila sobre $A^*$ (intercambiar filas; multiplicar una fila por un número no nulo; sumar a una fila un múltiplo de otra), se llega a una forma escalonada:
$$\left(\begin{array}{ccc|c}a&b&c&d\\0&e&f&g\\0&0&h&i\end{array}\right)$$
y se resuelve de abajo arriba (sustitución regresiva). Estas operaciones no cambian las soluciones.

Lectura del escalonado:
- Última fila $0\ 0\ h\,|\,i$ con $h\neq0$: sistema **compatible determinado** (solución única).
- Última fila $0\ 0\ 0\,|\,0$: sobra una ecuación; si las demás son independientes, **compatible indeterminado** (infinitas soluciones, un parámetro).
- Última fila $0\ 0\ 0\,|\,i$ con $i\neq0$: ecuación imposible $0=i$; sistema **incompatible**.

**Teorema de Rouché–Fröbenius** (con $n$ incógnitas):
- $\text{rg}\,A\neq\text{rg}\,A^*$ → **incompatible** (SI).
- $\text{rg}\,A=\text{rg}\,A^*=n$ → **compatible determinado** (SCD).
- $\text{rg}\,A=\text{rg}\,A^*<n$ → **compatible indeterminado** (SCI), con $n-\text{rg}\,A$ parámetros.

**Regla de Cramer** (solo si $|A|\neq0$): $x=\dfrac{|A_x|}{|A|}$, $y=\dfrac{|A_y|}{|A|}$, $z=\dfrac{|A_z|}{|A|}$, donde $A_x$ es $A$ con la columna de $x$ sustituida por los términos independientes (análogamente $A_y$, $A_z$).

**Discusión con parámetro** (método recomendado):
1. Calcula $|A|$ en función del parámetro y busca los valores que lo anulan.
2. Para los demás valores, $\text{rg}\,A=\text{rg}\,A^*=3$: SCD.
3. Para cada valor que anula $|A|$, sustitúyelo y calcula $\text{rg}\,A$ y $\text{rg}\,A^*$ (con menores o con Gauss): decide SCI o SI.
4. Resuelve en los casos que se pidan.

**Solución paramétrica.** En un SCI con un parámetro, se elige una incógnita como parámetro ($z=\lambda$) y se expresan las demás en función de él. Cada valor de $\lambda$ da una solución; geométricamente, todas forman una recta.

**Por qué funciona Gauss.** Cada operación elemental transforma el sistema en otro **equivalente**: cualquier solución del primero lo es del segundo y viceversa. Sumar a una ecuación un múltiplo de otra es lo que ya hacías en el método de reducción; Gauss solo lo organiza para que nunca falte ningún paso.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Gauss, sistema determinado
Resuelve $\begin{cases}x+y+z=6\\2x-y+z=3\\x+2y-z=2\end{cases}$

1. $F_2-2F_1$: $-3y-z=-9$. $F_3-F_1$: $y-2z=-4$.
2. Con $3F_3+F_2$ (usando la nueva $F_2$): $3y-6z-3y-z=-12-9$ → $-7z=-21$ → $z=3$.
3. $y-6=-4$ → $y=2$. $x=6-2-3=1$.

Solución $(1,2,3)$. Comprobación: $2-2+3=3$ ✔, $1+4-3=2$ ✔.
:::

:::ejemplo Ejemplo 2 · Sistema compatible indeterminado
Resuelve $\begin{cases}x+y+z=3\\x-y+2z=2\\2x+3z=5\end{cases}$

La tercera ecuación es la suma de las dos primeras: sobra. Con $z=\lambda$: sumando las dos primeras, $2x+3\lambda=5$ → $x=\dfrac{5-3\lambda}{2}$; y $y=3-x-\lambda=\dfrac{1+\lambda}{2}$. Infinitas soluciones $\left(\dfrac{5-3\lambda}{2},\dfrac{1+\lambda}{2},\lambda\right)$: tres planos que se cortan en una recta.
:::

:::ejemplo Ejemplo 3 · Discusión con parámetro
Discute $\begin{cases}x+y+kz=1\\x+ky+z=1\\kx+y+z=1\end{cases}$ según $k$.

1. $|A|=-(k-1)^2(k+2)$; se anula en $k=1$ y $k=-2$.
2. $k\neq1$ y $k\neq-2$: **SCD**.
3. $k=1$: las tres ecuaciones son $x+y+z=1$; $\text{rg}A=\text{rg}A^*=1<3$ → **SCI** con dos parámetros (los tres planos coinciden).
4. $k=-2$: $\text{rg}A=2$ y $\text{rg}A^*=3$ → **SI** (no hay punto común).
:::

:::error Error típico
Al hacer Gauss, operar solo sobre los coeficientes y olvidar la columna de términos independientes. Otro error: aplicar Cramer cuando $|A|=0$; la regla solo vale para sistemas determinados.
:::

## 6. Ejercicio guiado

Resuelve $\begin{cases}x+y+z=2\\x-y+z=0\\2x+y-z=3\end{cases}$

:::pista Primera pista
Resta las dos primeras ecuaciones: desaparecen $x$ y $z$ a la vez.
:::

:::pista Segunda pista
$2y=2$ → $y=1$. Sustituye en la primera y la tercera: queda un sistema 2×2 en $x$ y $z$.
:::

:::solucion Solución guiada
$x+z=1$ y $2x-z=2$. Sumando: $3x=3$ → $x=1$, $z=0$. Solución $(1,1,0)$. Comprobación: $1+1+0=2$ ✔; $1-1+0=0$ ✔; $2+1-0=3$ ✔. ($|A|=6\neq0$: SCD.)
:::

## 7. Práctica

**Fáciles**

1. Resuelve el sistema escalonado $x+y+z=6$, $y+z=5$, $z=3$.
2. Resuelve $x+y=3$, $y+z=5$, $x+z=4$.
3. Clasifica $x+y+z=1$, $2x+2y+2z=3$, $x-y=0$.

**Medios**

4. Resuelve el sistema del ejemplo 1 por Cramer y comprueba que obtienes lo mismo.
5. Halla la solución general de $x+2y-z=1$, $2x+4y-2z=2$, $y+z=1$.

**Tipo examen / transferencia**

6. Con el sistema del ejemplo 3, resuélvelo para $k=0$ y explica qué representa geométricamente el caso $k=-2$.

:::solucion Soluciones paso a paso
1. $z=3$, $y=2$, $x=1$.
2. Sumando las tres: $2(x+y+z)=12$ → $x+y+z=6$ → $z=3$, $x=1$, $y=2$.
3. La segunda es «el doble de la primera» en coeficientes pero con término 3 en vez de 2: $0=1$ → **incompatible**.
4. $|A|=\begin{vmatrix}1&1&1\\2&-1&1\\1&2&-1\end{vmatrix}=7$. $|A_x|=7$, $|A_y|=14$, $|A_z|=21$ → $(1,2,3)$. ✔
5. La segunda ecuación es el doble de la primera. Con $z=\lambda$: $y=1-\lambda$, $x=1-2y+z=1-2+2\lambda+\lambda=-1+3\lambda$. Solución $(-1+3\lambda,\,1-\lambda,\,\lambda)$.
6. $k=0$: $x+y=1$, $x+z=1$, $y+z=1$ → sumando, $x+y+z=\tfrac32$ → $x=y=z=\tfrac12$. Para $k=-2$, rg$A=2$ y rg$A^*=3$: los tres planos no tienen ningún punto común (se cortan dos a dos en rectas paralelas, como un prisma triangular).
:::

## 8. Cómo revisar tus errores

- Comprueba la solución en las **tres** ecuaciones originales.
- En Gauss, escribe qué operación haces en cada paso ($F_2-2F_1$).
- Antes de Cramer, calcula $|A|$; si es 0, usa rangos o Gauss.
- En la discusión, estudia por separado cada valor que anula $|A|$.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Gauss: escalonar la ampliada y sustituir hacia atrás.
- Rouché–Fröbenius: comparar rg$A$, rg$A^*$ y número de incógnitas.
- Cramer si $|A|\neq0$.
- Parámetro: ceros de $|A|$, y estudio caso a caso.

**Vocabulario:** matriz ampliada, operación elemental, sistema escalonado, compatible determinado, compatible indeterminado, incompatible, regla de Cramer, teorema de Rouché–Fröbenius, solución paramétrica.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un sistema por Gauss y discute uno con parámetro, con su interpretación geométrica.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de álgebra lineal del temario oficial de Matemáticas +25; conecta con la posición relativa de planos (M07-L03).
