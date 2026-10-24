---
id: matematicas-m06-l02
course: matematicas
module: M06
level: N2
title: Matrices, operaciones, producto y traspuesta
learning_objectives:
  - Identificar dimensiones, elementos y tipos de matrices
  - Sumar matrices, multiplicarlas por un número y multiplicar matrices compatibles
  - Calcular la traspuesta y usar las propiedades del producto, que no es conmutativo
prerequisites: [matematicas-m06-l01]
skill_ids: [matrix_ops, matrix_product]
exam_alignment: [algebra-lineal]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una matriz es una tabla de números con filas y columnas. Con matrices se organizan datos (stock por almacén y producto), se resuelven sistemas de ecuaciones (M06-L04), se describen transformaciones geométricas y, en Informática, se representan imágenes, grafos y redes neuronales. El álgebra lineal es un bloque fijo del examen de Matemáticas +25. En esta lección aprenderás las operaciones básicas y, sobre todo, el **producto de matrices**, que tiene reglas propias.

## 2. Lo que necesitas saber antes

- Vectores y producto escalar (M06-L01): $(1,2,3)\cdot(4,0,-1)=4+0-3=1$.
- Operar con enteros y fracciones con soltura.
- Sistemas de ecuaciones 2×2 (M02-L06).

## 3. Idea intuitiva

Piensa en una hoja de cálculo con dos almacenes (filas) y tres productos (columnas): cada celda es una cantidad. Eso es una matriz $2\times3$. Sumar dos matrices es sumar celda a celda (el stock de dos semanas). Multiplicar por un número es escalar todas las celdas (duplicar el pedido).

El producto es distinto: si tienes una tabla de cantidades y un vector de precios, el valor del stock de cada almacén se obtiene multiplicando **cada fila** por **la columna** de precios y sumando. Esa operación fila por columna es el producto de matrices, y es exactamente un producto escalar.

## 4. Definición precisa

- **Matriz** $m\times n$: tabla de $m$ filas y $n$ columnas. El elemento de la fila $i$ y la columna $j$ se escribe $a_{ij}$.
- **Tipos**: cuadrada ($m=n$); fila ($1\times n$); columna ($m\times1$); **identidad** $I$ (cuadrada con unos en la diagonal principal y ceros fuera); **nula** $O$; **diagonal**; **triangular** (ceros por debajo o por encima de la diagonal); **simétrica** ($A^t=A$).
- **Igualdad**: misma dimensión y mismos elementos uno a uno.
- **Suma**: solo con igual dimensión, elemento a elemento: $(A+B)_{ij}=a_{ij}+b_{ij}$.
- **Producto por un número**: $(kA)_{ij}=k\,a_{ij}$.
- **Producto de matrices**: $A$ de dimensión $m\times n$ y $B$ de dimensión $n\times p$ (el número de **columnas** de $A$ debe coincidir con el de **filas** de $B$). El resultado $AB$ es $m\times p$ y
$$(AB)_{ij}=\sum_{k=1}^{n}a_{ik}\,b_{kj}=\text{(fila } i\text{ de }A)\cdot\text{(columna } j\text{ de }B).$$
- **Traspuesta** $A^t$: intercambia filas y columnas; si $A$ es $m\times n$, $A^t$ es $n\times m$.

**Propiedades:**
- Suma: conmutativa y asociativa; $A+O=A$.
- Producto: asociativo $(AB)C=A(BC)$, distributivo $A(B+C)=AB+AC$, $AI=IA=A$.
- **El producto no es conmutativo**: en general $AB\neq BA$ (puede que uno exista y el otro no).
- $AB=O$ no implica $A=O$ o $B=O$.
- $(A+B)^t=A^t+B^t$; $(kA)^t=kA^t$; $(AB)^t=B^tA^t$ (el orden se invierte).
- Por la no conmutatividad, $(A+B)^2=A^2+AB+BA+B^2$, que **no** es $A^2+2AB+B^2$ salvo si $AB=BA$.

**Potencias** de una matriz cuadrada: $A^2=AA$, $A^3=A^2A$. Si al calcular varias potencias aparece un patrón, se puede conjeturar $A^n$ y comprobarlo.

**Matrices en Informática.** Una imagen en escala de grises es una matriz de números (la intensidad de cada píxel); una red de carreteras se representa con una matriz de adyacencia; y el núcleo de una red neuronal es, en gran parte, multiplicar matrices muy grandes. Por eso las tarjetas gráficas están diseñadas para hacer productos de matrices a enorme velocidad.

**Por qué el producto se define así.** Si una matriz describe cómo se transforman unas variables en otras, y otra matriz transforma las resultantes, el producto describe la transformación completa. La regla «fila por columna» es la que hace que componer transformaciones equivalga a multiplicar matrices, igual que componer funciones (M04-L05). Por eso, como la composición, no es conmutativa.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Producto no conmutativo
Con $A=\begin{pmatrix}1&2\\3&4\end{pmatrix}$ y $B=\begin{pmatrix}0&1\\5&-2\end{pmatrix}$, calcula $AB$ y $BA$.

$AB=\begin{pmatrix}1\cdot0+2\cdot5 & 1\cdot1+2\cdot(-2)\\ 3\cdot0+4\cdot5 & 3\cdot1+4\cdot(-2)\end{pmatrix}=\begin{pmatrix}10&-3\\20&-5\end{pmatrix}$.

$BA=\begin{pmatrix}0+3 & 0+4\\ 5-6 & 10-8\end{pmatrix}=\begin{pmatrix}3&4\\-1&2\end{pmatrix}$. Son distintas.
:::

