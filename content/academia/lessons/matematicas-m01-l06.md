---
id: matematicas-m01-l06
course: matematicas
module: M01
level: N1
title: Valor absoluto, distancia en la recta y ecuaciones e inecuaciones con valor absoluto
learning_objectives:
  - Interpretar el valor absoluto como distancia al cero y |a−b| como distancia entre dos números
  - Resolver ecuaciones del tipo |ax+b| = c separando en dos casos
  - Resolver inecuaciones |x−a| < r y |x−a| > r y expresar la solución con intervalos
prerequisites: [matematicas-m01-l05]
skill_ids: [absolute_value, abs_equations, abs_inequalities]
exam_alignment: [algebra, funciones]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

El valor absoluto mide **distancias** sin importar la dirección. Lo usarás para expresar tolerancias («la pieza debe medir 50 mm con un margen de 0,2 mm»), errores (M00-L07), distancias entre puntos de la recta y, más adelante, para definir funciones a trozos (M04-L04) y estudiar la continuidad. En esta lección aprenderás a resolver ecuaciones e inecuaciones con valor absoluto separando casos y a traducirlas a intervalos.

## 2. Lo que necesitas saber antes

- Inecuaciones de primer grado e intervalos, unión e intersección (M01-L05).
- Resolver ecuaciones de primer grado (M01-L02).
- Situar números negativos en la recta.

## 3. Idea intuitiva

El valor absoluto de un número es **lo lejos que está del cero**, sin importar el lado. El 5 y el $-5$ están los dos a 5 pasos del cero: $|5|=|-5|=5$.

Si preguntamos qué números están a 3 pasos del 2, la respuesta son dos: el 5 (3 a la derecha) y el $-1$ (3 a la izquierda). Eso es exactamente la ecuación $|x-2|=3$. Y si preguntamos qué números están **a menos de** 3 pasos del 2, la respuesta es todo el tramo entre $-1$ y 5: la inecuación $|x-2|<3$.

## 4. Definición precisa

- **Valor absoluto:**
$$|x|=\begin{cases}x & \text{si } x\ge0\\ -x & \text{si } x<0\end{cases}$$
  Nunca es negativo. Atención: $-x$ es positivo cuando $x$ es negativo ($|-7|=-(-7)=7$).
- **Distancia** entre $a$ y $b$ en la recta: $d(a,b)=|a-b|=|b-a|$.
- **Propiedades:** $|x|\ge0$; $|x|=0\iff x=0$; $|a\cdot b|=|a|\cdot|b|$; $\left|\dfrac ab\right|=\dfrac{|a|}{|b|}$; $|x|^2=x^2$; $\sqrt{x^2}=|x|$. En general, $|a+b|\le|a|+|b|$ (desigualdad triangular) y **no** se cumple $|a+b|=|a|+|b|$ si los signos son distintos.

**Ecuaciones:**
- $|E|=c$ con $c>0$: dos casos, $E=c$ o $E=-c$.
- $|E|=0$: un caso, $E=0$.
- $|E|=c$ con $c<0$: **sin solución** (un valor absoluto no puede ser negativo).
- $|E_1|=|E_2|$: $E_1=E_2$ o $E_1=-E_2$.

**Inecuaciones** (con $r>0$):
- $|x-a|<r\iff a-r<x<a+r$ → intervalo $(a-r,\,a+r)$: los puntos **cerca** de $a$.
- $|x-a|>r\iff x<a-r$ o $x>a+r$ → $(-\infty,a-r)\cup(a+r,+\infty)$: los puntos **lejos** de $a$.
- Con $\le$ o $\ge$ los extremos se incluyen.
- Si el coeficiente de $x$ no es 1, como $|2x-1|<5$, se escribe la desigualdad doble $-5<2x-1<5$ y se despeja.

**Tolerancias.** «Un valor $x$ de $50\pm0{,}2$» se escribe $|x-50|\le0{,}2$, es decir, $x\in[49{,}8;\,50{,}2]$. El centro es el valor nominal y el radio, la tolerancia.

**La gráfica del valor absoluto.** La función $y=|x|$ tiene forma de **V** con el vértice en el origen: para $x\ge0$ coincide con la recta $y=x$ y para $x<0$ con la recta $y=-x$. La gráfica de $y=|x-a|$ es la misma V desplazada hasta tener el vértice en $x=a$. Visualmente, resolver $|x-a|<r$ es buscar dónde la V está por debajo de la recta horizontal $y=r$, y resolver $|x-a|>r$, dónde está por encima. Esta imagen ayuda a no olvidar ninguno de los dos trozos.

