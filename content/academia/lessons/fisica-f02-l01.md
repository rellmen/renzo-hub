---
id: fisica-f02-l01
course: fisica
module: F02
level: N1
title: Posición, desplazamiento, velocidad y aceleración
learning_objectives:
  - Distinguir posición, desplazamiento y distancia recorrida
  - Calcular velocidad media y aceleración media con signo y unidades
  - Aplicar las ecuaciones del MRU y del MRUA a problemas de una dimensión
prerequisites: [fisica-f01-l01]
skill_ids: [kinematics_basic, mru, mrua]
exam_alignment: [cinematica]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/fisica/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La cinemática describe **cómo** se mueve algo sin preguntarse todavía **por qué**. Aquí aprenderás las cuatro magnitudes básicas del movimiento (posición, desplazamiento, velocidad y aceleración) y las ecuaciones del movimiento rectilíneo uniforme (MRU) y uniformemente acelerado (MRUA). Son la base de casi todos los problemas de mecánica del examen de Física +25: frenadas, lanzamientos, persecuciones y, más adelante, dinámica y energía.

## 2. Lo que necesitas saber antes

- Convertir unidades al SI (F01-L01): 72 km/h = 20 m/s.
- Resolver ecuaciones de primer grado y despejar una incógnita.
- Interpretar el signo: en una recta con un sentido positivo elegido, los valores negativos indican el sentido contrario.

## 3. Idea intuitiva

Imagina una carretilla en un pasillo recto. Pones un cero en la pared y decides que hacia la puerta es positivo. La **posición** dice dónde está la carretilla en cada instante (por ejemplo, $x=12$ m). Si va de 12 m a 30 m, su **desplazamiento** es $+18$ m. Si después vuelve a 20 m, el desplazamiento total desde el inicio es $+8$ m, pero la **distancia recorrida** es $18+10=28$ m. El desplazamiento solo mira el principio y el final; la distancia cuenta todo el camino.

La **velocidad** dice lo rápido que cambia la posición y en qué sentido. La **aceleración** dice lo rápido que cambia la velocidad. Un coche que pasa de 0 a 100 km/h en 5 segundos acelera más que uno que tarda 10 segundos.

## 4. Definición precisa

En movimiento rectilíneo, sobre un eje con origen y sentido positivo elegidos:

- **Posición** $x(t)$: coordenada del móvil en el instante $t$ (m).
- **Desplazamiento:** $\Delta x=x_f-x_i$ (m). Puede ser positivo, negativo o cero.
- **Distancia recorrida:** longitud total del camino, siempre positiva. Coincide con $|\Delta x|$ solo si el móvil no cambia de sentido.
- **Velocidad media:** $v_m=\dfrac{\Delta x}{\Delta t}$ (m/s). La **rapidez media** es distancia recorrida entre tiempo.
- **Aceleración media:** $a_m=\dfrac{\Delta v}{\Delta t}=\dfrac{v_f-v_i}{t_f-t_i}$ (m/s²).

**MRU (velocidad constante, $a=0$):**
$$x=x_0+v\,t$$

**MRUA (aceleración constante):**
$$v=v_0+a\,t\qquad x=x_0+v_0\,t+\tfrac12a\,t^2\qquad v^2=v_0^2+2a\,\Delta x$$

La tercera ecuación no contiene el tiempo: es útil cuando el enunciado no lo da ni lo pide.

**Signo de la aceleración.** Una aceleración negativa no siempre significa «frenar». El móvil frena cuando velocidad y aceleración tienen **signos opuestos**, y acelera cuando tienen el mismo signo. Un coche que va hacia la izquierda ($v<0$) y gana rapidez tiene $a<0$.

**Método para cualquier problema de cinemática:**
1. Dibuja el eje, el origen y el sentido positivo.
2. Escribe los datos con signo y en SI: $x_0$, $v_0$, $a$, $t$.
3. Identifica la incógnita y elige la ecuación que la relaciona con los datos.
4. Resuelve y comprueba unidades y sentido físico.

**Velocidad media frente a velocidad instantánea.** La velocidad media resume un intervalo entero; la **instantánea** es la que marca el velocímetro en un momento concreto, y se obtiene haciendo el intervalo cada vez más pequeño. En el MRU ambas coinciden siempre. En el MRUA no: un coche que acelera de 0 a 20 m/s tiene una velocidad media de 10 m/s, aunque en ningún instante salvo uno marque exactamente 10 m/s. Cuando más adelante estudies derivadas (M08), verás que la velocidad instantánea es la derivada de la posición respecto al tiempo.

**Por qué $x=x_0+v_0t+\tfrac12at^2$.** En el MRUA la velocidad crece de forma lineal desde $v_0$ hasta $v$, así que la velocidad media es la media de ambas: $\dfrac{v_0+v}{2}$. Multiplicando por $t$ y sustituyendo $v=v_0+at$ se obtiene $\Delta x=v_0t+\tfrac12at^2$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Velocidad media frente a rapidez media
Un operario camina 40 m hacia el norte en 50 s y vuelve 10 m hacia el sur en 10 s. Calcula su velocidad media y su rapidez media (norte positivo).

1. $\Delta x=+40-10=+30$ m; $\Delta t=60$ s → $v_m=0{,}5$ m/s hacia el norte.
2. Distancia: $50$ m → rapidez media $\dfrac{50}{60}\approx0{,}83$ m/s.
:::

