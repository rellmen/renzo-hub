---
id: matematicas-m04-l08
course: matematicas
module: M04
level: N2
title: Tasa de variación media e instantánea
learning_objectives:
  - Calcular la tasa de variación media de una función en un intervalo e interpretarla con unidades
  - Interpretar la tasa de variación media como pendiente de la recta secante
  - Aproximar la tasa de variación instantánea con intervalos cada vez más pequeños como paso previo a la derivada
prerequisites: [matematicas-m04-l01, matematicas-m08-l01]
skill_ids: [rate_of_change]
exam_alignment: [funciones, analisis]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

¿Cuánto ha crecido la producción por hora entre las 8 y las 12? ¿A qué velocidad media iba un vehículo? ¿Cuánto cuesta de media cada unidad adicional? Todas estas preguntas se responden con la **tasa de variación media**: cuánto cambia una magnitud por cada unidad que cambia otra. Esta lección cierra el bloque de funciones y abre el de derivadas: la derivada (M08-L02) no es más que la tasa de variación media en un intervalo infinitamente pequeño.

## 2. Lo que necesitas saber antes

- Pendiente de una recta $m=\dfrac{\Delta y}{\Delta x}$ (M04-L01).
- Evaluar funciones y simplificar expresiones con identidades notables (M02-L01).
- Límites sencillos (M08-L01).

## 3. Idea intuitiva

Un coche recorre 120 km en 2 horas: su velocidad media es 60 km/h. No significa que fuera siempre a 60: quizá estuvo parado en un semáforo y luego fue a 90. La velocidad media resume el intervalo completo con un solo número. Gráficamente, es la pendiente de la recta que une el punto inicial y el final de la gráfica posición–tiempo.

Si el intervalo se hace más corto (una hora, un minuto, un segundo), la velocidad media se parece cada vez más a lo que marca el velocímetro en ese instante. Ese valor límite es la **velocidad instantánea**.

## 4. Definición precisa

- **Tasa de variación** de $f$ en $[a,b]$: $\Delta f=f(b)-f(a)$. Indica cuánto ha cambiado la función en total.
- **Tasa de variación media** (TVM):
$$\text{TVM}_{[a,b]}=\frac{f(b)-f(a)}{b-a}.$$
  Sus unidades son «unidades de $f$ por unidad de $x$» (km/h, €/unidad, °C/hora).
- **Interpretación geométrica**: la TVM es la pendiente de la **recta secante** que pasa por $(a,f(a))$ y $(b,f(b))$.
- **Signo**: TVM $>0$ indica que, en conjunto, la función ha aumentado en el intervalo; TVM $<0$, que ha disminuido; TVM $=0$, que empieza y acaba en el mismo valor (aunque haya subido y bajado entre medias).
- **Funciones lineales**: la TVM es la misma en cualquier intervalo e igual a la pendiente. Una TVM que depende del intervalo indica una función no lineal.
- **Tasa de variación instantánea** en $x=a$: límite de la TVM en $[a,a+h]$ cuando $h\to0$:
$$\lim_{h\to0}\frac{f(a+h)-f(a)}{h}.$$
  Gráficamente, la secante se convierte en la **recta tangente**. Este límite es la **derivada** $f'(a)$ (M08-L02).

**Cálculo con $h$.** Para calcular la tasa instantánea a partir de la definición: (1) calcula $f(a+h)$ desarrollando; (2) resta $f(a)$; (3) divide entre $h$ y simplifica (la $h$ del denominador debe desaparecer); (4) haz $h\to0$.

**TVM en contextos económicos.** Si $C(q)$ es el coste de producir $q$ unidades, la TVM entre $q_1$ y $q_2$ es el coste medio de cada unidad adicional en ese tramo. Las empresas lo usan para decidir si ampliar la producción. La tasa instantánea se llama **coste marginal**.

**Por qué la media puede engañar.** Una TVM de 0 en un día de temperatura no significa que la temperatura no cambiara: puede subir 15 grados por la mañana y bajar 15 por la tarde. La TVM solo compara el principio y el final; para saber qué pasa entre medias hay que mirar intervalos más pequeños, que es exactamente lo que hace la derivada.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · TVM de una parábola
Calcula la TVM de $f(x)=x^2$ en $[1,3]$ y en $[3,5]$.

1. $[1,3]$: $\dfrac{9-1}{2}=4$.
2. $[3,5]$: $\dfrac{25-9}{2}=8$.

La TVM cambia según el intervalo: $x^2$ no es lineal y crece cada vez más deprisa.
:::

