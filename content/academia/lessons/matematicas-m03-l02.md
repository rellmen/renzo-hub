---
id: matematicas-m03-l02
course: matematicas
module: M03
level: N2
title: Progresiones aritméticas y geométricas
learning_objectives:
  - Reconocer progresiones aritméticas y geométricas por su diferencia o razón
  - Usar el término general a_n = a_1 + (n−1)d y a_n = a_1·r^(n−1) en problemas directos e inversos
  - Hallar la diferencia o la razón a partir de dos términos cualesquiera
prerequisites: [matematicas-m03-l01]
skill_ids: [arithmetic_progression, geometric_progression]
exam_alignment: [sucesiones]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Las progresiones son las dos sucesiones más importantes. En una **aritmética** se suma siempre la misma cantidad (un salario que sube 50 € al año, una fila de asientos con 2 más que la anterior). En una **geométrica** se multiplica siempre por el mismo número (una inversión que crece un 5 % anual, una máquina que pierde un 20 % de valor cada año). Saber distinguirlas y manejar sus fórmulas te permite resolver problemas de crecimiento lineal y exponencial, que son la base del interés compuesto (M03-L04) y de las funciones exponenciales (M04-L06).

## 2. Lo que necesitas saber antes

- Término general y recurrencias (M03-L01).
- Potencias y raíces (M00-L06): si $r^3=8$, entonces $r=2$.
- Porcentajes como índice de variación (M00-L05): subir un 5 % es multiplicar por $1{,}05$.

## 3. Idea intuitiva

Imagina dos escaleras. En la primera, cada peldaño sube exactamente 20 cm: después de 10 peldaños has subido 200 cm. Es una progresión **aritmética**: crecimiento constante, en línea recta.

En la segunda, cada peldaño es un 10 % más alto que el anterior. Al principio apenas se nota, pero los peldaños se van haciendo enormes. Es una progresión **geométrica**: el crecimiento es proporcional a lo que ya hay, y por eso se acelera. Esta diferencia entre sumar y multiplicar es la diferencia entre un sueldo con subida fija y una deuda con intereses compuestos.

## 4. Definición precisa

**Progresión aritmética (PA)**: cada término se obtiene sumando al anterior una cantidad fija $d$, la **diferencia**: $a_{n+1}=a_n+d$.
- Término general: $a_n=a_1+(n-1)\,d$.
- Entre dos términos cualesquiera: $a_n=a_k+(n-k)\,d$, de donde $d=\dfrac{a_n-a_k}{n-k}$.
- Si $d>0$ es creciente; si $d<0$, decreciente; si $d=0$, constante.
- Es la versión discreta de una función lineal: los puntos $(n,a_n)$ están sobre una recta de pendiente $d$.

**Progresión geométrica (PG)**: cada término se obtiene multiplicando el anterior por un número fijo $r\neq0$, la **razón**: $a_{n+1}=a_n\cdot r$.
- Término general: $a_n=a_1\cdot r^{\,n-1}$.
- Entre dos términos: $a_n=a_k\cdot r^{\,n-k}$, de donde $r^{\,n-k}=\dfrac{a_n}{a_k}$.
- Con $a_1>0$: si $r>1$ crece; si $0<r<1$ decrece hacia 0; si $r<0$, los signos se alternan.
- Una variación porcentual constante del $p\,\%$ es una PG de razón $r=1\pm\dfrac{p}{100}$.

**Cómo reconocerlas.** Calcula las diferencias $a_2-a_1$, $a_3-a_2$, …; si son iguales, es aritmética. Calcula los cocientes $\dfrac{a_2}{a_1}$, $\dfrac{a_3}{a_2}$, …; si son iguales, es geométrica. Puede que no sea ninguna de las dos.

**Términos intermedios.** En una PA, el término central de tres consecutivos es la **media aritmética** de los otros dos: $a_n=\dfrac{a_{n-1}+a_{n+1}}{2}$. En una PG de términos positivos, es la **media geométrica**: $a_n=\sqrt{a_{n-1}\cdot a_{n+1}}$. Esto permite «interpolar», es decir, insertar términos entre dos dados.

**Por qué la fórmula lleva $n-1$.** Desde $a_1$ hasta $a_n$ hay que dar $n-1$ pasos. En la PA cada paso suma $d$ (total $(n-1)d$); en la PG cada paso multiplica por $r$ (total $r^{n-1}$). Si numeras desde $a_0$ en vez de $a_1$, la fórmula se convierte en $a_n=a_0+nd$ o $a_n=a_0r^n$; las dos convenciones son correctas, pero no hay que mezclarlas.

**Preguntas inversas en PG.** Para saber cuándo una PG alcanza un valor hay que resolver una ecuación con la incógnita en el exponente, como $1{,}05^{\,n}=2$. Con números sencillos se puede probar con valores; en general se resuelve con logaritmos (M04-L06): $n=\dfrac{\log2}{\log1{,}05}\approx14{,}2$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · PA a partir de dos términos
En una PA, $a_3=11$ y $a_{10}=32$. Halla $d$, $a_1$ y el término general.

