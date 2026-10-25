---
id: matematicas-m08-l02
course: matematicas
module: M08
level: N2
title: La derivada como tasa de cambio instantánea
learning_objectives:
  - Definir la derivada en un punto como límite de la tasa de variación media e interpretarla como pendiente de la tangente
  - Calcular derivadas con la definición en funciones polinómicas sencillas y en 1/x
  - Interpretar la derivada como velocidad o coste marginal y relacionar derivabilidad con continuidad
prerequisites: [matematicas-m04-l08, matematicas-m08-l01]
skill_ids: [derivative_definition, derivative_interpretation]
exam_alignment: [analisis]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La derivada mide **lo rápido que cambia** una función en un instante concreto: la velocidad a la que va un vehículo justo ahora, el coste de producir una unidad más, la inclinación exacta de una curva en un punto. Es el concepto central del análisis y la base de todo lo que queda del módulo: reglas de derivación (M08-L03), recta tangente (M08-L04), máximos y mínimos (M08-L05) y optimización (M08-L07). En esta lección aprenderás qué es la derivada y a calcularla con su definición.

## 2. Lo que necesitas saber antes

- Tasa de variación media e instantánea (M04-L08).
- Límites e indeterminación $\tfrac00$ (M08-L01).
- Identidades notables y fracciones algebraicas (M02-L01, M02-L03).

## 3. Idea intuitiva

En M04-L08 viste que la velocidad media entre dos instantes es la pendiente de la recta secante. Si acercas el segundo instante al primero, la secante gira hasta convertirse en la **recta tangente**, que solo «roza» la curva en ese punto. La pendiente de esa tangente es la **derivada**: la velocidad instantánea, lo que marca el velocímetro.

Calcular la derivada con la definición es exactamente lo que hiciste con la tasa instantánea: escribir la tasa media en el intervalo $[a,a+h]$, simplificar para que desaparezca la $h$ del denominador y hacer $h\to0$.

## 4. Definición precisa

**Derivada de $f$ en el punto $a$:**
$$f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h},$$
si este límite existe y es finito. Entonces se dice que $f$ es **derivable** en $a$.

- **Interpretación geométrica**: $f'(a)$ es la pendiente de la recta tangente a la gráfica en $(a,f(a))$.
- **Interpretación física**: si $s(t)$ es la posición, $s'(t)$ es la velocidad instantánea; si $v(t)$ es la velocidad, $v'(t)$ es la aceleración.
- **Interpretación económica**: si $C(q)$ es el coste de producir $q$ unidades, $C'(q)$ es el **coste marginal**, aproximadamente lo que cuesta producir una unidad más.
- **Función derivada**: $f'(x)=\displaystyle\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$, que da la derivada en cada punto. Otras notaciones: $\dfrac{df}{dx}$, $y'$.
- **Unidades**: las de $f$ divididas entre las de $x$ (m/s, €/unidad).

**Derivadas laterales.** $f'(a^-)$ y $f'(a^+)$ son los límites cuando $h\to0^-$ y $h\to0^+$. La función es derivable en $a$ si ambas existen y coinciden.

**Derivabilidad y continuidad.**
- Si $f$ es derivable en $a$, entonces es continua en $a$.
- Lo contrario es falso: $f(x)=|x|$ es continua en 0 pero no derivable, porque tiene un «pico»: las derivadas laterales valen $-1$ y $+1$.
- Una función no es derivable donde es discontinua, donde tiene un pico (esquina) o donde la tangente es vertical.

**Procedimiento con la definición:**
1. Calcula $f(a+h)$ desarrollando con cuidado.
2. Resta $f(a)$: los términos sin $h$ deben cancelarse.
3. Divide entre $h$ (saca factor común $h$ en el numerador y simplifica).
4. Haz $h\to0$.

**Por qué el límite es $\tfrac00$.** Al sustituir $h=0$ en el cociente se obtiene $\tfrac{f(a)-f(a)}{0}=\tfrac00$ siempre. Por eso la definición siempre exige transformar la expresión (factorizar, desarrollar o racionalizar) antes de pasar al límite, exactamente como en M08-L01.

**La derivada como aproximación.** Para $h$ pequeño, $f(a+h)\approx f(a)+f'(a)\,h$. Si el coste marginal al producir 100 unidades es 12 €, producir la unidad 101 cuesta, aproximadamente, 12 € más. Esta idea, aproximar una curva por su tangente, se usa constantemente en ingeniería y en métodos numéricos de Informática.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Derivada en un punto
Calcula $f'(3)$ para $f(x)=x^2$.

$\dfrac{(3+h)^2-9}{h}=\dfrac{9+6h+h^2-9}{h}=\dfrac{h(6+h)}{h}=6+h$ → $f'(3)=6$.
:::

