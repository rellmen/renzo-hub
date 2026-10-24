---
id: matematicas-m02-l02
course: matematicas
module: M02
level: N1
title: Polinomios, división, regla de Ruffini y raíces
learning_objectives:
  - Operar con polinomios (suma, producto, valor numérico) y dividirlos por el método largo
  - Aplicar la regla de Ruffini y el teorema del resto para dividir entre (x − a)
  - Encontrar raíces enteras y factorizar polinomios de grado 3 o 4
prerequisites: [matematicas-m02-l01]
skill_ids: [polynomial_ops, ruffini, polynomial_roots]
exam_alignment: [algebra]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Los polinomios son las funciones más sencillas y más usadas del examen: rectas, parábolas, cúbicas. Saber **dividirlos** y **encontrar sus raíces** permite factorizarlos, y con la factorización se resuelven ecuaciones de grado 3 o 4, se simplifican fracciones algebraicas (M02-L03), se estudia el signo de una función y se calculan límites del tipo $\tfrac{0}{0}$ (M08-L01). La regla de Ruffini es una de las herramientas que más tiempo ahorra en el examen.

## 2. Lo que necesitas saber antes

- Identidades notables y factor común (M02-L01).
- Operar con enteros y potencias (M00-L01, M00-L06).
- Divisores de un número entero (M00-L02): los divisores de 6 son $\pm1,\pm2,\pm3,\pm6$.

## 3. Idea intuitiva

Dividir polinomios es como dividir números: $17:5$ da cociente 3 y resto 2 porque $17=5\cdot3+2$. Con polinomios ocurre lo mismo, cambiando «unidades» por «potencias de $x$».

Una **raíz** de un polinomio es un número que lo anula. Si $a$ es raíz, el polinomio «contiene» el factor $(x-a)$, igual que si 3 divide a 12, entonces $12=3\cdot4$. Encontrar raíces es, por tanto, encontrar factores. Y la regla de Ruffini es una forma rápida de hacer esa división cuando el divisor es de la forma $x-a$.

## 4. Definición precisa

- **Polinomio** en $x$: $P(x)=a_nx^n+\dots+a_1x+a_0$, con $a_n\neq0$. **Grado**: $n$. **Coeficiente principal**: $a_n$. **Término independiente**: $a_0$.
- **Valor numérico** $P(a)$: resultado de sustituir $x=a$.
- **Suma**: se suman los coeficientes de los términos del mismo grado. **Producto**: cada término por cada término (distributiva) y se reducen semejantes. El grado del producto es la suma de grados.
- **División** $P(x):D(x)$: existen un cociente $Q(x)$ y un resto $R(x)$ únicos con
$$P(x)=D(x)\cdot Q(x)+R(x),\qquad \text{grado}(R)<\text{grado}(D).$$
  Método largo: dividir el término de mayor grado de $P$ entre el de $D$, multiplicar, restar y repetir. **Escribe ceros** para los grados que falten.
- **Regla de Ruffini** (divisor $x-a$): se escriben los coeficientes de $P$ (con ceros), se baja el primero, se multiplica por $a$, se suma al siguiente, y así sucesivamente. El último número es el resto; los anteriores, los coeficientes del cociente (un grado menos).
- **Teorema del resto**: el resto de dividir $P(x)$ entre $x-a$ es $P(a)$.
- **Teorema del factor**: $a$ es raíz de $P$ $\iff$ $P(a)=0$ $\iff$ $(x-a)$ divide a $P(x)$.
- **Raíces enteras**: si los coeficientes son enteros, toda raíz entera es **divisor del término independiente**. Se prueban esos candidatos (empezando por $\pm1$, $\pm2$).
- Un polinomio de grado $n$ tiene como máximo $n$ raíces reales.

**Estrategia para factorizar un polinomio de grado 3 o 4:** (1) saca factor común si lo hay; (2) busca una raíz entera entre los divisores del término independiente; (3) divide por Ruffini; (4) repite con el cociente o, si es de grado 2, usa identidades, suma–producto o la fórmula de segundo grado (M02-L04).

**Raíces y gráfica.** Las raíces reales de $P(x)$ son los puntos donde la gráfica de $y=P(x)$ corta al eje horizontal. Por eso, factorizar un polinomio te dice dónde cambia de signo, algo que usarás al estudiar funciones y derivadas.

**Por qué funciona el teorema del resto.** De $P(x)=(x-a)Q(x)+R$, sustituyendo $x=a$: $P(a)=0\cdot Q(a)+R=R$. Una sola línea explica por qué basta un valor numérico para conocer el resto.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · División larga con hueco
Divide $P(x)=x^3-2x^2+4$ entre $D(x)=x^2+1$.

1. Escribe $P$ con todos los grados: $x^3-2x^2+0x+4$.
2. $x^3:x^2=x$; $x(x^2+1)=x^3+x$; restando: $-2x^2-x+4$.
3. $-2x^2:x^2=-2$; $-2(x^2+1)=-2x^2-2$; restando: $-x+6$.
4. Grado del resto (1) < grado del divisor (2): fin.

