---
id: matematicas-m07-l03
course: matematicas
module: M07
level: N2
title: Rectas y planos en el espacio y posiciones relativas
learning_objectives:
  - Escribir ecuaciones de rectas en el espacio y de planos a partir de un punto y un vector normal, o de tres puntos
  - Calcular intersecciones de rectas con planos y de planos entre sí
  - Estudiar las posiciones relativas de recta–recta, recta–plano y plano–plano con vectores o con rangos
prerequisites: [matematicas-m07-l02, matematicas-m06-l04]
skill_ids: [lines_3d, planes, relative_positions]
exam_alignment: [geometria]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

En el espacio aparecen los **planos**, y las rectas ya no se describen con una sola ecuación. En esta lección aprenderás a escribir rectas y planos, a calcular dónde se cortan y a estudiar sus posiciones relativas: si se cortan, si son paralelos, si una recta está contenida en un plano o si dos rectas se cruzan sin tocarse. Es una parte central del bloque de geometría del examen de Matemáticas +25, y conecta directamente con los sistemas 3×3 (M06-L04): cada plano es una ecuación lineal.

## 2. Lo que necesitas saber antes

- Rectas en el plano, vector director y vector normal (M07-L02).
- Sistemas 3×3, rangos y Rouché–Fröbenius (M06-L04).
- Producto escalar (M06-L01); el producto vectorial se profundiza en M07-L04.

## 3. Idea intuitiva

Una recta en el espacio sigue siendo «un punto y una dirección». Un plano, en cambio, es como una hoja infinita: se describe por un punto y la dirección **perpendicular** a la hoja (el vector normal), igual que una mesa queda definida por un punto de su superficie y la dirección de sus patas.

Dos rectas del espacio pueden cortarse, ser paralelas o **cruzarse**: no tocarse sin ser paralelas, como un puente que pasa por encima de una carretera. Esa cuarta posibilidad no existe en el plano.

## 4. Definición precisa

**Recta** por $P(x_0,y_0,z_0)$ con director $\vec v=(v_1,v_2,v_3)$:
- Vectorial: $(x,y,z)=(x_0,y_0,z_0)+t\,\vec v$.
- Paramétricas: $x=x_0+tv_1$, $y=y_0+tv_2$, $z=z_0+tv_3$.
- Continua: $\dfrac{x-x_0}{v_1}=\dfrac{y-y_0}{v_2}=\dfrac{z-z_0}{v_3}$.
- Implícita: intersección de dos planos no paralelos.

**Plano** por $P(x_0,y_0,z_0)$ con vector normal $\vec n=(A,B,C)$:
$$A(x-x_0)+B(y-y_0)+C(z-z_0)=0\quad\Longleftrightarrow\quad Ax+By+Cz+D=0.$$
- **Por tres puntos** no alineados $P,Q,R$: el normal es $\vec n=\vec{PQ}\times\vec{PR}$ (producto vectorial, M07-L04); o bien se impone el determinante $\begin{vmatrix}x-x_0&y-y_0&z-z_0\\u_1&u_2&u_3\\w_1&w_2&w_3\end{vmatrix}=0$ con $\vec u=\vec{PQ}$ y $\vec w=\vec{PR}$.
- **Un punto pertenece** al plano si sus coordenadas cumplen la ecuación.

**Posiciones relativas.**

| Elementos | Criterio con vectores |
|---|---|
| Plano–plano | Normales proporcionales → paralelos (o coincidentes si también lo es $D$); si no → se cortan en una recta de director $\vec n_1\times\vec n_2$ |
| Recta–plano | $\vec v\cdot\vec n\neq0$ → se cortan en un punto; $\vec v\cdot\vec n=0$ → paralela (si un punto de la recta no está en el plano) o contenida (si lo está) |
| Recta–recta | Directores proporcionales → paralelas o coincidentes. Si no: se cortan si $\det(\vec v_r,\vec v_s,\vec{P_rP_s})=0$; se cruzan si ese determinante es distinto de 0 |

**Intersección recta–plano.** Sustituye las paramétricas de la recta en la ecuación del plano, despeja $t$ y vuelve a las paramétricas. Si sale $0=0$, la recta está contenida; si sale $0=k$ con $k\neq0$, es paralela.

**Con rangos.** Las posiciones también se estudian con la matriz de coeficientes y la ampliada de las ecuaciones implícitas, como en M06-L04. Por ejemplo, dos planos: rango 1 y 1 → coincidentes; 1 y 2 → paralelos; 2 y 2 → se cortan en una recta.

**Dibujar ayuda.** Un esbozo rápido de los ejes con el plano o la recta (por ejemplo, marcando los cortes del plano con los ejes) evita muchos errores de signo y permite prever la respuesta antes de calcular.

**Por qué el normal define el plano.** Un punto $X$ está en el plano si y solo si el vector $\vec{PX}$ es perpendicular a $\vec n$, es decir, $\vec n\cdot\vec{PX}=0$. Desarrollando ese producto escalar se obtiene exactamente $A(x-x_0)+B(y-y_0)+C(z-z_0)=0$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Plano por un punto con normal
Plano que pasa por $A(1,0,2)$ con normal $(2,-1,3)$.