:::ejemplo Ejemplo 2 · Función derivada
Calcula $f'(x)$ para $f(x)=x^2-3x$.

$f(x+h)-f(x)=(x+h)^2-3(x+h)-x^2+3x=2xh+h^2-3h$. Dividiendo entre $h$: $2x+h-3$. Con $h\to0$: $f'(x)=2x-3$.
:::

:::ejemplo Ejemplo 3 · Derivada de 1/x
Calcula $f'(2)$ para $f(x)=\dfrac1x$.

$\dfrac{\frac{1}{2+h}-\frac12}{h}=\dfrac{\frac{2-(2+h)}{2(2+h)}}{h}=\dfrac{-h}{2(2+h)\,h}=\dfrac{-1}{2(2+h)}$ → $f'(2)=-\dfrac14$. La función decrece en $x=2$.
:::

:::error Error típico
Sustituir $h=0$ antes de simplificar: se obtiene $\tfrac00$ y no se puede concluir nada. Otro error: confundir $f(a+h)$ con $f(a)+h$; para $f(x)=x^2$, $f(3+h)=(3+h)^2$, no $9+h$.
:::

## 6. Ejercicio guiado

Un objeto cae y recorre $s(t)=4{,}9t^2$ metros en $t$ segundos. Calcula su velocidad exactamente en $t=2$.

:::pista Primera pista
La velocidad instantánea es $s'(2)=\displaystyle\lim_{h\to0}\frac{s(2+h)-s(2)}{h}$.
:::

:::pista Segunda pista
$s(2+h)=4{,}9(4+4h+h^2)$ y $s(2)=19{,}6$.
:::

:::solucion Solución guiada
$\dfrac{19{,}6h+4{,}9h^2}{h}=19{,}6+4{,}9h$ → $s'(2)=19{,}6$ m/s. Comprobación: con $h=0{,}01$, la velocidad media es $19{,}649$ m/s, muy cerca.
:::

## 7. Práctica

**Fáciles**

1. Con la definición, calcula la derivada de $f(x)=5x-2$.
2. Calcula $f'(1)$ para $f(x)=x^2+1$.
3. Si $C'(100)=12$ €/unidad, ¿qué significa?

**Medios**

4. Calcula $f'(1)$ para $f(x)=x^3$ con la definición (usa $(1+h)^3=1+3h+3h^2+h^3$).
5. Comprueba con las derivadas laterales que $f(x)=|x|$ no es derivable en $x=0$.

**Tipo examen / transferencia**

6. Sea $f(x)=2x^2-x$. Calcula $f'(x)$ con la definición, la pendiente de la tangente en $x=1$ e interpreta el resultado como ritmo de cambio.

:::solucion Soluciones paso a paso
1. $\dfrac{5(x+h)-2-5x+2}{h}=5$ → $f'(x)=5$ (la pendiente de la recta).
2. $\dfrac{(1+h)^2+1-2}{h}=2+h$ → $2$.
3. Producir la unidad 101 cuesta aproximadamente 12 € adicionales.
4. $\dfrac{3h+3h^2+h^3}{h}=3+3h+h^2$ → $f'(1)=3$.
5. $h>0$: $\dfrac{|h|}{h}=1$; $h<0$: $\dfrac{|h|}{h}=-1$. Las laterales no coinciden: no es derivable (pico en el origen).
6. $\dfrac{2(x+h)^2-(x+h)-2x^2+x}{h}=\dfrac{4xh+2h^2-h}{h}=4x+2h-1$ → $f'(x)=4x-1$. $f'(1)=3$: cerca de $x=1$, la función aumenta unas 3 unidades por cada unidad que aumenta $x$.
:::

## 8. Cómo revisar tus errores

- Al restar $f(a)$, todos los términos sin $h$ deben desaparecer; si no, hay un error.
- Simplifica la $h$ antes de hacer el límite.
- Comprueba con un valor pequeño de $h$, como 0,01.
- Revisa que el signo de la derivada concuerda con el crecimiento de la gráfica.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $f'(a)=\lim_{h\to0}\dfrac{f(a+h)-f(a)}{h}$: pendiente de la tangente, ritmo instantáneo.
- Velocidad = derivada de la posición; coste marginal = derivada del coste.
- Derivable ⇒ continua, pero no al revés (|x| en 0).

**Vocabulario:** derivada, función derivada, recta tangente, derivadas laterales, derivable, velocidad instantánea, coste marginal.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, calcula una derivada con la definición e interprétala en un contexto (velocidad o coste).

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (Bachillerato). Alineado con el bloque de análisis del temario oficial de Matemáticas +25; prepara las reglas de derivación (M08-L03).