1. $d=\dfrac{32-11}{10-3}=\dfrac{21}{7}=3$.
2. $a_1=a_3-2d=11-6=5$.
3. $a_n=5+(n-1)\cdot3=3n+2$. Comprobación: $a_{10}=32$ ✔.
:::

:::ejemplo Ejemplo 2 · PG a partir de dos términos
En una PG de términos positivos, $a_2=6$ y $a_5=162$. Halla $r$ y $a_1$.

1. $r^{3}=\dfrac{162}{6}=27$ → $r=3$.
2. $a_1=\dfrac{a_2}{r}=2$. Término general: $a_n=2\cdot3^{n-1}$.
:::

:::ejemplo Ejemplo 3 · Depreciación
Una carretilla cuesta 24.000 € y pierde un 15 % de su valor cada año. ¿Cuánto vale al cabo de 4 años?

PG de razón $r=0{,}85$: valor tras $n$ años $=24000\cdot0{,}85^{\,n}$. Con $n=4$: $24000\cdot0{,}52200625\approx12.528{,}15$ €.
:::

:::error Error típico
Usar $r^{n}$ en lugar de $r^{n-1}$ con la numeración que empieza en $a_1$: con $a_1=2$ y $r=3$, $a_2$ sería $2\cdot3^2=18$ en lugar de 6. Otro error: tratar un crecimiento porcentual como aritmético, sumando cada año el 5 % del valor **inicial** en lugar del valor del año anterior.
:::

## 6. Ejercicio guiado

Interpola tres términos entre 4 y 64 para que formen una progresión geométrica de términos positivos.

:::pista Primera pista
Tendrás cinco términos: $a_1=4$ y $a_5=64$. Usa $a_5=a_1r^4$.
:::

:::pista Segunda pista
$r^4=16$ y, como los términos son positivos, $r=2$.
:::

:::solucion Solución guiada
4, **8, 16, 32**, 64. Comprobación: cada término es el doble del anterior y $16=\sqrt{8\cdot32}$ (media geométrica). ✔
:::

## 7. Práctica

**Fáciles**

1. ¿Es aritmética, geométrica o ninguna? 3, 7, 11, 15; 5, 10, 20, 40; 1, 4, 9, 16.
2. En una PA con $a_1=-2$ y $d=5$, calcula $a_{12}$.
3. En una PG con $a_1=3$ y $r=2$, calcula $a_8$.

**Medios**

4. En una PA, $a_5=17$ y $a_{12}=45$. Halla $a_1$ y $d$.
5. En una PG, $a_1=1000$ y $a_4=729$. Halla la razón e interprétala como porcentaje.

**Tipo examen / transferencia**

6. Un trabajador puede elegir entre una subida anual fija de 900 € sobre un sueldo inicial de 24.000 €, o una subida del 3,5 % anual sobre el mismo sueldo. Calcula el sueldo del año 10 (contando el inicial como año 1) en cada opción e indica cuál conviene a ese plazo.

:::solucion Soluciones paso a paso
1. Aritmética ($d=4$); geométrica ($r=2$); ninguna (son cuadrados: diferencias 3, 5, 7).
2. $a_{12}=-2+11\cdot5=53$.
3. $a_8=3\cdot2^7=384$.
4. $d=\dfrac{45-17}{7}=4$; $a_1=17-4\cdot4=1$.
5. $r^3=0{,}729$ → $r=0{,}9$: cada término es el 90 % del anterior, una **bajada del 10 %**.
6. PA: $a_{10}=24000+9\cdot900=32.100$ €. PG: $a_{10}=24000\cdot1{,}035^{9}\approx24000\cdot1{,}36290\approx32.709{,}50$ €. A 10 años conviene la subida del 3,5 %. (Al principio la fija es mejor: el año 2, 24.900 € frente a 24.840 €.)
:::

## 8. Cómo revisar tus errores

- Comprueba la diferencia o la razón con al menos dos parejas de términos.
- Al despejar $r$ con exponente par, decide el signo con los datos (términos positivos → $r>0$).
- Revisa si el enunciado empieza a contar en $a_1$ o en $a_0$ (por ejemplo, «al cabo de 4 años» desde el valor inicial).
- Estima: una PG con $r>1$ acaba superando a cualquier PA.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- PA: $a_n=a_1+(n-1)d$, crecimiento lineal; $d=\dfrac{a_n-a_k}{n-k}$.
- PG: $a_n=a_1r^{n-1}$, crecimiento exponencial; $r^{n-k}=\dfrac{a_n}{a_k}$.
- Variación porcentual constante = PG de razón $1\pm\dfrac{p}{100}$.

**Vocabulario:** progresión aritmética, diferencia, progresión geométrica, razón, media aritmética, media geométrica, interpolar, depreciación.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, halla una PA y una PG a partir de dos términos dados y compara su crecimiento a largo plazo.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de sucesiones del temario oficial de Matemáticas +25; base de las sumas de progresiones (M03-L03) y del interés compuesto (M03-L04).