$Q(x)=x-2$, $R(x)=-x+6$. Comprobación: $(x^2+1)(x-2)+(-x+6)=x^3-2x^2+x-2-x+6=x^3-2x^2+4$. ✔
:::

:::ejemplo Ejemplo 2 · Ruffini y factorización
Factoriza $P(x)=2x^3+x^2-5x+2$.

1. Candidatos (divisores de 2): $\pm1,\pm2$. $P(1)=2+1-5+2=0$ → $x=1$ es raíz.
2. Ruffini con $a=1$ sobre $2,\ 1,\ -5,\ 2$: bajas 2; $2\cdot1+1=3$; $3\cdot1-5=-2$; $-2\cdot1+2=0$. Cociente $2x^2+3x-2$, resto 0.
3. $2x^2+3x-2=(2x-1)(x+2)$ (raíces $\tfrac12$ y $-2$).

**$P(x)=(x-1)(2x-1)(x+2)$.** Raíces: $1$, $\tfrac12$, $-2$.
:::

:::ejemplo Ejemplo 3 · Teorema del resto
Calcula el resto de dividir $x^4-3x^2+2x-5$ entre $x+2$.

$x+2=x-(-2)$ → resto $=P(-2)=16-12-4-5=-5$.
:::

:::error Error típico
En Ruffini, olvidar los ceros de los grados que faltan: $x^3-7x+6$ tiene coeficientes $1,\ 0,\ -7,\ 6$, no $1,\ -7,\ 6$. Otro error: dividir entre $x+2$ usando $a=2$; el divisor $x+2$ corresponde a $a=-2$.
:::

## 6. Ejercicio guiado

Halla $k$ para que $x^3+kx^2-4x+12$ sea divisible por $x-2$ y factoriza el polinomio resultante.

:::pista Primera pista
Divisible por $x-2$ significa resto 0, es decir, $P(2)=0$.
:::

:::pista Segunda pista
$8+4k-8+12=0$. Despeja $k$ y después factoriza agrupando términos de dos en dos.
:::

:::solucion Solución guiada
$4k+12=0$ → $k=-3$. $x^3-3x^2-4x+12=x^2(x-3)-4(x-3)=(x-3)(x^2-4)=(x-3)(x-2)(x+2)$. Comprobación: $P(2)=8-12-8+12=0$. ✔
:::

## 7. Práctica

**Fáciles**

1. Indica grado, coeficiente principal y término independiente de $P(x)=-4x^3+x-9$.
2. Calcula $(x^2-3x+2)+(2x^2+x-5)$ y $(x-2)(x^2+x+1)$.
3. Calcula $P(2)$ si $P(x)=x^3-4x+1$.

**Medios**

4. Divide por Ruffini $(x^3-7x+6):(x-2)$ y factoriza.
5. Sin dividir, calcula el resto de $(2x^3-x+4):(x+1)$.

**Tipo examen / transferencia**

6. Factoriza $x^3-x^2-9x+9$ y resuelve la ecuación $x^3-x^2-9x+9=0$. Explica por qué solo hay que probar divisores de 9 como raíces enteras.

:::solucion Soluciones paso a paso
1. Grado 3, coeficiente principal $-4$, término independiente $-9$.
2. $3x^2-2x-3$; $x^3+x^2+x-2x^2-2x-2=x^3-x^2-x-2$.
3. $8-8+1=1$.
4. Coeficientes $1,\ 0,\ -7,\ 6$ con $a=2$: $1,\ 2,\ -3,\ 0$. Cociente $x^2+2x-3=(x+3)(x-1)$. $P=(x-2)(x-1)(x+3)$.
5. Resto $=P(-1)=-2+1+4=3$.
6. Agrupando: $x^2(x-1)-9(x-1)=(x-1)(x-3)(x+3)$. Soluciones $1,\ 3,\ -3$. Si $a$ entero es raíz, $a^3-a^2-9a=-9$, y como $a$ divide al miembro izquierdo, también divide a $-9$.
:::

## 8. Cómo revisar tus errores

- Comprueba la división con $P=D\cdot Q+R$, o sustituyendo un valor como $x=1$.
- Verifica cada raíz sustituyéndola en el polinomio original.
- Cuenta: un polinomio de grado $n$ factorizado tiene factores cuyos grados suman $n$.
- En Ruffini, revisa el signo de $a$ y los ceros de los huecos.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $P=D\cdot Q+R$ con grado$(R)<$ grado$(D)$.
- Ruffini para dividir entre $x-a$; resto $=P(a)$.
- Raíz $a$ ⇔ factor $(x-a)$; raíces enteras entre los divisores del término independiente.

**Vocabulario:** grado, coeficiente principal, término independiente, cociente, resto, raíz, regla de Ruffini, teorema del resto, teorema del factor.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, factoriza un polinomio de grado 3 buscando una raíz entera y comprueba el resultado con $x=1$.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N1–N2 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; base de fracciones algebraicas (M02-L03), ecuaciones de grado superior y límites (M08).
