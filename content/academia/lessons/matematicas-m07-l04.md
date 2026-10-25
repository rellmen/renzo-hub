---
id: matematicas-m07-l04
course: matematicas
module: M07
level: N2
title: Producto vectorial y mixto, ángulos y distancias en el espacio
learning_objectives:
  - Calcular el producto vectorial y el mixto e interpretarlos como área y volumen
  - Calcular ángulos entre rectas, entre planos y entre recta y plano
  - Calcular distancias de un punto a un plano, de un punto a una recta y entre rectas que se cruzan
prerequisites: [matematicas-m07-l03, matematicas-m06-l03]
skill_ids: [cross_product, angles_3d, distances_3d]
exam_alignment: [geometria]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Esta lección completa la geometría del espacio con las **medidas**: ángulos, distancias, áreas y volúmenes. La herramienta nueva es el **producto vectorial**, que a partir de dos vectores da un tercero perpendicular a ambos, cuya longitud es el área del paralelogramo que forman. Con él y con el **producto mixto** se calculan áreas de triángulos, volúmenes de tetraedros, normales de planos y distancias. Son preguntas habituales en el examen de Matemáticas +25 y, en Física, el producto vectorial describe momentos de fuerza y fuerzas magnéticas (F09).

## 2. Lo que necesitas saber antes

- Producto escalar y ángulo entre vectores (M06-L01).
- Determinantes de orden 3 (M06-L03).
- Rectas y planos en el espacio (M07-L03).

## 3. Idea intuitiva

El producto escalar responde a «¿cuánto apuntan dos vectores en la misma dirección?» y da un número. El producto vectorial responde a «¿qué dirección es perpendicular a los dos?» y da un **vector**. Su longitud es máxima cuando los vectores son perpendiculares y cero cuando son paralelos, porque mide cuánto «abren» un paralelogramo.

Si añades un tercer vector, el producto mixto mide el volumen de la caja inclinada (paralelepípedo) que forman los tres. Si sale 0, la caja está aplastada: los tres vectores están en el mismo plano.

## 4. Definición precisa

**Producto vectorial** de $\vec u=(u_1,u_2,u_3)$ y $\vec v=(v_1,v_2,v_3)$:
$$\vec u\times\vec v=\begin{vmatrix}\vec i&\vec j&\vec k\\u_1&u_2&u_3\\v_1&v_2&v_3\end{vmatrix}=(u_2v_3-u_3v_2,\ \ u_3v_1-u_1v_3,\ \ u_1v_2-u_2v_1).$$
- Es perpendicular a $\vec u$ y a $\vec v$.
- $|\vec u\times\vec v|=|\vec u|\,|\vec v|\sin\alpha$ = **área del paralelogramo**; el triángulo es la mitad.
- Anticonmutativo: $\vec v\times\vec u=-\vec u\times\vec v$. Es $\vec 0$ si los vectores son paralelos.

**Producto mixto**: $[\vec u,\vec v,\vec w]=\vec u\cdot(\vec v\times\vec w)=\det(\vec u,\vec v,\vec w)$.
- $|[\vec u,\vec v,\vec w]|$ = **volumen del paralelepípedo**; el tetraedro es $\dfrac16$ de ese valor.
- Es 0 si y solo si los tres vectores son coplanarios.

**Ángulos** (siempre el agudo, entre 0° y 90°):
- Entre rectas: $\cos\alpha=\dfrac{|\vec v_r\cdot\vec v_s|}{|\vec v_r|\,|\vec v_s|}$.
- Entre planos: $\cos\alpha=\dfrac{|\vec n_1\cdot\vec n_2|}{|\vec n_1|\,|\vec n_2|}$.
- Entre recta y plano: $\sin\alpha=\dfrac{|\vec v\cdot\vec n|}{|\vec v|\,|\vec n|}$ (seno, porque el normal es perpendicular al plano).

**Distancias:**
- Punto–plano: $d(P,\pi)=\dfrac{|Ax_0+By_0+Cz_0+D|}{\sqrt{A^2+B^2+C^2}}$.
- Punto–recta (recta por $A$ con director $\vec v$): $d(P,r)=\dfrac{|\vec{AP}\times\vec v|}{|\vec v|}$.
- Entre rectas que se cruzan ($r$ por $A$ con $\vec u$; $s$ por $B$ con $\vec v$): $d(r,s)=\dfrac{|[\vec{AB},\vec u,\vec v]|}{|\vec u\times\vec v|}$.
- Entre planos paralelos, o entre recta y plano paralelos: distancia de un punto cualquiera del primero al segundo.

**Por qué la distancia punto–recta.** El área del paralelogramo formado por $\vec{AP}$ y $\vec v$ es $|\vec{AP}\times\vec v|$. Ese mismo paralelogramo tiene base $|\vec v|$ y altura igual a la distancia de $P$ a la recta. Despejando la altura: área entre base. La distancia entre rectas que se cruzan sale igual: volumen del paralelepípedo entre área de la base.

**Proyecciones.** Además de las distancias, a menudo se pide el **punto proyección** de $P$ sobre un plano: se traza la recta que pasa por $P$ con dirección el normal del plano y se calcula su intersección con el plano (M07-L03). El simétrico de $P$ respecto al plano se obtiene después como en M07-L01: $P'=2Q-P$, siendo $Q$ la proyección.

