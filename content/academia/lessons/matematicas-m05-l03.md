---
id: matematicas-m05-l03
course: matematicas
module: M05
level: N2
title: Identidades trigonométricas y ecuaciones trigonométricas
learning_objectives:
  - Demostrar y aplicar las identidades fundamentales y las fórmulas de suma y ángulo doble
  - Calcular razones exactas de ángulos no notables como 15° o 75°
  - Resolver ecuaciones trigonométricas en un intervalo y dar la solución general
prerequisites: [matematicas-m05-l01, matematicas-m02-l04]
skill_ids: [trig_identities, trig_equations]
exam_alignment: [trigonometria]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Las identidades trigonométricas son igualdades que se cumplen para **todos** los ángulos. Sirven para simplificar expresiones, calcular valores exactos sin calculadora y resolver ecuaciones en las que aparecen senos y cosenos. Las ecuaciones trigonométricas, a diferencia de las algebraicas, suelen tener **infinitas** soluciones, porque las funciones trigonométricas se repiten cada vuelta. Estas técnicas aparecen en el examen y son la base de los fenómenos periódicos en Física (ondas, corriente alterna) y del procesamiento de señales en Informática.

## 2. Lo que necesitas saber antes

- Razones trigonométricas, ángulos notables, cuadrantes y reducción (M05-L01).
- Ecuaciones de segundo grado y cambio de variable (M02-L04).
- Racionalizar (M02-L05).

## 3. Idea intuitiva

Una identidad es como una equivalencia de unidades: $1\text{ h}=60\text{ min}$ es cierto siempre, y lo usas para reescribir cantidades. Del mismo modo, $\sin^2x+\cos^2x=1$ es cierto para cualquier $x$, y lo usas para cambiar senos por cosenos cuando te conviene.

Una ecuación trigonométrica, en cambio, solo se cumple para algunos ángulos. Si $\sin x=\dfrac12$, en la circunferencia unitaria hay **dos** puntos a altura $\dfrac12$: los ángulos 30° y 150°. Y como cada vuelta completa vuelve al mismo punto, también valen 390°, 510°, … Por eso se da una solución en una vuelta y luego la solución general sumando vueltas.

## 4. Definición precisa

**Identidades fundamentales:**
- $\sin^2x+\cos^2x=1$.
- $\tan x=\dfrac{\sin x}{\cos x}$; $1+\tan^2x=\dfrac{1}{\cos^2x}$.

**Ángulos opuestos**: $\sin(-x)=-\sin x$, $\cos(-x)=\cos x$, $\tan(-x)=-\tan x$.

**Suma y diferencia de ángulos:**
$$\sin(a\pm b)=\sin a\cos b\pm\cos a\sin b$$
$$\cos(a\pm b)=\cos a\cos b\mp\sin a\sin b$$
$$\tan(a\pm b)=\frac{\tan a\pm\tan b}{1\mp\tan a\tan b}$$
(atención: en el coseno el signo central **se invierte**).

**Ángulo doble:**
$$\sin2x=2\sin x\cos x,\qquad \cos2x=\cos^2x-\sin^2x=2\cos^2x-1=1-2\sin^2x.$$

**Demostrar una identidad**: se transforma **un solo miembro** (normalmente el más complicado) hasta llegar al otro, usando las identidades conocidas. No se «pasan términos» de un lado a otro, porque eso supondría dar por cierto lo que se quiere demostrar.

**Ecuaciones trigonométricas.**
1. Reduce la ecuación a una forma básica: $\sin x=k$, $\cos x=k$ o $\tan x=k$ (a veces factorizando o con un cambio de variable $t=\sin x$).
2. Comprueba que tiene sentido: $\sin x=k$ y $\cos x=k$ exigen $-1\le k\le1$.
3. Halla las soluciones en una vuelta $[0^\circ,360^\circ)$:
   - $\sin x=k$: $x_1=\alpha$ y $x_2=180^\circ-\alpha$.
   - $\cos x=k$: $x_1=\alpha$ y $x_2=360^\circ-\alpha$.
   - $\tan x=k$: $x_1=\alpha$ y $x_2=\alpha+180^\circ$.
4. **Solución general**: suma $360^\circ k$ ($2\pi k$ en radianes), con $k$ entero; para la tangente basta con $180^\circ k$.

**Cuidado al dividir o elevar al cuadrado.** Dividir entre $\sin x$ o $\cos x$ puede hacer perder las soluciones donde valen 0; es mejor **factorizar**. Elevar al cuadrado puede introducir soluciones falsas; hay que comprobarlas, como en las ecuaciones irracionales (M02-L06).

**Ecuaciones con ángulos múltiplos.** En $\sin2x=\dfrac12$, primero se resuelve para el ángulo $2x$: $2x=30^\circ+360^\circ k$ o $2x=150^\circ+360^\circ k$. Después se divide entre 2: $x=15^\circ+180^\circ k$ o $x=75^\circ+180^\circ k$. Al dividir, el periodo también se divide, de modo que en una vuelta completa aparecen **cuatro** soluciones (15°, 75°, 195° y 255°) en lugar de dos. Olvidar este detalle es uno de los fallos más frecuentes.

**Comprobación numérica de una identidad.** Antes de intentar demostrar una igualdad, sustituye un ángulo sencillo, como 30°. Si los dos miembros dan valores distintos, la igualdad es falsa y no hace falta seguir. Si coinciden, no está demostrada (podría ser casualidad), pero es una buena señal para empezar la demostración.