:::ejemplo Ejemplo 2 · Frenada (MRUA)
Un coche circula a 72 km/h y frena con aceleración constante hasta pararse en 4 s. Calcula la aceleración y la distancia de frenado.

1. SI: $v_0=20$ m/s, $v=0$, $t=4$ s.
2. $a=\dfrac{0-20}{4}=-5$ m/s² (signo opuesto a $v$: frena).
3. $\Delta x=20\cdot4+\tfrac12(-5)\cdot16=80-40=40$ m.
Comprobación con la ecuación sin tiempo: $0=400+2(-5)\Delta x$ → $\Delta x=40$ m. ✔
:::

:::ejemplo Ejemplo 3 · Encuentro de dos móviles (MRU)
Dos carretillas están separadas 60 m y avanzan una hacia la otra a 2 m/s y 1 m/s. ¿Cuándo y dónde se cruzan?

Origen en la primera, sentido hacia la segunda: $x_1=2t$, $x_2=60-1\cdot t$. Igualando: $2t=60-t$ → $t=20$ s; $x=40$ m desde la primera.
:::

:::error Error típico
Mezclar unidades: sustituir $v_0=72$ (km/h) con $t$ en segundos da resultados absurdos. Convierte primero. Otro error: tomar $a=+5$ m/s² en una frenada cuando la velocidad es positiva; el resultado sería una distancia que crece sin parar.
:::

## 6. Ejercicio guiado

Una cinta de un aeropuerto arranca desde el reposo y alcanza 1,8 m/s en 3 s con aceleración constante. Calcula la aceleración y la distancia que avanza una maleta en esos 3 s.

:::pista Primera pista
Datos en SI: $v_0=0$, $v=1{,}8$ m/s, $t=3$ s. Usa $a=\dfrac{\Delta v}{\Delta t}$.
:::

:::pista Segunda pista
Con $a$ conocida, usa $\Delta x=v_0t+\tfrac12at^2$.
:::

:::solucion Solución guiada
$a=\dfrac{1{,}8}{3}=0{,}6$ m/s². $\Delta x=0+\tfrac12\cdot0{,}6\cdot9=2{,}7$ m.
Comprobación con la velocidad media: $\dfrac{0+1{,}8}{2}\cdot3=2{,}7$ m. ✔
:::

## 7. Práctica

**Fáciles**

1. Una cinta avanza a 1,5 m/s durante 40 s. ¿Qué distancia recorre?
2. Un móvil pasa de 5 m/s a 17 m/s en 4 s. Calcula su aceleración media.
3. Un objeto parte del reposo con $a=3$ m/s². ¿Qué distancia recorre en 2 s?

**Medios**

4. Un tren a 30 m/s frena con $a=-1{,}5$ m/s². ¿Cuánto tarda en pararse y qué distancia recorre?
5. Una furgoneta acelera de 10 m/s a 30 m/s en 100 m. ¿Cuál es su aceleración?

**Tipo examen / transferencia**

6. Un coche está parado en un semáforo. Cuando se pone verde, arranca con $a=2$ m/s²; en ese instante le adelanta un camión a 10 m/s constantes. ¿Cuándo alcanza el coche al camión y a qué distancia del semáforo? ¿Qué velocidad lleva entonces el coche?

:::solucion Soluciones paso a paso
1. $1{,}5\cdot40=60$ m.
2. $\dfrac{17-5}{4}=3$ m/s².
3. $\tfrac12\cdot3\cdot4=6$ m.
4. $0=30-1{,}5t$ → $t=20$ s. $\Delta x=30\cdot20-\tfrac12\cdot1{,}5\cdot400=600-300=300$ m.
5. $900=100+2a\cdot100$ → $a=\dfrac{800}{200}=4$ m/s².
6. Coche: $x_c=t^2$; camión: $x_k=10t$. $t^2=10t$ → $t=0$ (salida) o $t=10$ s. Posición $x=100$ m. Velocidad del coche $v=2\cdot10=20$ m/s (72 km/h). Comprobación: camión $10\cdot10=100$ m. ✔
:::

## 8. Cómo revisar tus errores

- ¿Están todos los datos en SI y con signo según el eje elegido?
- ¿El signo de la aceleración es coherente con que el móvil frene o acelere?
- Comprueba con una segunda ecuación (por ejemplo, la velocidad media) cuando sea posible.
- Estimación física: una frenada urbana de 40 m es razonable; una de 4 km, no.
- Escribe la unidad en el resultado final.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $\Delta x=x_f-x_i$; distancia recorrida $\ge|\Delta x|$.
- $v_m=\dfrac{\Delta x}{\Delta t}$; $a_m=\dfrac{\Delta v}{\Delta t}$.
- MRU: $x=x_0+vt$. MRUA: $v=v_0+at$, $x=x_0+v_0t+\tfrac12at^2$, $v^2=v_0^2+2a\Delta x$.
- Frena si $v$ y $a$ tienen signos opuestos.

**Vocabulario:** sistema de referencia, posición, desplazamiento, trayectoria, velocidad media, rapidez, aceleración, MRU, MRUA.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una frenada y un problema de encuentro, comprobando con dos ecuaciones distintas.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N1–N2 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de cinemática del temario oficial de Física +25; continúa con gráficas $x$–$t$ y $v$–$t$ (F02-L03) y tiro parabólico (F02-L04).
