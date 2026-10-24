---
id: matematicas-m08-l01
course: matematicas
module: M08
level: N2
title: Límites intuitivos y continuidad
learning_objectives:
  - Calcular límites en un punto por sustitución y resolver la indeterminación 0/0 factorizando
  - Calcular límites en el infinito de cocientes de polinomios
  - Estudiar la continuidad de una función, también definida a trozos
prerequisites: [matematicas-m04-l01, matematicas-m02-l01]
skill_ids: [limits, continuity]
exam_alignment: [analisis]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

El límite responde a la pregunta «¿a qué valor se acerca $f(x)$ cuando $x$ se acerca a un número?». Es la idea que sostiene todo el cálculo: la derivada es un límite y la integral también. En esta lección aprenderás a calcular los límites que aparecen en el examen de Matemáticas +25, a resolver la indeterminación más común ($\tfrac{0}{0}$), a calcular límites en el infinito (asíntotas horizontales) y a decidir si una función es **continua**, algo que se pregunta casi siempre con funciones definidas a trozos y un parámetro.

## 2. Lo que necesitas saber antes

- Evaluar funciones y esbozar rectas y parábolas (M04-L01).
- Factorizar con factor común, identidades y trinomios (M02-L01): $x^2-9=(x+3)(x-3)$.
- Simplificar fracciones algebraicas cancelando **factores**, nunca términos.

## 3. Idea intuitiva

Piensa en la función $f(x)=\dfrac{x^2-1}{x-1}$. En $x=1$ no se puede calcular: daría $\tfrac{0}{0}$. Pero prueba valores cercanos: $f(0{,}9)=1{,}9$, $f(0{,}99)=1{,}99$, $f(1{,}01)=2{,}01$. Los valores se acercan a 2, tanto por la izquierda como por la derecha. Decimos que **el límite cuando $x$ tiende a 1 es 2**, aunque en 1 la función no exista. El límite habla de los alrededores, no del punto.

Una función es **continua** en un punto si puedes dibujar su gráfica allí sin levantar el lápiz: el valor de la función coincide con el valor al que se acerca.

## 4. Definición precisa

- **Límite:** $\lim_{x\to a}f(x)=L$ significa que $f(x)$ se acerca tanto como queramos a $L$ tomando $x$ suficientemente cerca de $a$ (con $x\neq a$).
- **Límites laterales:** $\lim_{x\to a^-}f(x)$ (por la izquierda, $x<a$) y $\lim_{x\to a^+}f(x)$ (por la derecha). **El límite existe si y solo si ambos laterales existen y son iguales.**
- **Sustitución directa:** para polinomios, y para cocientes de polinomios cuando el denominador no se anula, $\lim_{x\to a}f(x)=f(a)$.
- **Indeterminación $\tfrac{0}{0}$:** en un cociente de polinomios indica que $(x-a)$ es factor del numerador y del denominador. Se factoriza, se simplifica y se vuelve a sustituir.
- **$\tfrac{k}{0}$ con $k\neq0$:** el límite es infinito (asíntota vertical); se estudian los signos laterales.
- **Límites en el infinito de** $\dfrac{P(x)}{Q(x)}$, comparando grados:
  - grado $P<$ grado $Q$: el límite es $0$;
  - grado $P=$ grado $Q$: el límite es el cociente de los coeficientes principales;
  - grado $P>$ grado $Q$: el límite es $\pm\infty$.
- **Continuidad en $a$:** $f$ es continua en $a$ si (1) existe $f(a)$, (2) existe $\lim_{x\to a}f(x)$ y (3) son iguales.
- Los polinomios son continuos en todo $\mathbb{R}$; los cocientes de polinomios lo son salvo donde se anula el denominador.

**Por qué funciona la factorización en $\tfrac{0}{0}$.** Si numerador y denominador valen 0 en $x=a$, ambos tienen la raíz $a$ y, por tanto, el factor $(x-a)$. Para $x\neq a$ ese factor se puede cancelar, y como el límite no mira el valor en $a$, la función simplificada tiene el mismo límite.

**Por qué solo importan los términos de mayor grado en el infinito.** Divide numerador y denominador entre la mayor potencia de $x$. En $\dfrac{4x^2-x+7}{2x^2+5}$ queda $\dfrac{4-\frac1x+\frac{7}{x^2}}{2+\frac{5}{x^2}}$; cuando $x$ crece, cada fracción con $x$ abajo tiende a 0 y el cociente se acerca a $\dfrac{4}{2}$. Por eso la regla de los grados no es un truco, sino una consecuencia de que $\dfrac{1}{x}\to0$.

**Funciones a trozos.** En el punto donde cambia la fórmula, la continuidad se estudia con límites laterales: cada lateral se calcula con la fórmula de su lado.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Indeterminación 0/0
Calcula $\lim_{x\to3}\dfrac{x^2-9}{x^2-3x}$.

1. Sustituir: $\dfrac{0}{0}$, indeterminación.
2. Factorizar: $\dfrac{(x+3)(x-3)}{x(x-3)}$.
3. Simplificar ($x\neq3$): $\dfrac{x+3}{x}$.
4. Sustituir: $\dfrac{6}{3}=2$.

**Resultado: 2.**
:::

