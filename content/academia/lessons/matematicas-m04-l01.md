---
id: matematicas-m04-l01
course: matematicas
module: M04
level: N2
title: Plano cartesiano, funciones lineales y cuadráticas
learning_objectives:
  - Representar puntos y leer coordenadas en el plano cartesiano
  - Interpretar pendiente y ordenada en el origen de una recta y obtener su ecuación
  - Representar una parábola a partir de su vértice, eje y puntos de corte
prerequisites: [matematicas-m01-l02, matematicas-m02-l01]
skill_ids: [cartesian_plane, linear_function, quadratic_function]
exam_alignment: [funciones]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una función describe cómo cambia una cantidad cuando cambia otra: el coste según los kilos, la posición según el tiempo, el beneficio según el precio. En esta lección aprenderás a dibujar y leer los dos tipos de función más usados: la **lineal** (recta) y la **cuadrática** (parábola). En el examen de Matemáticas +25 aparecen al estudiar funciones, al calcular áreas entre curvas con integrales, al optimizar y al interpretar enunciados con gráficas. Saber esbozarlas a mano permite comprobar si un resultado tiene sentido.

## 2. Lo que necesitas saber antes

- Resolver ecuaciones de primer grado (M01-L02).
- Factorizar trinomios y reconocer identidades (M02-L01): $x^2-4x+3=(x-1)(x-3)$.
- Sustituir valores negativos entre paréntesis: si $x=-2$, $x^2=4$.

## 3. Idea intuitiva

El **plano cartesiano** es un mapa con dos calles perpendiculares: el eje horizontal $X$ y el vertical $Y$. Un punto $(3,-2)$ significa «3 pasos a la derecha y 2 hacia abajo». Una función asigna a cada $x$ un único valor $y$; si dibujas todos los pares $(x,y)$, obtienes su gráfica.

En una **recta**, cada paso hacia la derecha sube (o baja) siempre lo mismo. Ese «cuánto sube por paso» es la **pendiente**. Si una tarifa cuesta 5 € fijos más 2 € por kilo, cada kilo añade 2 € (pendiente 2) y con 0 kilos ya pagas 5 € (ordenada en el origen 5).

En una **parábola**, el cambio no es constante: crece cada vez más rápido o frena y da la vuelta. Tiene un punto de giro, el **vértice**, y es simétrica respecto a una recta vertical que pasa por él, el **eje**.

## 4. Definición precisa

**Función lineal (afín):** $f(x)=mx+n$.
- $m$ es la **pendiente**: $m=\dfrac{y_2-y_1}{x_2-x_1}$ para dos puntos cualesquiera de la recta. Si $m>0$ la recta crece, si $m<0$ decrece, si $m=0$ es horizontal.
- $n$ es la **ordenada en el origen**: el punto de corte con el eje $Y$ es $(0,n)$.
- Corte con el eje $X$: se resuelve $mx+n=0$, es decir, $x=-\dfrac{n}{m}$ (si $m\neq0$).
- Ecuación punto–pendiente: la recta de pendiente $m$ que pasa por $(x_0,y_0)$ es $y-y_0=m(x-x_0)$.

**Función cuadrática:** $f(x)=ax^2+bx+c$ con $a\neq0$. Su gráfica es una **parábola**.
- Si $a>0$ se abre hacia arriba (forma de U, el vértice es un mínimo); si $a<0$, hacia abajo (el vértice es un máximo).
- **Vértice:** $x_v=-\dfrac{b}{2a}$ y $y_v=f(x_v)$. El **eje de simetría** es la recta $x=x_v$.
- Corte con el eje $Y$: $(0,c)$.
- Cortes con el eje $X$: soluciones de $ax^2+bx+c=0$. Puede haber dos, uno (el vértice toca el eje) o ninguno.

**Por qué $x_v=-\dfrac{b}{2a}$.** Si la parábola corta al eje $X$ en $x_1$ y $x_2$, por simetría el vértice está justo en medio: $x_v=\dfrac{x_1+x_2}{2}$. Como la suma de las raíces de $ax^2+bx+c$ es $-\dfrac{b}{a}$, la media es $-\dfrac{b}{2a}$. La fórmula sigue siendo válida aunque no haya cortes.

**Procedimiento para esbozar una parábola:** (1) signo de $a$; (2) vértice; (3) corte con $Y$ y su simétrico respecto al eje; (4) cortes con $X$ si existen; (5) une los puntos con una curva suave, nunca con segmentos rectos.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Recta que pasa por dos puntos
Halla la ecuación de la recta que pasa por $A(1,3)$ y $B(4,9)$ y sus cortes con los ejes.

1. Pendiente: $m=\dfrac{9-3}{4-1}=\dfrac{6}{3}=2$.
2. Punto–pendiente con $A$: $y-3=2(x-1)$ → $y=2x+1$.
3. Corte con $Y$: $(0,1)$. Corte con $X$: $2x+1=0$ → $x=-\dfrac{1}{2}$, punto $\left(-\dfrac{1}{2},0\right)$.

Comprobación con $B$: $2\cdot4+1=9$. ✔
:::

:::ejemplo Ejemplo 2 · Parábola completa
Estudia $f(x)=x^2-4x+3$.

