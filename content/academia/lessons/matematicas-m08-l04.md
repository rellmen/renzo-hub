---
id: matematicas-m08-l04
course: matematicas
module: M08
level: N2
title: Recta tangente y recta normal
learning_objectives:
  - Calcular la ecuación de la recta tangente a una curva en un punto
  - Calcular la recta normal y hallar puntos donde la tangente tiene una pendiente dada
  - Usar la tangente para aproximar valores de una función
prerequisites: [matematicas-m08-l03, matematicas-m07-l02]
skill_ids: [tangent_line, linear_approximation]
exam_alignment: [analisis]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La recta tangente es la aplicación geométrica más directa de la derivada y una pregunta clásica del examen de Matemáticas +25: «halla la ecuación de la recta tangente a la curva en el punto de abscisa...». En esta lección aprenderás a escribirla en tres pasos, a calcular la recta normal (perpendicular a la tangente), a encontrar los puntos donde la tangente es paralela a una recta dada u horizontal, y a usar la tangente para aproximar valores difíciles de calcular a mano.

## 2. Lo que necesitas saber antes

- Reglas de derivación (M08-L03).
- Ecuación punto–pendiente y perpendicularidad de rectas (M07-L02).
- Resolución de ecuaciones de segundo grado (M02-L04).

## 3. Idea intuitiva

Si haces zoom muchas veces sobre un punto de una curva suave, la curva se ve cada vez más recta. Esa recta que ves con el máximo zoom es la **tangente**: la mejor aproximación lineal de la curva cerca del punto. Su pendiente es la derivada en ese punto. La **normal** es la recta que sale perpendicular a la curva en el mismo punto, como un poste clavado perpendicular al suelo en una ladera.

Toda recta queda determinada por un punto y una pendiente. Para la tangente, el punto es $(a,f(a))$ y la pendiente es $f'(a)$: solo hay que calcular dos números.

## 4. Definición precisa

**Recta tangente** a la gráfica de $f$ en el punto de abscisa $x=a$:
$$y-f(a)=f'(a)\,(x-a).$$