:::ejemplo Ejemplo 2 · Límite en el infinito
Calcula $\lim_{x\to\infty}\dfrac{4x^2-x+7}{2x^2+5}$ y $\lim_{x\to\infty}\dfrac{3x+1}{x^2-2}$.

1. Mismo grado (2 y 2): cociente de coeficientes principales $\dfrac{4}{2}=2$. Asíntota horizontal $y=2$.
2. Grado del numerador menor: límite $0$. Asíntota horizontal $y=0$.
:::

:::ejemplo Ejemplo 3 · Continuidad con parámetro
Halla $k$ para que sea continua en $x=2$:
$$f(x)=\begin{cases}x^2+k & \text{si } x<2\\ 3x-1 & \text{si } x\ge2\end{cases}$$

1. $f(2)=3\cdot2-1=5$.
2. Lateral derecho: $\lim_{x\to2^+}(3x-1)=5$.
3. Lateral izquierdo: $\lim_{x\to2^-}(x^2+k)=4+k$.
4. Continuidad: $4+k=5$ → $k=1$.
:::

:::error Error típico
Escribir $\tfrac{0}{0}=0$ o $\tfrac{0}{0}=1$. $\tfrac{0}{0}$ **no es un resultado**: es una señal de que hay que transformar la expresión. Otro error: en una función a trozos, calcular ambos laterales con la misma fórmula.
:::

## 6. Ejercicio guiado

Calcula $\lim_{x\to-2}\dfrac{x^2+5x+6}{x^2-4}$.

:::pista Primera pista
Sustituye primero. Si obtienes $\tfrac{0}{0}$, factoriza numerador y denominador.
:::

:::pista Segunda pista
$x^2+5x+6$: dos números que suman 5 y multiplican 6. El denominador es una diferencia de cuadrados.
:::

:::solucion Solución guiada
$\dfrac{(x+2)(x+3)}{(x+2)(x-2)}=\dfrac{x+3}{x-2}$ para $x\neq-2$. Sustituyendo: $\dfrac{1}{-4}=-\dfrac{1}{4}$.
Comprobación numérica: con $x=-2{,}01$, el numerador vale $-0{,}0099$ y el denominador $0{,}0401$; el cociente es $\approx-0{,}247$, cerca de $-0{,}25$. ✔
:::

## 7. Práctica

**Fáciles**

1. Calcula $\lim_{x\to2}(3x^2-x+1)$.
2. Calcula $\lim_{x\to\infty}\dfrac{5x-2}{x+3}$.
3. ¿Es continua $f(x)=\dfrac{1}{x-4}$ en $x=4$? Justifica.

**Medios**

4. Calcula $\lim_{x\to1}\dfrac{x^2-1}{x^2+x-2}$.
5. Calcula los límites laterales de $\dfrac{1}{x-1}$ cuando $x\to1$ y explica qué ocurre.

**Tipo examen / transferencia**

6. Sea $f(x)=\begin{cases}ax+1 & x\le1\\ x^2-ax+3 & x>1\end{cases}$. Halla $a$ para que $f$ sea continua en todo $\mathbb{R}$ y justifica que no hay otros puntos problemáticos.

:::solucion Soluciones paso a paso
1. Polinomio: sustitución, $12-2+1=11$.
2. Mismo grado: $\dfrac{5}{1}=5$.
3. No: $f(4)$ no existe (denominador cero). Hay una asíntota vertical en $x=4$.
4. $\dfrac{(x+1)(x-1)}{(x+2)(x-1)}=\dfrac{x+1}{x+2}$ → $\dfrac{2}{3}$.
5. Por la izquierda ($x<1$) el denominador es negativo y pequeño: $-\infty$. Por la derecha: $+\infty$. Los laterales no coinciden; asíntota vertical $x=1$.
6. Cada trozo es un polinomio, continuo en su intervalo; solo hay que estudiar $x=1$. $f(1)=a+1$; lateral derecho $1-a+3=4-a$. $a+1=4-a$ → $2a=3$ → $a=\dfrac{3}{2}$. Comprobación: ambos valen $2{,}5$. ✔
:::

## 8. Cómo revisar tus errores

- **Siempre sustituye primero.** Muchos límites se resuelven así y no hace falta factorizar.
- Tras simplificar, comprueba con un valor cercano (por ejemplo $a+0{,}01$) con la calculadora.
- Al comparar grados en el infinito, fíjate solo en el término de mayor grado de cada polinomio.
- En continuidad, comprueba las **tres** condiciones y escribe la conclusión con palabras.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- El límite mira los alrededores del punto; existe si los laterales coinciden.
- $\tfrac{0}{0}$: factorizar, simplificar, sustituir. $\tfrac{k}{0}$: infinito, asíntota vertical.
- En el infinito, compara grados.
- Continua: $f(a)$ existe, el límite existe y coinciden.

**Vocabulario:** límite, límite lateral, indeterminación, asíntota vertical, asíntota horizontal, continuidad, discontinuidad.

**Repaso:** a 1, 3, 7, 14 y 30 días. En cada repaso, resuelve una indeterminación $\tfrac{0}{0}$ y estudia la continuidad de una función a trozos con parámetro.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (Bachillerato). Alineado con el bloque de análisis del temario oficial de Matemáticas +25; prepara la derivada como límite (M08-L02) y el estudio de asíntotas (M04-L07).
