---
id: matematicas-m04-l06
course: matematicas
module: M04
level: N2
title: Funciones exponenciales y logarítmicas
learning_objectives:
  - Reconocer y representar funciones exponenciales y logarítmicas y sus propiedades
  - Aplicar la definición y las propiedades de los logaritmos, incluido el cambio de base
  - Resolver ecuaciones exponenciales y logarítmicas comprobando las soluciones
prerequisites: [matematicas-m04-l05, matematicas-m00-l06, matematicas-m03-l04]
skill_ids: [exponential_functions, logarithms, exp_log_equations]
exam_alignment: [funciones]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

El crecimiento compuesto (intereses, poblaciones, contagios, datos almacenados) se describe con **funciones exponenciales**. Y cuando la pregunta es «¿cuánto tiempo hace falta para…?», la incógnita está en el exponente, y para despejarla se necesita su función inversa: el **logaritmo**. En esta lección aprenderás las dos funciones, las propiedades de los logaritmos y a resolver ecuaciones exponenciales y logarítmicas. Aparecen en el examen de Matemáticas +25 en problemas de crecimiento y en el estudio de funciones, y son esenciales en Informática (la complejidad $\log n$ de la búsqueda binaria).

## 2. Lo que necesitas saber antes

- Potencias de exponente entero y racional (M00-L06, M02-L05).
- Función inversa y simetría respecto de $y=x$ (M04-L05).
- Interés compuesto (M03-L04): $C_n=C_0(1+i)^n$.

## 3. Idea intuitiva

En una función exponencial, $f(x)=2^x$, la variable está en el exponente. Cada vez que $x$ aumenta en 1, el valor se **multiplica** por 2: 1, 2, 4, 8, 16, 32… Es la versión continua de una progresión geométrica.

El logaritmo responde a la pregunta inversa: ¿a qué exponente hay que elevar 2 para obtener 32? A 5. Por eso $\log_2 32=5$. Un logaritmo **es un exponente**. Con esta idea se entienden todas sus propiedades: como los exponentes se suman al multiplicar potencias, los logaritmos convierten productos en sumas.

## 4. Definición precisa

**Función exponencial** $f(x)=a^x$, con base $a>0$, $a\neq1$.
- Dominio $\mathbb R$, recorrido $(0,+\infty)$: **nunca** vale 0 ni negativo.
- Pasa por $(0,1)$ y por $(1,a)$.
- Si $a>1$, creciente; si $0<a<1$, decreciente.
- Asíntota horizontal $y=0$.
- La base más usada en ciencia es el número $e\approx2{,}71828$; $e^x$ se llama exponencial natural.

**Logaritmo**: $\log_a x=y\iff a^{y}=x$, con $a>0$, $a\neq1$, $x>0$.
- $\log_a1=0$, $\log_a a=1$, $\log_a a^k=k$, $a^{\log_a x}=x$.
- $\log x$ sin base indica base 10 (decimal); $\ln x$, base $e$ (neperiano).

**Función logarítmica** $g(x)=\log_a x$: inversa de $a^x$.
- Dominio $(0,+\infty)$, recorrido $\mathbb R$.
- Pasa por $(1,0)$ y por $(a,1)$; asíntota vertical $x=0$.
- Si $a>1$, creciente (cada vez más despacio).

**Propiedades** (con $x,y>0$):

| Propiedad | Fórmula |
|---|---|
| Producto | $\log_a(xy)=\log_a x+\log_a y$ |
| Cociente | $\log_a\dfrac xy=\log_a x-\log_a y$ |
| Potencia | $\log_a x^k=k\log_a x$ |
| Cambio de base | $\log_a x=\dfrac{\log x}{\log a}=\dfrac{\ln x}{\ln a}$ |

No existe propiedad para $\log(x+y)$.

**Ecuaciones exponenciales.**
1. Si se pueden igualar las bases: $a^{E_1}=a^{E_2}\iff E_1=E_2$.
2. Si no: se toman logaritmos en ambos miembros y se usa la propiedad de la potencia.
3. Si aparece $a^x$ varias veces ($4^x-3\cdot2^x-4=0$), se hace un cambio de variable $t=2^x$ y se descartan los $t\le0$.

**Ecuaciones logarítmicas.**
1. Agrupa con las propiedades hasta tener $\log_a E_1=\log_a E_2$ (entonces $E_1=E_2$) o $\log_a E=c$ (entonces $E=a^c$).
2. **Comprueba** cada solución: los argumentos de todos los logaritmos de la ecuación original deben ser **positivos**.

**Por qué el logaritmo convierte productos en sumas.** Si $x=a^m$ e $y=a^n$, entonces $xy=a^{m+n}$, y por definición $\log_a(xy)=m+n=\log_a x+\log_a y$. Antes de las calculadoras, esta propiedad permitía multiplicar números grandes sumando sus logaritmos con tablas; hoy la usamos para despejar exponentes.

