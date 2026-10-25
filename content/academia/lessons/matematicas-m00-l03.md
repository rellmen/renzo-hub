---
id: matematicas-m00-l03
course: matematicas
module: M00
level: N0
title: Fracciones equivalentes, simplificación y comparación
learning_objectives:
  - Interpretar una fracción como parte de un todo, como cociente y como operador
  - Obtener fracciones equivalentes y simplificar hasta la fracción irreducible usando el MCD
  - Comparar y ordenar fracciones reduciendo a común denominador
prerequisites: [matematicas-m00-l02]
skill_ids: [fraction_equivalence, fraction_simplify, fraction_compare]
exam_alignment: [arithmetica-algebra]
estimated_minutes: 40
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Antes de sumar o multiplicar fracciones necesitas saber cuándo dos fracciones valen lo mismo, cómo dejarlas en su forma más simple y cuál de dos fracciones es mayor. Parece aritmética de primaria, pero en el examen de Matemáticas +25 aparece constantemente: al simplificar el resultado final de un problema (los correctores esperan la fracción irreducible), al comparar soluciones, al interpretar porcentajes y probabilidades y al trabajar con fracciones algebraicas, que se simplifican con exactamente la misma idea.

## 2. Lo que necesitas saber antes

- Descomponer en factores primos y calcular MCD y mcm (M00-L02): $36=2^2\cdot3^2$, MCD$(24,36)=12$, mcm$(4,6)=12$.
- Multiplicar y dividir números enteros con soltura.
- Saber que dividir entre 0 no está definido.

## 3. Idea intuitiva

Piensa en una pizza. Si la cortas en 4 trozos y te comes 2, has comido $\dfrac{2}{4}$. Si la cortas en 8 trozos y te comes 4, has comido $\dfrac{4}{8}$. En ambos casos has comido **media pizza**: $\dfrac{2}{4}=\dfrac{4}{8}=\dfrac{1}{2}$. Cambiar el tamaño de los trozos no cambia la cantidad comida, siempre que cortes cada trozo en el mismo número de partes.

Simplificar es hacer lo contrario: juntar trozos para describir la misma cantidad con números más pequeños. Y para comparar, por ejemplo, $\dfrac{3}{5}$ y $\dfrac{2}{3}$, lo más seguro es cortar las dos pizzas en trozos iguales (quinceavos) y contar.

## 4. Definición precisa

- **Fracción** $\dfrac{a}{b}$ con $b\neq0$: $a$ es el **numerador** y $b$ el **denominador**. Tres lecturas equivalentes:
  - **parte de un todo**: $a$ partes de un total dividido en $b$ partes iguales;
  - **cociente**: $\dfrac{a}{b}=a:b$ (por eso $\dfrac{3}{4}=0{,}75$);
  - **operador**: $\dfrac{3}{4}$ de 200 es $\dfrac{3}{4}\cdot200=150$.
- **Fracciones equivalentes**: $\dfrac{a}{b}=\dfrac{c}{d}$ si y solo si $a\cdot d=b\cdot c$ (productos cruzados).
- **Propiedad fundamental**: multiplicar o dividir numerador y denominador por el mismo número distinto de cero da una fracción equivalente: $\dfrac{a}{b}=\dfrac{a\cdot k}{b\cdot k}$.
- **Amplificar**: multiplicar ambos términos por $k$. **Simplificar**: dividir ambos por un divisor común.
- **Fracción irreducible**: numerador y denominador son primos entre sí (MCD $=1$). Se obtiene en un solo paso dividiendo entre el MCD: $\dfrac{a}{b}=\dfrac{a:\text{MCD}}{b:\text{MCD}}$.
- **Fracción propia** ($a<b$, vale menos que 1) e **impropia** ($a\ge b$). Una impropia puede escribirse como número mixto: $\dfrac{11}{4}=2+\dfrac{3}{4}=2\tfrac{3}{4}$.
- **Signo**: $\dfrac{-3}{4}=\dfrac{3}{-4}=-\dfrac{3}{4}$. Se suele escribir el signo delante o en el numerador.

