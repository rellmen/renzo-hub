---
id: matematicas-m08-l05
course: matematicas
module: M08
level: N2
title: Crecimiento, decrecimiento, máximos y mínimos
learning_objectives:
  - Estudiar los intervalos de crecimiento y decrecimiento de una función con el signo de la derivada
  - Localizar máximos y mínimos relativos con la primera derivada y confirmarlos con la segunda
  - Calcular máximos y mínimos absolutos de una función continua en un intervalo cerrado
prerequisites: [matematicas-m08-l03, matematicas-m02-l07]
skill_ids: [monotonicity, local_extrema, absolute_extrema]
exam_alignment: [analisis]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Saber dónde una función sube, dónde baja y dónde alcanza sus valores más altos y más bajos es la información más útil que da la derivada. Sirve para dibujar gráficas sin tabla de valores, para encontrar el beneficio máximo o el coste mínimo y, en el examen de Matemáticas +25, aparece casi siempre como «estudia la monotonía y los extremos relativos de...». En esta lección aprenderás el método completo: puntos críticos, tabla de signos y clasificación de extremos, también en intervalos cerrados.

## 2. Lo que necesitas saber antes

- Reglas de derivación (M08-L03).
- Inecuaciones y estudio del signo de un polinomio o fracción (M02-L07).
- Continuidad (M08-L01).

## 3. Idea intuitiva

Imagina que recorres la gráfica de izquierda a derecha en bicicleta. Donde la pendiente es positiva subes ($f'>0$); donde es negativa bajas ($f'<0$). En la cima de una colina dejas de subir y empiezas a bajar: justo ahí la pendiente es cero. En el fondo de un valle pasa lo contrario. Por eso los máximos y mínimos de una función derivable se buscan donde $f'(x)=0$.

Pero ojo: que la pendiente sea cero no garantiza una cima. En $f(x)=x^3$, en $x=0$ la tangente es horizontal y, sin embargo, la función sigue subiendo a ambos lados: es un **punto de inflexión** con tangente horizontal, como un rellano en una escalera.

## 4. Definición precisa

**Monotonía.** En un intervalo donde $f$ es derivable:
- Si $f'(x)>0$, $f$ es **creciente**.
- Si $f'(x)<0$, $f$ es **decreciente**.

**Extremos relativos (o locales).** $f$ tiene un máximo relativo en $a$ si $f(a)\ge f(x)$ para los $x$ cercanos a $a$; un mínimo relativo si $f(a)\le f(x)$.

**Condición necesaria.** Si $f$ es derivable en $a$ y tiene un extremo relativo en $a$, entonces $f'(a)=0$. Los puntos donde $f'(a)=0$ o donde $f'$ no existe (dentro del dominio) se llaman **puntos críticos**: son los únicos candidatos.

**Criterio de la primera derivada** (cambio de signo):
- $f'$ pasa de $+$ a $-$ en $a$: **máximo** relativo.
- $f'$ pasa de $-$ a $+$: **mínimo** relativo.
- No cambia de signo: no hay extremo.

