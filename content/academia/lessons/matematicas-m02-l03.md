---
id: matematicas-m02-l03
course: matematicas
module: M02
level: N1
title: Fracciones algebraicas y restricciones del dominio
learning_objectives:
  - Determinar los valores que anulan el denominador y excluirlos
  - Simplificar fracciones algebraicas factorizando numerador y denominador
  - Sumar, restar, multiplicar y dividir fracciones algebraicas con el mcm de polinomios
prerequisites: [matematicas-m02-l02, matematicas-m00-l04]
skill_ids: [algebraic_fractions, domain_restrictions]
exam_alignment: [algebra, funciones]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una fracción algebraica es un cociente de polinomios, como $\dfrac{x+1}{x^2-4}$. Aparecen en funciones racionales (asíntotas), en derivadas de cocientes, en límites y en ecuaciones racionales (M02-L06). En esta lección aplicarás todo lo que sabes de fracciones numéricas (M00-L03, M00-L04) a expresiones con letras, con una idea nueva e importante: hay valores de $x$ **prohibidos**, los que anulan el denominador, y hay que declararlos.

## 2. Lo que necesitas saber antes

- Simplificar y operar fracciones numéricas con el mcm (M00-L03, M00-L04).
- Factorizar: factor común, identidades notables, Ruffini (M02-L01, M02-L02).
- Que dividir entre cero no está definido.

## 3. Idea intuitiva

Con números, $\dfrac{12}{18}=\dfrac{2}{3}$ porque ambos comparten el factor 6. Con polinomios ocurre igual: $\dfrac{x^2-9}{x^2+3x}=\dfrac{(x-3)(x+3)}{x(x+3)}=\dfrac{x-3}{x}$, porque comparten el factor $(x+3)$. La clave es la misma: **factorizar primero, cancelar factores después**.

La novedad es que la fracción original no existe cuando el denominador vale cero, y eso no cambia aunque simplifiques. Por eso, la simplificación anterior es válida «para $x\neq0$ y $x\neq-3$». Olvidar el $-3$ es un error aunque, tras simplificar, el $-3$ ya no aparezca abajo.

## 4. Definición precisa

- **Fracción algebraica**: $\dfrac{P(x)}{Q(x)}$ con $Q(x)$ no nulo.
- **Restricciones (dominio)**: todos los $x$ reales salvo las raíces de $Q(x)$. Se calculan **antes** de simplificar.
- **Equivalencia**: $\dfrac{P}{Q}=\dfrac{P\cdot R}{Q\cdot R}$ para $R\neq0$.
- **Simplificar**: factorizar numerador y denominador y cancelar factores comunes, manteniendo las restricciones originales.
- **mcm de polinomios**: producto de los factores comunes y no comunes con su mayor exponente, igual que con números. mcm$(x^2-1,\ x^2+x)=x(x+1)(x-1)$.
- **Suma y resta**: se reduce a común denominador con el mcm y se operan los numeradores. Cuidado con los paréntesis al restar.
- **Producto**: $\dfrac PQ\cdot\dfrac RS=\dfrac{PR}{QS}$. Factoriza todo antes y cancela.
- **Cociente**: $\dfrac PQ:\dfrac RS=\dfrac PQ\cdot\dfrac SR$. Añade la restricción $R\neq0$.

**Solo se cancelan factores.** En $\dfrac{x+3}{x}$ no se puede tachar la $x$: $x$ es un término del numerador, no un factor. «Tachar» las $x$ daría $3$, pero con $x=2$ la fracción vale $\dfrac{5}{2}$, que no es $3$.

**Por qué se mantienen las restricciones.** La expresión simplificada y la original dan el mismo valor en todos los puntos donde la original existe, pero no en el punto excluido, donde la original no está definida. En funciones, ese punto será un «agujero» en la gráfica (lo verás con límites, M08-L01).

**Cómo calcular el mcm de polinomios paso a paso.** Factoriza cada denominador por completo. Escribe cada factor distinto que aparezca en cualquiera de ellos, con el mayor exponente con que aparezca. Por ejemplo, para $x^2-4$, $x^2+4x+4$ y $3x$: los factores son $(x-2)(x+2)$, $(x+2)^2$ y $3x$, así que el mcm es $3x(x-2)(x+2)^2$. Después, cada fracción se amplifica por los factores que le faltan para llegar al mcm, igual que con números. Usar el producto de todos los denominadores también funciona, pero genera expresiones más grandes que habrá que simplificar al final.

**Cambio de signo útil.** $a-b=-(b-a)$. Así, $\dfrac{x-2}{2-x}=-1$ para $x\neq2$. Fíjate en ello cuando dos factores parezcan iguales salvo el orden.

**Método general:** (1) factoriza todos los numeradores y denominadores; (2) escribe las restricciones; (3) opera; (4) simplifica el resultado y vuelve a factorizar el numerador para ver si queda algo por cancelar.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Simplificar con restricciones
Simplifica $\dfrac{x^2-9}{x^2+6x+9}$.

1. Factoriza: $\dfrac{(x-3)(x+3)}{(x+3)^2}$.
2. Restricción: $x\neq-3$.
3. Cancela un factor $(x+3)$: $\dfrac{x-3}{x+3}$, para $x\neq-3$.
:::

