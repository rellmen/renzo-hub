---
id: matematicas-m04-l04
course: matematicas
module: M04
level: N2
title: Funciones definidas a trozos
learning_objectives:
  - Evaluar y representar funciones definidas a trozos, incluidas las de valor absoluto
  - Resolver ecuaciones con funciones a trozos comprobando que la solución está en el tramo correcto
  - Modelizar tarifas y tramos fiscales con funciones a trozos y detectar saltos
prerequisites: [matematicas-m04-l03, matematicas-m01-l06]
skill_ids: [piecewise_functions]
exam_alignment: [funciones]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Muchas situaciones reales no se describen con una sola fórmula: una tarifa de envío cambia según el peso, el impuesto sobre la renta aplica porcentajes distintos por tramos, una nómina paga las horas extra a otro precio. Las **funciones a trozos** usan una fórmula distinta en cada intervalo. En el examen de Matemáticas +25 aparecen muy a menudo, sobre todo en preguntas de continuidad con un parámetro (M08-L01) y en derivadas e integrales por tramos.

## 2. Lo que necesitas saber antes

- Gráficas de rectas y parábolas (M04-L01).
- Intervalos y desigualdades (M01-L05).
- Valor absoluto (M01-L06).

## 3. Idea intuitiva

Piensa en una tarifa de mensajería: hasta 2 kg pagas 5 € fijos; entre 2 y 10 kg pagas 5 € más 1,50 € por cada kilo que pase de 2; a partir de 10 kg, otra regla. Para saber cuánto pagas, primero miras **en qué tramo estás** y después aplicas la fórmula de ese tramo.

La gráfica de una función a trozos se dibuja pegando trozos de gráficas conocidas (rectas, parábolas, constantes), cada uno solo en su intervalo. En los puntos donde cambia la fórmula, la gráfica puede continuar sin cortes o dar un **salto**.

## 4. Definición precisa

Una función a trozos tiene la forma
$$f(x)=\begin{cases}f_1(x) & \text{si } x\in I_1\\ f_2(x) & \text{si } x\in I_2\\ \ \vdots & \end{cases}$$
donde los intervalos $I_1,I_2,\dots$ no se solapan. Su dominio es la unión de los intervalos donde está definida.

**Evaluar** $f(a)$: localiza el intervalo que contiene a $a$ (atención a los extremos: $<$ o $\le$) y usa **solo** esa fórmula.

**Representar**: dibuja cada fórmula solo en su intervalo. En los extremos, usa un punto relleno (●) si el extremo pertenece a ese tramo y un punto vacío (○) si no.

**Puntos de cambio**: en cada valor donde cambia la fórmula, compara el valor al que llega el tramo de la izquierda, el que sale del tramo de la derecha y el valor de la función. Si los tres coinciden, la gráfica no se corta (la función es continua ahí, M08-L01); si no, hay un **salto**.

**Valor absoluto como función a trozos.** $|E(x)|$ vale $E(x)$ donde $E(x)\ge0$ y $-E(x)$ donde $E(x)<0$. Por ejemplo,
$$|2x-4|=\begin{cases}-2x+4 & \text{si } x<2\\ 2x-4 & \text{si } x\ge2\end{cases}$$
Su gráfica es una V con el vértice en $(2,0)$.

**Ecuaciones con funciones a trozos.** Se resuelve la ecuación en **cada** tramo y se conserva una solución **solo si pertenece al intervalo** de ese tramo. Es el error más frecuente: obtener un valor con la fórmula de un tramo que, en realidad, cae en otro.

**Tramos fiscales y tarifas.** En un impuesto progresivo por tramos, cada porcentaje se aplica solo a la parte de la base que cae dentro de su tramo, no a toda la base. Por eso la cuota se escribe como función a trozos continua: al pasar de un tramo al siguiente no se paga de golpe más por la parte anterior. Es un buen ejemplo de por qué conviene comprobar los valores en los puntos de cambio.

**Por qué importa la comprobación del intervalo.** Cada fórmula es una descripción válida solo en su tramo. Fuera de él, describe otra función distinta que no es la nuestra. Una «solución» obtenida fuera de su tramo es la solución de otra ecuación.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Evaluar y detectar saltos
Sea $f(x)=\begin{cases}x+2 & x<0\\ x^2 & 0\le x\le2\\ 4 & x>2\end{cases}$. Calcula $f(-3)$, $f(1)$, $f(5)$ y estudia los puntos de cambio.

1. $f(-3)=-1$; $f(1)=1$; $f(5)=4$.
2. En $x=0$: por la izquierda la gráfica llega a $0+2=2$, pero $f(0)=0$: hay un **salto**.
3. En $x=2$: el tramo central da $4$ y el de la derecha también vale 4: **no** hay salto.
:::

:::ejemplo Ejemplo 2 · Tarifa de envío
Una mensajería cobra 5 € hasta 2 kg; 5 € más 1,50 € por kilo adicional hasta 10 kg; y por encima de 10 kg, 17 € más 1 € por kilo adicional. Escribe la función y calcula el precio de 7 kg y de 12 kg.

