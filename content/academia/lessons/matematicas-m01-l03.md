---
id: matematicas-m01-l03
course: matematicas
module: M01
level: N1
title: Despeje de fórmulas
learning_objectives:
  - Despejar una variable de una fórmula aplicando operaciones inversas en el orden correcto
  - Despejar variables que aparecen en denominadores, al cuadrado o en varios términos
  - Indicar las condiciones (divisores no nulos, signos) que hacen válido el despeje
prerequisites: [matematicas-m01-l02]
skill_ids: [formula_rearrange, inverse_operations]
exam_alignment: [algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Despejar es reorganizar una fórmula para que una letra concreta quede sola a un lado del igual. Lo harás constantemente: obtener el tiempo a partir de $d=v\cdot t$, el capital inicial a partir de la fórmula del interés, el radio a partir del área, una incógnita en un sistema o la pendiente de una recta. En Física y Economía casi todos los ejercicios se reducen a «elige la fórmula y despeja». En esta lección aprenderás un método seguro que funciona igual con números y con letras.

## 2. Lo que necesitas saber antes

- Resolver ecuaciones de primer grado manteniendo el equilibrio (M01-L02).
- Distributiva y factor común (M01-L01): $ax+bx=x(a+b)$.
- Potencias y raíces (M00-L06): si $x^2=9$ con $x>0$, $x=3$.

## 3. Idea intuitiva

Una fórmula es una receta que construye un resultado a partir de ingredientes. Por ejemplo, en $A=\dfrac{b\cdot h}{2}$ se toma $b$, se multiplica por $h$ y se divide entre 2. Para despejar $h$, deshaces la receta **en orden inverso**, como quien se quita la ropa: lo último que se puso es lo primero que se quita. Lo último que se hizo fue dividir entre 2, así que primero multiplicas por 2: $2A=b\cdot h$. Después deshaces la multiplicación por $b$ dividiendo: $h=\dfrac{2A}{b}$.

Despejar con letras es exactamente igual que resolver una ecuación con números; la única diferencia es que el resultado es una expresión, no un número.

## 4. Definición precisa

**Operaciones inversas:**

| Operación aplicada a la variable | Se deshace con |
|---|---|
| sumar $a$ | restar $a$ en ambos miembros |
| multiplicar por $a$ ($a\neq0$) | dividir entre $a$ |
| dividir entre $a$ | multiplicar por $a$ |
| elevar al cuadrado | raíz cuadrada (con $\pm$ si el signo no se conoce) |
| raíz cuadrada | elevar al cuadrado |

**Método en cuatro pasos:**
1. **Rodea** la variable que quieres despejar.
2. Si aparece en un **denominador**, multiplica ambos miembros por ese denominador para sacarla.
3. Si aparece en **varios términos**, pásalos todos al mismo miembro y saca **factor común**.
4. Deshaz las operaciones que la envuelven, de fuera hacia dentro. Al dividir por una expresión, anota que debe ser distinta de cero.

**Condiciones de validez.** Despejar $t=\dfrac{d}{v}$ exige $v\neq0$. Al despejar con raíz cuadrada en contextos físicos o geométricos (longitudes, radios, tiempos) se toma la raíz positiva; en un problema puramente algebraico hay que considerar $\pm$.

**Variable dentro de una raíz.** Si la variable está bajo una raíz, como en $T=2\pi\sqrt{\dfrac{L}{g}}$ (periodo de un péndulo), primero aísla la raíz ($\dfrac{T}{2\pi}=\sqrt{\dfrac Lg}$), después eleva al cuadrado los dos miembros ($\dfrac{T^2}{4\pi^2}=\dfrac Lg$) y por último despeja: $L=\dfrac{gT^2}{4\pi^2}$. Elevar al cuadrado es seguro aquí porque ambos miembros son positivos.

**Comprobación.** Sustituye unos valores sencillos en la fórmula original, calcula, y comprueba que tu despeje devuelve el valor de partida. Es el equivalente a comprobar una ecuación.

**Por qué el orden importa.** En $y=3x+5$, la $x$ primero se multiplica por 3 y después se le suma 5. Si dividieras primero entre 3, tendrías que dividir también el 5: $\dfrac{y}{3}=x+\dfrac{5}{3}$. No es incorrecto, pero es más largo y propenso a errores. Deshacer en orden inverso (restar 5 y después dividir entre 3) da directamente $x=\dfrac{y-5}{3}$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Despeje directo
Despeja $C_0$ en $C=C_0(1+r\,t)$ (interés simple).

Lo último que se hizo con $C_0$ fue multiplicarlo por $(1+rt)$. Divide: $C_0=\dfrac{C}{1+r\,t}$, con $1+rt\neq0$.
:::

:::ejemplo Ejemplo 2 · Variable al cuadrado
Despeja $r$ en $A=\pi r^2$ (área del círculo) y calcula $r$ si $A=50$ m².

1. Divide entre $\pi$: $r^2=\dfrac{A}{\pi}$.
2. Raíz positiva (es una longitud): $r=\sqrt{\dfrac{A}{\pi}}$.
3. $r=\sqrt{\dfrac{50}{\pi}}\approx\sqrt{15{,}92}\approx3{,}99$ m.
:::

:::ejemplo Ejemplo 3 · Variable en dos términos
Despeja $x$ en $a x+b=c x+d$ (con $a\neq c$).

1. Agrupa: $ax-cx=d-b$.
2. Factor común: $x(a-c)=d-b$.
3. Divide: $x=\dfrac{d-b}{a-c}$.

Comprobación con $a=5,b=1,c=2,d=10$: $x=\dfrac{9}{3}=3$; $5\cdot3+1=16=2\cdot3+10$. ✔
:::

:::error Error típico
En $v=\dfrac{d}{t}$, escribir $t=v\cdot d$. Comprueba con números: $v=\dfrac{100}{20}=5$, y $5\cdot100=500\neq20$. Lo correcto es $t=\dfrac{d}{v}$. Otro error: «despejar» de un denominador compuesto separando términos: $\dfrac{1}{a+b}\neq\dfrac1a+\dfrac1b$.
:::

## 6. Ejercicio guiado

Despeja $m$ en la fórmula de la energía cinética más la potencial, $E=\dfrac{1}{2}m v^2+m g h$.

:::pista Primera pista
$m$ aparece en dos términos. Saca factor común.
:::

:::pista Segunda pista
$E=m\left(\dfrac12v^2+gh\right)$. Ahora $m$ solo está multiplicada por el paréntesis.
:::

:::solucion Solución guiada
$m=\dfrac{E}{\frac12v^2+gh}=\dfrac{2E}{v^2+2gh}$ (multiplicando arriba y abajo por 2), con $v^2+2gh\neq0$.
Comprobación con $m=2$, $v=3$, $g=10$, $h=1$: $E=9+20=29$; $\dfrac{58}{9+20}=2$. ✔
:::

## 7. Práctica

**Fáciles**

1. Despeja $t$ en $d=v\,t$.
2. Despeja $b$ en $P=2a+2b$.
3. Despeja $h$ en $V=\dfrac{1}{3}A\,h$.

**Medios**

4. Despeja $x$ en $y=\dfrac{2x-1}{3}$.
5. Despeja $v_0$ en $v^2=v_0^2+2a\,d$ (suponiendo $v_0\ge0$).

**Tipo examen / transferencia**

6. El coste total de un pedido es $C=F+p\,n$, donde $F$ es un coste fijo, $p$ el precio por unidad y $n$ el número de unidades. Despeja $n$ y calcula cuántas unidades se pueden pedir con un presupuesto de 1.250 € si $F=50$ € y $p=7{,}50$ €.

:::solucion Soluciones paso a paso
1. $t=\dfrac{d}{v}$ ($v\neq0$).
2. $2b=P-2a$ → $b=\dfrac{P-2a}{2}$.
3. $3V=A\,h$ → $h=\dfrac{3V}{A}$ ($A\neq0$).
4. $3y=2x-1$ → $2x=3y+1$ → $x=\dfrac{3y+1}{2}$.
5. $v_0^2=v^2-2ad$ → $v_0=\sqrt{v^2-2ad}$ (requiere $v^2-2ad\ge0$).
6. $n=\dfrac{C-F}{p}=\dfrac{1250-50}{7{,}5}=160$ unidades. Comprobación: $50+7{,}5\cdot160=1250$. ✔
:::

## 8. Cómo revisar tus errores

- Comprueba siempre con números sencillos en la fórmula original.
- Revisa que no has dividido por algo que pueda valer cero sin decirlo.
- Si la variable aparece en dos sitios, ¿has sacado factor común antes de dividir?
- Analiza las unidades: si despejas un tiempo, el resultado debe salir en segundos u horas.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Deshacer las operaciones en orden inverso, con la operación inversa en ambos miembros.
- Variable en el denominador: multiplica por él. En varios términos: factor común.
- Indicar las condiciones de validez y comprobar con números.

**Vocabulario:** despejar, operación inversa, factor común, condición de validez, fórmula.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, despeja tres variables distintas de una misma fórmula de Física o de Economía y compruébalas con números.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1 (ESO). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; herramienta transversal para Física y Economía de la Empresa.
