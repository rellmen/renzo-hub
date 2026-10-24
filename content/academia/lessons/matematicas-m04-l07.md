---
id: matematicas-m04-l07
course: matematicas
module: M04
level: N2
title: Transformaciones de gráficas y asíntotas
learning_objectives:
  - Obtener gráficas por traslación, reflexión y dilatación de funciones conocidas
  - Calcular las asíntotas verticales, horizontales y oblicuas de funciones racionales
  - Estudiar el comportamiento de la función a ambos lados de una asíntota vertical
prerequisites: [matematicas-m04-l06, matematicas-m08-l01, matematicas-m02-l02]
skill_ids: [graph_transformations, asymptotes]
exam_alignment: [funciones, analisis]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Dibujar una función punto a punto es lento. Si reconoces que $y=(x-2)^2+1$ es la parábola $y=x^2$ movida 2 a la derecha y 1 hacia arriba, la dibujas en segundos. Esa es la primera parte de la lección: las **transformaciones**. La segunda son las **asíntotas**, rectas a las que la gráfica se acerca sin llegar a tocarlas (o tocándolas solo en algunos puntos). El cálculo de asíntotas es una pregunta clásica del examen de Matemáticas +25, siempre junto al dominio y a los límites.

## 2. Lo que necesitas saber antes

- Gráficas de funciones elementales: rectas, parábolas, exponenciales (M04-L01, M04-L06).
- Límites en un punto y en el infinito (M08-L01).
- División de polinomios (M02-L02).

## 3. Idea intuitiva

Las transformaciones son como mover una plantilla sobre un papel cuadriculado: puedes desplazarla (traslación), darle la vuelta (reflexión) o estirarla (dilatación). La forma básica no cambia; solo su posición o su tamaño.

Una asíntota es como una carretera que la gráfica acompaña cada vez más de cerca. Por ejemplo, $y=\dfrac1x$ se acerca al eje $X$ cuando $x$ es muy grande (asíntota horizontal $y=0$), y se dispara hacia arriba o hacia abajo cerca de $x=0$ (asíntota vertical $x=0$).

## 4. Definición precisa

**Transformaciones** de la gráfica de $y=f(x)$ (con $h,k>0$):

| Expresión | Efecto |
|---|---|
| $f(x)+k$ / $f(x)-k$ | sube / baja $k$ unidades |
| $f(x-h)$ / $f(x+h)$ | se desplaza a la **derecha** / **izquierda** $h$ unidades |
| $-f(x)$ | reflexión respecto del eje $X$ |
| $f(-x)$ | reflexión respecto del eje $Y$ |
| $a\,f(x)$, $a>1$ | estiramiento vertical (factor $a$) |
| $a\,f(x)$, $0<a<1$ | compresión vertical |

Atención al signo dentro del paréntesis: $f(x-2)$ se desplaza a la **derecha**, porque el valor que antes ocurría en $x=0$ ahora ocurre en $x=2$.

**Asíntotas:**
- **Vertical** $x=a$: si $\lim_{x\to a^\pm}f(x)=\pm\infty$. En funciones racionales, se busca en los ceros del denominador que **no** anulan también el numerador. Si ambos se anulan, puede ser un **agujero** (discontinuidad evitable) en lugar de una asíntota: se simplifica y se vuelve a comprobar.
- **Horizontal** $y=L$: si $\lim_{x\to\pm\infty}f(x)=L$. En racionales $\dfrac{P}{Q}$: grado $P<$ grado $Q$ → $y=0$; grados iguales → $y=$ cociente de coeficientes principales; grado $P>$ grado $Q$ → no hay horizontal.
- **Oblicua** $y=mx+n$ (con $m\neq0$): en racionales, cuando grado $P=$ grado $Q+1$. Se obtiene dividiendo: si $\dfrac{P(x)}{Q(x)}=mx+n+\dfrac{R(x)}{Q(x)}$ con grado $R<$ grado $Q$, la asíntota es $y=mx+n$. También: $m=\lim\dfrac{f(x)}{x}$, $n=\lim\big(f(x)-mx\big)$.
- Una función no puede tener a la vez asíntota horizontal y oblicua en el mismo lado ($+\infty$ o $-\infty$).

**Comportamiento junto a una asíntota vertical.** Se estudia el signo de $f$ a la izquierda y a la derecha de $a$ (con una tabla de signos o con un valor cercano como $a\pm0{,}01$). Así se sabe si la gráfica sube a $+\infty$ o baja a $-\infty$ en cada lado.

**Exponenciales y logaritmos.** $a^x$ tiene asíntota horizontal $y=0$ (en un lado). $\log_a x$ tiene asíntota vertical $x=0$. Sus transformaciones mueven también las asíntotas: $y=2^x+3$ tiene asíntota $y=3$; $y=\ln(x-1)$ tiene asíntota $x=1$.

**Por qué la división da la asíntota oblicua.** Si $f(x)=mx+n+\dfrac{R(x)}{Q(x)}$ y el grado de $R$ es menor que el de $Q$, la fracción tiende a 0 en el infinito, así que $f(x)$ y $mx+n$ se acercan tanto como se quiera. Es la misma idea que la regla de los grados para la horizontal.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Transformación de una parábola
Describe $y=(x-2)^2+1$ a partir de $y=x^2$.