:::ejemplo Ejemplo 2 · Producto de matrices rectangulares
Multiplica $A=\begin{pmatrix}1&0&2\\-1&3&1\end{pmatrix}$ ($2\times3$) por $B=\begin{pmatrix}2&1\\0&1\\1&0\end{pmatrix}$ ($3\times2$).

El resultado es $2\times2$: $AB=\begin{pmatrix}2+0+2 & 1+0+0\\ -2+0+1 & -1+3+0\end{pmatrix}=\begin{pmatrix}4&1\\-1&2\end{pmatrix}$. El producto $BA$ también existe, pero es $3\times3$.
:::

:::ejemplo Ejemplo 3 · Traspuesta
Calcula $A^t$ para $A=\begin{pmatrix}1&2&3\\4&5&6\end{pmatrix}$ y comprueba que $AA^t$ es simétrica.

$A^t=\begin{pmatrix}1&4\\2&5\\3&6\end{pmatrix}$. $AA^t=\begin{pmatrix}14&32\\32&77\end{pmatrix}$, simétrica (el elemento 1,2 coincide con el 2,1).
:::

:::error Error típico
Multiplicar matrices elemento a elemento: $\begin{pmatrix}1&2\\3&4\end{pmatrix}\begin{pmatrix}0&1\\5&-2\end{pmatrix}\neq\begin{pmatrix}0&2\\15&-8\end{pmatrix}$. Otro error: intentar multiplicar matrices incompatibles, como una $2\times3$ por otra $2\times3$.
:::

## 6. Ejercicio guiado

Dos almacenes tienen stock de tres productos: $W=\begin{pmatrix}10&5&8\\4&12&6\end{pmatrix}$ (filas: almacenes; columnas: productos). Los precios unitarios son $p=\begin{pmatrix}3\\2\\5\end{pmatrix}$ €. Calcula el valor del stock de cada almacén.

:::pista Primera pista
$W$ es $2\times3$ y $p$ es $3\times1$: el producto existe y es $2\times1$.
:::

:::pista Segunda pista
Primera fila por la columna: $10\cdot3+5\cdot2+8\cdot5$.
:::

:::solucion Solución guiada
$Wp=\begin{pmatrix}30+10+40\\12+24+30\end{pmatrix}=\begin{pmatrix}80\\66\end{pmatrix}$: 80 € en el primer almacén y 66 € en el segundo.
:::

## 7. Práctica

**Fáciles**

1. Indica la dimensión de $\begin{pmatrix}1&0&-2&5\\3&1&0&2\end{pmatrix}$ y el elemento $a_{24}$.
2. Calcula $2A-B$ con $A=\begin{pmatrix}1&-1\\0&2\end{pmatrix}$ y $B=\begin{pmatrix}3&0\\1&1\end{pmatrix}$.
3. Calcula $\begin{pmatrix}2&1\\0&3\end{pmatrix}\begin{pmatrix}1&4\\2&-1\end{pmatrix}$.

**Medios**

4. Calcula $A^2$ y $A^3$ para $A=\begin{pmatrix}1&1\\0&1\end{pmatrix}$ y conjetura $A^n$.
5. Halla $x$ e $y$ para que $\begin{pmatrix}x+y&2\\1&x-y\end{pmatrix}=\begin{pmatrix}7&2\\1&1\end{pmatrix}$.

**Tipo examen / transferencia**

6. Sea $A=\begin{pmatrix}2&1\\1&3\end{pmatrix}$. Comprueba que $A^2-5A+5I=O$ y úsalo para expresar $A^3$ en función de $A$ e $I$.

:::solucion Soluciones paso a paso
1. $2\times4$; $a_{24}=2$.
2. $\begin{pmatrix}2&-2\\0&4\end{pmatrix}-\begin{pmatrix}3&0\\1&1\end{pmatrix}=\begin{pmatrix}-1&-2\\-1&3\end{pmatrix}$.
3. $\begin{pmatrix}2+2&8-1\\0+6&0-3\end{pmatrix}=\begin{pmatrix}4&7\\6&-3\end{pmatrix}$.
4. $A^2=\begin{pmatrix}1&2\\0&1\end{pmatrix}$, $A^3=\begin{pmatrix}1&3\\0&1\end{pmatrix}$; conjetura $A^n=\begin{pmatrix}1&n\\0&1\end{pmatrix}$.
5. $x+y=7$, $x-y=1$ → $x=4$, $y=3$.
6. $A^2=\begin{pmatrix}5&5\\5&10\end{pmatrix}$; $5A=\begin{pmatrix}10&5\\5&15\end{pmatrix}$; $A^2-5A+5I=\begin{pmatrix}0&0\\0&0\end{pmatrix}$ ✔. Así $A^2=5A-5I$ y $A^3=A\cdot A^2=5A^2-5A=5(5A-5I)-5A=20A-25I$.
:::

## 8. Cómo revisar tus errores

- Antes de multiplicar, escribe las dimensiones: $(m\times n)(n\times p)=m\times p$.
- Calcula cada elemento como fila por columna y repasa los signos.
- No supongas $AB=BA$; si lo necesitas, compruébalo.
- Comprueba un elemento del resultado por un camino distinto cuando puedas.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Suma y producto por número: elemento a elemento.
- Producto $AB$: columnas de $A$ = filas de $B$; elemento $ij$ = fila $i$ por columna $j$.
- No conmutativo; $(AB)^t=B^tA^t$; $AI=IA=A$.

**Vocabulario:** matriz, dimensión, elemento, matriz cuadrada, identidad, nula, diagonal, triangular, simétrica, traspuesta, producto de matrices.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, multiplica dos matrices rectangulares en los dos órdenes y calcula una potencia de una matriz 2×2.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de álgebra lineal del temario oficial de Matemáticas +25; base de determinantes e inversa (M06-L03) y de los sistemas con matrices (M06-L04).
