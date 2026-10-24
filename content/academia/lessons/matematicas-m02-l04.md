---
id: matematicas-m02-l04
course: matematicas
module: M02
level: N1
title: Ecuación de segundo grado y discriminante
learning_objectives:
  - Resolver ecuaciones de segundo grado completas con la fórmula y las incompletas sin ella
  - Usar el discriminante para saber cuántas soluciones reales hay y para hallar parámetros
  - Aplicar las relaciones entre coeficientes y raíces, y resolver ecuaciones bicuadradas
prerequisites: [matematicas-m02-l01, matematicas-m01-l07]
skill_ids: [quadratic_equation, quadratic_discriminant, biquadratic]
exam_alignment: [algebra]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La ecuación de segundo grado es probablemente la herramienta más usada del examen de Matemáticas +25. La necesitarás para hallar los cortes de una parábola con el eje $X$, los puntos críticos de una función cúbica (al derivar), las intersecciones entre curvas, la discusión de sistemas con parámetro y muchos problemas de áreas. En esta lección aprenderás la fórmula, cuándo **no** usarla, qué te dice el discriminante y cómo reducir ciertas ecuaciones de grado 4 a una de grado 2.

## 2. Lo que necesitas saber antes

- Factorizar con identidades y con suma–producto (M02-L01): $x^2-5x+6=(x-2)(x-3)$.
- Raíces cuadradas y su simplificación (M00-L06).
- Plantear problemas (M01-L07).

## 3. Idea intuitiva

Una ecuación de segundo grado pregunta dónde corta una parábola al eje horizontal. Una parábola puede cortarlo en **dos** puntos, **tocarlo** en uno (cuando el vértice está justo sobre el eje) o **no tocarlo**. Por eso estas ecuaciones tienen dos, una o ninguna solución real.

La fórmula general sale de completar un cuadrado: convertir $x^2+bx$ en $(x+\tfrac b2)^2$ menos algo. No necesitas memorizar la demostración, pero sí entender que el número bajo la raíz, el **discriminante**, decide cuántos cortes hay: si es negativo, la raíz no existe en los reales y la parábola no toca el eje.

## 4. Definición precisa

- **Ecuación de segundo grado**: $ax^2+bx+c=0$ con $a\neq0$.
- **Fórmula general**:
$$x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$$
- **Discriminante**: $\Delta=b^2-4ac$.
  - $\Delta>0$: dos soluciones reales distintas.
  - $\Delta=0$: una solución doble, $x=-\dfrac{b}{2a}$ (el vértice está sobre el eje).
  - $\Delta<0$: ninguna solución real.
- **Incompletas** (más rápido sin fórmula):
  - $b=0$: $ax^2+c=0$ → $x^2=-\dfrac ca$ → $x=\pm\sqrt{-\dfrac ca}$ si $-\dfrac ca\ge0$; si no, sin solución.
  - $c=0$: $ax^2+bx=0$ → $x(ax+b)=0$ → $x=0$ o $x=-\dfrac ba$. **Nunca dividas entre $x$**: perderías la solución $x=0$.
- **Relaciones de Cardano–Vieta**: si $x_1,x_2$ son las raíces, $x_1+x_2=-\dfrac ba$ y $x_1\cdot x_2=\dfrac ca$. Permiten comprobar soluciones y factorizar: $ax^2+bx+c=a(x-x_1)(x-x_2)$.
- **Ecuación bicuadrada**: $ax^4+bx^2+c=0$. Con el cambio $t=x^2$ queda $at^2+bt+c=0$; cada solución $t\ge0$ da $x=\pm\sqrt t$, y las $t<0$ se descartan.

**Antes de aplicar la fórmula**: pasa todo a un miembro, simplifica (divide por un factor común si lo hay) y, si $a<0$, multiplica por $-1$ para trabajar con $a>0$. Identifica $a$, $b$ y $c$ **con su signo**.

**¿Factorizar o usar la fórmula?** Si los coeficientes son pequeños y $a=1$, prueba primero suma–producto: busca dos números que sumen $-b$ y multipliquen $c$. Si no los encuentras en unos segundos, usa la fórmula, que funciona siempre. Si $\Delta$ no es un cuadrado perfecto, las soluciones son irracionales y debes dejarlas con la raíz simplificada: $x^2-2x-1=0$ da $x=\dfrac{2\pm\sqrt8}{2}=1\pm\sqrt2$.

**Relación con la parábola.** Las soluciones de $ax^2+bx+c=0$ son los cortes de la parábola $y=ax^2+bx+c$ con el eje $X$ (M04-L01). El vértice está en $x=-\dfrac{b}{2a}$, justo en medio de las dos soluciones, lo que coincide con la media de $x_1$ y $x_2$ en la fórmula. Si $\Delta=0$, el vértice toca el eje; si $\Delta<0$, la parábola queda entera por encima o por debajo del eje.

