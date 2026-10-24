---
id: matematicas-m06-l03
course: matematicas
module: M06
level: N2
title: Determinantes, matriz inversa y rango
learning_objectives:
  - Calcular determinantes de orden 2 y 3 (regla de Sarrus y desarrollo por una fila) y aplicar sus propiedades
  - Decidir si una matriz es invertible y calcular su inversa con la matriz adjunta
  - Calcular el rango de una matriz por menores o por escalonamiento, también con un parámetro
prerequisites: [matematicas-m06-l02]
skill_ids: [determinants, matrix_inverse, matrix_rank]
exam_alignment: [algebra-lineal]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

El **determinante** es un número asociado a una matriz cuadrada que dice si esta es «reversible»: si es distinto de cero, la matriz tiene **inversa** y un sistema con esa matriz de coeficientes tiene solución única. El **rango** mide cuántas filas son realmente independientes, y con él se discuten los sistemas (M06-L04). Determinantes, inversas y rangos con un parámetro $k$ son ejercicios muy habituales del examen de Matemáticas +25. Geométricamente, el determinante es un área (en 2D) o un volumen (en 3D).

## 2. Lo que necesitas saber antes

- Operaciones y producto de matrices, identidad y traspuesta (M06-L02).
- Sistemas 2×2 y su clasificación (M02-L06).
- Ecuaciones de primer y segundo grado (M01-L02, M02-L04).

## 3. Idea intuitiva

Una matriz $2\times2$ transforma el cuadrado unidad en un paralelogramo. El determinante es el **área** (con signo) de ese paralelogramo. Si el determinante es 0, el paralelogramo se aplasta en un segmento: la transformación «pierde» información y no se puede deshacer. Por eso una matriz con determinante 0 no tiene inversa.

El rango cuenta la información real que contiene una matriz. Si una fila es el doble de otra, no aporta nada nuevo: en un sistema, sería la misma ecuación escrita dos veces. El rango es el número de filas que no se pueden obtener combinando las demás.

## 4. Definición precisa

**Determinante de orden 2:** $\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc$.

**Determinante de orden 3** (regla de Sarrus):
$$\begin{vmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{vmatrix}=a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}-a_{13}a_{22}a_{31}-a_{11}a_{23}a_{32}-a_{12}a_{21}a_{33}.$$
Alternativa: **desarrollo por una fila** (o columna), especialmente útil si tiene ceros: $|A|=\sum_j a_{ij}\,A_{ij}$, donde el **adjunto** $A_{ij}=(-1)^{i+j}\,M_{ij}$ y el **menor** $M_{ij}$ es el determinante que queda al suprimir la fila $i$ y la columna $j$.

**Propiedades útiles:**
- $|A^t|=|A|$; $|AB|=|A|\,|B|$; $|kA|=k^n|A|$ para una matriz $n\times n$.
- Si una fila (o columna) es nula, o dos son iguales o proporcionales, el determinante vale 0.
- Intercambiar dos filas cambia el signo; sumar a una fila un múltiplo de otra **no** cambia el determinante.
- En una matriz triangular, el determinante es el producto de la diagonal.