**Criterio de la segunda derivada** (si $f'(a)=0$):
- $f''(a)<0$: máximo relativo (la curva es «cóncava hacia abajo», como $\cap$).
- $f''(a)>0$: mínimo relativo (como $\cup$).
- $f''(a)=0$: el criterio no decide; usa el de la primera derivada.

**Método completo** para estudiar monotonía y extremos:
1. Calcula el dominio de $f$.
2. Deriva y simplifica (factoriza) $f'(x)$.
3. Halla los puntos críticos: resuelve $f'(x)=0$ y busca dónde $f'$ no existe.
4. Ordena en la recta real los puntos críticos **y** los puntos excluidos del dominio, y estudia el signo de $f'$ en cada intervalo con un valor de prueba.
5. Escribe los intervalos de crecimiento y decrecimiento y clasifica cada punto crítico.
6. Calcula la ordenada de cada extremo: el extremo es el **punto** $(a,f(a))$.

**Extremos absolutos en un intervalo cerrado** $[p,q]$. Si $f$ es continua en $[p,q]$, el **teorema de Weierstrass** garantiza que alcanza un máximo y un mínimo absolutos. Para encontrarlos:
1. Halla los puntos críticos que están dentro de $(p,q)$.
2. Evalúa $f$ en esos puntos y en los **extremos** $p$ y $q$.
3. El mayor valor es el máximo absoluto; el menor, el mínimo absoluto.

**Por qué el signo de $f'$ decide.** Por la aproximación lineal (M08-L04), $f(a+h)\approx f(a)+f'(a)h$: si $f'(a)>0$, al aumentar $x$ un poco ($h>0$) la función aumenta. En un intervalo donde la derivada es siempre positiva, la función no puede bajar en ningún momento.

**Presentación en el examen.** La forma más clara es una tabla con una fila para los intervalos, otra para el signo de $f'$ y otra con flechas de crecimiento. Escribe siempre las conclusiones con intervalos abiertos y los extremos como puntos con sus dos coordenadas.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Polinomio de grado 3
Estudia la monotonía y los extremos de $f(x)=x^3-3x^2-9x+2$.

$f'(x)=3x^2-6x-9=3(x-3)(x+1)$. Puntos críticos: $x=-1$ y $x=3$.

| Intervalo | $(-\infty,-1)$ | $(-1,3)$ | $(3,+\infty)$ |
|---|---|---|---|
| Signo de $f'$ | $+$ | $-$ | $+$ |
| $f$ | crece | decrece | crece |

Máximo relativo en $(-1,7)$; mínimo relativo en $(3,-25)$. Con la segunda derivada: $f''(x)=6x-6$, $f''(-1)=-12<0$ (máximo) y $f''(3)=12>0$ (mínimo). ✔
:::

:::ejemplo Ejemplo 2 · Función racional
Monotonía de $f(x)=\dfrac{x^2}{x-1}$.

Dominio: $x\neq1$. $f'(x)=\dfrac{2x(x-1)-x^2}{(x-1)^2}=\dfrac{x(x-2)}{(x-1)^2}$. Críticos: $0$ y $2$; además, $1$ no está en el dominio. Signos: $(-\infty,0)$ $+$; $(0,1)$ $-$; $(1,2)$ $-$; $(2,+\infty)$ $+$. Máximo en $(0,0)$, mínimo en $(2,4)$.
:::

:::ejemplo Ejemplo 3 · Extremos absolutos
Máximo y mínimo absolutos de $f(x)=x^2-4x+1$ en $[0,5]$.

$f'(x)=2x-4=0$ → $x=2\in[0,5]$. Valores: $f(0)=1$, $f(2)=-3$, $f(5)=6$. Máximo absoluto 6 en $x=5$; mínimo absoluto $-3$ en $x=2$.
:::

:::error Error típico
Olvidar en la tabla de signos los puntos que no están en el dominio: en el ejemplo 2, la función decrece en $(0,1)$ y en $(1,2)$, pero **no** en $(0,2)$, porque en $x=1$ no existe. Otro error: dar solo la abscisa del extremo («máximo en $x=-1$») cuando se pide el punto.
:::

## 6. Ejercicio guiado

Estudia la monotonía y los extremos de $f(x)=xe^{-x}$.

:::pista Primera pista
Producto y cadena: $f'(x)=e^{-x}-xe^{-x}$. Saca factor común.
:::

:::pista Segunda pista
$f'(x)=e^{-x}(1-x)$, y $e^{-x}>0$ siempre: el signo lo decide $1-x$.
:::

:::solucion Solución guiada
Crece en $(-\infty,1)$ y decrece en $(1,+\infty)$. Máximo relativo (y absoluto) en $\left(1,\tfrac1e\right)\approx(1;\ 0{,}368)$.
:::

## 7. Práctica

**Fáciles**

1. Intervalos de monotonía de $f(x)=x^2-6x+5$.
2. ¿Tiene extremos $f(x)=x^3$?
3. Si $f'(2)=0$ y $f''(2)=-3$, ¿qué hay en $x=2$?

**Medios**

4. Extremos relativos de $f(x)=2x^3-3x^2-12x$.
5. Extremos absolutos de $f(x)=x^3-3x$ en $[0,2]$.

**Tipo examen / transferencia**

6. Halla $a$ y $b$ para que $f(x)=x^3+ax^2+b$ tenga un extremo relativo en el punto $(2,-1)$. Indica si es máximo o mínimo.

:::solucion Soluciones paso a paso
1. $f'(x)=2x-6$: decrece en $(-\infty,3)$, crece en $(3,+\infty)$; mínimo en $(3,-4)$.
2. $f'(x)=3x^2\ge0$ no cambia de signo: no tiene extremos (inflexión en 0).
3. Un máximo relativo.
4. $f'(x)=6x^2-6x-12=6(x-2)(x+1)$. Máximo en $(-1,7)$, mínimo en $(2,-20)$.
5. $f'(x)=3x^2-3=0$ → $x=1$ (dentro). $f(0)=0$, $f(1)=-2$, $f(2)=2$. Máximo absoluto 2 en $x=2$; mínimo absoluto $-2$ en $x=1$.
6. $f'(2)=12+4a=0$ → $a=-3$. $f(2)=8-12+b=-1$ → $b=3$. $f''(x)=6x-6$, $f''(2)=6>0$: **mínimo**.
:::

## 8. Cómo revisar tus errores

- Factoriza $f'$ antes de estudiar el signo.
- Incluye en la tabla los puntos fuera del dominio.
- Comprueba los extremos con la segunda derivada cuando sea fácil.
- En intervalos cerrados, no olvides evaluar los extremos del intervalo.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $f'>0$ crece; $f'<0$ decrece. Candidatos a extremo: $f'(a)=0$ o $f'$ no existe.
- Cambio de signo de $f'$ (o signo de $f''$) clasifica el extremo.
- En $[p,q]$: compara $f$ en críticos interiores y en $p$ y $q$.

**Vocabulario:** creciente, decreciente, monotonía, punto crítico, máximo y mínimo relativo, máximo y mínimo absoluto, teorema de Weierstrass.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, haz la tabla de signos completa de un polinomio de grado 3 y de una función racional.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de análisis del temario oficial de Matemáticas +25.
