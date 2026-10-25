---
id: matematicas-m04-l05
course: matematicas
module: M04
level: N2
title: Composición de funciones y función inversa
learning_objectives:
  - Calcular la composición de dos funciones y su valor en un punto, sabiendo que el orden importa
  - Decidir si una función es inyectiva y calcular su inversa despejando
  - Relacionar las gráficas de una función y su inversa por simetría respecto de y = x
prerequisites: [matematicas-m04-l02, matematicas-m01-l03]
skill_ids: [function_composition, inverse_function]
exam_alignment: [funciones]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Muchas funciones se construyen encadenando otras: primero se aplica un descuento y después el IVA; primero se calcula el cuadrado y después la raíz. Eso es la **composición**. La operación contraria, deshacer lo que hace una función (pasar de grados Fahrenheit a Celsius y volver, recuperar el precio sin IVA), es la **función inversa**. La composición es imprescindible para la regla de la cadena de las derivadas (M08-L03), y la inversa explica por qué el logaritmo deshace la exponencial (M04-L06).

## 2. Lo que necesitas saber antes

- Dominio y recorrido (M04-L02).
- Despejar una variable en una fórmula (M01-L03).
- Gráficas de funciones elementales (M04-L01).

## 3. Idea intuitiva

Piensa en dos máquinas en una cadena de montaje: la primera, $f$, coloca la etiqueta; la segunda, $g$, embala. La pieza pasa primero por $f$ y luego por $g$: el resultado es $g(f(x))$. Si cambias el orden (embalar y luego etiquetar), el resultado es otro. Por eso la composición **no es conmutativa**.

La función inversa es la máquina que deshace el trabajo: si $f$ convierte euros sin IVA en euros con IVA multiplicando por 1,21, su inversa divide entre 1,21. Para poder deshacer sin ambigüedad, $f$ no puede dar el mismo resultado a partir de dos entradas distintas; si lo hiciera, no sabríamos a cuál volver.

## 4. Definición precisa

- **Composición**: $(g\circ f)(x)=g\big(f(x)\big)$. Se lee «$g$ compuesta con $f$» y se aplica **primero $f$**, después $g$.
- **Dominio de** $g\circ f$: los $x$ del dominio de $f$ tales que $f(x)$ está en el dominio de $g$.
- En general, $g\circ f\neq f\circ g$.
- **Función identidad**: $I(x)=x$.
- **Función inyectiva**: valores distintos de $x$ dan valores distintos de $f(x)$; es decir, si $f(a)=f(b)$ entonces $a=b$. Gráficamente, ninguna recta horizontal corta a la gráfica más de una vez (**prueba de la recta horizontal**).
- **Función inversa**: si $f$ es inyectiva, su inversa $f^{-1}$ cumple $f^{-1}\big(f(x)\big)=x$ y $f\big(f^{-1}(x)\big)=x$. El dominio de $f^{-1}$ es el recorrido de $f$, y viceversa.
- **Cálculo de la inversa**: (1) escribe $y=f(x)$; (2) despeja $x$ en función de $y$; (3) intercambia los nombres de las letras; (4) comprueba con $f\big(f^{-1}(x)\big)=x$.
- **Gráfica**: las gráficas de $f$ y $f^{-1}$ son **simétricas respecto de la recta $y=x$**, porque si el punto $(a,b)$ está en la gráfica de $f$, el punto $(b,a)$ está en la de $f^{-1}$.

**Atención a la notación.** $f^{-1}(x)$ es la función inversa, **no** $\dfrac{1}{f(x)}$. Por ejemplo, si $f(x)=2x$, entonces $f^{-1}(x)=\dfrac{x}{2}$, mientras que $\dfrac{1}{f(x)}=\dfrac{1}{2x}$.

**Restringir el dominio.** Una función no inyectiva puede tener inversa en una parte de su dominio. $f(x)=x^2$ no es inyectiva en $\mathbb R$ ($f(2)=f(-2)$), pero sí en $[0,+\infty)$, y ahí su inversa es $\sqrt{x}$. Así se definen las raíces y, más adelante, las funciones trigonométricas inversas.

**Descomponer una función.** Reconocer de qué funciones está compuesta otra es tan útil como componer: $h(x)=\sqrt{x^2+1}$ es $g\circ f$ con $f(x)=x^2+1$ y $g(x)=\sqrt x$. Esta lectura «de fuera hacia dentro» es exactamente la que se usa al derivar con la regla de la cadena.

**Por qué el orden importa.** En $(g\circ f)(x)$ la salida de $f$ es la entrada de $g$. Si $f$ suma 1 y $g$ eleva al cuadrado, $g(f(3))=16$ pero $f(g(3))=10$: sumar y luego elevar no es lo mismo que elevar y luego sumar.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Composición en los dos órdenes
Con $f(x)=2x+1$ y $g(x)=x^2$, calcula $(g\circ f)(x)$, $(f\circ g)(x)$ y $(g\circ f)(1)$.

1. $(g\circ f)(x)=g(2x+1)=(2x+1)^2=4x^2+4x+1$.
2. $(f\circ g)(x)=f(x^2)=2x^2+1$.
3. $(g\circ f)(1)=g(3)=9$. Son funciones distintas: el orden importa.
:::