$$P(x)=\begin{cases}5 & 0<x\le2\\ 5+1{,}5(x-2) & 2<x\le10\\ 17+(x-10) & x>10\end{cases}$$
$P(7)=5+7{,}5=12{,}50$ €; $P(12)=17+2=19$ €. En $x=10$ ambos tramos dan 17 €: no hay salto.
:::

:::ejemplo Ejemplo 3 · Ecuación por tramos
Resuelve $f(x)=3$ con $f(x)=\begin{cases}2x+1 & x<1\\ 5-x & x\ge1\end{cases}$.

1. Tramo 1: $2x+1=3$ → $x=1$, pero el tramo exige $x<1$: **se descarta**.
2. Tramo 2: $5-x=3$ → $x=2\ge1$: **válida**.

Única solución: $x=2$.
:::

:::error Error típico
Evaluar $f(0)$ en el ejemplo 1 con la fórmula $x+2$ porque «está a la izquierda»; el 0 pertenece al tramo $0\le x\le2$, así que $f(0)=0$. Otro error: aplicar el porcentaje del tramo más alto a toda la base imponible en un impuesto progresivo.
:::

## 6. Ejercicio guiado

Escribe $|x+3|$ como función a trozos y calcula sus valores en $x=-5$ y $x=1$.

:::pista Primera pista
El valor de dentro, $x+3$, cambia de signo en $x=-3$.
:::

:::pista Segunda pista
Para $x\ge-3$, $|x+3|=x+3$; para $x<-3$, $|x+3|=-(x+3)$.
:::

:::solucion Solución guiada
$|x+3|=\begin{cases}-x-3 & x<-3\\ x+3 & x\ge-3\end{cases}$. Valores: $x=-5$ → $5-3=2$; $x=1$ → $4$. Comprobación: $|-2|=2$ y $|4|=4$. ✔
:::

## 7. Práctica

**Fáciles**

1. Con $g(x)=\begin{cases}3 & x<0\\ x+3 & x\ge0\end{cases}$, calcula $g(-2)$, $g(0)$ y $g(4)$.
2. Escribe $|x-1|$ como función a trozos.
3. ¿Hay salto en $x=0$ en la función $g$ del ejercicio 1?

**Medios**

4. Resuelve $h(x)=0$ con $h(x)=\begin{cases}x^2-4 & x<1\\ 2x-6 & x\ge1\end{cases}$.
5. Dibuja (describe) la gráfica de $f(x)=\begin{cases}-x & x<0\\ x^2 & x\ge0\end{cases}$ y da su recorrido.

**Tipo examen / transferencia**

6. Un impuesto ficticio grava al 0 % los primeros 10.000 € de base, al 20 % la parte entre 10.000 y 30.000 €, y al 30 % lo que supere 30.000 €. Escribe la cuota $T(x)$ como función a trozos, calcula $T(25.000)$ y $T(40.000)$, y comprueba que no hay saltos en los cambios de tramo.

:::solucion Soluciones paso a paso
1. $g(-2)=3$; $g(0)=3$; $g(4)=7$.
2. $|x-1|=\begin{cases}1-x & x<1\\ x-1 & x\ge1\end{cases}$.
3. No: por la izquierda vale 3 y $g(0)=3$.
4. Tramo 1: $x^2=4$ → $x=\pm2$; solo $x=-2<1$ vale. Tramo 2: $x=3\ge1$ vale. Soluciones: $-2$ y $3$.
5. Para $x<0$, la recta $y=-x$ (valores positivos); para $x\ge0$, la parábola $y=x^2$. Ambas llegan a 0 en el origen. Recorrido $[0,+\infty)$.
6. $T(x)=\begin{cases}0 & 0\le x\le10000\\ 0{,}2(x-10000) & 10000<x\le30000\\ 4000+0{,}3(x-30000) & x>30000\end{cases}$. $T(25000)=3000$ €; $T(40000)=4000+3000=7000$ €. En 10.000 ambos tramos dan 0; en 30.000 ambos dan 4.000: sin saltos.
:::

## 8. Cómo revisar tus errores

- Antes de evaluar, escribe en qué tramo cae el valor.
- En ecuaciones, comprueba que cada solución pertenece a su tramo.
- En los puntos de cambio, calcula los valores de los dos tramos para ver si hay salto.
- En la gráfica, marca bien los puntos rellenos y vacíos.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Una fórmula por intervalo; evaluar con la del tramo correcto.
- Puntos de cambio: comparar valores a izquierda y derecha.
- Ecuaciones: resolver por tramos y descartar soluciones fuera del tramo.
- $|E(x)|$ es una función a trozos con el cambio donde $E(x)=0$.

**Vocabulario:** función a trozos, tramo, punto de cambio, salto, punto relleno y vacío, tarifa por tramos, impuesto progresivo.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, modeliza una tarifa real por tramos y resuelve una ecuación con una función a trozos.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de funciones del temario oficial de Matemáticas +25; prepara la continuidad con parámetro (M08-L01) y la derivabilidad por tramos. Los tramos fiscales del ejercicio 6 son ficticios.
