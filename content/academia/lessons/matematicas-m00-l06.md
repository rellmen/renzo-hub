---
id: matematicas-m00-l06
course: matematicas
module: M00
level: N0
title: Potencias, raíces y notación científica
learning_objectives:
  - Aplicar las propiedades de las potencias de exponente entero, incluido el exponente negativo y el cero
  - Calcular y simplificar raíces sencillas y relacionarlas con potencias
  - Escribir y operar números en notación científica
prerequisites: [matematicas-m00-l05]
skill_ids: [powers, roots, scientific_notation]
exam_alignment: [arithmetica-algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Las potencias abrevian multiplicaciones repetidas y aparecen en casi todas las fórmulas del examen: polinomios, derivadas ($x^n$), interés compuesto ($(1+i)^n$), exponenciales y logaritmos. Las raíces son su operación inversa. La notación científica permite escribir números muy grandes o muy pequeños sin errores de ceros. Dominar las propiedades evita los fallos más caros del examen, como $(a+b)^2=a^2+b^2$ o $2^3\cdot2^4=2^{12}$.

## 2. Lo que necesitas saber antes

- Signos y jerarquía de operaciones (M00-L01): $-3^2=-9$ pero $(-3)^2=9$.
- Fracciones y su inversa (M00-L04).
- Decimales y movimiento de la coma al multiplicar por 10 (M00-L05).

## 3. Idea intuitiva

$2^5$ significa «multiplica 2 por sí mismo 5 veces»: $2\cdot2\cdot2\cdot2\cdot2=32$. Si multiplicas $2^3\cdot2^4$, estás poniendo en fila tres doses y luego cuatro más: siete doses, $2^7$. Por eso **los exponentes se suman**. Si divides $2^7:2^3$, tachas tres doses de arriba con tres de abajo y quedan cuatro: **se restan**.

¿Qué significa entonces $2^{-1}$? Siguiendo la regla de la resta, $2^3:2^4=2^{-1}$, y también es $\dfrac{8}{16}=\dfrac{1}{2}$. Así que un exponente negativo significa «uno partido por»: $2^{-1}=\dfrac12$. Y $2^0=2^3:2^3=1$.

La raíz cuadrada pregunta lo contrario: ¿qué número al cuadrado da 49? El 7.

## 4. Definición precisa

**Potencia de exponente natural:** $a^n=a\cdot a\cdots a$ ($n$ factores). $a$ es la base y $n$ el exponente.

**Propiedades** (con $a,b\neq0$ cuando haya divisiones o exponentes no positivos):

| Propiedad | Fórmula | Ejemplo |
|---|---|---|
| Producto, misma base | $a^m\cdot a^n=a^{m+n}$ | $3^2\cdot3^4=3^6$ |
| Cociente, misma base | $a^m:a^n=a^{m-n}$ | $5^7:5^5=5^2$ |
| Potencia de potencia | $(a^m)^n=a^{m\cdot n}$ | $(2^3)^2=2^6$ |
| Potencia de un producto | $(a\cdot b)^n=a^n b^n$ | $(2x)^3=8x^3$ |
| Potencia de un cociente | $\left(\dfrac ab\right)^n=\dfrac{a^n}{b^n}$ | $\left(\dfrac23\right)^2=\dfrac49$ |
| Exponente cero | $a^0=1$ | $7^0=1$ |
| Exponente negativo | $a^{-n}=\dfrac{1}{a^n}$ | $10^{-3}=0{,}001$ |
| Fracción con exponente negativo | $\left(\dfrac ab\right)^{-n}=\left(\dfrac ba\right)^n$ | $\left(\dfrac23\right)^{-2}=\dfrac94$ |

**No hay propiedad para la suma:** $(a+b)^2\neq a^2+b^2$ y $2^3+2^4\neq2^7$.

**Signo de la base:** una base negativa elevada a exponente par da positivo; a impar, negativo. $(-2)^4=16$, $(-2)^3=-8$. Sin paréntesis, el exponente solo afecta al número: $-2^4=-16$.

**Raíces.** $\sqrt[n]{a}=b$ significa $b^n=a$. La raíz cuadrada de un número positivo se toma positiva: $\sqrt{49}=7$ (aunque $x^2=49$ tiene soluciones $\pm7$). No existe la raíz cuadrada real de un negativo; sí la cúbica: $\sqrt[3]{-8}=-2$.
- Relación con potencias: $\sqrt[n]{a}=a^{1/n}$ (lo desarrollarás en M02-L05).
- Producto y cociente: $\sqrt{a\cdot b}=\sqrt a\sqrt b$, $\sqrt{\dfrac ab}=\dfrac{\sqrt a}{\sqrt b}$ (con $a,b\ge0$).
- Extraer factores: $\sqrt{72}=\sqrt{36\cdot2}=6\sqrt2$.
- **No** se reparte sobre la suma: $\sqrt{9+16}=5\neq3+4$.

**Notación científica:** $N=m\cdot10^k$ con $1\le|m|<10$ y $k$ entero. $45\,000=4{,}5\cdot10^4$; $0{,}00072=7{,}2\cdot10^{-4}$.
- Producto: se multiplican las mantisas y se suman los exponentes, y se reajusta.
- Cociente: se dividen las mantisas y se restan los exponentes.
- Suma: hay que igualar antes los exponentes. Por ejemplo, $3\cdot10^5+4\cdot10^4=3\cdot10^5+0{,}4\cdot10^5=3{,}4\cdot10^5$.

**Orden de magnitud y estimación.** El exponente de 10 en notación científica indica el **orden de magnitud**: $3{,}4\cdot10^5$ está en las centenas de miles. Antes de dar un resultado, estima su orden de magnitud redondeando cada dato a una cifra: $\dfrac{4{,}8\cdot10^5\cdot1{,}5\cdot10}{2\cdot10^2}\approx\dfrac{5\cdot10^5\cdot2\cdot10}{2\cdot10^2}=5\cdot10^4$. Si tu cálculo exacto da $3{,}6\cdot10^{6}$, algo ha fallado. Es la comprobación más rápida que existe y la usarás también en Física.

**Por qué $a^0=1$ y $a^{-n}=\dfrac{1}{a^n}$ no son reglas arbitrarias.** Son la única forma de que la propiedad $a^m:a^n=a^{m-n}$ siga funcionando cuando $m\le n$. Las matemáticas eligen definiciones que conservan las reglas ya conocidas; por eso, si dudas de una propiedad, puedes reconstruirla con un ejemplo pequeño ($2^3:2^5=\dfrac{8}{32}=\dfrac14=2^{-2}$).

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Simplificar con propiedades
Simplifica $\dfrac{2^5\cdot4^2}{8^3}$ y da el resultado como potencia de 2.

1. Todo en base 2: $4^2=(2^2)^2=2^4$; $8^3=(2^3)^3=2^9$.
2. Numerador: $2^5\cdot2^4=2^9$.
3. Cociente: $2^9:2^9=2^0=1$.
:::

:::ejemplo Ejemplo 2 · Exponentes negativos
Calcula $3^{-2}+\left(\dfrac12\right)^{-3}$.

$3^{-2}=\dfrac19$; $\left(\dfrac12\right)^{-3}=2^3=8$. Suma: $8+\dfrac19=\dfrac{73}{9}$.
:::

:::ejemplo Ejemplo 3 · Notación científica
Un almacén procesa $4{,}8\cdot10^5$ cajas al año y cada caja pesa de media $1{,}5\cdot10^{1}$ kg. Calcula el peso total en notación científica.

$4{,}8\cdot1{,}5=7{,}2$; $10^5\cdot10^1=10^6$ → $7{,}2\cdot10^6$ kg (7.200 toneladas).
:::

:::error Error típico
Multiplicar los exponentes en un producto de igual base ($2^3\cdot2^4=2^{12}$, falso) o multiplicar las bases ($2^3\cdot3^3=6^6$, falso: es $6^3$). Otro error: $5^{-2}=-25$. Un exponente negativo **no** hace negativo el número: $5^{-2}=\dfrac{1}{25}$.
:::

## 6. Ejercicio guiado

Simplifica $\sqrt{50}+\sqrt{18}-\sqrt{8}$.

:::pista Primera pista
Busca en cada radicando un cuadrado perfecto: $50=25\cdot2$, $18=9\cdot2$, $8=4\cdot2$.
:::

:::pista Segunda pista
Extrae: $5\sqrt2+3\sqrt2-2\sqrt2$. Ahora son «términos semejantes» en $\sqrt2$.
:::

:::solucion Solución guiada
$5\sqrt2+3\sqrt2-2\sqrt2=6\sqrt2$. Comprobación decimal: $7{,}071+4{,}243-2{,}828=8{,}485$ y $6\cdot1{,}414=8{,}485$. ✔
:::

## 7. Práctica

**Fáciles**

1. Calcula $(-3)^4$ y $-3^4$.
2. Escribe como una sola potencia: $7^3\cdot7^5:7^2$.
3. Escribe $0{,}0000063$ en notación científica.

**Medios**

4. Calcula $\left(\dfrac{3}{5}\right)^{-2}$.
5. Simplifica $\sqrt{48}-\sqrt{12}$.

**Tipo examen / transferencia**

6. Un servidor almacena $3{,}2\cdot10^{12}$ bytes y cada registro ocupa $8\cdot10^{3}$ bytes. ¿Cuántos registros caben? Expresa el resultado en notación científica y explica el procedimiento.

:::solucion Soluciones paso a paso
1. $(-3)^4=81$; $-3^4=-81$.
2. $7^{3+5-2}=7^6$.
3. $6{,}3\cdot10^{-6}$.
4. $\left(\dfrac53\right)^2=\dfrac{25}{9}$.
5. $4\sqrt3-2\sqrt3=2\sqrt3$.
6. $\dfrac{3{,}2\cdot10^{12}}{8\cdot10^3}=0{,}4\cdot10^{9}=4\cdot10^{8}$ registros. Se dividen mantisas ($3{,}2:8=0{,}4$), se restan exponentes ($12-3=9$) y se reajusta para que la mantisa esté entre 1 y 10.
:::

## 8. Cómo revisar tus errores

- Antes de aplicar una propiedad, comprueba que las bases son iguales.
- Cuidado con los paréntesis en las bases negativas.
- En notación científica, revisa que la mantisa esté entre 1 y 10; si no, reajusta el exponente.
- Comprueba raíces elevando al cuadrado el resultado.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Misma base: producto suma exponentes, cociente los resta; potencia de potencia los multiplica.
- $a^0=1$, $a^{-n}=\dfrac{1}{a^n}$; nunca repartir potencias ni raíces sobre sumas.
- $\sqrt{a b}=\sqrt a\sqrt b$; extraer factores cuadrados.
- Notación científica: $m\cdot10^k$ con $1\le|m|<10$.

**Vocabulario:** base, exponente, potencia, radicando, índice, raíz, mantisa, notación científica, orden de magnitud.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, simplifica una expresión con exponentes negativos y opera dos números en notación científica.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N0 (rescate, 2.º–3.º ESO). Base de polinomios (M02), radicales y potencias racionales (M02-L05), exponenciales y logaritmos (M04-L06) y de la notación científica de Física (F01).