**Por qué la fórmula del ángulo doble.** Es la suma con $a=b=x$: $\sin(x+x)=\sin x\cos x+\cos x\sin x=2\sin x\cos x$. No hace falta memorizar las fórmulas dobles si recuerdas las de la suma.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Demostrar una identidad
Demuestra que $(\sin x+\cos x)^2=1+\sin2x$.

Desarrollamos el miembro izquierdo: $\sin^2x+2\sin x\cos x+\cos^2x=(\sin^2x+\cos^2x)+2\sin x\cos x=1+\sin2x$. ✔
:::

:::ejemplo Ejemplo 2 · Valor exacto de sen 75°
Calcula $\sin75^\circ$ sin calculadora.

$\sin(45^\circ+30^\circ)=\sin45^\circ\cos30^\circ+\cos45^\circ\sin30^\circ=\dfrac{\sqrt2}2\cdot\dfrac{\sqrt3}2+\dfrac{\sqrt2}2\cdot\dfrac12=\dfrac{\sqrt6+\sqrt2}{4}\approx0{,}9659$. ✔
:::

:::ejemplo Ejemplo 3 · Ecuación básica
Resuelve $2\sin x-1=0$.

$\sin x=\dfrac12$. En una vuelta: $x=30^\circ$ y $x=180^\circ-30^\circ=150^\circ$. Solución general: $x=30^\circ+360^\circ k$ o $x=150^\circ+360^\circ k$, con $k\in\mathbb Z$.
:::

:::error Error típico
Dar solo una solución en una vuelta ($\sin x=\tfrac12$ → solo 30°) y olvidar 150°. Otro error: escribir $\cos(a+b)=\cos a+\cos b$; con $a=b=60^\circ$ daría $\cos120^\circ=1$, cuando vale $-\tfrac12$.
:::

## 6. Ejercicio guiado

Resuelve $2\cos^2x-\cos x-1=0$ en $[0^\circ,360^\circ)$.

:::pista Primera pista
Cambio $t=\cos x$: $2t^2-t-1=0$.
:::

:::pista Segunda pista
$t=1$ o $t=-\dfrac12$. Ahora resuelve $\cos x=1$ y $\cos x=-\dfrac12$.
:::

:::solucion Solución guiada
$\cos x=1$ → $x=0^\circ$. $\cos x=-\tfrac12$ → referencia 60°, cuadrantes II y III: $x=120^\circ$ y $x=240^\circ$. Soluciones: $0^\circ$, $120^\circ$, $240^\circ$. Comprobación con 120°: $2\cdot\tfrac14+\tfrac12-1=0$. ✔
:::

## 7. Práctica

**Fáciles**

1. Simplifica $\dfrac{\sin^2x}{1-\cos x}$.
2. Calcula $\cos15^\circ$ exacto.
3. Si $\sin\alpha=\dfrac35$ con $\alpha$ en el I cuadrante, calcula $\sin2\alpha$.

**Medios**

4. Resuelve $\cos x=\dfrac{\sqrt2}{2}$ en $[0^\circ,360^\circ)$.
5. Resuelve $\tan x=-1$ en $[0^\circ,360^\circ)$.

**Tipo examen / transferencia**

6. Resuelve $2\sin^2x+\sin x-1=0$ en $[0,2\pi)$ y da la solución general.

:::solucion Soluciones paso a paso
1. $\sin^2x=1-\cos^2x=(1-\cos x)(1+\cos x)$ → $1+\cos x$ (con $\cos x\neq1$).
2. $\cos(45^\circ-30^\circ)=\dfrac{\sqrt2}2\cdot\dfrac{\sqrt3}2+\dfrac{\sqrt2}2\cdot\dfrac12=\dfrac{\sqrt6+\sqrt2}4$.
3. $\cos\alpha=\dfrac45$; $\sin2\alpha=2\cdot\dfrac35\cdot\dfrac45=\dfrac{24}{25}$.
4. $45^\circ$ y $315^\circ$.
5. Referencia 45°, cuadrantes II y IV: $135^\circ$ y $315^\circ$.
6. $t=\sin x$: $2t^2+t-1=0$ → $t=\tfrac12$ o $t=-1$. $\sin x=\tfrac12$ → $\tfrac\pi6,\tfrac{5\pi}6$; $\sin x=-1$ → $\tfrac{3\pi}2$. General: $\tfrac\pi6+2\pi k$, $\tfrac{5\pi}6+2\pi k$, $\tfrac{3\pi}2+2\pi k$.
:::

## 8. Cómo revisar tus errores

- Comprueba cada solución sustituyendo en la ecuación original.
- Dibuja la circunferencia unitaria para encontrar el segundo ángulo.
- Comprueba una identidad con un ángulo concreto (por ejemplo, 30°) antes de demostrarla.
- No dividas entre $\sin x$ o $\cos x$: factoriza.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $\sin^2+\cos^2=1$; $1+\tan^2=\dfrac{1}{\cos^2}$.
- Suma: $\sin(a\pm b)$, $\cos(a\pm b)$ (signo invertido); ángulo doble.
- Ecuaciones: forma básica, dos soluciones por vuelta, solución general con $360^\circ k$.

**Vocabulario:** identidad, ángulo doble, fórmula de adición, ecuación trigonométrica, solución general, periodo.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, demuestra una identidad, calcula un valor exacto con la fórmula de la suma y resuelve una ecuación de segundo grado en seno o coseno.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de trigonometría del temario oficial de Matemáticas +25; base de los números complejos en forma polar (M02-L07) y de las funciones periódicas.
