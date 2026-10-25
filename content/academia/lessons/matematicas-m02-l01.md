---
id: matematicas-m02-l01
course: matematicas
module: M02
level: N1
title: Identidades notables y factorización
learning_objectives:
  - Desarrollar el cuadrado de una suma, de una diferencia y la suma por diferencia
  - Reconocer una identidad notable en un polinomio y factorizarlo
  - Factorizar sacando factor común y combinando métodos
prerequisites: [matematicas-m01-l01]
skill_ids: [notable_identities, factoring]
exam_alignment: [algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Las identidades notables son tres multiplicaciones que aparecen tantas veces que conviene reconocerlas a simple vista. Saber **desarrollarlas** te ahorra tiempo; saber **leerlas al revés** (factorizar) te permite simplificar fracciones algebraicas, resolver ecuaciones de segundo grado sin fórmula, estudiar el signo de una función y calcular límites del tipo $\dfrac{0}{0}$. En el examen, una factorización bien hecha suele convertir un ejercicio largo en uno de tres líneas.

## 2. Lo que necesitas saber antes

- Distributiva y términos semejantes (M01-L01): $(x+2)(x+5)=x^2+5x+2x+10=x^2+7x+10$.
- Potencias: $(3x)^2=9x^2$, no $3x^2$. Al elevar un producto, se eleva cada factor.
- Signos: $(-a)^2=a^2$.

## 3. Idea intuitiva

Piensa en un cuadrado de lado $a+b$. Su área es $(a+b)^2$. Si lo divides con dos cortes, ves cuatro piezas: un cuadrado $a\times a$, otro $b\times b$ y **dos** rectángulos $a\times b$. Por eso $(a+b)^2=a^2+2ab+b^2$ y no $a^2+b^2$: olvidar los dos rectángulos es el error más frecuente de todo el álgebra escolar.

**Factorizar** es el viaje de vuelta: te dan el área troceada y te piden el lado. Igual que $12=2^2\cdot3$ descompone un número en factores primos, $x^2-9=(x+3)(x-3)$ descompone un polinomio en factores más simples. Un producto es más útil que una suma porque «un producto vale cero si y solo si algún factor vale cero».

## 4. Definición precisa

Para cualesquiera expresiones $a$ y $b$:

| Nombre | Identidad |
|---|---|
| Cuadrado de una suma | $(a+b)^2=a^2+2ab+b^2$ |
| Cuadrado de una diferencia | $(a-b)^2=a^2-2ab+b^2$ |
| Suma por diferencia | $(a+b)(a-b)=a^2-b^2$ |

**Demostración de la suma por diferencia.** $(a+b)(a-b)=a^2-ab+ab-b^2=a^2-b^2$. Los términos cruzados se anulan; por eso el resultado solo tiene dos términos.

**Factorizar** un polinomio es escribirlo como producto de polinomios de menor grado. Estrategia en este orden:

1. **Factor común:** si todos los términos comparten un factor, sácalo. $6x^3-9x^2=3x^2(2x-3)$.
2. **Identidad notable:** si quedan dos términos que son cuadrados con signo menos entre ellos, es una diferencia de cuadrados. Si quedan tres términos y dos son cuadrados perfectos, comprueba si el tercero es el doble producto.
3. **Trinomio** $x^2+sx+p$: busca dos números cuya suma sea $s$ y cuyo producto sea $p$. $x^2+7x+10=(x+2)(x+5)$ porque $2+5=7$ y $2\cdot5=10$. (Lo generalizarás con la fórmula de segundo grado en M02-L04.)
4. Repite con cada factor hasta que no se pueda más.

**Cómo reconocer un trinomio cuadrado perfecto.** En $4x^2-12x+9$: $4x^2=(2x)^2$, $9=3^2$ y el término central es $-2\cdot(2x)\cdot3=-12x$. Coincide, así que $4x^2-12x+9=(2x-3)^2$. Si el término central no coincide (por ejemplo $4x^2-10x+9$), **no** es una identidad notable.

**Una suma de cuadrados**, como $x^2+9$, no se factoriza con números reales. No la confundas con $x^2-9$. La razón: si $x^2+9$ tuviera un factor $(x-r)$, entonces $r^2+9=0$, y ningún número real al cuadrado da $-9$.

**Factor común negativo.** Cuando el primer término es negativo, conviene sacar un signo menos: $-x^2+6x-9=-(x^2-6x+9)=-(x-3)^2$. Así el polinomio que queda dentro empieza en positivo y las identidades se reconocen mejor. Recuerda cambiar el signo de **todos** los términos al sacar el $-1$.

**Para qué sirve factorizar: tres usos que verás en el examen.**
1. **Resolver ecuaciones:** $x^2-5x=0$ se resuelve sin fórmula como $x(x-5)=0$, de donde $x=0$ o $x=5$.
2. **Simplificar fracciones algebraicas:** solo se pueden cancelar factores, y para verlos hay que factorizar numerador y denominador.
3. **Estudiar el signo de una función:** el signo de $(x-1)(x-4)$ se deduce del signo de cada factor en cada intervalo, sin dar valores al azar.

**Los productos notables en el cálculo mental.** La suma por diferencia permite multiplicar números cercanos a una cifra redonda: $49\cdot51=(50-1)(50+1)=2500-1=2499$. Y el cuadrado de una suma, elevar números al cuadrado: $31^2=(30+1)^2=900+60+1=961$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Desarrollar
Desarrolla $(3x-2)^2$ y $(x+5)(x-5)$.

1. $(3x-2)^2=(3x)^2-2\cdot3x\cdot2+2^2=9x^2-12x+4$.
2. $(x+5)(x-5)=x^2-25$.
:::

:::ejemplo Ejemplo 2 · Factorizar en dos pasos
Factoriza $2x^3-18x$.

1. Factor común $2x$: $2x(x^2-9)$.
2. $x^2-9=x^2-3^2=(x+3)(x-3)$.

**Resultado: $2x(x+3)(x-3)$.** Comprobación con $x=1$: original $2-18=-16$; factorizado $2\cdot1\cdot4\cdot(-2)=-16$. ✔
:::

:::ejemplo Ejemplo 3 · Usar la factorización para simplificar
Simplifica $\dfrac{x^2-4}{x^2-4x+4}$ (para $x\neq2$).

Numerador: $(x+2)(x-2)$. Denominador: $(x-2)^2$. Cancelando un factor $(x-2)$: $\dfrac{x+2}{x-2}$.
:::

:::error Error típico
$(x+3)^2=x^2+9$ es **falso**. Con $x=1$: $(1+3)^2=16$, pero $1+9=10$. Falta el doble producto $6x$: $(x+3)^2=x^2+6x+9$. Otro error: cancelar $x^2$ en $\dfrac{x^2-4}{x^2-4x+4}$. Solo se cancelan **factores**, nunca términos sueltos.
:::

## 6. Ejercicio guiado

Factoriza completamente $3x^3+12x^2+12x$.

:::pista Primera pista
Los tres coeficientes son múltiplos de 3 y todos los términos tienen al menos una $x$.
:::

:::pista Segunda pista
Tras sacar $3x$ queda $x^2+4x+4$. ¿Son $x^2$ y $4$ cuadrados? ¿Es $4x$ el doble producto?
:::

:::solucion Solución guiada
$3x^3+12x^2+12x=3x(x^2+4x+4)=3x(x+2)^2$, porque $2\cdot x\cdot2=4x$.
Comprobación con $x=1$: $3+12+12=27$ y $3\cdot1\cdot9=27$. ✔
:::

## 7. Práctica

**Fáciles**

1. Desarrolla $(x+4)^2$.
2. Desarrolla $(2a-5)(2a+5)$.
3. Factoriza $x^2-49$.

**Medios**

4. Factoriza $9x^2+30x+25$.
5. Factoriza $x^2-5x+6$.

**Tipo examen / transferencia**

6. Resuelve la ecuación $x^3-16x=0$ factorizando. Explica por qué la factorización permite encontrar todas las soluciones.

:::solucion Soluciones paso a paso
1. $x^2+8x+16$.
2. $(2a)^2-5^2=4a^2-25$.
3. $(x+7)(x-7)$.
4. $9x^2=(3x)^2$, $25=5^2$, $2\cdot3x\cdot5=30x$ → $(3x+5)^2$.
5. Dos números que suman $-5$ y multiplican $6$: $-2$ y $-3$ → $(x-2)(x-3)$.
6. $x(x^2-16)=x(x+4)(x-4)=0$. Un producto es cero solo si algún factor es cero: $x=0$, $x=-4$ o $x=4$. Comprobación con $x=4$: $64-64=0$. ✔
:::

## 8. Cómo revisar tus errores

- **Comprueba con un número:** sustituye $x=1$ o $x=2$ en la expresión original y en la factorizada. Deben dar lo mismo.
- Después de sacar factor común, revisa que dentro del paréntesis no quede otro factor común.
- Para un trinomio, verifica siempre el doble producto antes de escribir $(a\pm b)^2$.
- Si tu resultado tiene un factor que todavía es diferencia de cuadrados, sigue factorizando.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $(a\pm b)^2=a^2\pm2ab+b^2$; $(a+b)(a-b)=a^2-b^2$.
- Factorizar: factor común → identidades → trinomio suma/producto → repetir.
- Solo se cancelan factores; $x^2+b^2$ no se factoriza en los reales.

**Vocabulario:** identidad notable, doble producto, diferencia de cuadrados, trinomio cuadrado perfecto, factor común, factorizar.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, desarrolla una identidad y factoriza un polinomio de grado 3 comprobando con $x=1$.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1–N2 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; base de polinomios (M02-L02), fracciones algebraicas (M02-L03) y límites indeterminados (M08).