$2(x-1)-(y-0)+3(z-2)=0$ → $2x-y+3z-8=0$. Comprobación con $A$: $2-0+6-8=0$. ✔
:::

:::ejemplo Ejemplo 2 · Plano por tres puntos
Plano por $A(1,0,0)$, $B(0,2,0)$ y $C(0,0,3)$.

$\vec{AB}=(-1,2,0)$, $\vec{AC}=(-1,0,3)$. Normal $=\vec{AB}\times\vec{AC}=(6,3,2)$. Plano: $6(x-1)+3y+2z=0$ → $6x+3y+2z=6$. Comprobación con $B$: $6=6$ ✔; con $C$: $6=6$ ✔.
:::

:::ejemplo Ejemplo 3 · Recta y plano
Estudia la posición de $r:\ (x,y,z)=(1,2,0)+t(1,-1,2)$ y $\pi:\ x+y+z=5$, y halla el corte si existe.

$\vec v\cdot\vec n=1-1+2=2\neq0$: **se cortan** en un punto. Sustituyendo: $(1+t)+(2-t)+2t=5$ → $t=1$ → punto $(2,1,2)$. Comprobación: $2+1+2=5$. ✔
:::

:::error Error típico
Tomar el vector normal de un plano como si fuera un vector del plano: el normal es **perpendicular** al plano. Otro error: concluir que dos rectas del espacio se cortan solo porque no son paralelas; también pueden cruzarse.
:::

## 6. Ejercicio guiado

Estudia la posición de los planos $\pi_1:\ x+y+z=1$ y $\pi_2:\ x-y=0$, y halla un vector director de su recta de intersección.

:::pista Primera pista
Normales $(1,1,1)$ y $(1,-1,0)$. ¿Son proporcionales?
:::

:::pista Segunda pista
No lo son: los planos se cortan en una recta cuyo director es $\vec n_1\times\vec n_2$.
:::

:::solucion Solución guiada
$\vec n_1\times\vec n_2=(1\cdot0-1\cdot(-1),\ 1\cdot1-1\cdot0,\ 1\cdot(-1)-1\cdot1)=(1,1,-2)$. Comprobación: $(1,1,-2)\cdot(1,1,1)=0$ y $(1,1,-2)\cdot(1,-1,0)=0$. ✔
:::

## 7. Práctica

**Fáciles**

1. Plano que pasa por el origen con normal $(1,2,3)$.
2. ¿Pertenece $(1,1,1)$ al plano $2x-y+z=2$?
3. Ecuaciones paramétricas de la recta que pasa por $(0,1,2)$ y $(2,3,5)$.

**Medios**

4. Posición de $r:\ (x,y,z)=t(1,2,1)$ y $\pi:\ x-y+z=4$.
5. Posición de $r:\ (t,t,0)$ y $s:\ (1,0,\lambda)$.

**Tipo examen / transferencia**

6. Halla el plano que pasa por $A(1,1,1)$ y es perpendicular a la recta $r:\ (x,y,z)=(2,0,1)+t(1,-2,2)$. Calcula el punto donde $r$ corta a ese plano y la distancia del punto $B(2,0,1)$ al plano.

:::solucion Soluciones paso a paso
1. $x+2y+3z=0$.
2. $2-1+1=2$: sí.
3. Director $(2,2,3)$: $x=2t$, $y=1+2t$, $z=2+3t$.
4. $\vec v\cdot\vec n=1-2+1=0$: paralela o contenida. El punto $(0,0,0)$ de $r$ da $0\neq4$: **paralela**.
5. Directores $(1,1,0)$ y $(0,0,1)$, no proporcionales. Igualando: $t=1$, $t=0$: imposible, no se cortan. **Se cruzan**.
6. Normal = director de $r$: $x-2y+2z+D=0$; con $A$: $1-2+2+D=0$ → $D=-1$. Corte: $(2+t)-2(-2t)+2(1+2t)-1=0$ → $9t+3=0$ → $t=-\tfrac13$ → $\left(\tfrac53,\tfrac23,\tfrac13\right)$. Distancia de $B$: $\dfrac{|2-0+2-1|}{\sqrt{1+4+4}}=\dfrac{3}{3}=1$.
:::

## 8. Cómo revisar tus errores

- Comprueba que los puntos dados cumplen la ecuación del plano.
- Verifica que el normal es perpendicular a dos vectores del plano.
- En intersecciones, sustituye el punto obtenido en todas las ecuaciones.
- Para dos rectas no paralelas, calcula el determinante antes de decir que se cortan.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Recta: punto + director. Plano: punto + normal, $Ax+By+Cz+D=0$.
- Recta–plano: $\vec v\cdot\vec n$; plano–plano: normales; recta–recta: directores y determinante.
- Cuatro posiciones de dos rectas: coincidentes, paralelas, secantes o que se cruzan.

**Vocabulario:** plano, vector normal, ecuación general del plano, recta en el espacio, rectas que se cruzan, recta contenida, posición relativa.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, halla un plano por tres puntos y estudia la posición de una recta respecto a él.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de geometría del temario oficial de Matemáticas +25; se completa con ángulos y distancias en M07-L04.
