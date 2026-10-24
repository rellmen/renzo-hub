---
id: matematicas-m01-l05
course: matematicas
module: M01
level: N1
title: Desigualdades, intervalos y recta real
learning_objectives:
  - Representar conjuntos de números reales con intervalos, desigualdades y en la recta
  - Resolver inecuaciones de primer grado, invirtiendo el sentido al multiplicar o dividir por un negativo
  - Resolver sistemas de inecuaciones y expresar la solución como intersección de intervalos
prerequisites: [matematicas-m01-l02]
skill_ids: [intervals, linear_inequalities]
exam_alignment: [algebra, funciones]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una ecuación pregunta «¿cuándo es igual?»; una inecuación pregunta «¿cuándo es mayor o menor?». La respuesta ya no es un número, sino un **conjunto** de números, que se escribe con **intervalos**. En el examen de Matemáticas +25 los intervalos aparecen al calcular el dominio de una función, al estudiar dónde crece o decrece (derivadas) y al indicar dónde es positiva o negativa. En problemas de contexto expresan condiciones como «el coste no puede superar 500 €».

## 2. Lo que necesitas saber antes

- Resolver ecuaciones de primer grado con paréntesis y fracciones (M01-L02).
- Orden de los números enteros y fracciones en la recta (M00-L01, M00-L03): $-5<-2$.
- Signos al multiplicar: negativo por negativo es positivo.

## 3. Idea intuitiva

Las desigualdades funcionan como una balanza **desequilibrada**: si el platillo izquierdo pesa más, seguirá pesando más si añades lo mismo a los dos lados. Puedes sumar, restar, multiplicar o dividir por un número positivo sin que cambie nada.

Pero hay una trampa: multiplicar por un número negativo **da la vuelta** al orden. Es fácil de ver: $2<5$, pero $-2>-5$ (en la recta, $-2$ está más a la derecha que $-5$). Por eso, al multiplicar o dividir los dos miembros por un negativo, el signo de la desigualdad se invierte.

## 4. Definición precisa

**Símbolos:** $<$ (menor), $\le$ (menor o igual), $>$ (mayor), $\ge$ (mayor o igual).

**Intervalos:**

| Desigualdad | Intervalo | En la recta |
|---|---|---|
| $a<x<b$ | $(a,b)$ abierto | extremos vacíos |
| $a\le x\le b$ | $[a,b]$ cerrado | extremos rellenos |
| $a\le x<b$ | $[a,b)$ semiabierto | $a$ incluido |
| $x>a$ | $(a,+\infty)$ | semirrecta |
| $x\le b$ | $(-\infty,b]$ | semirrecta |
| todos los reales | $(-\infty,+\infty)=\mathbb R$ | recta entera |

El infinito **nunca** se incluye: siempre lleva paréntesis.

**Unión e intersección:** $A\cup B$ son los números que están en $A$ **o** en $B$; $A\cap B$, los que están en ambos. Ejemplo: $(-\infty,2)\cup(5,+\infty)$ son los $x<2$ o $x>5$; $[0,4]\cap(2,7)=(2,4]$.

**Propiedades de las desigualdades:**
1. Sumar o restar el mismo número a ambos miembros conserva el sentido.
2. Multiplicar o dividir por un número **positivo** conserva el sentido.
3. Multiplicar o dividir por un número **negativo invierte** el sentido.

**Inecuación de primer grado:** se resuelve como una ecuación (paréntesis, denominadores, agrupar, despejar) aplicando la regla 3 cuando corresponda. La solución es un intervalo.

**Sistema de inecuaciones:** se resuelve cada una por separado y la solución es la **intersección** de los intervalos. Si la intersección es vacía, el sistema no tiene solución.

**Desigualdad doble:** $-3<2x+1\le7$ se resuelve operando en los tres miembros a la vez: $-4<2x\le6$ → $-2<x\le3$ → $(-2,3]$.

**Por qué se invierte el sentido.** Que $a<b$ significa que $b-a$ es positivo. Al multiplicar por $-1$, la diferencia se convierte en $-b-(-a)=-(b-a)$, que es negativa; por tanto $-a>-b$. La propiedad no es un truco: es una consecuencia de que multiplicar por un negativo refleja la recta.

**Traducir el enunciado.** «Como máximo», «no más de», «no supera» se escriben $\le$; «al menos», «como mínimo», «no menos de», $\ge$; «menos de» y «más de», sin el igual. Un error de traducción cambia los extremos del intervalo.

**Comprobación.** Elige un número **dentro** del intervalo solución y otro **fuera**, y sustitúyelos en la inecuación original: el primero debe cumplirla y el segundo no. Si el extremo es cerrado, comprueba también que el extremo la cumple.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Inecuación con cambio de sentido
Resuelve $5-3x\ge14$.