Traslación 2 a la derecha y 1 hacia arriba. El vértice pasa de $(0,0)$ a $(2,1)$; la forma es la misma.
:::

:::ejemplo Ejemplo 2 · Asíntotas vertical y horizontal
Calcula las asíntotas de $f(x)=\dfrac{2x+1}{x-3}$.

1. Vertical: $x=3$ (el numerador vale $7\neq0$).
2. Horizontal: grados iguales → $y=\dfrac21=2$.
3. Laterales en $x=3$: por la derecha ($x=3{,}01$) $\dfrac{7{,}02}{0{,}01}>0$ → $+\infty$; por la izquierda → $-\infty$.
:::

:::ejemplo Ejemplo 3 · Asíntota oblicua
Calcula las asíntotas de $f(x)=\dfrac{x^2+1}{x-1}$.

1. Vertical: $x=1$ (numerador $2\neq0$).
2. Grado 2 sobre grado 1: oblicua. División: $x^2+1=(x-1)(x+1)+2$, así que $f(x)=x+1+\dfrac{2}{x-1}$.
3. Asíntota oblicua: $y=x+1$. No hay horizontal.
:::

:::error Error típico
Poner una asíntota vertical en cada cero del denominador sin comprobar el numerador: en $\dfrac{x^2-9}{x-3}$, en $x=3$ hay un **agujero** (la función simplificada es $x+3$), no una asíntota. Otro error: desplazar $f(x+2)$ hacia la derecha; se desplaza a la **izquierda**.
:::

## 6. Ejercicio guiado

Describe la gráfica de $f(x)=\dfrac{3}{x+2}-1$ a partir de $y=\dfrac1x$ y da sus asíntotas.

:::pista Primera pista
$\dfrac{3}{x+2}$ es $\dfrac1x$ estirada por 3 y desplazada 2 a la izquierda. Después, $-1$ la baja una unidad.
:::

:::pista Segunda pista
Las asíntotas de $\dfrac1x$ son $x=0$ e $y=0$. ¿A dónde se mueven?
:::

:::solucion Solución guiada
Estiramiento vertical de factor 3, traslación 2 a la izquierda y 1 hacia abajo. Asíntotas: vertical $x=-2$ y horizontal $y=-1$. Comprobación: $\lim_{x\to\infty}\left(\dfrac{3}{x+2}-1\right)=-1$. ✔
:::

## 7. Práctica

**Fáciles**

1. Describe $y=x^2-4$ a partir de $y=x^2$.
2. Describe $y=|x+3|$ a partir de $y=|x|$.
3. Calcula las asíntotas verticales y horizontales de $f(x)=\dfrac{x+1}{x^2-4}$.

**Medios**

4. Calcula la asíntota horizontal de $f(x)=\dfrac{3x^2-1}{x^2+5}$. ¿Tiene verticales?
5. Calcula la asíntota oblicua de $f(x)=\dfrac{2x^2-x}{x+1}$.

**Tipo examen / transferencia**

6. Estudia las asíntotas de $f(x)=\dfrac{x^2}{x^2-1}$ y el comportamiento a ambos lados de $x=1$. Haz un esbozo razonado de la gráfica.

:::solucion Soluciones paso a paso
1. Traslación de 4 unidades hacia abajo; vértice $(0,-4)$.
2. Traslación de 3 a la izquierda; vértice $(-3,0)$.
3. Verticales $x=2$ y $x=-2$ (el numerador no se anula ahí); horizontal $y=0$ (grado menor).
4. $y=3$. El denominador $x^2+5$ nunca se anula: no tiene verticales.
5. $2x^2-x=(x+1)(2x-3)+3$ → $y=2x-3$ (y vertical $x=-1$).
6. Verticales $x=\pm1$; horizontal $y=1$. Cerca de $x=1$: por la derecha, numerador $\approx1$ y denominador positivo pequeño → $+\infty$; por la izquierda, denominador negativo → $-\infty$. Por simetría ($f(-x)=f(x)$), en $x=-1$ ocurre lo contrario. Además, $f(0)=0$ y la gráfica queda por debajo de $y=1$ entre $-1$ y $1$.
:::

## 8. Cómo revisar tus errores

- En traslaciones horizontales, prueba un punto: ¿dónde está ahora el vértice?
- Antes de declarar una asíntota vertical, comprueba que el numerador no se anula.
- Para la oblicua, verifica la división multiplicando.
- Comprueba los laterales con un valor muy cercano a la asíntota.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $f(x)\pm k$: vertical; $f(x\mp h)$: horizontal (al revés del signo); $-f(x)$ y $f(-x)$: reflexiones.
- Asíntotas: vertical (denominador 0, numerador no); horizontal (grados); oblicua (grado + 1, dividir).
- Agujeros cuando numerador y denominador se anulan a la vez.

**Vocabulario:** traslación, reflexión, dilatación, asíntota vertical, horizontal y oblicua, discontinuidad evitable, límite lateral.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, dibuja una función obtenida por dos transformaciones y calcula todas las asíntotas de una función racional.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (Bachillerato). Alineado con los bloques de funciones y análisis del temario oficial de Matemáticas +25; se apoya en los límites de M08-L01 y se usa en la representación de funciones con derivadas (M08).