:::ejemplo Ejemplo 2 · Suma
Calcula $\dfrac{2}{x-1}+\dfrac{3}{x+1}$.

1. mcm: $(x-1)(x+1)$. Restricciones: $x\neq\pm1$.
2. $\dfrac{2(x+1)+3(x-1)}{(x-1)(x+1)}=\dfrac{2x+2+3x-3}{x^2-1}=\dfrac{5x-1}{x^2-1}$.

Comprobación con $x=2$: $2+1=3$ y $\dfrac{9}{3}=3$. ✔
:::

:::ejemplo Ejemplo 3 · Cociente
Calcula $\dfrac{x^2-4}{3x}:\dfrac{x+2}{6x^2}$.

1. Producto por la inversa: $\dfrac{(x-2)(x+2)}{3x}\cdot\dfrac{6x^2}{x+2}$.
2. Restricciones: $x\neq0$ (denominadores) y $x\neq-2$ (el divisor no puede ser 0).
3. Cancela $(x+2)$ y $3x$: $2x(x-2)$, para $x\neq0,\,-2$.
:::

:::error Error típico
Restar sin paréntesis: $\dfrac{x}{x+1}-\dfrac{x-1}{x+1}=\dfrac{x-x-1}{x+1}$ es **falso**. Lo correcto es $\dfrac{x-(x-1)}{x+1}=\dfrac{1}{x+1}$. Otro error: simplificar $\dfrac{x^2+4}{x+2}$ como $x+2$; $x^2+4$ no se factoriza en los reales y no tiene el factor $(x+2)$.
:::

## 6. Ejercicio guiado

Simplifica $\dfrac{1}{x-2}-\dfrac{4}{x^2-4}$.

:::pista Primera pista
$x^2-4=(x-2)(x+2)$, así que el mcm es $(x-2)(x+2)$. Restricciones: $x\neq\pm2$.
:::

:::pista Segunda pista
La primera fracción se amplifica por $(x+2)$: el numerador queda $(x+2)-4$.
:::

:::solucion Solución guiada
$\dfrac{x+2-4}{(x-2)(x+2)}=\dfrac{x-2}{(x-2)(x+2)}=\dfrac{1}{x+2}$, para $x\neq\pm2$.
Comprobación con $x=3$: $1-\dfrac45=\dfrac15$ y $\dfrac{1}{5}$. ✔
:::

## 7. Práctica

**Fáciles**

1. ¿Qué valores no puede tomar $x$ en $\dfrac{x+1}{x^2-5x}$?
2. Simplifica $\dfrac{6x^2}{9x}$.
3. Simplifica $\dfrac{x^2-x}{x^2-1}$.

**Medios**

4. Calcula $\dfrac1x+\dfrac{1}{x+1}$.
5. Calcula $\dfrac{x^2-1}{x+3}\cdot\dfrac{x+3}{x-1}$.

**Tipo examen / transferencia**

6. Simplifica $f(x)=\dfrac{x^2+2x+1}{x^2-1}$, indica su dominio y calcula $f(3)$. ¿Existe $f(-1)$? Justifica.

:::solucion Soluciones paso a paso
1. $x(x-5)\neq0$ → $x\neq0$ y $x\neq5$.
2. $\dfrac{2x}{3}$, con $x\neq0$.
3. $\dfrac{x(x-1)}{(x-1)(x+1)}=\dfrac{x}{x+1}$, con $x\neq\pm1$.
4. $\dfrac{(x+1)+x}{x(x+1)}=\dfrac{2x+1}{x(x+1)}$, con $x\neq0,\,-1$.
5. $\dfrac{(x-1)(x+1)(x+3)}{(x+3)(x-1)}=x+1$, con $x\neq-3,\,1$.
6. $\dfrac{(x+1)^2}{(x-1)(x+1)}=\dfrac{x+1}{x-1}$; dominio $\mathbb R\setminus\{-1,1\}$. $f(3)=\dfrac{4}{2}=2$. $f(-1)$ **no existe**: el denominador original se anula, aunque la expresión simplificada daría 0.
:::

## 8. Cómo revisar tus errores

- Escribe las restricciones **antes** de cancelar nada.
- Comprueba el resultado con un valor permitido, como $x=2$ o $x=3$.
- Al restar, pon entre paréntesis el numerador que se resta.
- Si dos factores son opuestos ($x-2$ y $2-x$), saca un $-1$.
- Al final, vuelve a factorizar el numerador: a veces aparece un factor que todavía se puede cancelar.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Restricciones: raíces del denominador, calculadas antes de simplificar.
- Factorizar y cancelar solo factores.
- Operar como con fracciones numéricas, usando el mcm de polinomios.

**Vocabulario:** fracción algebraica, dominio, restricción, mcm de polinomios, simplificación, factor.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resta dos fracciones algebraicas cuyo mcm sea una diferencia de cuadrados y simplifica el resultado.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N1–N2 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; base de ecuaciones racionales (M02-L06), funciones racionales y asíntotas (M04-L07).
