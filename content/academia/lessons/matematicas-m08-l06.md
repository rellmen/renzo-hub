---
id: matematicas-m08-l06
course: matematicas
module: M08
level: N2
title: Concavidad, puntos de inflexión y representación de funciones
learning_objectives:
  - Estudiar la curvatura de una función con el signo de la segunda derivada
  - Localizar puntos de inflexión
  - Representar gráficamente funciones polinómicas y racionales sencillas reuniendo dominio, cortes, asíntotas, monotonía y curvatura
prerequisites: [matematicas-m08-l05, matematicas-m08-l01]
skill_ids: [concavity, inflection_points, curve_sketching]
exam_alignment: [analisis]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La primera derivada dice si la función sube o baja; la **segunda** dice cómo se curva: si se dobla hacia arriba como una sonrisa o hacia abajo como un arco. Los puntos donde cambia la curvatura se llaman **puntos de inflexión**. Con esta lección cierras las herramientas para **representar una función** completa, uno de los ejercicios largos más típicos del examen de Matemáticas +25. Además, la curvatura tiene lectura práctica: una curva de ventas cóncava hacia abajo indica que el crecimiento se está frenando aunque las ventas sigan subiendo.

## 2. Lo que necesitas saber antes

- Monotonía y extremos (M08-L05).
- Asíntotas y límites en el infinito (M08-L01).
- Dominio y cortes con los ejes (M04).

## 3. Idea intuitiva

Si la pendiente de la tangente va **aumentando** al moverte hacia la derecha, la curva se va doblando hacia arriba: forma de $\cup$, como un cuenco que retiene el agua. Se dice **cóncava hacia arriba** (en muchos libros españoles, «convexa»). Si la pendiente va **disminuyendo**, la curva se dobla hacia abajo: forma de $\cap$, **cóncava hacia abajo**.

Como la pendiente es $f'$, que la pendiente aumente significa que $f'$ crece, es decir, $f''>0$. Por eso la segunda derivada mide la curvatura. Un punto de inflexión es donde la curva pasa de $\cup$ a $\cap$ o al revés, como el punto donde una carretera pasa de girar a la izquierda a girar a la derecha.

## 4. Definición precisa

**Curvatura.** En un intervalo donde $f$ es dos veces derivable:
- $f''(x)>0$: $f$ es **cóncava hacia arriba** ($\cup$). La gráfica queda por encima de sus tangentes.
- $f''(x)<0$: $f$ es **cóncava hacia abajo** ($\cap$). La gráfica queda por debajo de sus tangentes.

**Aviso de vocabulario.** Los nombres «cóncava» y «convexa» se usan con sentidos opuestos según el libro. En el examen, para evitar ambigüedades, indica siempre el símbolo $\cup$ o $\cap$ además del nombre, o di «cóncava hacia arriba / hacia abajo».

**Punto de inflexión.** Es un punto $(a,f(a))$ de la gráfica, con $f$ continua en $a$, donde la curvatura cambia. Condición necesaria (si existe $f''$): $f''(a)=0$. Pero no basta: en $f(x)=x^4$, $f''(0)=0$ y no hay inflexión, porque $f''=12x^2$ no cambia de signo.

**Método para la curvatura:**
1. Calcula $f''(x)$ y factorízala.
2. Resuelve $f''(x)=0$ y añade los puntos fuera del dominio.
3. Estudia el signo de $f''$ en cada intervalo.
4. Hay inflexión donde $f''$ cambia de signo **y** el punto pertenece al dominio.

