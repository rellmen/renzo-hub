---
id: matematicas-m09-l01
course: matematicas
module: M09
level: N2
title: Integrales: primitivas, métodos de integración, integral definida y áreas
learning_objectives:
  - Calcular primitivas inmediatas usando la linealidad y la tabla de derivadas leída al revés
  - Integrar por sustitución sencilla y por partes
  - Calcular integrales definidas con la regla de Barrow y áreas de recintos limitados por curvas
prerequisites: [matematicas-m08-l03, matematicas-m08-l05]
skill_ids: [antiderivatives, integration_methods, definite_integral, area_between_curves]
exam_alignment: [analisis]
estimated_minutes: 75
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Integrar es el proceso inverso de derivar: si conoces la velocidad de un coche en cada instante, la integral te da la distancia recorrida; si conoces el coste marginal, te da el coste total. Geométricamente, la integral definida mide **áreas** bajo curvas. En el examen de Matemáticas +25 suelen pedirse primitivas sencillas, una integral por partes o por sustitución y, sobre todo, el área de un recinto limitado por una o dos curvas. En esta lección verás todo el bloque: primitivas, métodos, integral definida y áreas.

## 2. Lo que necesitas saber antes

- Tabla de derivadas y regla de la cadena (M08-L03).
- Puntos de corte de dos funciones: resolver $f(x)=g(x)$ (M02-L04, M02-L05).
- Propiedades de potencias, exponenciales y logaritmos (M00-L05, M05-L01).

## 3. Idea intuitiva

Derivar responde a «conozco la función, ¿cómo cambia?». Integrar responde a la pregunta contraria: «sé cómo cambia, ¿cuál es la función?». Si la derivada de $x^2$ es $2x$, una primitiva de $2x$ es $x^2$. Pero también lo son $x^2+5$ o $x^2-1$, porque la constante desaparece al derivar: por eso las primitivas llevan siempre $+\,C$.

La integral definida $\int_a^b f(x)\,dx$ suma «infinitas tiras finísimas» de altura $f(x)$ y anchura $dx$ entre $a$ y $b$: si $f\ge0$, el resultado es el área bajo la curva. El gran resultado del análisis, el **teorema fundamental del cálculo**, dice que esa suma se calcula con una primitiva: basta restar $F(b)-F(a)$.

## 4. Definición precisa

**Primitiva.** $F$ es una primitiva de $f$ si $F'(x)=f(x)$. La **integral indefinida** es el conjunto de todas: $\int f(x)\,dx=F(x)+C$.

**Linealidad:** $\int\big(af(x)+bg(x)\big)dx=a\int f(x)\,dx+b\int g(x)\,dx$.

**Integrales inmediatas** (con su versión con $u=u(x)$):

