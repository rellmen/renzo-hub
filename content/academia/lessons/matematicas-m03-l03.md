---
id: matematicas-m03-l03
course: matematicas
module: M03
level: N2
title: Sumas de progresiones y notación sumatorio
learning_objectives:
  - Leer y escribir sumas con la notación sumatorio Σ
  - Calcular la suma de los n primeros términos de una progresión aritmética y de una geométrica
  - Calcular la suma infinita de una progresión geométrica con |r| < 1 y resolver problemas inversos de sumas
prerequisites: [matematicas-m03-l02]
skill_ids: [series_sum, sigma_notation]
exam_alignment: [sucesiones]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Muchas preguntas no piden un término, sino un **total**: cuántas cajas hay en una pila en la que cada fila tiene dos menos que la anterior, cuánto se ha ahorrado en un año con aportaciones crecientes, cuánto ha producido una máquina en 12 meses. En esta lección aprenderás a sumar progresiones sin sumar término a término, a usar la notación $\Sigma$ (que verás constantemente en estadística, en Informática y en las integrales de M09) y a calcular sumas infinitas que, sorprendentemente, dan un número finito.

## 2. Lo que necesitas saber antes

- Progresiones aritméticas y geométricas, término general (M03-L02).
- Resolver ecuaciones de segundo grado (M02-L04).
- Potencias y fracciones (M00-L04, M00-L06).

## 3. Idea intuitiva

Para sumar $1+2+3+\dots+100$ hay un truco clásico: escribe la suma dos veces, una al derecho y otra al revés, y suma por columnas. Cada columna da 101 ($1+100$, $2+99$, …) y hay 100 columnas, así que el doble de la suma es $100\cdot101$, y la suma es 5.050. El truco funciona con cualquier progresión aritmética, porque los términos equidistantes de los extremos siempre suman lo mismo.

Con las geométricas el truco es distinto: si multiplicas la suma por la razón, casi todos los términos se repiten, y al restar se cancelan, dejando solo el primero y el último.

## 4. Definición precisa

**Notación sumatorio.** $\displaystyle\sum_{k=1}^{n}a_k=a_1+a_2+\dots+a_n$. La letra $k$ es el **índice** (puede llamarse $i$, $j$…), 1 y $n$ son los **límites**. Ejemplo: $\displaystyle\sum_{k=1}^{4}k^2=1+4+9+16=30$.

Propiedades: $\displaystyle\sum(a_k+b_k)=\sum a_k+\sum b_k$; $\displaystyle\sum c\,a_k=c\sum a_k$; $\displaystyle\sum_{k=1}^{n}c=n\,c$.

**Suma de $n$ términos de una progresión aritmética:**
$$S_n=\frac{n\,(a_1+a_n)}{2}=\frac{n\,\big(2a_1+(n-1)d\big)}{2}$$
Es «número de términos por la media del primero y el último». Casos útiles: $1+2+\dots+n=\dfrac{n(n+1)}{2}$; la suma de los $n$ primeros impares es $n^2$.

**Suma de $n$ términos de una progresión geométrica** ($r\neq1$):
$$S_n=a_1\,\frac{r^{n}-1}{r-1}=a_1\,\frac{1-r^{n}}{1-r}$$
Si $r=1$, todos los términos son iguales y $S_n=n\,a_1$.

**Suma infinita de una progresión geométrica**: si $|r|<1$, los términos se hacen cada vez más pequeños y la suma de **todos** ellos se acerca a
$$S_\infty=\frac{a_1}{1-r}.$$
Si $|r|\ge1$, la suma no tiende a un número finito.

**Por qué funcionan las fórmulas.**
- Aritmética: $S_n=a_1+\dots+a_n$ y $S_n=a_n+\dots+a_1$. Sumando por columnas, cada pareja vale $a_1+a_n$ y hay $n$ parejas: $2S_n=n(a_1+a_n)$.
- Geométrica: $S_n=a_1+a_1r+\dots+a_1r^{n-1}$ y $r\,S_n=a_1r+\dots+a_1r^{n}$. Restando, todo se cancela salvo los extremos: $rS_n-S_n=a_1r^n-a_1$, de donde sale la fórmula.
- Infinita: si $|r|<1$, $r^n$ se acerca a 0 al crecer $n$, y la fórmula de $S_n$ se acerca a $\dfrac{a_1}{1-r}$.

**Problemas inversos.** Si te dan la suma y te preguntan cuántos términos hacen falta, en una PA aparece una ecuación de segundo grado en $n$ (se descarta la solución negativa o no entera); en una PG aparece $n$ en el exponente y se resuelve probando valores o con logaritmos (M04-L06).

**Sumas en Informática.** Un bucle que acumula valores (`total += valor`) calcula exactamente un sumatorio. Conocer la fórmula cerrada permite comprobar el resultado de un programa o evitar el bucle: sumar los números del 1 al millón requiere un millón de operaciones con un bucle y una sola con $\dfrac{n(n+1)}{2}$. Esta idea, sustituir un proceso repetitivo por una fórmula, es una de las más útiles del análisis de algoritmos.