**Crecimiento exponencial frente a lineal.** Cualquier exponencial con base mayor que 1 acaba superando a cualquier polinomio, y cualquier logaritmo crece más despacio que cualquier potencia positiva de $x$. En Informática esto decide si un algoritmo es viable: duplicar los datos con un coste $\log n$ apenas añade un paso, mientras que con un coste $2^n$ lo vuelve imposible.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Calcular logaritmos
Calcula $\log_2 32$, $\log 0{,}001$ y $\ln e^4$.

$2^5=32$ → $5$; $10^{-3}=0{,}001$ → $-3$; $\ln e^4=4$.
:::

:::ejemplo Ejemplo 2 · Ecuaciones exponenciales
Resuelve $3^{x+1}=81$ y $2^x=10$.

1. $81=3^4$ → $x+1=4$ → $x=3$.
2. Tomando logaritmos: $x\log2=\log10=1$ → $x=\dfrac{1}{\log2}\approx3{,}3219$. Comprobación: $2^{3{,}3219}\approx10$. ✔
:::

:::ejemplo Ejemplo 3 · Ecuación logarítmica con solución falsa
Resuelve $\log x+\log(x-3)=1$.

1. $\log\big(x(x-3)\big)=1$ → $x(x-3)=10$ → $x^2-3x-10=0$ → $x=5$ o $x=-2$.
2. $x=-2$ haría negativos los argumentos: **se descarta**. Solución: $x=5$. Comprobación: $\log5+\log2=\log10=1$. ✔
:::

:::error Error típico
Escribir $\log(x+3)=\log x+\log 3$: el logaritmo de una suma no se separa. Otro error: dar por buena una solución que hace negativo el argumento de un logaritmo, o creer que $\log_a x$ puede calcularse para $x\le0$.
:::

## 6. Ejercicio guiado

Una inversión crece un 5 % anual compuesto. ¿Cuántos años tarda en duplicarse?

:::pista Primera pista
Plantea $1{,}05^{\,n}=2$.
:::

:::pista Segunda pista
Toma logaritmos: $n\log1{,}05=\log2$.
:::

:::solucion Solución guiada
$n=\dfrac{\log2}{\log1{,}05}\approx\dfrac{0{,}30103}{0{,}02119}\approx14{,}21$ años: se duplica a lo largo del año 15. Coincide con la prueba de valores de M03-L04.
:::

## 7. Práctica

**Fáciles**

1. Calcula $\log_3 81$.
2. Calcula $\log_2\dfrac18$.
3. Calcula $\log2+\log50$.

**Medios**

4. Resuelve $5^{2x-1}=125$.
5. Resuelve $\log_2(x+3)=4$.

**Tipo examen / transferencia**

6. Un cultivo tiene 500 bacterias y se duplica cada 3 horas: $N(t)=500\cdot2^{t/3}$. (a) ¿Cuántas habrá a las 9 horas? (b) ¿Cuándo llegará a 10.000? Da el resultado con dos decimales.

:::solucion Soluciones paso a paso
1. $3^4=81$ → $4$.
2. $2^{-3}=\dfrac18$ → $-3$.
3. $\log(2\cdot50)=\log100=2$.
4. $5^{2x-1}=5^3$ → $2x-1=3$ → $x=2$.
5. $x+3=2^4=16$ → $x=13$ (argumento positivo ✔).
6. (a) $N(9)=500\cdot2^3=4000$. (b) $2^{t/3}=20$ → $\dfrac t3=\log_2 20=\dfrac{\log20}{\log2}\approx4{,}3219$ → $t\approx12{,}97$ horas.
:::

## 8. Cómo revisar tus errores

- Recuerda que un logaritmo es un exponente: comprueba elevando la base.
- En ecuaciones logarítmicas, verifica que todos los argumentos son positivos.
- Una exponencial nunca vale 0 ni un número negativo: si te sale $2^x=-4$, no hay solución.
- Usa el cambio de base para calcular con la calculadora.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $a^x$: dominio $\mathbb R$, recorrido $(0,+\infty)$, asíntota $y=0$.
- $\log_a x=y\iff a^y=x$; dominio $(0,+\infty)$.
- Producto → suma; cociente → resta; potencia → factor; cambio de base.
- Ecuaciones: igualar bases o tomar logaritmos; comprobar argumentos.

**Vocabulario:** función exponencial, base, número $e$, logaritmo decimal, logaritmo neperiano, cambio de base, asíntota.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una ecuación exponencial con logaritmos y una logarítmica con una solución que haya que descartar.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de funciones del temario oficial de Matemáticas +25; base de modelos de crecimiento y de la derivada de $e^x$ y $\ln x$.
