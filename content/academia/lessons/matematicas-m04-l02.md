---
id: matematicas-m04-l02
course: matematicas
module: M04
level: N2
title: Dominio y recorrido de una función
learning_objectives:
  - Calcular el dominio de funciones polinómicas, racionales, irracionales y combinadas
  - Expresar el dominio con intervalos y justificar cada restricción
  - Determinar el recorrido de funciones sencillas a partir de su gráfica o de su expresión
prerequisites: [matematicas-m04-l01, matematicas-m01-l05, matematicas-m02-l03]
skill_ids: [function_domain, function_range]
exam_alignment: [funciones]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Antes de estudiar una función (sus cortes, su signo, su derivada, su gráfica) hay que saber **dónde existe**. El dominio es casi siempre la primera pregunta de un ejercicio de funciones en el examen de Matemáticas +25, y un error ahí arrastra todo lo demás: asíntotas mal situadas, máximos en puntos donde la función no existe, integrales imposibles. En esta lección aprenderás a calcular el dominio de las funciones más habituales y a describir su recorrido, el conjunto de valores que puede tomar.

## 2. Lo que necesitas saber antes

- Funciones, gráficas de rectas y parábolas (M04-L01).
- Inecuaciones de primer grado e intervalos (M01-L05).
- Fracciones algebraicas y sus restricciones (M02-L03).

## 3. Idea intuitiva

Una función es una máquina: metes un número $x$ y sale un número $f(x)$. Pero algunas máquinas se atascan con ciertos números. La función $f(x)=\dfrac{1}{x}$ se atasca con $x=0$, porque no se puede dividir entre cero. La función $g(x)=\sqrt{x}$ se atasca con los negativos, porque ningún número real al cuadrado da negativo. El **dominio** es el conjunto de números que la máquina acepta.

El **recorrido** (o imagen) es el conjunto de resultados que la máquina puede producir. $x^2$ acepta cualquier número, pero nunca produce un negativo: su recorrido es $[0,+\infty)$.

## 4. Definición precisa

- **Función real de variable real**: regla que asigna a cada $x$ de un conjunto un **único** valor real $f(x)$.
- **Dominio** $\text{Dom}(f)$: conjunto de valores de $x$ para los que $f(x)$ existe y es un número real.
- **Recorrido** o **imagen** $\text{Im}(f)$: conjunto de valores $y$ tales que existe algún $x$ del dominio con $f(x)=y$.

**Reglas para el dominio** (de las expresiones más usadas):

| Tipo | Condición | Ejemplo |
|---|---|---|
| Polinomio | ninguna: $\mathbb R$ | $3x^2-x+1$ |
| Cociente $\dfrac{P}{Q}$ | $Q(x)\neq0$ | $\dfrac{x}{x-4}$: $x\neq4$ |
| Raíz de índice par $\sqrt{R}$ | $R(x)\ge0$ | $\sqrt{x+3}$: $x\ge-3$ |
| Raíz de índice impar | ninguna (si $R$ existe) | $\sqrt[3]{x-1}$: $\mathbb R$ |
| Raíz par en el denominador $\dfrac{1}{\sqrt R}$ | $R(x)>0$ (estricto) | $\dfrac{1}{\sqrt{x}}$: $x>0$ |
| Logaritmo $\log R$ | $R(x)>0$ (M04-L06) | $\ln(x-2)$: $x>2$ |

**Funciones combinadas.** Si una función tiene varias partes, el dominio es la **intersección** de las condiciones de todas ellas. Se resuelve cada condición por separado y se combinan en la recta real.

**Dominio en contexto.** En un problema real, además de las restricciones algebraicas, hay restricciones de sentido: un número de unidades no puede ser negativo, un tiempo empieza en 0, una longitud es positiva. Por ejemplo, el área de un cuadrado de lado $x$ es $A(x)=x^2$, con dominio $(0,+\infty)$ en el contexto, aunque algebraicamente sea $\mathbb R$.

**Cómo calcular el recorrido.** No hay una regla universal; los métodos más útiles son:
1. **Gráfica**: proyectar la gráfica sobre el eje $Y$.
2. **Funciones conocidas**: una parábola con $a>0$ tiene recorrido $[y_v,+\infty)$, con $y_v$ la ordenada del vértice; con $a<0$, $(-\infty,y_v]$. Una recta no horizontal tiene recorrido $\mathbb R$. $\sqrt{x}$ tiene recorrido $[0,+\infty)$.
3. **Despejar $x$**: si de $y=f(x)$ se puede despejar $x$, los valores de $y$ para los que el despeje tiene sentido forman el recorrido. Para $y=\dfrac{1}{x-2}$: $x=2+\dfrac{1}{y}$, que existe para $y\neq0$; recorrido $\mathbb R\setminus\{0\}$.