:::ejemplo Ejemplo 2 · Velocidad media
Un objeto recorre $s(t)=5t^2$ metros en $t$ segundos. Calcula su velocidad media entre $t=2$ y $t=4$.

$\dfrac{s(4)-s(2)}{4-2}=\dfrac{80-20}{2}=30$ m/s.
:::

:::ejemplo Ejemplo 3 · De la media a la instantánea
Calcula la tasa de variación instantánea de $f(x)=x^2$ en $x=2$.

1. $\text{TVM}_{[2,2+h]}=\dfrac{(2+h)^2-4}{h}=\dfrac{4+4h+h^2-4}{h}=\dfrac{4h+h^2}{h}=4+h$.
2. Con $h=0{,}1$: 4,1; con $h=0{,}01$: 4,01.
3. Cuando $h\to0$: **4**. Es la pendiente de la tangente en $(2,4)$.
:::

:::error Error típico
Calcular $\dfrac{f(b)-f(a)}{b-a}$ restando en órdenes distintos arriba y abajo, lo que cambia el signo. Otro error: dar la TVM sin unidades o interpretarla como el valor de la función en lugar de su ritmo de cambio.
:::

## 6. Ejercicio guiado

El coste de producir $q$ unidades es $C(q)=0{,}5q^2+10q+100$ euros. Calcula el coste medio de cada unidad adicional al pasar de 10 a 20 unidades.

:::pista Primera pista
Calcula $C(10)$ y $C(20)$.
:::

:::pista Segunda pista
$C(10)=50+100+100=250$ y $C(20)=200+200+100=500$.
:::

:::solucion Solución guiada
$\text{TVM}=\dfrac{500-250}{20-10}=25$ €/unidad. Cada una de esas 10 unidades adicionales cuesta, de media, 25 €.
:::

## 7. Práctica

**Fáciles**

1. TVM de $f(x)=3x+2$ en $[0,5]$.
2. TVM de $f(x)=x^3$ en $[1,2]$.
3. Una ciudad tenía 40.000 habitantes en 2015 y 46.000 en 2025. Calcula el crecimiento medio anual.

**Medios**

4. TVM de $f(x)=\dfrac1x$ en $[1,4]$. Interpreta el signo.
5. Calcula la tasa de variación instantánea de $f(x)=x^2+x$ en $x=1$ con la definición.

**Tipo examen / transferencia**

6. La temperatura de una nave entre las 0 y las 12 horas es $T(t)=-0{,}5t^2+6t+10$ (°C, $t$ en horas). Calcula la TVM en $[0,4]$ y en $[8,12]$, interpreta los resultados y explica qué ocurre con la TVM en $[0,12]$.

:::solucion Soluciones paso a paso
1. $\dfrac{17-2}{5}=3$ (igual a la pendiente).
2. $\dfrac{8-1}{1}=7$.
3. $\dfrac{6000}{10}=600$ habitantes/año.
4. $\dfrac{\frac14-1}{3}=-\dfrac14$: en conjunto, la función disminuye en ese intervalo.
5. $\dfrac{(1+h)^2+(1+h)-2}{h}=\dfrac{3h+h^2}{h}=3+h$ → $3$.
6. $T(0)=10$, $T(4)=26$, $T(8)=26$, $T(12)=10$. $[0,4]$: $+4$ °C/h (se calienta). $[8,12]$: $-4$ °C/h (se enfría). En $[0,12]$ la TVM es 0, aunque la temperatura subió y bajó 16 grados: la media oculta lo que ocurre dentro del intervalo.
:::

## 8. Cómo revisar tus errores

- Resta en el mismo orden arriba y abajo: $f(b)-f(a)$ entre $b-a$.
- Escribe siempre las unidades.
- En la definición con $h$, la $h$ del denominador debe simplificarse antes de hacer $h\to0$.
- Comprueba con un valor pequeño de $h$, como 0,01.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- TVM $=\dfrac{f(b)-f(a)}{b-a}$: pendiente de la secante, ritmo medio de cambio.
- Funciones lineales: TVM constante.
- Tasa instantánea: límite de la TVM cuando el intervalo tiende a 0 → derivada.

**Vocabulario:** tasa de variación, tasa de variación media, recta secante, tasa de variación instantánea, recta tangente, coste marginal.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, calcula una TVM con unidades en un contexto real y una tasa instantánea con la definición.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (1.º Bachillerato). Alineado con los bloques de funciones y análisis del temario oficial de Matemáticas +25; puente directo hacia la derivada (M08-L02).