1. Resta 5: $-3x\ge9$.
2. Divide entre $-3$ **invirtiendo**: $x\le-3$.
3. Solución: $(-\infty,-3]$.

Comprobación: $x=-4$: $5+12=17\ge14$ ✔; $x=0$: $5\ge14$ ✗ (está fuera, correcto).
:::

:::ejemplo Ejemplo 2 · Con fracciones
Resuelve $\dfrac{x-1}{2}-\dfrac{x}{3}<1$.

1. mcm 6: $3(x-1)-2x<6$.
2. $3x-3-2x<6$ → $x<9$.
3. Solución: $(-\infty,9)$.
:::

:::ejemplo Ejemplo 3 · Sistema
Resuelve $\begin{cases}2x-4>0\\ x+3\le8\end{cases}$

1. Primera: $x>2$ → $(2,+\infty)$.
2. Segunda: $x\le5$ → $(-\infty,5]$.
3. Intersección: $(2,5]$.
:::

:::error Error típico
Olvidar invertir el sentido: de $-2x<6$ concluir $x<-3$. Lo correcto es $x>-3$. Comprueba con $x=0$: $0<6$ es cierto, así que el 0 debe estar en la solución, y $0>-3$. ✔ Otro error: escribir $[2,+\infty]$; el infinito siempre va con paréntesis.
:::

## 6. Ejercicio guiado

Una empresa de alquiler cobra 30 € fijos más 0,20 € por kilómetro. Con un presupuesto máximo de 75 €, ¿cuántos kilómetros puedes recorrer? Expresa la solución como intervalo.

:::pista Primera pista
Escribe la condición «el coste no supera 75»: $30+0{,}2x\le75$. Los kilómetros tampoco pueden ser negativos.
:::

:::pista Segunda pista
Despeja: $0{,}2x\le45$. Divide entre $0{,}2$ (positivo: el sentido no cambia).
:::

:::solucion Solución guiada
$x\le225$ y $x\ge0$ → $[0,225]$ km. Comprobación: $30+0{,}2\cdot225=75$ ✔ (justo el máximo).
:::

## 7. Práctica

**Fáciles**

1. Escribe como intervalo: $-1\le x<4$.
2. Escribe como desigualdad: $(-\infty,0]$.
3. Resuelve $3x+2>11$.

**Medios**

4. Resuelve $2(x-3)\ge5x+3$.
5. Calcula $[-2,6)\cap(1,9]$ y $(-\infty,1)\cup[3,5]$ representados en la recta.

**Tipo examen / transferencia**

6. Resuelve el sistema $\begin{cases}\dfrac{x}{2}-1\le\dfrac{x}{3}\\ 4-x<2x+1\end{cases}$ y comprueba con un valor interior y otro exterior.

:::solucion Soluciones paso a paso
1. $[-1,4)$.
2. $x\le0$.
3. $3x>9$ → $x>3$ → $(3,+\infty)$.
4. $2x-6\ge5x+3$ → $-3x\ge9$ → $x\le-3$ → $(-\infty,-3]$.
5. $[-2,6)\cap(1,9]=(1,6)$. La unión no se simplifica: $(-\infty,1)\cup[3,5]$, dos trozos separados.
6. Primera, por 6: $3x-6\le2x$ → $x\le6$. Segunda: $3<3x$ → $x>1$. Solución $(1,6]$. Interior $x=3$: $0{,}5\le1$ ✔ y $1<7$ ✔. Exterior $x=0$: $-1\le0$ ✔ pero $4<1$ ✗, así que 0 no es solución. ✔
:::

## 8. Cómo revisar tus errores

- Cada vez que multipliques o dividas por un negativo, marca el paso y gira el símbolo.
- Comprueba con un número dentro y otro fuera del intervalo.
- Revisa los extremos: ¿el problema dice «como máximo» ($\le$) o «menos de» ($<$)?
- En un sistema, dibuja ambos intervalos en la misma recta antes de escribir la intersección.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Intervalos abiertos, cerrados y semiabiertos; el infinito siempre abierto.
- Inecuaciones: como ecuaciones, pero multiplicar o dividir por negativo invierte el sentido.
- Sistemas: intersección de soluciones.

**Vocabulario:** desigualdad, inecuación, intervalo, extremo, semirrecta, unión, intersección, conjunto vacío.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una inecuación con coeficiente negativo y un sistema de dos inecuaciones, y dibuja la solución.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N1 (4.º ESO). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; base del dominio de funciones (M04-L02), del valor absoluto (M01-L06) y del estudio de la monotonía con derivadas (M08-L05).