**Ecuaciones que se convierten en cuadráticas.** Muchas ecuaciones parecen distintas pero, tras quitar paréntesis o denominadores, son de segundo grado. Siempre que aparezca $x^2$ al simplificar, ordena la ecuación en la forma $ax^2+bx+c=0$ antes de decidir cómo resolverla.

**Por qué funciona la fórmula.** Dividiendo entre $a$ y completando el cuadrado: $x^2+\dfrac bax=-\dfrac ca$ → $\left(x+\dfrac{b}{2a}\right)^2=\dfrac{b^2-4ac}{4a^2}$. Extrayendo la raíz cuadrada (con $\pm$) y despejando $x$ se obtiene la fórmula. Se ve por qué el signo de $b^2-4ac$ decide: un cuadrado no puede ser negativo.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Ecuación completa
Resuelve $2x^2-7x+3=0$.

1. $a=2$, $b=-7$, $c=3$. $\Delta=49-24=25$.
2. $x=\dfrac{7\pm5}{4}$ → $x_1=3$, $x_2=\dfrac12$.
3. Comprobación con Vieta: suma $3+\tfrac12=\tfrac72=-\tfrac{b}{a}$ ✔; producto $\tfrac32=\tfrac ca$ ✔.
:::

:::ejemplo Ejemplo 2 · Incompletas
Resuelve $3x^2-12x=0$ y $2x^2-18=0$.

1. $3x(x-4)=0$ → $x=0$ o $x=4$.
2. $x^2=9$ → $x=\pm3$.
:::

:::ejemplo Ejemplo 3 · Parámetro con el discriminante
Halla $k$ para que $x^2+kx+9=0$ tenga una solución doble.

$\Delta=k^2-36=0$ → $k=\pm6$. Con $k=6$: $(x+3)^2=0$, solución doble $x=-3$; con $k=-6$: $x=3$.
:::

:::error Error típico
Tomar mal el signo de $b$: en $x^2-6x+5=0$, $b=-6$ y $-b=6$. Otro error: dividir $x^2=5x$ entre $x$ y quedarse solo con $x=5$; falta $x=0$. Y en la bicuadrada, olvidar los dos signos: $x^2=4$ da $x=2$ **y** $x=-2$.
:::

## 6. Ejercicio guiado

Un rectángulo tiene 60 m² de área y 32 m de perímetro. Calcula sus dimensiones.

:::pista Primera pista
Si un lado mide $x$, el otro mide $16-x$ (la mitad del perímetro es 16).
:::

:::pista Segunda pista
Área: $x(16-x)=60$. Pasa todo a un miembro y ordena.
:::

:::solucion Solución guiada
$x^2-16x+60=0$ → $(x-6)(x-10)=0$ → $x=6$ o $x=10$. Ambas dan el mismo rectángulo: **6 m × 10 m**. Comprobación: $6\cdot10=60$ y $2(6+10)=32$. ✔
:::

## 7. Práctica

**Fáciles**

1. Resuelve $x^2-5x+6=0$.
2. Resuelve $x^2-16=0$.
3. ¿Cuántas soluciones reales tiene $x^2+2x+5=0$?

**Medios**

4. Resuelve $(x+1)^2=2x+10$.
5. Resuelve $\dfrac{x(x-3)}{2}=5$.

**Tipo examen / transferencia**

6. Resuelve la ecuación bicuadrada $x^4-13x^2+36=0$ y comprueba una de las soluciones.

:::solucion Soluciones paso a paso
1. $(x-2)(x-3)=0$ → $2$ y $3$.
2. $x=\pm4$.
3. $\Delta=4-20=-16<0$ → ninguna.
4. $x^2+2x+1=2x+10$ → $x^2=9$ → $x=\pm3$.
5. $x^2-3x=10$ → $x^2-3x-10=0$ → $(x-5)(x+2)=0$ → $5$ y $-2$.
6. $t=x^2$: $t^2-13t+36=0$ → $t=4$ o $t=9$ → $x=\pm2,\ \pm3$. Comprobación con $x=3$: $81-117+36=0$. ✔
:::

## 8. Cómo revisar tus errores

- Comprueba con Cardano–Vieta: suma $-\dfrac ba$, producto $\dfrac ca$.
- Calcula $\Delta$ antes que nada: si es negativo, no sigas.
- En problemas, descarta soluciones sin sentido (longitudes negativas).
- Si $\Delta$ es un cuadrado perfecto, las raíces son racionales; si no, deja la raíz simplificada.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $x=\dfrac{-b\pm\sqrt{\Delta}}{2a}$, $\Delta=b^2-4ac$: dos, una o ninguna solución.
- Incompletas: factor común ($c=0$) o despejar $x^2$ ($b=0$).
- $x_1+x_2=-\dfrac ba$, $x_1x_2=\dfrac ca$; bicuadradas con $t=x^2$.

**Vocabulario:** ecuación cuadrática, discriminante, solución doble, ecuación incompleta, ecuación bicuadrada, relaciones de Cardano–Vieta.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una completa, una incompleta y una con parámetro, comprobando con suma y producto.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N1–N2 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; imprescindible para funciones (M04), derivadas (M08) e integrales (M09).