**Orden de los vectores.** Para el producto vectorial, el orden cambia el sentido (no el módulo). Para áreas y volúmenes solo importa el valor absoluto, pero si necesitas un normal con un sentido concreto (por ejemplo, hacia fuera), respeta el orden: la regla de la mano derecha da el sentido de $\vec u\times\vec v$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Producto vectorial y área
Con $\vec u=(1,2,3)$ y $\vec v=(0,1,4)$, calcula $\vec u\times\vec v$ y el área del triángulo que forman.

$\vec u\times\vec v=(2\cdot4-3\cdot1,\ 3\cdot0-1\cdot4,\ 1\cdot1-2\cdot0)=(5,-4,1)$. Comprobación: $(5,-4,1)\cdot(1,2,3)=0$ ✔. Área del triángulo $=\dfrac12\sqrt{25+16+1}=\dfrac{\sqrt{42}}2\approx3{,}24$.
:::

:::ejemplo Ejemplo 2 · Distancia punto–plano
Distancia de $P(1,2,3)$ a $\pi:\ 2x-y+2z+1=0$.

$d=\dfrac{|2-2+6+1|}{\sqrt{4+1+4}}=\dfrac{7}{3}\approx2{,}33$.
:::

:::ejemplo Ejemplo 3 · Ángulo recta–plano
Ángulo entre la recta de director $(1,0,1)$ y el plano $z=0$ (normal $(0,0,1)$).

$\sin\alpha=\dfrac{|1|}{\sqrt2\cdot1}=\dfrac{\sqrt2}{2}$ → $\alpha=45^\circ$.
:::

:::error Error típico
Usar el coseno en el ángulo recta–plano: daría el ángulo entre la recta y el **normal**, que es el complementario. Otro error: equivocarse en el signo de la segunda componente del producto vectorial; usa la fórmula del determinante con cuidado y comprueba la perpendicularidad.
:::

## 6. Ejercicio guiado

Calcula el volumen del paralelepípedo determinado por $\vec u=(1,0,0)$, $\vec v=(0,2,0)$ y $\vec w=(1,1,3)$.

:::pista Primera pista
El volumen es el valor absoluto del determinante con los tres vectores como filas.
:::

:::pista Segunda pista
Desarrolla por la primera fila, que tiene dos ceros.
:::

:::solucion Solución guiada
$\begin{vmatrix}1&0&0\\0&2&0\\1&1&3\end{vmatrix}=1\cdot(2\cdot3-0\cdot1)=6$. Volumen 6 unidades cúbicas.
:::

## 7. Práctica

**Fáciles**

1. Calcula $(1,0,0)\times(0,1,0)$.
2. Área del triángulo de vértices $(0,0,0)$, $(2,0,0)$ y $(0,3,0)$.
3. Ángulo entre los planos $x+y+z=1$ y $x-y=0$.

**Medios**

4. Distancia del origen al plano $x+2y+2z-9=0$.
5. Distancia de $P(1,1,1)$ a la recta que pasa por el origen con director $(1,0,0)$.

**Tipo examen / transferencia**

6. Tetraedro de vértices $A(0,0,0)$, $B(1,0,0)$, $C(0,2,0)$ y $D(0,0,3)$. Calcula su volumen, el área de la cara $BCD$ y la altura desde $A$ sobre esa cara. Comprueba la altura con la distancia de $A$ al plano $BCD$.

:::solucion Soluciones paso a paso
1. $(0,0,1)$.
2. $\dfrac12|(2,0,0)\times(0,3,0)|=\dfrac12|(0,0,6)|=3$.
3. Normales $(1,1,1)$ y $(1,-1,0)$: producto escalar 0 → $90^\circ$ (perpendiculares).
4. $\dfrac{|-9|}{\sqrt{1+4+4}}=3$.
5. $\vec{AP}\times\vec v=(1,1,1)\times(1,0,0)=(0,1,-1)$; $d=\dfrac{\sqrt2}{1}=\sqrt2\approx1{,}41$.
6. Volumen $=\dfrac16\left|\det\big((1,0,0),(0,2,0),(0,0,3)\big)\right|=\dfrac66=1$. $\vec{BC}=(-1,2,0)$, $\vec{BD}=(-1,0,3)$, producto $(6,3,2)$ de módulo 7 → área $3{,}5$. Altura $=\dfrac{3V}{\text{área}}=\dfrac{3}{3{,}5}=\dfrac67\approx0{,}857$. Plano $BCD$: $6x+3y+2z=6$; $d(A)=\dfrac{6}{7}$. ✔
:::

## 8. Cómo revisar tus errores

- Comprueba que $\vec u\times\vec v$ es perpendicular a ambos (producto escalar 0).
- Áreas y volúmenes: valor absoluto.
- Ángulo recta–plano con seno; rectas y planos entre sí, con coseno.
- Si dos métodos distintos dan la misma distancia, el resultado es fiable.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $\vec u\times\vec v$: perpendicular a ambos, módulo = área del paralelogramo.
- $[\vec u,\vec v,\vec w]$: volumen del paralelepípedo; tetraedro $\frac16$.
- Ángulos con coseno (rectas, planos) o seno (recta–plano); distancias con las fórmulas de área y volumen.

**Vocabulario:** producto vectorial, producto mixto, vectores coplanarios, paralelepípedo, tetraedro, distancia punto–plano, punto–recta, entre rectas que se cruzan.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, calcula un área con el producto vectorial, un volumen con el mixto y una distancia punto–plano.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de geometría del temario oficial de Matemáticas +25; cierra el módulo M07.
