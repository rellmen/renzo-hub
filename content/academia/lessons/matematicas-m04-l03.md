---
id: matematicas-m04-l03
course: matematicas
module: M04
level: N2
title: Ceros y signo de una función; inecuaciones de segundo grado y racionales
learning_objectives:
  - Calcular los ceros de funciones polinómicas y racionales
  - Construir una tabla de signos a partir de la factorización
  - Resolver inecuaciones de segundo grado, polinómicas y racionales con la tabla de signos
prerequisites: [matematicas-m04-l02, matematicas-m02-l02, matematicas-m02-l04]
skill_ids: [function_zeros, sign_table, polynomial_inequalities]
exam_alignment: [funciones]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Saber dónde una función vale cero y dónde es positiva o negativa es la base de casi todo el estudio de funciones: el dominio de una raíz ($\sqrt{x^2-4x}$ exige que el radicando sea no negativo), el crecimiento con derivadas (una función crece donde su derivada es positiva), las áreas con integrales (hay que saber si la curva está por encima o por debajo del eje) y las inecuaciones de grado 2 o superior. En esta lección aprenderás la **tabla de signos**, una herramienta sencilla que funciona para todos estos casos.

## 2. Lo que necesitas saber antes

- Dominio de funciones (M04-L02).
- Factorizar polinomios con Ruffini e identidades (M02-L01, M02-L02).
- Resolver ecuaciones de segundo grado (M02-L04) e inecuaciones lineales (M01-L05).

## 3. Idea intuitiva

Imagina la gráfica de una función continua como una carretera que sube y baja respecto al nivel del mar (el eje $X$). Solo puede pasar de estar por encima a estar por debajo **cruzando** el nivel del mar, es decir, en un cero. Por tanto, entre dos ceros consecutivos el signo no cambia. Si conoces los ceros, basta con comprobar el signo en **un** punto de cada tramo.

Con un producto, el signo es todavía más fácil: un producto es positivo si tiene un número par de factores negativos y negativo si tiene un número impar. Por eso factorizar convierte cualquier inecuación polinómica en un recuento de signos.

## 4. Definición precisa

- **Cero** (o raíz) de $f$: valor $x$ del dominio con $f(x)=0$. Es la abscisa de un punto de corte de la gráfica con el eje $X$.
- **Ceros de un cociente** $\dfrac{P}{Q}$: los ceros del numerador que **no** anulan el denominador.
- **Signo**: $f$ es positiva en un intervalo si $f(x)>0$ para todos sus puntos (gráfica por encima del eje $X$) y negativa si $f(x)<0$ (por debajo).

**Método de la tabla de signos:**
1. Calcula el dominio y factoriza $f$ al máximo.
2. Marca en la recta real los **ceros** y los puntos que **no están en el dominio** (ceros del denominador). Dividen la recta en intervalos.
3. Estudia el signo de cada factor en cada intervalo (o evalúa $f$ en un punto de prueba de cada intervalo).
4. Multiplica los signos.
5. Escribe la solución, cuidando los extremos: los ceros se incluyen si la desigualdad es $\ge$ o $\le$; los puntos fuera del dominio **nunca** se incluyen.

**Inecuaciones de segundo grado** $ax^2+bx+c>0$ (o $<$, $\ge$, $\le$):
- Si $\Delta>0$ con raíces $x_1<x_2$ y $a>0$: la parábola es positiva fuera de las raíces, $(-\infty,x_1)\cup(x_2,+\infty)$, y negativa entre ellas, $(x_1,x_2)$. Con $a<0$, al revés.
- Si $\Delta<0$: la parábola no corta al eje y tiene **siempre** el signo de $a$.
- Si $\Delta=0$: tiene el signo de $a$ en todas partes salvo en la raíz doble, donde vale 0.

**Multiplicidad.** En un factor elevado a un exponente par, como $(x-1)^2$, el signo **no cambia** al pasar por la raíz (la gráfica toca el eje y rebota). Con exponente impar, sí cambia. Esto evita errores en tablas de signos con factores repetidos.

**Por qué no se puede «pasar multiplicando» en una inecuación racional.** En $\dfrac{x-2}{x+1}\le0$, multiplicar por $x+1$ exigiría saber su signo, porque multiplicar por un negativo invierte la desigualdad (M01-L05). La tabla de signos evita ese problema: compara signos sin multiplicar.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Ceros de un polinomio
Calcula los ceros de $f(x)=x^3-4x$.

