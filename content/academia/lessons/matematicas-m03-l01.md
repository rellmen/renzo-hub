---
id: matematicas-m03-l01
course: matematicas
module: M03
level: N2
title: Sucesiones, término general y recurrencias
learning_objectives:
  - Reconocer patrones en una lista de números y describirlos con un término general
  - Calcular términos de una sucesión dada por su término general o por una recurrencia
  - Pasar de una recurrencia sencilla a una fórmula explícita y estudiar si la sucesión crece o decrece
prerequisites: [matematicas-m01-l02, matematicas-m00-l06]
skill_ids: [sequences_general_term, recurrences]
exam_alignment: [algebra, sucesiones]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una sucesión es una lista ordenada de números que sigue una regla: el stock al final de cada semana, el saldo de un préstamo cada mes, la población de un año a otro. En esta lección aprenderás a describir esa regla de dos maneras: con un **término general**, que da directamente el término que quieras, y con una **recurrencia**, que explica cómo se pasa de un término al siguiente. Son la base de las progresiones (M03-L02), las sumas (M03-L03) y el interés compuesto (M03-L04), y en Informática son el lenguaje natural de los bucles y de los algoritmos recursivos.

## 2. Lo que necesitas saber antes

- Sustituir valores en una expresión algebraica (M01-L01): si $a_n=3n-1$, entonces $a_4=3\cdot4-1=11$.
- Resolver ecuaciones de primer grado (M01-L02).
- Potencias (M00-L06): $2^5=32$, $(-1)^n$ vale $1$ si $n$ es par y $-1$ si es impar.

## 3. Idea intuitiva

Mira la lista 5, 8, 11, 14, … Cada número es el anterior más 3. Eso es una **regla de paso** (recurrencia). Pero si te preguntan por el término 100, recorrer la lista paso a paso es lento. Es mejor encontrar una fórmula que dependa de la **posición**: el primero es $5=3\cdot1+2$, el segundo $8=3\cdot2+2$, el tercero $11=3\cdot3+2$… Entonces el término que ocupa la posición $n$ es $3n+2$, y el término 100 es 302.

La recurrencia describe **cómo cambia** la sucesión; el término general describe **dónde está** en cada momento. Las dos son útiles: la recurrencia suele salir directamente de un enunciado («cada semana se añaden 3 palés»), y el término general permite calcular rápido y razonar.

## 4. Definición precisa

- **Sucesión**: función que asigna a cada número natural $n=1,2,3,\dots$ un número real $a_n$. Se escribe $(a_n)=a_1,a_2,a_3,\dots$ El número $n$ es la **posición** (índice) y $a_n$ el **término**.
- **Término general**: fórmula explícita $a_n=f(n)$. Ejemplos: $a_n=n^2$ (1, 4, 9, 16, …), $a_n=\dfrac{1}{n}$ (1, ½, ⅓, …), $a_n=(-1)^n$ (−1, 1, −1, …).
- **Recurrencia**: regla que da cada término a partir de los anteriores, junto con el término (o términos) iniciales. Ejemplos: $a_1=5,\ a_{n+1}=a_n+3$; $b_1=2,\ b_{n+1}=3b_n$. Sin el valor inicial la recurrencia no determina la sucesión.
- **Sucesión de Fibonacci**: $F_1=F_2=1$, $F_{n+2}=F_{n+1}+F_n$ (1, 1, 2, 3, 5, 8, 13, …). Cada término depende de los **dos** anteriores.
- **Monotonía**: $(a_n)$ es **creciente** si $a_{n+1}\ge a_n$ para todo $n$, y **decreciente** si $a_{n+1}\le a_n$. Para estudiarla se analiza el signo de $a_{n+1}-a_n$: si es siempre positivo, crece; si es siempre negativo, decrece. Si los términos son positivos, también sirve comparar el cociente $\dfrac{a_{n+1}}{a_n}$ con 1.
- **Acotación**: una sucesión está **acotada superiormente** si existe un número $M$ que ningún término supera, e **inferiormente** si existe $m$ por debajo del cual no baja ningún término.

**Cómo encontrar un término general.** No hay un método único, pero estas pistas resuelven casi todos los casos del examen:
1. Calcula las **diferencias** entre términos consecutivos. Si son constantes, el término general es de la forma $a_n=dn+c$ (lineal).
2. Si las diferencias no son constantes, calcula los **cocientes**. Si son constantes, el término es de la forma $a_n=c\cdot r^{n}$ (o $c\cdot r^{n-1}$).
3. Si las diferencias crecen de forma constante (diferencias segundas constantes), el término es cuadrático: $a_n=An^2+Bn+C$.
4. Compara con sucesiones conocidas: cuadrados ($n^2$), cubos ($n^3$), potencias de 2, signos alternos ($(-1)^n$), fracciones ($\tfrac{n}{n+1}$).
5. **Comprueba** la fórmula con al menos tres términos.

**Por qué conviene el término general.** Con la recurrencia, calcular $a_{1000}$ exige 999 pasos; con el término general, una sola sustitución. Además, el término general permite resolver preguntas inversas: «¿qué término vale 302?» se convierte en la ecuación $3n+2=302$, que da $n=100$. Si la solución no es un número natural, ese valor **no** pertenece a la sucesión.

**Sucesiones en la vida real.** Un inventario que recibe 40 unidades por semana y vende el 10 % de lo que tiene sigue la recurrencia $s_{n+1}=0{,}9\,s_n+40$. Este tipo de recurrencias aparece en finanzas, en gestión de stocks y en programación, y se analiza calculando unos cuantos términos para ver hacia dónde tiende.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Encontrar el término general
Halla el término general de 7, 11, 15, 19, … y calcula $a_{50}$.