| $\int f(x)\,dx$ | Resultado | Forma compuesta |
|---|---|---|
| $\int x^n\,dx$ ($n\neq-1$) | $\dfrac{x^{n+1}}{n+1}+C$ | $\int u^n u'\,dx=\dfrac{u^{n+1}}{n+1}+C$ |
| $\int \dfrac1x\,dx$ | $\ln\lvert x\rvert+C$ | $\int\dfrac{u'}{u}\,dx=\ln\lvert u\rvert+C$ |
| $\int e^x\,dx$ | $e^x+C$ | $\int e^u u'\,dx=e^u+C$ |
| $\int \cos x\,dx$ | $\sin x+C$ | $\int\cos u\cdot u'\,dx=\sin u+C$ |
| $\int \sin x\,dx$ | $-\cos x+C$ | $\int\sin u\cdot u'\,dx=-\cos u+C$ |

**Sustitución (cambio de variable).** Si en el integrando aparece una función $u(x)$ y también su derivada $u'(x)$ (salvo una constante), haz $u=u(x)$, $du=u'(x)\,dx$, integra en $u$ y deshaz el cambio. Ejemplo: $\int 2x\,(x^2+1)^3dx$ con $u=x^2+1$ da $\dfrac{(x^2+1)^4}{4}+C$.

**Integración por partes.** Procede de la regla del producto:
$$\int u\,dv=u\,v-\int v\,du.$$
Elige como $u$ la función que se simplifica al derivar (polinomios, logaritmos) y como $dv$ la que se integra fácilmente (exponenciales, senos, cosenos). Regla práctica para escoger $u$, en este orden de preferencia: logaritmos, polinomios, exponenciales y trigonométricas.

**Integral definida y regla de Barrow.** Si $F$ es una primitiva de $f$ continua en $[a,b]$:
$$\int_a^b f(x)\,dx=\Big[F(x)\Big]_a^b=F(b)-F(a).$$
Propiedades: $\int_a^a f=0$; $\int_b^a f=-\int_a^b f$; $\int_a^b f=\int_a^c f+\int_c^b f$.

**Teorema fundamental del cálculo.** Si $f$ es continua, la función $G(x)=\int_a^x f(t)\,dt$ es derivable y $G'(x)=f(x)$. Derivar e integrar son operaciones inversas.

**Áreas.**
- Si $f\ge0$ en $[a,b]$: área $=\int_a^b f(x)\,dx$.
- Si $f$ cambia de signo, la integral **resta** las partes bajo el eje. Para el área: halla los cortes con el eje OX en $[a,b]$, integra en cada tramo y suma los **valores absolutos**.
- **Entre dos curvas** $f$ y $g$: halla los cortes resolviendo $f(x)=g(x)$; en cada tramo, área $=\int\lvert f(x)-g(x)\rvert\,dx$, es decir, «la de arriba menos la de abajo».

**Comprobar una primitiva.** Siempre puedes verificar el resultado derivándolo: debe salir el integrando. Esta comprobación tarda medio minuto y evita perder puntos por un signo o un coeficiente mal puesto.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Primitivas inmediatas
Calcula $\int\left(3x^2-\dfrac4x+e^x\right)dx$ y $\int\sqrt x\,dx$.

$x^3-4\ln\lvert x\rvert+e^x+C$. $\int x^{1/2}dx=\dfrac{x^{3/2}}{3/2}+C=\dfrac23x\sqrt x+C$.
:::

:::ejemplo Ejemplo 2 · Por partes
Calcula $\int x\,e^x\,dx$.

$u=x$, $du=dx$; $dv=e^xdx$, $v=e^x$. $\int xe^x\,dx=xe^x-\int e^x\,dx=e^x(x-1)+C$. Comprobación: $\big(e^x(x-1)\big)'=e^x(x-1)+e^x=xe^x$. ✔
:::

:::ejemplo Ejemplo 3 · Área entre dos curvas
Área del recinto limitado por $f(x)=x^2$ y $g(x)=x+2$.

Cortes: $x^2=x+2$ → $x=-1$ y $x=2$. En $(-1,2)$ la recta está por encima (en $x=0$: $2>0$).
$$A=\int_{-1}^{2}(x+2-x^2)\,dx=\left[\frac{x^2}{2}+2x-\frac{x^3}{3}\right]_{-1}^{2}=\frac{10}{3}-\left(-\frac76\right)=\frac92=4{,}5.$$
:::

:::error Error típico
Calcular un área con una sola integral cuando la función cambia de signo: $\int_0^{2\pi}\sin x\,dx=0$, pero el área es 4. Otros errores: olvidar la $+\,C$ en las indefinidas y aplicar $\int x^n=\frac{x^{n+1}}{n+1}$ con $n=-1$ (ese caso da el logaritmo).
:::

## 6. Ejercicio guiado

Calcula $\displaystyle\int_0^1 \frac{2x}{x^2+1}\,dx$.

:::pista Primera pista
El numerador es la derivada del denominador: tiene la forma $\int\dfrac{u'}{u}$.
:::

:::pista Segunda pista
Primitiva: $\ln(x^2+1)$. Aplica Barrow.
:::

:::solucion Solución guiada
$\big[\ln(x^2+1)\big]_0^1=\ln2-\ln1=\ln2\approx0{,}693$.
:::

## 7. Práctica

**Fáciles**

1. $\int(4x^3-2x+5)\,dx$.
2. $\int_0^2 3x^2\,dx$.
3. $\int e^{3x}\,dx$.

**Medios**

4. $\int x\cos x\,dx$ (por partes).
5. Área encerrada entre $f(x)=4-x^2$ y el eje OX.

**Tipo examen / transferencia**

6. Sea $f(x)=x^3-x$. Calcula el área total del recinto limitado por la gráfica de $f$ y el eje OX entre $x=-1$ y $x=1$. Explica por qué $\int_{-1}^1 f(x)\,dx$ no da el área.

:::solucion Soluciones paso a paso
1. $x^4-x^2+5x+C$.
2. $\big[x^3\big]_0^2=8$.
3. $\dfrac{e^{3x}}{3}+C$.
4. $u=x$, $dv=\cos x\,dx$, $v=\sin x$: $x\sin x-\int\sin x\,dx=x\sin x+\cos x+C$.
5. Cortes en $\pm2$: $\int_{-2}^{2}(4-x^2)dx=\left[4x-\frac{x^3}{3}\right]_{-2}^{2}=\dfrac{16}{3}+\dfrac{16}{3}=\dfrac{32}{3}\approx10{,}67$.
6. Cortes: $x=-1,0,1$. $\int_{-1}^0(x^3-x)dx=\left[\frac{x^4}{4}-\frac{x^2}{2}\right]_{-1}^0=\frac14$; $\int_0^1(x^3-x)dx=-\frac14$. Área $=\frac14+\frac14=\frac12$. La integral de $-1$ a $1$ da $0$ porque la parte positiva y la negativa se compensan (la función es impar).
:::

## 8. Cómo revisar tus errores

- Deriva tu primitiva: debe salir el integrando.
- En áreas, dibuja o comprueba el signo de la función en cada tramo.
- Un área nunca es negativa ni cero si el recinto existe.
- En Barrow, cuidado con los signos al restar $F(a)$.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $\int f=F+C$ con $F'=f$; tabla de inmediatas y formas compuestas.
- Sustitución si aparece $u$ y $u'$; partes $\int u\,dv=uv-\int v\,du$.
- Barrow: $\int_a^b f=F(b)-F(a)$. Áreas: tramos entre cortes y valores absolutos; entre curvas, arriba menos abajo.

**Vocabulario:** primitiva, integral indefinida, constante de integración, cambio de variable, integración por partes, integral definida, regla de Barrow, teorema fundamental del cálculo, recinto.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una inmediata, una por partes y el área entre una parábola y una recta.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de análisis (cálculo integral) del temario oficial de Matemáticas +25.