**Un aviso sobre el primer término.** Antes de aplicar una fórmula, identifica bien $a_1$ y $n$. Si la suma empieza en $k=0$, hay $n+1$ términos; si empieza en $k=3$ y termina en $k=10$, hay 8 términos.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Suma aritmética
Suma los 20 primeros términos de 5, 9, 13, …

1. $d=4$; $a_{20}=5+19\cdot4=81$.
2. $S_{20}=\dfrac{20\,(5+81)}{2}=10\cdot86=860$.
:::

:::ejemplo Ejemplo 2 · Suma geométrica
Suma los 8 primeros términos de 3, 6, 12, …

$S_8=3\cdot\dfrac{2^8-1}{2-1}=3\cdot255=765$. Comprobación parcial: $3+6+12+24=45=3(2^4-1)$. ✔
:::

:::ejemplo Ejemplo 3 · Suma infinita
Calcula $8+4+2+1+\dfrac12+\dots$

$a_1=8$, $r=\dfrac12$ ($|r|<1$): $S_\infty=\dfrac{8}{1-\frac12}=16$. Las sumas parciales (8, 12, 14, 15, 15,5, …) se acercan a 16 sin superarlo.
:::

:::error Error típico
Usar $a_n$ en la fórmula de la suma sin calcularlo antes, o confundir $n$ con el último valor de la lista: en $2+4+\dots+40$ el último término es 40, pero hay **20** términos. Otro error: aplicar $S_\infty$ con $r=2$; la suma $1+2+4+\dots$ no es $\dfrac{1}{1-2}=-1$, sino que crece sin límite.
:::

## 6. Ejercicio guiado

Una nave apila cajas en filas: la fila inferior tiene 30 cajas y cada fila tiene 2 menos que la de debajo, hasta una fila superior de 2 cajas. ¿Cuántas filas hay y cuántas cajas en total?

:::pista Primera pista
Es una PA con $a_1=30$ y $d=-2$. El último término es $a_n=2$: plantea $30-2(n-1)=2$.
:::

:::pista Segunda pista
Con $n$ conocido, usa $S_n=\dfrac{n(a_1+a_n)}{2}$.
:::

:::solucion Solución guiada
$30-2(n-1)=2$ → $n=15$ filas. $S_{15}=\dfrac{15\,(30+2)}{2}=240$ cajas.
:::

## 7. Práctica

**Fáciles**

1. Calcula $1+2+3+\dots+50$.
2. Calcula $\displaystyle\sum_{k=1}^{5}(2k+1)$.
3. Calcula $1+2+4+\dots+2^9$.

**Medios**

4. ¿Cuántos términos de $2+5+8+\dots$ hay que sumar para obtener 155?
5. Una persona ahorra 100 € el primer mes y cada mes un 10 % más que el anterior. ¿Cuánto ha ahorrado en 6 meses?

**Tipo examen / transferencia**

6. Una pelota se deja caer desde 3 m y en cada bote sube el 60 % de la altura anterior. Calcula la distancia vertical total recorrida hasta que se detiene (suponiendo infinitos botes). Explica qué condición permite usar la suma infinita.

:::solucion Soluciones paso a paso
1. $\dfrac{50\cdot51}{2}=1275$.
2. $3+5+7+9+11=35$ (o $2\cdot15+5=35$).
3. $\dfrac{2^{10}-1}{2-1}=1023$.
4. $a_n=3n-1$; $S_n=\dfrac{n(2+3n-1)}{2}=\dfrac{n(3n+1)}{2}=155$ → $3n^2+n-310=0$ → $n=10$ (la otra raíz es negativa). Comprobación: $\dfrac{10\cdot31}{2}=155$. ✔
5. PG con $a_1=100$, $r=1{,}1$: $S_6=100\cdot\dfrac{1{,}1^6-1}{0{,}1}\approx771{,}56$ €.
6. Bajada inicial: 3 m. Después, cada bote sube y baja: $2(1{,}8+1{,}08+\dots)=2\cdot\dfrac{1{,}8}{1-0{,}6}=9$ m. Total $3+9=12$ m. Se puede usar la suma infinita porque $|r|=0{,}6<1$.
:::

## 8. Cómo revisar tus errores

- Cuenta bien el número de términos $n$ antes de aplicar la fórmula.
- Comprueba con una suma pequeña hecha a mano (los 3 o 4 primeros términos).
- En problemas inversos, descarta valores de $n$ negativos o no enteros.
- Antes de usar $S_\infty$, verifica que $|r|<1$.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $\Sigma$: suma con índice y límites.
- PA: $S_n=\dfrac{n(a_1+a_n)}{2}$. PG: $S_n=a_1\dfrac{r^n-1}{r-1}$.
- PG infinita con $|r|<1$: $S_\infty=\dfrac{a_1}{1-r}$.

**Vocabulario:** sumatorio, índice, suma parcial, suma infinita, serie geométrica, convergencia.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, calcula una suma aritmética, una geométrica finita y una infinita, y comprueba la primera con los primeros términos.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de sucesiones del temario oficial de Matemáticas +25; base de la capitalización y amortización (M03-L04) y de la idea de integral como suma (M09).