**Matriz inversa.** $A^{-1}$ es la matriz que cumple $AA^{-1}=A^{-1}A=I$. Existe si y solo si $|A|\neq0$ (matriz **regular**); si $|A|=0$, la matriz es **singular**.
- Orden 2: $\begin{pmatrix}a&b\\c&d\end{pmatrix}^{-1}=\dfrac{1}{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$.
- Orden 3: $A^{-1}=\dfrac{1}{|A|}\,(\text{Adj}\,A)^t$, donde $\text{Adj}\,A$ es la matriz de los adjuntos.
- **Comprobación obligatoria**: multiplicar $A\cdot A^{-1}$ y obtener $I$.
- Ecuaciones matriciales: $AX=B$ → $X=A^{-1}B$ (multiplicando por la izquierda); $XA=B$ → $X=BA^{-1}$ (por la derecha). El lado importa porque el producto no es conmutativo.

**Rango.** Es el número máximo de filas (o columnas) linealmente independientes. Equivale al orden del mayor menor no nulo.
- **Por menores**: busca un menor de orden 2 no nulo; después prueba los de orden 3 que lo contienen, etc.
- **Por Gauss**: escalona la matriz con operaciones de fila (M06-L04); el rango es el número de filas no nulas.
- Con un parámetro: calcula el determinante, iguálalo a 0, y estudia por separado esos valores de $k$.

**Estrategia práctica.** Antes de aplicar Sarrus, busca filas o columnas con ceros, o crea ceros sumando múltiplos de una fila a otra (no cambia el determinante): el cálculo se simplifica mucho.

**Por qué $|A|=0$ impide invertir.** Si existiera $A^{-1}$, entonces $|A|\cdot|A^{-1}|=|I|=1$, lo que es imposible si $|A|=0$. La fórmula de la inversa divide entre $|A|$ por la misma razón.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Determinante 3×3
Calcula $\begin{vmatrix}1&2&3\\0&1&4\\5&6&0\end{vmatrix}$.

Desarrollando por la primera columna (tiene un cero): $1\cdot\begin{vmatrix}1&4\\6&0\end{vmatrix}-0+5\cdot\begin{vmatrix}2&3\\1&4\end{vmatrix}=1\cdot(-24)+5\cdot(8-3)=-24+25=1$.
:::

:::ejemplo Ejemplo 2 · Inversa 2×2
Calcula la inversa de $A=\begin{pmatrix}2&1\\5&3\end{pmatrix}$.

$|A|=6-5=1$. $A^{-1}=\begin{pmatrix}3&-1\\-5&2\end{pmatrix}$. Comprobación: $AA^{-1}=\begin{pmatrix}6-5&-2+2\\15-15&-5+6\end{pmatrix}=I$. ✔
:::

:::ejemplo Ejemplo 3 · Rango
Calcula el rango de $\begin{pmatrix}1&2&3\\2&4&6\\1&0&1\end{pmatrix}$.

La segunda fila es el doble de la primera, así que $|A|=0$ y el rango es menor que 3. El menor $\begin{vmatrix}1&2\\1&0\end{vmatrix}=-2\neq0$ (filas 1 y 3). **Rango 2.**
:::

:::error Error típico
En la inversa $2\times2$, cambiar de signo los elementos de la diagonal principal en lugar de intercambiarlos: lo correcto es intercambiar $a$ y $d$ y cambiar el signo de $b$ y $c$. Otro error: resolver $AX=B$ como $X=BA^{-1}$.
:::

## 6. Ejercicio guiado

¿Para qué valor de $k$ la matriz $\begin{pmatrix}1&k\\2&4\end{pmatrix}$ no tiene inversa?

:::pista Primera pista
No tiene inversa cuando su determinante es 0.
:::

:::pista Segunda pista
$|A|=4-2k$.
:::

:::solucion Solución guiada
$4-2k=0$ → $k=2$. Con $k=2$, la segunda fila $(2,4)$ es el doble de la primera $(1,2)$, lo que confirma que es singular.
:::

## 7. Práctica

**Fáciles**

1. Calcula $\begin{vmatrix}5&-2\\3&1\end{vmatrix}$.
2. Calcula el determinante de $\begin{pmatrix}2&1&0\\0&3&5\\0&0&-1\end{pmatrix}$.
3. Calcula la inversa de $\begin{pmatrix}4&7\\2&6\end{pmatrix}$.

**Medios**

4. Calcula el rango de $\begin{pmatrix}1&2\\3&6\end{pmatrix}$.
5. Calcula $\begin{vmatrix}1&1&1\\1&2&3\\1&4&9\end{vmatrix}$.

**Tipo examen / transferencia**

6. Sea $A=\begin{pmatrix}1&0&2\\0&1&1\\1&1&k\end{pmatrix}$. (a) ¿Para qué valores de $k$ es invertible? (b) Calcula $A^{-1}$ para $k=4$ y compruébalo.

:::solucion Soluciones paso a paso
1. $5+6=11$.
2. Triangular: $2\cdot3\cdot(-1)=-6$.
3. $|A|=24-14=10$; $A^{-1}=\dfrac{1}{10}\begin{pmatrix}6&-7\\-2&4\end{pmatrix}$.
4. $|A|=6-6=0$ y hay elementos no nulos: rango 1.
5. Sarrus: $18+3+4-2-12-9=2$.
6. (a) $|A|=1\cdot(k-1)-0+2\cdot(0-1)=k-3$. Invertible si $k\neq3$. (b) Con $k=4$, $|A|=1$ y $A^{-1}=\begin{pmatrix}3&2&-2\\1&2&-1\\-1&-1&1\end{pmatrix}$. Comprobación (primera fila de $A$ por las columnas): $(3-2,\ 2-2,\ -2+2)=(1,0,0)$ ✔; las demás filas dan $(0,1,0)$ y $(0,0,1)$.
:::

## 8. Cómo revisar tus errores

- Comprueba siempre la inversa multiplicando por $A$.
- Desarrolla por la fila o columna con más ceros.
- Recuerda el signo de los adjuntos: patrón de tablero $\begin{smallmatrix}+&-&+\\-&+&-\\+&-&+\end{smallmatrix}$.
- Si dos filas son proporcionales, el determinante es 0: úsalo para comprobar.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $|A|$ de orden 2: $ad-bc$; orden 3: Sarrus o desarrollo por adjuntos.
- Inversa si y solo si $|A|\neq0$: $A^{-1}=\dfrac{1}{|A|}(\text{Adj}A)^t$.
- Rango: mayor menor no nulo o filas no nulas tras escalonar.

**Vocabulario:** determinante, menor, adjunto, matriz regular, matriz singular, matriz inversa, matriz adjunta, rango, ecuación matricial.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, calcula un determinante 3×3 con parámetro, decide para qué valores es invertible y calcula una inversa comprobándola.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de álgebra lineal del temario oficial de Matemáticas +25; imprescindible para la discusión de sistemas (M06-L04) y el producto vectorial (M07-L04).