:::ejemplo Ejemplo 2 · Inversa de una función lineal
Halla la inversa de $f(x)=\dfrac{3x-2}{5}$.

1. $y=\dfrac{3x-2}{5}$ → $5y=3x-2$ → $x=\dfrac{5y+2}{3}$.
2. Intercambiando: $f^{-1}(x)=\dfrac{5x+2}{3}$.
3. Comprobación: $f\big(f^{-1}(x)\big)=\dfrac{3\cdot\frac{5x+2}{3}-2}{5}=\dfrac{5x}{5}=x$. ✔
:::

:::ejemplo Ejemplo 3 · Inversa de una función racional
Halla la inversa de $f(x)=\dfrac{x+1}{x-2}$.

1. $y(x-2)=x+1$ → $yx-2y=x+1$ → $x(y-1)=2y+1$ → $x=\dfrac{2y+1}{y-1}$.
2. $f^{-1}(x)=\dfrac{2x+1}{x-1}$, con $x\neq1$ (el recorrido de $f$ no contiene el 1).
:::

:::error Error típico
Calcular $(g\circ f)(x)$ aplicando primero $g$: con los datos del ejemplo 1, escribir $2x^2+1$, que es $f\circ g$. Otro error: escribir $f^{-1}(x)=\dfrac{1}{2x+1}$ para $f(x)=2x+1$; eso es el inverso del valor, no la función inversa, que es $\dfrac{x-1}{2}$.
:::

## 6. Ejercicio guiado

La fórmula $C=\dfrac{5(F-32)}{9}$ pasa de grados Fahrenheit a Celsius. Halla la fórmula inversa y calcula cuántos grados Fahrenheit son 25 °C.

:::pista Primera pista
Despeja $F$: multiplica por 9, divide entre 5 y suma 32.
:::

:::pista Segunda pista
$9C=5(F-32)$ → $F-32=\dfrac{9C}{5}$.
:::

:::solucion Solución guiada
$F=\dfrac{9C}{5}+32$. Con $C=25$: $F=45+32=77$ °F. Comprobación: $\dfrac{5(77-32)}{9}=25$. ✔
:::

## 7. Práctica

**Fáciles**

1. Con $f(x)=x+3$ y $g(x)=2x$, calcula $(f\circ g)(4)$ y $(g\circ f)(4)$.
2. Con $f(x)=x^2-1$ y $g(x)=x+2$, escribe $(f\circ g)(x)$.
3. Halla la inversa de $f(x)=4x-7$.

**Medios**

4. Halla la inversa de $f(x)=x^3+1$.
5. Halla la inversa de $f(x)=\dfrac{x+1}{x-2}$ y comprueba con $x=3$.

**Tipo examen / transferencia**

6. Un precio sin IVA $x$ recibe un descuento del 10 % y después se aplica un IVA del 21 %. Escribe las funciones $d(x)$ (descuento) y $v(x)$ (IVA), la composición que da el precio final, su inversa, y calcula qué precio sin IVA corresponde a un precio final de 217,80 €.

:::solucion Soluciones paso a paso
1. $(f\circ g)(4)=f(8)=11$; $(g\circ f)(4)=g(7)=14$.
2. $(x+2)^2-1=x^2+4x+3$.
3. $y=4x-7$ → $x=\dfrac{y+7}{4}$ → $f^{-1}(x)=\dfrac{x+7}{4}$.
4. $y=x^3+1$ → $x=\sqrt[3]{y-1}$ → $f^{-1}(x)=\sqrt[3]{x-1}$.
5. $f^{-1}(x)=\dfrac{2x+1}{x-1}$. $f(3)=\dfrac41=4$ y $f^{-1}(4)=\dfrac{9}{3}=3$. ✔
6. $d(x)=0{,}9x$, $v(x)=1{,}21x$; precio final $(v\circ d)(x)=1{,}089x$. Inversa: $\dfrac{x}{1{,}089}$. $\dfrac{217{,}80}{1{,}089}=200$ €.
:::

## 8. Cómo revisar tus errores

- En $g\circ f$, escribe primero $f(x)$ y sustitúyelo dentro de $g$.
- Comprueba siempre la inversa con $f\big(f^{-1}(x)\big)=x$ o con un número.
- Antes de buscar la inversa, comprueba que la función es inyectiva.
- No confundas $f^{-1}(x)$ con $\dfrac{1}{f(x)}$.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $(g\circ f)(x)=g(f(x))$: primero $f$; no conmutativa.
- Inversa: solo si $f$ es inyectiva; despejar e intercambiar; gráfica simétrica respecto de $y=x$.
- $f^{-1}\neq\dfrac1f$.

**Vocabulario:** composición, función identidad, inyectiva, función inversa, prueba de la recta horizontal, simetría respecto de $y=x$.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, compón dos funciones en ambos órdenes y calcula la inversa de una función racional sencilla.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de funciones del temario oficial de Matemáticas +25; prepara exponenciales y logaritmos (M04-L06) y la regla de la cadena (M08-L03).