1. Diferencias: $11-7=4$, $15-11=4$, $19-15=4$. Constantes → $a_n=4n+c$.
2. Con $n=1$: $4+c=7$ → $c=3$. Término general: $a_n=4n+3$.
3. Comprobación: $a_3=15$ ✔, $a_4=19$ ✔. $a_{50}=203$.
:::

:::ejemplo Ejemplo 2 · Recurrencia y monotonía
Sea $a_1=10$, $a_{n+1}=\dfrac{a_n}{2}+3$. Calcula los cuatro primeros términos y estudia la tendencia.

1. $a_2=5+3=8$; $a_3=4+3=7$; $a_4=3{,}5+3=6{,}5$.
2. Los términos bajan, cada vez menos: $10, 8, 7, 6{,}5, 6{,}25,\dots$
3. Parecen acercarse a 6. Comprobación: si $a_n=6$, entonces $a_{n+1}=3+3=6$; el 6 es un **punto fijo** de la recurrencia.
:::

:::ejemplo Ejemplo 3 · Pregunta inversa
En la sucesión $a_n=n^2-2n$, ¿qué término vale 48? ¿Pertenece 50 a la sucesión?

1. $n^2-2n=48$ → $n^2-2n-48=0$ → $(n-8)(n+6)=0$ → $n=8$ (se descarta $-6$, no es natural). Es el **octavo** término.
2. $n^2-2n=50$ → $n=1\pm\sqrt{51}$, que no es natural: **50 no pertenece** a la sucesión.
:::

:::error Error típico
Confundir la posición con el valor: en 7, 11, 15, …, «el término 3» es 15, no el número 3. Otro error: escribir el término general a partir de la diferencia sin ajustar la constante, como $a_n=4n$ para 7, 11, 15; daría 4, 8, 12. Comprueba siempre con $n=1$.
:::

## 6. Ejercicio guiado

Halla el término general de $\dfrac12,\ \dfrac23,\ \dfrac34,\ \dfrac45,\dots$ y estudia si es creciente.

:::pista Primera pista
Mira por separado numeradores y denominadores: 1, 2, 3, 4… y 2, 3, 4, 5…
:::

:::pista Segunda pista
$a_n=\dfrac{n}{n+1}$. Para la monotonía, calcula $a_{n+1}-a_n$ con denominador común.
:::

:::solucion Solución guiada
$a_{n+1}-a_n=\dfrac{n+1}{n+2}-\dfrac{n}{n+1}=\dfrac{(n+1)^2-n(n+2)}{(n+1)(n+2)}=\dfrac{1}{(n+1)(n+2)}>0$. Es **creciente**, y como $\dfrac{n}{n+1}<1$ siempre, está acotada superiormente por 1.
:::

## 7. Práctica

**Fáciles**

1. Escribe los cinco primeros términos de $a_n=2n^2-1$.
2. Halla el término general de 3, 6, 9, 12, …
3. Calcula los cuatro primeros términos de $b_1=1$, $b_{n+1}=2b_n+1$.

**Medios**

4. Halla el término general de 2, 6, 18, 54, … y calcula el séptimo término.
5. Halla el término general de $-1,\ 1,\ -1,\ 1,\dots$ y de $1,\ -2,\ 3,\ -4,\dots$

**Tipo examen / transferencia**

6. Un almacén tiene 500 cajas. Cada semana sale el 20 % de lo que hay y entran 60 cajas nuevas. Escribe la recurrencia, calcula el stock de las tres primeras semanas y halla el valor de equilibrio (punto fijo). Interpreta el resultado.

:::solucion Soluciones paso a paso
1. 1, 7, 17, 31, 49.
2. $a_n=3n$.
3. 1, 3, 7, 15 (se observa $b_n=2^n-1$).
4. Cociente 3: $a_n=2\cdot3^{n-1}$; $a_7=2\cdot729=1458$.
5. $(-1)^n$; $(-1)^{n+1}n$.
6. $s_0=500$, $s_{n+1}=0{,}8\,s_n+60$. $s_1=460$, $s_2=428$, $s_3=402{,}4$. Punto fijo: $s=0{,}8s+60$ → $s=300$. El stock tiende a estabilizarse en 300 cajas: en ese nivel, lo que sale (20 % de 300 = 60) iguala lo que entra.
:::

## 8. Cómo revisar tus errores

- Comprueba el término general con $n=1$, $n=2$ y $n=3$.
- En una pregunta inversa, la solución debe ser un número **natural**; si no lo es, el valor no pertenece a la sucesión.
- En recurrencias, no olvides el término inicial.
- Para la monotonía, simplifica $a_{n+1}-a_n$ hasta poder ver su signo.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Sucesión: lista indexada por $n=1,2,3,\dots$
- Término general $a_n=f(n)$; recurrencia $a_{n+1}=g(a_n)$ más valor inicial.
- Diferencias constantes → lineal; cocientes constantes → potencias.
- Monotonía con el signo de $a_{n+1}-a_n$.

**Vocabulario:** sucesión, término, índice, término general, recurrencia, sucesión creciente y decreciente, acotada, punto fijo.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, busca el término general de dos listas (una lineal y otra con potencias) y calcula los primeros términos de una recurrencia.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de sucesiones del temario oficial de Matemáticas +25; prepara las progresiones (M03-L02) y el interés compuesto (M03-L04).