**Conexión con el error.** El error absoluto de M00-L07 es exactamente un valor absoluto: $E_a=|\text{aproximación}-\text{valor real}|$. Decir que una medida tiene un error menor que 0,05 es decir que el valor real está en un intervalo de radio 0,05 alrededor de la medida.

**Por qué hay dos casos.** La definición del valor absoluto es una función a trozos: se comporta de una forma si lo de dentro es positivo y de otra si es negativo. Separar casos es simplemente aplicar la definición. Al final, conviene **comprobar** cada solución en la ecuación original, sobre todo cuando aparecen $x$ fuera del valor absoluto.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Ecuación
Resuelve $|2x-3|=7$.

1. Caso 1: $2x-3=7$ → $x=5$.
2. Caso 2: $2x-3=-7$ → $x=-2$.

Comprobación: $|10-3|=7$ ✔; $|-4-3|=7$ ✔. Soluciones: $x=5$ y $x=-2$.
:::

:::ejemplo Ejemplo 2 · Inecuación «cerca de»
Resuelve $|x+1|\le4$.

$|x-(-1)|\le4$: puntos a distancia como máximo 4 de $-1$. $-4\le x+1\le4$ → $-5\le x\le3$ → $[-5,3]$.
:::

:::ejemplo Ejemplo 3 · Inecuación «lejos de»
Resuelve $|3x-6|>9$.

$3x-6>9$ → $x>5$; o $3x-6<-9$ → $x<-1$. Solución: $(-\infty,-1)\cup(5,+\infty)$.
:::

:::error Error típico
Escribir $|x-2|<3\Rightarrow x-2<3$ y quedarse solo con $x<5$: se pierde el límite inferior. Lo correcto es $-3<x-2<3$, es decir, $(-1,5)$. Otro error: dar soluciones a $|x+4|=-2$; un valor absoluto nunca vale $-2$, no hay solución.
:::

## 6. Ejercicio guiado

Una pieza debe pesar 250 g con una tolerancia de 4 g. Escribe la condición con valor absoluto y decide si son aceptables piezas de 245 g y 253,5 g.

:::pista Primera pista
Centro 250 y radio 4: $|p-250|\le4$.
:::

:::pista Segunda pista
Calcula $|245-250|$ y $|253{,}5-250|$ y compáralos con 4.
:::

:::solucion Solución guiada
$|p-250|\le4\iff p\in[246,254]$. $|245-250|=5>4$: rechazada. $|253{,}5-250|=3{,}5\le4$: aceptada.
:::

## 7. Práctica

**Fáciles**

1. Calcula $|-12|$, $|3-8|$ y $-|-4|$.
2. ¿Qué distancia hay entre $-6$ y $9$ en la recta?
3. Resuelve $|x|=6$.

**Medios**

4. Resuelve $|4-x|=10$.
5. Resuelve $|2x+1|<7$ y escribe la solución como intervalo.

**Tipo examen / transferencia**

6. Resuelve $|x-1|=|2x+4|$ y comprueba las soluciones.

:::solucion Soluciones paso a paso
1. $12$; $|-5|=5$; $-4$.
2. $|9-(-6)|=15$.
3. $x=6$ o $x=-6$.
4. $4-x=10$ → $x=-6$; $4-x=-10$ → $x=14$.
5. $-7<2x+1<7$ → $-8<2x<6$ → $-4<x<3$ → $(-4,3)$.
6. $x-1=2x+4$ → $x=-5$; $x-1=-(2x+4)$ → $3x=-3$ → $x=-1$. Comprobación: $x=-5$: $|-6|=6$ y $|-6|=6$ ✔; $x=-1$: $|-2|=2$ y $|2|=2$ ✔.
:::

## 8. Cómo revisar tus errores

- Si el lado derecho de $|E|=c$ es negativo, para: no hay solución.
- Comprueba cada solución en la ecuación original.
- En inecuaciones, piensa «cerca» ($<$, un intervalo) o «lejos» ($>$, dos trozos) antes de calcular.
- Dibuja el centro y el radio en la recta.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $|x|$ = distancia al cero; $|a-b|$ = distancia entre $a$ y $b$.
- $|E|=c>0$: dos casos. $|E|<r$: intervalo centrado. $|E|>r$: unión de dos semirrectas.
- Tolerancias: $|x-\text{nominal}|\le\text{margen}$.

**Vocabulario:** valor absoluto, distancia, tolerancia, centro, radio, desigualdad triangular.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una ecuación con valor absoluto, una inecuación «cerca» y otra «lejos».

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; base de funciones a trozos (M04-L04) y de la definición de límite (M08).