**Comparar fracciones.** Tres métodos válidos:
1. **Mismo denominador**: es mayor la de mayor numerador ($\dfrac{5}{9}>\dfrac{4}{9}$).
2. **Común denominador** con el mcm: $\dfrac{3}{5}=\dfrac{9}{15}$ y $\dfrac{2}{3}=\dfrac{10}{15}$, así que $\dfrac{3}{5}<\dfrac{2}{3}$.
3. **Productos cruzados** (fracciones positivas): $\dfrac{a}{b}<\dfrac{c}{d}\iff a\cdot d<b\cdot c$. Con $3\cdot3=9<5\cdot2=10$ se confirma lo anterior.

Con el mismo numerador, es mayor la de **menor** denominador: $\dfrac{3}{4}>\dfrac{3}{7}$ (trozos más grandes). Con negativos, el orden se invierte: $-\dfrac{3}{4}<-\dfrac{3}{7}$.

**Fracciones en la recta numérica.** Para situar $\dfrac{7}{4}$, divide cada unidad en 4 partes iguales y cuenta 7: queda entre 1 y 2, más cerca de 2. Todas las fracciones equivalentes caen exactamente en el mismo punto de la recta; por eso son «el mismo número escrito de otra forma». Entre dos fracciones distintas siempre hay otra: la media $\dfrac{1}{2}\left(\dfrac{a}{b}+\dfrac{c}{d}\right)$ queda en medio, así que nunca existe «la fracción siguiente».

**Por qué el examen pide la fracción irreducible.** Un resultado como $\dfrac{18}{24}$ es correcto, pero los criterios de corrección suelen pedir el resultado simplificado y, además, simplificar ayuda a detectar errores: si la solución de un problema sencillo sale $\dfrac{37}{111}$, al simplificar ves que es $\dfrac{1}{3}$ y ganas confianza en el cálculo.

**Por qué funciona la propiedad fundamental.** Multiplicar arriba y abajo por $k$ equivale a multiplicar la fracción por $\dfrac{k}{k}=1$, y multiplicar por 1 no cambia el valor. Por eso los productos cruzados funcionan: $\dfrac{a}{b}=\dfrac{c}{d}$ se convierte, multiplicando ambos lados por $b\cdot d$, en $a\cdot d=c\cdot b$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Simplificar en un paso con el MCD
Simplifica $\dfrac{84}{126}$.

1. $84=2^2\cdot3\cdot7$; $126=2\cdot3^2\cdot7$.
2. MCD $=2\cdot3\cdot7=42$.
3. $\dfrac{84:42}{126:42}=\dfrac{2}{3}$.

Comprobación: $84\cdot3=252=126\cdot2$. ✔
:::

:::ejemplo Ejemplo 2 · Ordenar tres fracciones
Ordena de menor a mayor $\dfrac{5}{6}$, $\dfrac{3}{4}$ y $\dfrac{7}{9}$.

1. mcm$(6,4,9)=36$.
2. $\dfrac{5}{6}=\dfrac{30}{36}$; $\dfrac{3}{4}=\dfrac{27}{36}$; $\dfrac{7}{9}=\dfrac{28}{36}$.
3. Orden: $\dfrac{3}{4}<\dfrac{7}{9}<\dfrac{5}{6}$.
:::

:::ejemplo Ejemplo 3 · Completar una equivalencia
Halla $x$ para que $\dfrac{6}{15}=\dfrac{x}{40}$.

Productos cruzados: $6\cdot40=15x$ → $240=15x$ → $x=16$. Alternativa: $\dfrac{6}{15}=\dfrac{2}{5}=\dfrac{16}{40}$ (amplificando por 8).
:::

:::error Error típico
Simplificar restando: $\dfrac{8}{12}\neq\dfrac{8-4}{12-4}=\dfrac{4}{8}$. Solo se puede **dividir** (o multiplicar) arriba y abajo por el mismo número. Otro error: pensar que $\dfrac{1}{8}>\dfrac{1}{5}$ «porque 8 es mayor que 5»; con el mismo numerador, más denominador significa trozos más pequeños.
:::