**Por qué importa la intersección.** En $f(x)=\dfrac{\sqrt{x-2}}{x-5}$, el numerador exige $x\ge2$ y el denominador $x\neq5$. Ninguna de las dos condiciones sola basta: hay que cumplir ambas a la vez, y por eso se intersecan, lo que da $[2,5)\cup(5,+\infty)$.

**Notación.** $\mathbb R\setminus\{a,b\}$ significa «todos los reales salvo $a$ y $b$». Es equivalente a la unión de intervalos $(-\infty,a)\cup(a,b)\cup(b,+\infty)$ si $a<b$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Dominio de una función racional
Calcula el dominio de $f(x)=\dfrac{x+1}{x^2-9}$.

$x^2-9=0$ → $x=\pm3$. $\text{Dom}(f)=\mathbb R\setminus\{-3,3\}$.
:::

:::ejemplo Ejemplo 2 · Dominio combinado
Calcula el dominio de $f(x)=\dfrac{\sqrt{x-2}}{x-5}$.

1. Raíz: $x-2\ge0$ → $x\ge2$.
2. Denominador: $x\neq5$.
3. Intersección: $[2,5)\cup(5,+\infty)$.
:::

:::ejemplo Ejemplo 3 · Recorrido de una parábola
Halla el recorrido de $f(x)=x^2-4x+7$.

$a=1>0$ → mínimo en el vértice. $x_v=2$, $f(2)=4-8+7=3$. $\text{Im}(f)=[3,+\infty)$.
:::

:::error Error típico
En $\sqrt{x-2}$ escribir $x>2$ y excluir el 2: la raíz de 0 existe, así que $x=2$ **sí** está en el dominio. Al revés, en $\dfrac{1}{\sqrt{x-2}}$ el 2 **no** está, porque anularía el denominador. Otro error: simplificar antes de calcular el dominio; $\dfrac{x^2-1}{x-1}$ no existe en $x=1$ aunque se simplifique a $x+1$.
:::

## 6. Ejercicio guiado

Calcula el dominio de $g(x)=\dfrac{\sqrt{6-2x}}{x+1}$.

:::pista Primera pista
Condición de la raíz: $6-2x\ge0$. Al despejar, recuerda invertir la desigualdad si divides entre un negativo.
:::

:::pista Segunda pista
$-2x\ge-6$ → $x\le3$. Además, el denominador exige $x\neq-1$.
:::

:::solucion Solución guiada
$\text{Dom}(g)=(-\infty,-1)\cup(-1,3]$. Comprobación: $g(3)=0$ existe; $g(4)$ daría raíz de $-2$; $g(-1)$ dividiría entre 0.
:::

## 7. Práctica

**Fáciles**

1. Dominio de $f(x)=3x^2-5$.
2. Dominio de $f(x)=\dfrac{2}{x-4}$.
3. Dominio de $f(x)=\sqrt{x+3}$.

**Medios**

4. Dominio de $f(x)=\dfrac{x+1}{x^2-5x+6}$.
5. Recorrido de $f(x)=(x-1)^2+3$ y de $g(x)=-2x^2+8$.

**Tipo examen / transferencia**

6. Sea $f(x)=\sqrt{x-1}+\dfrac{1}{x-3}$. Calcula su dominio, $f(5)$, y explica por qué no existen $f(0)$ ni $f(3)$.

:::solucion Soluciones paso a paso
1. $\mathbb R$ (polinomio).
2. $\mathbb R\setminus\{4\}$.
3. $[-3,+\infty)$.
4. $x^2-5x+6=(x-2)(x-3)$ → $\mathbb R\setminus\{2,3\}$.
5. $f$: vértice $(1,3)$ con $a>0$ → $[3,+\infty)$. $g$: vértice $(0,8)$ con $a<0$ → $(-\infty,8]$.
6. Raíz: $x\ge1$; denominador: $x\neq3$ → $[1,3)\cup(3,+\infty)$. $f(5)=\sqrt4+\dfrac12=2{,}5$. $f(0)$ exige $\sqrt{-1}$, que no es real; $f(3)$ exige dividir entre 0.
:::

## 8. Cómo revisar tus errores

- Comprueba un valor dentro del dominio y otro fuera.
- Revisa los extremos: ¿$\ge$ (raíz en el numerador) o $>$ (raíz en el denominador o logaritmo)?
- Calcula el dominio **antes** de simplificar.
- Para el recorrido, haz un esbozo de la gráfica.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Dominio: polinomios $\mathbb R$; cocientes, denominador $\neq0$; raíz par, radicando $\ge0$; logaritmo, argumento $>0$.
- Funciones combinadas: intersección de condiciones.
- Recorrido: gráfica, vértice de la parábola o despejando $x$.

**Vocabulario:** función, dominio, recorrido, imagen, restricción, intersección.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, calcula el dominio de una función con raíz y cociente a la vez y el recorrido de una parábola.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de funciones del temario oficial de Matemáticas +25; primer paso de todo estudio de funciones (asíntotas M04-L07, derivadas M08).
