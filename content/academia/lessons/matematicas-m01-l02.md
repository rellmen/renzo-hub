---
id: matematicas-m01-l02
course: matematicas
module: M01
level: N1
title: Ecuaciones de primer grado con paréntesis y fracciones
learning_objectives:
  - Resolver ecuaciones lineales aplicando operaciones equivalentes en ambos miembros
  - Eliminar paréntesis y denominadores sin perder signos
  - Comprobar la solución y reconocer ecuaciones sin solución o con infinitas
prerequisites: [matematicas-m01-l01, matematicas-m00-l04]
skill_ids: [linear_equation, equation_fractions, solution_check]
exam_alignment: [algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una ecuación es una pregunta: ¿qué número hace cierta esta igualdad? En esta lección aprenderás a resolver ecuaciones de primer grado (la incógnita aparece con exponente 1), incluidas las que tienen paréntesis y denominadores. Es la herramienta más usada del examen: aparece al buscar puntos de corte de funciones, al despejar en geometría, al encontrar máximos con derivadas y al resolver sistemas. Además aprenderás a **comprobar** siempre tu resultado, que es la forma más barata de no perder puntos.

## 2. Lo que necesitas saber antes

- Quitar paréntesis con la distributiva y reducir términos semejantes (M01-L01): $3(x-2)-(x+1)=2x-7$.
- Operar fracciones y calcular el mcm (M00-L04): mcm(4,6)=12.
- Sustituir un valor entre paréntesis para evaluar una expresión.

## 3. Idea intuitiva

Imagina una balanza en equilibrio. En un platillo hay $3x+4$ kilos y en el otro 19 kilos. Puedes hacer lo que quieras **siempre que hagas lo mismo en los dos platillos**: si quitas 4 kilos de cada lado, queda $3x=15$; si divides cada lado entre 3, queda $x=5$. Resolver una ecuación es exactamente eso: ir haciendo operaciones iguales a ambos lados hasta que la incógnita quede sola.

La regla escolar «lo que suma pasa restando» es un atajo de esa misma idea. Funciona, pero si no recuerdas por qué funciona, es fácil equivocarse con los signos o con los factores. Piensa siempre en la balanza.

## 4. Definición precisa

- **Ecuación de primer grado con una incógnita:** igualdad que, tras simplificar, puede escribirse como $ax+b=0$ con $a\neq0$. Su única solución es $x=-\dfrac{b}{a}$.
- **Miembros:** lo que hay a la izquierda y a la derecha del signo $=$.
- **Ecuaciones equivalentes:** tienen las mismas soluciones. Se obtienen sumando o restando la misma expresión a ambos miembros, o multiplicándolos o dividiéndolos por el mismo número **distinto de cero**.
- **Solución:** valor que, sustituido, hace verdadera la igualdad.

**Procedimiento general (en este orden):**

1. Quitar paréntesis.
2. Quitar denominadores multiplicando **todos los términos** de ambos miembros por el mcm de los denominadores.
3. Agrupar los términos con $x$ en un miembro y los números en el otro.
4. Reducir términos semejantes.
5. Despejar dividiendo por el coeficiente de $x$.
6. Comprobar sustituyendo en la ecuación **original**.

**Casos especiales.** Si al reducir desaparece la $x$:
- Queda algo falso, como $0=7$: la ecuación **no tiene solución** (incompatible).
- Queda algo siempre cierto, como $0=0$: **cualquier número es solución** (identidad).

**El signo menos delante de una fracción.** En $-\dfrac{x-1}{3}$ la raya de fracción actúa como paréntesis. Al multiplicar por el mcm queda $-(x-1)=-x+1$. Es el error más frecuente de todo el tema.

**Ecuaciones con decimales.** Si aparecen coeficientes como $0{,}5x+1{,}25=2$, multiplica ambos miembros por una potencia de 10 que elimine todas las comas (aquí por 100): $50x+125=200$, y resuelve como siempre. Es el mismo principio de la balanza: multiplicar los dos platillos por el mismo número no altera el equilibrio, y trabajar con enteros reduce errores de cálculo.

**Por qué multiplicar por el mcm.** Multiplicar ambos miembros por el mismo número no cambia la solución, y si eliges un múltiplo de todos los denominadores, todos se simplifican a la vez. Podrías usar cualquier múltiplo común, pero el mcm produce coeficientes más pequeños.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Con paréntesis
Resuelve $4(x-3)-2(x+1)=6$.

1. Paréntesis: $4x-12-2x-2=6$.
2. Reduce: $2x-14=6$.
3. Suma 14 a ambos lados: $2x=20$.
4. Divide entre 2: $x=10$.

Comprobación: $4(7)-2(11)=28-22=6$. ✔
:::

:::ejemplo Ejemplo 2 · Con denominadores y signo menos
Resuelve $\dfrac{x+2}{3}-\dfrac{x-1}{4}=1$.

1. mcm(3,4)=12. Multiplica **cada término** por 12: $4(x+2)-3(x-1)=12$.
2. Paréntesis (atención al $-3$): $4x+8-3x+3=12$.
3. Reduce: $x+11=12$.
4. $x=1$.

Comprobación: $\dfrac{3}{3}-\dfrac{0}{4}=1$. ✔
:::

:::ejemplo Ejemplo 3 · Sin solución
Resuelve $2(x+3)=2x+5$.

$2x+6=2x+5$ → restando $2x$: $6=5$, que es falso. **No hay solución.** Las dos rectas $y=2x+6$ e $y=2x+5$ son paralelas y nunca se cortan.
:::

:::error Error típico
Al multiplicar por el mcm, olvidar el término que no tiene denominador. En $\dfrac{x}{2}+3=\dfrac{x}{3}$, multiplicar por 6 da $3x+18=2x$, **no** $3x+3=2x$. Todos los términos, también el 3, se multiplican por 6.
:::

## 6. Ejercicio guiado

Resuelve $\dfrac{2x-1}{5}-\dfrac{x}{2}=\dfrac{1}{10}$ y comprueba.

:::pista Primera pista
El mcm de 5, 2 y 10 es 10. Multiplica los tres términos por 10.
:::

:::pista Segunda pista
Queda $2(2x-1)-5x=1$. Ahora quita el paréntesis y agrupa.
:::

:::solucion Solución guiada
$4x-2-5x=1$ → $-x-2=1$ → $-x=3$ → $x=-3$.
Comprobación: $\dfrac{-7}{5}-\dfrac{-3}{2}=-1{,}4+1{,}5=0{,}1=\dfrac{1}{10}$. ✔
:::

## 7. Práctica

**Fáciles**

1. Resuelve $5x-7=3x+9$.
2. Resuelve $3(2x-1)=15$.
3. Resuelve $\dfrac{x}{4}-2=1$.

**Medios**

4. Resuelve $\dfrac{x-3}{2}+\dfrac{x+1}{3}=4$.
5. Resuelve $3(x-2)-2(2x-5)=x-6$.

**Tipo examen / transferencia**

6. Un técnico cobra una salida fija más 30 € por hora. Por un trabajo de 3 horas cobró lo mismo que otro técnico que no cobra salida y pide 45 € por hora durante el mismo tiempo. Plantea una ecuación, calcula el importe de la salida fija y comprueba.

:::solucion Soluciones paso a paso
1. $5x-3x=9+7$ → $2x=16$ → $x=8$.
2. $6x-3=15$ → $6x=18$ → $x=3$.
3. Multiplica por 4: $x-8=4$ → $x=12$.
4. mcm 6: $3(x-3)+2(x+1)=24$ → $3x-9+2x+2=24$ → $5x=31$ → $x=\dfrac{31}{5}=6{,}2$. Comprobación: $1{,}6+2{,}4=4$. ✔
5. $3x-6-4x+10=x-6$ → $-x+4=x-6$ → $10=2x$ → $x=5$. Comprobación: $3\cdot3-2\cdot5=-1$ y $5-6=-1$. ✔
6. Sea $s$ la salida fija: $s+30\cdot3=45\cdot3$ → $s+90=135$ → $s=45$ €. Comprobación: $45+90=135$. ✔
:::

## 8. Cómo revisar tus errores

- **Comprueba siempre** en la ecuación original, no en una intermedia: si te equivocaste en el paso 2, comprobar en el paso 3 no lo detecta.
- Cuando haya una fracción con signo menos delante y numerador compuesto, escribe el paréntesis antes de multiplicar: $-\dfrac{x-1}{4}\cdot12=-3(x-1)$.
- Si obtienes una solución «rara» (como $\dfrac{37}{11}$) en un ejercicio sencillo, vuelve a revisar los signos: suele indicar un error.
- Al despejar $-x=3$, multiplica por $-1$: $x=-3$. No escribas $x=3$.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Hacer lo mismo en los dos miembros mantiene la solución.
- Orden: paréntesis → denominadores (mcm a todos los términos) → agrupar → reducir → despejar → comprobar.
- $0=k$ con $k\neq0$: sin solución; $0=0$: infinitas soluciones.

**Vocabulario:** incógnita, miembro, ecuación equivalente, solución, ecuación incompatible, identidad.

**Repaso:** a 1, 3, 7, 14 y 30 días. En cada repaso resuelve una ecuación con dos fracciones, una de ellas precedida de un signo menos, y compruébala.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1 (ESO). Base del bloque de álgebra del temario oficial de Matemáticas +25; lo necesitarás en sistemas (M02-L06), funciones (M04) y optimización (M08).