Criterio alternativo: si $f''(a)=0$ y $f'''(a)\neq0$, hay inflexión en $a$.

**Guion para representar una función:**
1. **Dominio** y, si se ve fácil, simetría (par: $f(-x)=f(x)$; impar: $f(-x)=-f(x)$).
2. **Cortes con los ejes**: con OY, $x=0$; con OX, $f(x)=0$.
3. **Asíntotas**: verticales donde el denominador se anula y el límite es infinito; horizontales con $\lim_{x\to\pm\infty}f(x)$; oblicuas $y=mx+n$ con $m=\lim\frac{f(x)}{x}$ y $n=\lim(f(x)-mx)$ cuando no hay horizontal.
4. **Monotonía y extremos** con $f'$.
5. **Curvatura e inflexiones** con $f''$.
6. **Tabla resumen y dibujo**: sitúa asíntotas, cortes, extremos e inflexiones y únelos respetando la información de cada intervalo.

**Coherencia de la información.** Los datos deben encajar entre sí. Entre un máximo y un mínimo consecutivos de una función continua y derivable siempre hay al menos un punto de inflexión. Un polinomio de grado 3 tiene exactamente una inflexión; uno de grado 2 no tiene ninguna. Si tu estudio contradice estas reglas, revisa los cálculos antes de dibujar.

**No hace falta $f''$ simplificada al máximo** para el signo, pero sí factorizada. En funciones racionales, el denominador de $f''$ suele ser una potencia de $(x-a)$: su signo depende de si el exponente es par o impar.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Curvatura de un polinomio
Estudia la curvatura de $f(x)=x^3-6x^2+4$.

$f'(x)=3x^2-12x$, $f''(x)=6x-12$. $f''<0$ si $x<2$ ($\cap$); $f''>0$ si $x>2$ ($\cup$). Inflexión en $(2,f(2))=(2,-12)$.
:::

:::ejemplo Ejemplo 2 · Representación de un polinomio
Representa $f(x)=x^3-3x$.

1. Dominio $\mathbb R$; impar (simétrica respecto al origen).
2. Cortes: $x(x^2-3)=0$ → $x=0$, $x=\pm\sqrt3\approx\pm1{,}73$.
3. Sin asíntotas (polinomio).
4. $f'(x)=3(x-1)(x+1)$: máximo en $(-1,2)$, mínimo en $(1,-2)$.
5. $f''(x)=6x$: $\cap$ en $(-\infty,0)$, $\cup$ en $(0,+\infty)$; inflexión en $(0,0)$.
6. La curva viene de $-\infty$, sube hasta $(-1,2)$, baja cruzando el origen hasta $(1,-2)$ y sube hacia $+\infty$.
:::

:::ejemplo Ejemplo 3 · Función racional
Asíntotas y curvatura de $f(x)=\dfrac{1}{x-2}$.

Asíntota vertical $x=2$; horizontal $y=0$. $f'(x)=-\dfrac{1}{(x-2)^2}<0$: decreciente en todo su dominio. $f''(x)=\dfrac{2}{(x-2)^3}$: $\cap$ si $x<2$, $\cup$ si $x>2$. No hay inflexión: $x=2$ no está en el dominio.
:::

:::error Error típico
Afirmar que hay inflexión solo porque $f''(a)=0$, sin comprobar el cambio de signo (contraejemplo: $x^4$ en 0). Otro error: declarar inflexión en un punto que no pertenece al dominio, como $x=2$ en el ejemplo 3.
:::

## 6. Ejercicio guiado

Halla los puntos de inflexión de $f(x)=x^4-6x^2$.

:::pista Primera pista
$f'(x)=4x^3-12x$ y $f''(x)=12x^2-12$.
:::

:::pista Segunda pista
$f''(x)=12(x-1)(x+1)$: estudia su signo en tres intervalos.
:::

:::solucion Solución guiada
$f''>0$ en $(-\infty,-1)$ y $(1,+\infty)$ ($\cup$); $f''<0$ en $(-1,1)$ ($\cap$). Cambia de signo en $\pm1$: inflexiones en $(-1,-5)$ y $(1,-5)$.
:::

## 7. Práctica

**Fáciles**

1. Curvatura de $f(x)=x^2$.
2. ¿Tiene inflexión $f(x)=x^3$ en el origen?
3. Si $f''(x)=x-4$, ¿dónde es $f$ cóncava hacia abajo?

**Medios**

4. Inflexión de $f(x)=x^3+3x^2-1$.
5. Asíntotas de $f(x)=\dfrac{2x+1}{x-3}$.

**Tipo examen / transferencia**

6. Representa $f(x)=\dfrac{x^2}{x^2+1}$: dominio, simetría, cortes, asíntotas, monotonía y extremos. (La curvatura no es necesaria.)

:::solucion Soluciones paso a paso
1. $f''=2>0$: $\cup$ en todo $\mathbb R$.
2. Sí: $f''(x)=6x$ cambia de signo en 0.
3. Donde $f''<0$: $(-\infty,4)$.
4. $f''(x)=6x+6=0$ → $x=-1$; cambia de signo. Inflexión en $(-1,1)$.
5. Vertical $x=3$; horizontal $y=2$.
6. Dominio $\mathbb R$; par. Corte en $(0,0)$. Asíntota horizontal $y=1$ (sin verticales). $f'(x)=\dfrac{2x}{(x^2+1)^2}$: decrece en $(-\infty,0)$, crece en $(0,+\infty)$; mínimo en $(0,0)$. La gráfica tiene forma de valle que se aproxima a $y=1$ por debajo en ambos lados.
:::

## 8. Cómo revisar tus errores

- Comprueba el cambio de signo de $f''$ antes de afirmar una inflexión.
- Excluye los puntos fuera del dominio.
- Revisa la coherencia: entre un máximo y un mínimo consecutivos hay una inflexión.
- El dibujo debe respetar cada dato de la tabla resumen.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $f''>0$: $\cup$; $f''<0$: $\cap$. Inflexión: cambio de signo de $f''$ en un punto del dominio.
- Representar: dominio, simetría, cortes, asíntotas, monotonía, curvatura y dibujo.
- Polinomio de grado 3: siempre una inflexión.

**Vocabulario:** curvatura, cóncava hacia arriba, cóncava hacia abajo, punto de inflexión, segunda derivada, función par e impar, representación gráfica.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, representa completa una función polinómica o racional sencilla siguiendo el guion.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de análisis del temario oficial de Matemáticas +25.