## 6. Ejercicio guiado

En un almacén, el lunes se revisaron 18 de 24 ubicaciones y el martes 25 de 30. ¿Qué día se revisó una proporción mayor?

:::pista Primera pista
Escribe cada proporción como fracción y simplifícala: $\dfrac{18}{24}$ y $\dfrac{25}{30}$.
:::

:::pista Segunda pista
$\dfrac{18}{24}=\dfrac{3}{4}$ y $\dfrac{25}{30}=\dfrac{5}{6}$. Compáralas con denominador 12.
:::

:::solucion Solución guiada
$\dfrac{3}{4}=\dfrac{9}{12}$ y $\dfrac{5}{6}=\dfrac{10}{12}$. El martes ($\dfrac{5}{6}\approx83\,\%$) supera al lunes ($75\,\%$). Comprobación con productos cruzados: $3\cdot6=18<4\cdot5=20$. ✔
:::

## 7. Práctica

**Fáciles**

1. Escribe dos fracciones equivalentes a $\dfrac{2}{7}$.
2. Simplifica $\dfrac{45}{60}$.
3. ¿Son equivalentes $\dfrac{4}{6}$ y $\dfrac{10}{15}$?

**Medios**

4. Ordena de mayor a menor: $\dfrac{2}{3}$, $\dfrac{5}{8}$, $\dfrac{7}{12}$.
5. Escribe $\dfrac{23}{6}$ como número mixto y $3\tfrac{2}{5}$ como fracción impropia.

**Tipo examen / transferencia**

6. Un proveedor entrega correctamente 135 de 150 pedidos y otro 176 de 200. Expresa cada proporción como fracción irreducible y decide cuál es más fiable. Justifica.

:::solucion Soluciones paso a paso
1. Por ejemplo $\dfrac{4}{14}$ y $\dfrac{6}{21}$ (amplificando por 2 y por 3).
2. MCD$(45,60)=15$ → $\dfrac{3}{4}$.
3. Sí: $4\cdot15=60=6\cdot10$. Ambas valen $\dfrac{2}{3}$.
4. mcm 24: $\dfrac{16}{24}$, $\dfrac{15}{24}$, $\dfrac{14}{24}$ → $\dfrac{2}{3}>\dfrac{5}{8}>\dfrac{7}{12}$.
5. $23=3\cdot6+5$ → $3\tfrac{5}{6}$. $3\tfrac{2}{5}=\dfrac{15+2}{5}=\dfrac{17}{5}$.
6. $\dfrac{135}{150}=\dfrac{9}{10}$ (MCD 15) y $\dfrac{176}{200}=\dfrac{22}{25}$ (MCD 8). Comparando con denominador 50: $\dfrac{45}{50}>\dfrac{44}{50}$. El primero es más fiable (90 % frente a 88 %).
:::

## 8. Cómo revisar tus errores

- Comprueba cualquier equivalencia con productos cruzados.
- Una fracción está bien simplificada si el MCD de sus términos es 1: prueba al menos con 2, 3 y 5.
- Al comparar, haz una estimación decimal rápida ($\dfrac{7}{9}\approx0{,}78$) para detectar errores grandes.
- Cuidado con los negativos: el orden se invierte.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $\dfrac{a}{b}=\dfrac{a k}{b k}$ con $k\neq0$; equivalentes si $ad=bc$.
- Irreducible: dividir entre el MCD.
- Comparar: común denominador o productos cruzados; con igual numerador gana el menor denominador.

**Vocabulario:** numerador, denominador, fracción equivalente, amplificar, simplificar, irreducible, fracción propia e impropia, número mixto.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, simplifica dos fracciones de números grandes con el MCD y ordena tres fracciones.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N0 (rescate, primaria–1.º ESO). Prerrequisito directo de las operaciones con fracciones (M00-L04) y de las fracciones algebraicas (M02-L03).