1. $a=1>0$: abre hacia arriba, el vértice es un mínimo.
2. Vértice: $x_v=-\dfrac{-4}{2}=2$, $y_v=4-8+3=-1$ → $V(2,-1)$. Eje $x=2$.
3. Corte con $Y$: $(0,3)$; su simétrico respecto a $x=2$ es $(4,3)$.
4. Cortes con $X$: $x^2-4x+3=(x-1)(x-3)=0$ → $(1,0)$ y $(3,0)$, a la misma distancia del eje. ✔
:::

:::ejemplo Ejemplo 3 · Modelo con máximo
El beneficio diario de una tienda, en euros, es $B(p)=-2p^2+40p-150$, con $p$ el precio en euros. ¿Qué precio maximiza el beneficio y cuál es?

$a=-2<0$, hay máximo en $p_v=-\dfrac{40}{2(-2)}=10$ €. $B(10)=-200+400-150=50$ €.
:::

:::error Error típico
Calcular la pendiente restando en órdenes distintos: $\dfrac{9-3}{1-4}=-2$ es **incorrecto**. Si arriba restas $B-A$, abajo también $B-A$. Otro error: en $f(x)=-x^2+2x$ calcular $f(3)$ como $9+6$; lo correcto es $-(3)^2+2\cdot3=-9+6=-3$.
:::

## 6. Ejercicio guiado

Estudia $g(x)=-x^2+2x+8$: orientación, vértice, cortes y esbozo.

:::pista Primera pista
$a=-1$. Usa $x_v=-\dfrac{b}{2a}$ con $b=2$.
:::

:::pista Segunda pista
Para los cortes con $X$, multiplica por $-1$: $x^2-2x-8=0$. Busca dos números que sumen $-2$ y multipliquen $-8$.
:::

:::solucion Solución guiada
Abre hacia abajo. $x_v=-\dfrac{2}{-2}=1$, $g(1)=-1+2+8=9$ → máximo $V(1,9)$. Corte $Y$: $(0,8)$, simétrico $(2,8)$. Cortes $X$: $(x-4)(x+2)=0$ → $(-2,0)$ y $(4,0)$, a 3 unidades del eje $x=1$. ✔
:::

## 7. Práctica

**Fáciles**

1. ¿En qué cuadrante está el punto $(-3,5)$?
2. Calcula la pendiente de la recta que pasa por $(2,-1)$ y $(6,7)$.
3. Indica pendiente y ordenada en el origen de $y=-3x+4$, y si crece o decrece.

**Medios**

4. Halla la ecuación de la recta de pendiente $-2$ que pasa por $(3,1)$.
5. Halla el vértice y los cortes con los ejes de $f(x)=x^2+2x-8$.

**Tipo examen / transferencia**

6. Una empresa de alquiler cobra 20 € fijos y 0,25 € por kilómetro; otra cobra 0,45 € por kilómetro sin cuota fija. Escribe ambas funciones, calcula a partir de cuántos kilómetros es más barata la primera y justifica con la gráfica.

:::solucion Soluciones paso a paso
1. $x<0$, $y>0$: segundo cuadrante.
2. $m=\dfrac{7-(-1)}{6-2}=\dfrac{8}{4}=2$.
3. $m=-3$ (decrece), $n=4$, corta al eje $Y$ en $(0,4)$.
4. $y-1=-2(x-3)$ → $y=-2x+7$.
5. $x_v=-1$, $f(-1)=1-2-8=-9$ → $V(-1,-9)$. Corte $Y$: $(0,-8)$. $(x+4)(x-2)=0$ → $(-4,0)$ y $(2,0)$.
6. $A(k)=20+0{,}25k$, $B(k)=0{,}45k$. Iguales cuando $20+0{,}25k=0{,}45k$ → $20=0{,}2k$ → $k=100$ km. Para $k>100$ la recta $B$ (más pendiente) queda por encima: la primera es más barata a partir de 100 km. Comprobación con 200 km: $A=70$ €, $B=90$ €. ✔
:::

## 8. Cómo revisar tus errores

- Sustituye un punto conocido en la ecuación que has obtenido: debe cumplirla.
- En una parábola, los cortes con el eje $X$ deben estar a la misma distancia del eje de simetría. Si no lo están, hay un error.
- Comprueba el signo de $a$ antes de decir si el vértice es máximo o mínimo.
- Al dibujar, marca al menos cinco puntos: vértice, corte con $Y$ y su simétrico, y cortes con $X$ (o dos puntos más si no existen).

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Recta: $y=mx+n$; $m=\dfrac{\Delta y}{\Delta x}$; $y-y_0=m(x-x_0)$.
- Parábola: $y=ax^2+bx+c$; $a>0$ mínimo, $a<0$ máximo; $x_v=-\dfrac{b}{2a}$; eje $x=x_v$.
- Cortes: con $Y$ haciendo $x=0$; con $X$ resolviendo $f(x)=0$.

**Vocabulario:** abscisa, ordenada, cuadrante, pendiente, ordenada en el origen, parábola, vértice, eje de simetría.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, esboza una parábola con $a<0$ y una recta que pase por dos puntos dados, y comprueba sustituyendo.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de funciones del temario oficial de Matemáticas +25; preparación para dominio y recorrido (M04-L02), derivadas (M08) y áreas (M09).
