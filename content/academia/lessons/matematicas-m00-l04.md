---
id: matematicas-m00-l04
course: matematicas
module: M00
level: N0
title: Operaciones con fracciones
learning_objectives:
  - Sumar y restar fracciones reduciendo a común denominador con el mcm
  - Multiplicar y dividir fracciones simplificando antes de operar
  - Combinar las cuatro operaciones respetando la jerarquía y los signos
prerequisites: [matematicas-m00-l02, matematicas-m00-l03]
skill_ids: [fraction_add, fraction_mul, fraction_simplify]
exam_alignment: [arithmetica-algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Las fracciones aparecen en todo el examen de Matemáticas aunque nadie las anuncie: al resolver una ecuación con denominadores, al simplificar una derivada, al calcular una probabilidad o al despejar una incógnita en un sistema. En esta lección aprenderás a sumar, restar, multiplicar y dividir fracciones sin calculadora y, sobre todo, a hacerlo con un procedimiento que se pueda revisar. Un error de fracciones en el primer paso de un problema de 4 puntos hace perder casi toda la nota aunque el planteamiento sea correcto.

## 2. Lo que necesitas saber antes

- **mcm y MCD** (M00-L02): el mínimo común múltiplo de 4 y 6 es 12; el máximo común divisor de 18 y 24 es 6.
- **Fracciones equivalentes** (M00-L03): multiplicar o dividir numerador y denominador por el mismo número no cambia el valor. $\dfrac{3}{4}=\dfrac{6}{8}=\dfrac{9}{12}$.
- **Simplificar** es dividir arriba y abajo por el MCD: $\dfrac{18}{24}=\dfrac{18:6}{24:6}=\dfrac{3}{4}$. Una fracción está simplificada (es **irreducible**) cuando numerador y denominador no tienen divisores comunes salvo el 1.
- **Signos:** $\dfrac{-a}{b}=\dfrac{a}{-b}=-\dfrac{a}{b}$. Se suele dejar el signo delante o en el numerador.

## 3. Idea intuitiva

Una fracción $\dfrac{a}{b}$ es «$a$ trozos de tamaño $\dfrac{1}{b}$». Por eso **solo se pueden sumar directamente trozos del mismo tamaño**: 2 cuartos más 1 cuarto son 3 cuartos. Si tienes medios y tercios, primero los cortas en trozos iguales (sextos) y después los cuentas: $\dfrac{1}{2}=\dfrac{3}{6}$ y $\dfrac{1}{3}=\dfrac{2}{6}$, así que juntos son $\dfrac{5}{6}$.

**Multiplicar** es tomar «una parte de una parte»: la mitad de tres cuartos de una pizza es $\dfrac{1}{2}\cdot\dfrac{3}{4}=\dfrac{3}{8}$. Aquí no hace falta común denominador, porque no estás juntando trozos, sino reduciendo uno.

**Dividir** pregunta «cuántas veces cabe». ¿Cuántas veces cabe $\dfrac{1}{4}$ en 3? Doce veces, porque cada unidad contiene cuatro cuartos. Esa es la razón de la regla «multiplicar por la inversa»: $3:\dfrac{1}{4}=3\cdot 4=12$.

## 4. Definición precisa

- **Suma y resta con igual denominador:** $\dfrac{a}{c}\pm\dfrac{b}{c}=\dfrac{a\pm b}{c}$.
- **Suma y resta con distinto denominador:** se busca el **mcm** de los denominadores (el denominador común más pequeño), se convierte cada fracción en una equivalente con ese denominador y se suman los numeradores. Para $\dfrac{a}{b}$ con denominador común $m$, el nuevo numerador es $a\cdot\dfrac{m}{b}$.
- **Producto:** $\dfrac{a}{b}\cdot\dfrac{c}{d}=\dfrac{a\cdot c}{b\cdot d}$.
- **Inversa** de $\dfrac{c}{d}$ (con $c\neq0$): $\dfrac{d}{c}$. Su producto es 1.
- **Cociente:** $\dfrac{a}{b}:\dfrac{c}{d}=\dfrac{a}{b}\cdot\dfrac{d}{c}=\dfrac{a\cdot d}{b\cdot c}$ (los «productos cruzados»).
- **Número entero como fracción:** $5=\dfrac{5}{1}$.
- **Jerarquía:** paréntesis, después potencias, después productos y cocientes de izquierda a derecha, y por último sumas y restas. Es la misma que con enteros.

**Simplificar antes de multiplicar.** En $\dfrac{14}{15}\cdot\dfrac{25}{21}$ puedes cancelar factores comunes en diagonal antes de multiplicar: el 14 y el 21 comparten el 7; el 25 y el 15 comparten el 5. Queda $\dfrac{2}{3}\cdot\dfrac{5}{3}=\dfrac{10}{9}$. Esto evita números grandes y reduce errores. Atención: **solo se cancela entre factores de un producto**, nunca entre términos de una suma.

**Por qué el mcm y no cualquier denominador común.** Multiplicar los denominadores siempre funciona ($4\cdot6=24$), pero produce números más grandes y obliga a simplificar al final. Con el mcm (12) trabajas con lo mínimo. En el examen ambas vías son correctas si el resultado final está simplificado.

**Fracciones mixtas.** $2\tfrac{1}{3}$ significa $2+\dfrac{1}{3}=\dfrac{7}{3}$. Antes de operar, conviértelas siempre en fracción impropia.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Suma y resta con mcm
Calcula $\dfrac{5}{6}-\dfrac{3}{4}+\dfrac{1}{3}$.

1. Denominadores 6, 4 y 3. $6=2\cdot3$, $4=2^2$, $3=3$ → mcm $=2^2\cdot3=12$.
2. Convierte: $\dfrac{5}{6}=\dfrac{10}{12}$ (12:6=2, 5·2=10); $\dfrac{3}{4}=\dfrac{9}{12}$; $\dfrac{1}{3}=\dfrac{4}{12}$.
3. Opera numeradores: $10-9+4=5$.

**Resultado: $\dfrac{5}{12}$**, ya irreducible.
:::

:::ejemplo Ejemplo 2 · Producto y cociente simplificando
Calcula $\dfrac{9}{10}\cdot\dfrac{25}{12}:\dfrac{15}{8}$.

1. Cambia la división por la inversa: $\dfrac{9}{10}\cdot\dfrac{25}{12}\cdot\dfrac{8}{15}$.
2. Escribe todo como un solo producto: $\dfrac{9\cdot25\cdot8}{10\cdot12\cdot15}$.
3. Factoriza: arriba $3^2\cdot5^2\cdot2^3$; abajo $(2\cdot5)(2^2\cdot3)(3\cdot5)=2^3\cdot3^2\cdot5^2$.
4. Todo se cancela.

**Resultado: $1$.** Comprobación aproximada: $0{,}9\cdot2{,}083=1{,}875$ y $1{,}875:1{,}875=1$. ✔
:::

:::ejemplo Ejemplo 3 · Jerarquía con fracciones
Calcula $\dfrac{1}{2}+\dfrac{2}{3}\cdot\left(1-\dfrac{1}{4}\right)$.

1. Paréntesis: $1-\dfrac{1}{4}=\dfrac{4}{4}-\dfrac{1}{4}=\dfrac{3}{4}$.
2. Producto: $\dfrac{2}{3}\cdot\dfrac{3}{4}=\dfrac{6}{12}=\dfrac{1}{2}$.
3. Suma: $\dfrac{1}{2}+\dfrac{1}{2}=1$.

**Resultado: $1$.** Si hubieras sumado primero $\dfrac{1}{2}+\dfrac{2}{3}$, el resultado sería $\dfrac{7}{8}$, que es incorrecto.
:::

:::error Error típico
$\dfrac{1}{2}+\dfrac{1}{3}=\dfrac{2}{5}$ es **falso**: no se suman numeradores con numeradores y denominadores con denominadores. Comprueba: $\dfrac{2}{5}=0{,}4$, pero $\dfrac{1}{2}$ ya vale $0{,}5$; la suma no puede ser menor que uno de sus sumandos positivos. Otro error: cancelar en una suma, como $\dfrac{3+x}{3}=1+x$; lo correcto es $1+\dfrac{x}{3}$.
:::

## 6. Ejercicio guiado

Calcula y simplifica $\left(\dfrac{3}{4}-\dfrac{1}{6}\right):\dfrac{7}{9}$.

:::pista Primera pista
Resuelve primero el paréntesis. El mcm de 4 y 6 es 12.
:::

:::pista Segunda pista
$\dfrac{3}{4}=\dfrac{9}{12}$ y $\dfrac{1}{6}=\dfrac{2}{12}$. Después divide multiplicando por $\dfrac{9}{7}$.
:::

:::solucion Solución guiada
Paréntesis: $\dfrac{9}{12}-\dfrac{2}{12}=\dfrac{7}{12}$. Cociente: $\dfrac{7}{12}\cdot\dfrac{9}{7}$. Cancela el 7 y el 3 (de 9 y 12): $\dfrac{1}{4}\cdot\dfrac{3}{1}=\dfrac{3}{4}$.
Comprobación decimal: $0{,}5833:0{,}7778\approx0{,}75$. ✔
:::

## 7. Práctica

**Fáciles**

1. Calcula $\dfrac{2}{5}+\dfrac{1}{5}$.
2. Calcula $\dfrac{3}{8}\cdot\dfrac{4}{9}$ simplificando.
3. Calcula $\dfrac{5}{6}:\dfrac{10}{3}$.

**Medios**

4. Calcula $\dfrac{7}{10}-\dfrac{2}{15}+\dfrac{1}{6}$.
5. Calcula $2\tfrac{1}{2}\cdot\left(\dfrac{4}{5}-\dfrac{1}{2}\right)$.

**Tipo examen / transferencia**

6. Un almacén dedica $\dfrac{2}{5}$ de su superficie a recepción y $\dfrac{1}{3}$ del resto a expedición. ¿Qué fracción de la superficie total queda para almacenaje? Si la nave mide 1.200 m², ¿cuántos metros cuadrados son?

:::solucion Soluciones paso a paso
1. Mismo denominador: $\dfrac{3}{5}$.
2. Cancela 4 con 8 (queda 1 y 2) y 3 con 9 (queda 1 y 3): $\dfrac{1}{2}\cdot\dfrac{1}{3}=\dfrac{1}{6}$.
3. $\dfrac{5}{6}\cdot\dfrac{3}{10}=\dfrac{15}{60}=\dfrac{1}{4}$.
4. mcm(10,15,6)=30: $\dfrac{21}{30}-\dfrac{4}{30}+\dfrac{5}{30}=\dfrac{22}{30}=\dfrac{11}{15}$.
5. $2\tfrac{1}{2}=\dfrac{5}{2}$; paréntesis $\dfrac{8}{10}-\dfrac{5}{10}=\dfrac{3}{10}$; producto $\dfrac{5}{2}\cdot\dfrac{3}{10}=\dfrac{15}{20}=\dfrac{3}{4}$.
6. Resto tras recepción: $1-\dfrac{2}{5}=\dfrac{3}{5}$. Expedición: $\dfrac{1}{3}\cdot\dfrac{3}{5}=\dfrac{1}{5}$. Almacenaje: $1-\dfrac{2}{5}-\dfrac{1}{5}=\dfrac{2}{5}$. En metros: $\dfrac{2}{5}\cdot1200=480$ m². Comprobación: recepción 480 + expedición 240 + almacenaje 480 = 1.200. ✔
:::

## 8. Cómo revisar tus errores

- **Estimación decimal:** convierte cada fracción a decimal aproximado y comprueba que el resultado tiene sentido (una suma de positivos crece; multiplicar por una fracción menor que 1 reduce).
- **¿Usé el mcm correcto?** Cada denominador debe dividir exactamente al mcm.
- **¿Invertí la segunda fracción y solo esa?** En $\dfrac{a}{b}:\dfrac{c}{d}$ se invierte la que divide.
- **¿Simplifiqué al final?** Divide numerador y denominador por su MCD hasta que sea irreducible.
- **«De» significa multiplicar:** «un tercio del resto» es $\dfrac{1}{3}\cdot(\text{resto})$, no $\dfrac{1}{3}$ del total.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Sumar o restar: común denominador (mcm) y operar numeradores.
- Multiplicar: numerador por numerador, denominador por denominador; cancela factores antes.
- Dividir: multiplicar por la inversa de la segunda.
- Jerarquía igual que con enteros; nunca canceles términos de una suma.

**Vocabulario:** numerador, denominador, equivalente, irreducible, mcm, inversa, fracción impropia, número mixto.

**Repaso:** a 1, 3, 7, 14 y 30 días. En cada repaso, haz una suma de tres fracciones con denominadores distintos y una cadena producto–cociente, y compruébalas en decimal.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N0 (rescate, primaria–1.º ESO). Prerrequisito directo de ecuaciones con denominadores (M01-L02), fracciones algebraicas (M02-L03) y de cualquier problema del examen de Matemáticas +25.