$x(x^2-4)=x(x-2)(x+2)=0$ → $x=0$, $x=2$, $x=-2$. La gráfica corta al eje $X$ en tres puntos.
:::

:::ejemplo Ejemplo 2 · Inecuación de segundo grado
Resuelve $(x+1)(x-3)>0$.

| | $(-\infty,-1)$ | $(-1,3)$ | $(3,+\infty)$ |
|---|---|---|---|
| $x+1$ | − | + | + |
| $x-3$ | − | − | + |
| producto | **+** | **−** | **+** |

Solución: $(-\infty,-1)\cup(3,+\infty)$. Los extremos no se incluyen porque la desigualdad es estricta.
:::

:::ejemplo Ejemplo 3 · Inecuación racional
Resuelve $\dfrac{x-2}{x+1}\le0$.

Puntos clave: $x=2$ (cero, se puede incluir) y $x=-1$ (fuera del dominio, nunca se incluye).

| | $(-\infty,-1)$ | $(-1,2)$ | $(2,+\infty)$ |
|---|---|---|---|
| $x-2$ | − | − | + |
| $x+1$ | − | + | + |
| cociente | + | **−** | + |

Solución: $(-1,2]$.
:::

:::error Error típico
Resolver $x^2>9$ como $x>3$ y olvidar la otra mitad: también cumple $x<-3$. Otro error: incluir en la solución un punto que anula el denominador, como $x=-1$ en el ejemplo 3, solo porque la desigualdad es $\le$.
:::

## 6. Ejercicio guiado

Resuelve $x^2-x-6<0$.

:::pista Primera pista
Factoriza: busca dos números que sumen $-1$ y multipliquen $-6$.
:::

:::pista Segunda pista
$(x-3)(x+2)$. Con $a=1>0$, la parábola es negativa **entre** las raíces.
:::

:::solucion Solución guiada
Raíces $-2$ y $3$; solución $(-2,3)$. Comprobación: $x=0$ da $-6<0$ ✔; $x=4$ da $6>0$ (fuera, correcto).
:::

## 7. Práctica

**Fáciles**

1. Ceros de $f(x)=2x-8$.
2. Ceros de $f(x)=x^2-5x$.
3. ¿Qué signo tiene $x^2+1$? Justifica.

**Medios**

4. Resuelve $x^2\ge9$.
5. Resuelve $\dfrac{x+4}{x-1}>0$.

**Tipo examen / transferencia**

6. (a) Calcula el dominio de $g(x)=\sqrt{x^2-4x}$. (b) Estudia el signo de $f(x)=x^3-x^2-6x$ e indica dónde su gráfica está por encima del eje $X$.

:::solucion Soluciones paso a paso
1. $x=4$.
2. $x(x-5)=0$ → $0$ y $5$.
3. Siempre positivo: $x^2\ge0$, así que $x^2+1\ge1>0$ ($\Delta<0$ y $a>0$).
4. $x^2-9\ge0$ → $(x-3)(x+3)\ge0$ → $(-\infty,-3]\cup[3,+\infty)$.
5. Puntos $-4$ y $1$; positivo fuera: $(-\infty,-4)\cup(1,+\infty)$.
6. (a) $x(x-4)\ge0$ → $(-\infty,0]\cup[4,+\infty)$. (b) $x(x^2-x-6)=x(x-3)(x+2)$. Signos: $(-\infty,-2)$ −; $(-2,0)$ +; $(0,3)$ −; $(3,+\infty)$ +. Por encima del eje en $(-2,0)\cup(3,+\infty)$.
:::

## 8. Cómo revisar tus errores

- Comprueba la tabla con un punto de prueba en cada intervalo.
- Marca con círculo vacío los puntos que no pertenecen al dominio.
- Recuerda el patrón de la parábola: con $a>0$, negativa entre raíces.
- Revisa factores al cuadrado: no cambian de signo.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Ceros: $f(x)=0$; en cocientes, solo los del numerador que no anulan el denominador.
- Tabla de signos: factorizar, marcar puntos clave, estudiar signos por intervalos.
- Cuadráticas: con $a>0$, positiva fuera de las raíces; con $\Delta<0$, signo de $a$.

**Vocabulario:** cero, raíz, signo, tabla de signos, punto de prueba, multiplicidad, inecuación racional.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una inecuación cuadrática y una racional con tabla de signos.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de funciones del temario oficial de Matemáticas +25; herramienta para dominios con raíces, monotonía (M08-L05) y áreas (M09).