**Recta normal** en el mismo punto (si $f'(a)\neq0$):
$$y-f(a)=-\frac{1}{f'(a)}\,(x-a).$$
Si $f'(a)=0$, la tangente es horizontal ($y=f(a)$) y la normal es vertical ($x=a$).

**Procedimiento en tres pasos:**
1. Calcula la ordenada del punto: $f(a)$.
2. Calcula la pendiente: deriva y evalúa $f'(a)$.
3. Sustituye en la ecuación punto–pendiente y simplifica a la forma $y=mx+n$.

**Problemas inversos** (muy frecuentes):
- **Tangente paralela a una recta** $y=mx+n$: resuelve $f'(x)=m$. Pueden salir varios puntos.
- **Tangente horizontal**: resuelve $f'(x)=0$. Son los candidatos a máximo o mínimo (M08-L05).
- **Tangente perpendicular a una recta** de pendiente $m$: resuelve $f'(x)=-\dfrac1m$.
- **Tangente que pasa por un punto exterior** $(p,q)$ que no está en la curva: el punto de tangencia $(a,f(a))$ es desconocido; impón que $q-f(a)=f'(a)(p-a)$ y resuelve en $a$.

**Aproximación lineal.** Cerca de $a$, la curva y su tangente casi coinciden:
$$f(x)\approx f(a)+f'(a)(x-a).$$
Por ejemplo, $\sqrt{4{,}1}$: con $f(x)=\sqrt x$, $a=4$, $f(4)=2$ y $f'(4)=\tfrac14$, se obtiene $\sqrt{4{,}1}\approx2+\tfrac14\cdot0{,}1=2{,}025$. El valor real es $2{,}02485...$: el error es menor que una diezmilésima. Cuanto más cerca de $a$, mejor la aproximación.

**Cuándo no hay tangente.** Si $f$ no es derivable en $a$ (un pico, como $|x|$ en 0, o un salto), no existe una única tangente. Si la derivada tiende a infinito, como $\sqrt[3]{x}$ en 0, la tangente es vertical.

**Comprobaciones útiles.** El punto de tangencia debe cumplir a la vez la ecuación de la curva y la de la tangente. Además, en un esbozo, la tangente debe «acompañar» a la curva cerca del punto: si la curva sube, la pendiente debe ser positiva. Estas dos comprobaciones detectan casi todos los errores de cálculo.

**Relación con la física.** Si $s(t)$ es la posición, la tangente en $t=a$ describe el movimiento que tendría el móvil si a partir de ese instante siguiera con velocidad constante $s'(a)$. Por eso la aproximación lineal es tan útil para predecir a muy corto plazo.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Tangente y normal
Halla la tangente y la normal a $f(x)=x^2-3x+1$ en $x=2$.

1. $f(2)=4-6+1=-1$.
2. $f'(x)=2x-3$, $f'(2)=1$.
3. Tangente: $y+1=1\cdot(x-2)$ → $y=x-3$. Normal: $y+1=-1\cdot(x-2)$ → $y=-x+1$.
:::

:::ejemplo Ejemplo 2 · Tangente paralela a una recta
¿En qué puntos de $f(x)=x^3-3x$ la tangente es paralela a $y=9x$?

$f'(x)=3x^2-3=9$ → $x^2=4$ → $x=\pm2$. Puntos: $(2,2)$ y $(-2,-2)$.
:::

:::ejemplo Ejemplo 3 · Tangente con exponencial
Tangente a $f(x)=e^{x}$ en $x=0$.

$f(0)=1$, $f'(0)=1$ → $y=x+1$. Cerca de 0, $e^x\approx1+x$: por ejemplo $e^{0{,}05}\approx1{,}05$ (real: $1{,}0513$).
:::

:::error Error típico
Usar $f'(x)$ (una expresión con $x$) como pendiente en lugar de $f'(a)$ (un número): la tangente es una recta, no puede contener $x^2$. Otro error: confundir la pendiente de la normal con $-f'(a)$; es $-\dfrac{1}{f'(a)}$.
:::

## 6. Ejercicio guiado

Halla la ecuación de la tangente a $f(x)=\dfrac{4}{x}$ en el punto de abscisa $x=2$.

:::pista Primera pista
$f(2)=2$. Escribe $f(x)=4x^{-1}$ para derivar.
:::

:::pista Segunda pista
$f'(x)=-\dfrac{4}{x^2}$, así que $f'(2)=-1$.
:::

:::solucion Solución guiada
$y-2=-1\cdot(x-2)$ → $y=-x+4$. Comprobación: el punto $(2,2)$ cumple $2=-2+4$. ✔
:::

## 7. Práctica

**Fáciles**

1. Tangente a $f(x)=x^2$ en $x=1$.
2. Pendiente de la normal a $f(x)=x^3$ en $x=1$.
3. ¿En qué punto de $f(x)=x^2-6x$ la tangente es horizontal?

**Medios**

4. Tangente a $f(x)=\ln x$ en $x=1$.
5. Usa la tangente de $f(x)=\sqrt x$ en $x=9$ para aproximar $\sqrt{9{,}2}$.

**Tipo examen / transferencia**

6. Sea $f(x)=x^2+bx+c$. Halla $b$ y $c$ sabiendo que la gráfica pasa por $(1,2)$ y que la tangente en ese punto es paralela a $y=4x$.

:::solucion Soluciones paso a paso
1. $f(1)=1$, $f'(1)=2$: $y=2x-1$.
2. $f'(1)=3$ → pendiente normal $-\dfrac13$.
3. $f'(x)=2x-6=0$ → $x=3$, punto $(3,-9)$.
4. $f(1)=0$, $f'(1)=1$: $y=x-1$.
5. $f(9)=3$, $f'(9)=\dfrac16$: $\sqrt{9{,}2}\approx3+\dfrac{0{,}2}{6}\approx3{,}0333$ (real: $3{,}0332$).
6. $f'(1)=2+b=4$ → $b=2$. $f(1)=1+2+c=2$ → $c=-1$. Así $f(x)=x^2+2x-1$.
:::

## 8. Cómo revisar tus errores

- El punto de tangencia debe cumplir la ecuación de la tangente.
- La pendiente es un número: evalúa la derivada antes de sustituir.
- Comprueba que tangente y normal tienen pendientes cuyo producto es $-1$.
- En los problemas inversos, verifica cada punto obtenido.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Tangente: $y-f(a)=f'(a)(x-a)$. Normal: pendiente $-1/f'(a)$.
- Tangente horizontal: $f'(x)=0$. Paralela a $y=mx+n$: $f'(x)=m$.
- Aproximación lineal: $f(x)\approx f(a)+f'(a)(x-a)$.

**Vocabulario:** recta tangente, recta normal, punto de tangencia, pendiente, aproximación lineal, tangente horizontal.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, halla una tangente, una normal y un punto con tangente paralela a una recta dada.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de análisis del temario oficial de Matemáticas +25.
