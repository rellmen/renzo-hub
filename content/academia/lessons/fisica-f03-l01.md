---
id: fisica-f03-l01
course: fisica
module: F03
level: N2
title: Las tres leyes de Newton
learning_objectives:
  - Enunciar e interpretar las tres leyes de Newton con ejemplos cotidianos
  - Aplicar la segunda ley para calcular fuerza neta, masa o aceleración
  - Identificar pares de acción y reacción y distinguirlos de fuerzas que se equilibran
prerequisites: [fisica-f02-l01, fisica-f01-l01]
skill_ids: [newton_laws, net_force]
exam_alignment: [dinamica]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/fisica/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

La cinemática describe el movimiento; la **dinámica** explica su causa: las fuerzas. Las tres leyes de Newton son el núcleo de toda la mecánica que entra en el examen de Física +25: planos inclinados, poleas, rozamiento, movimiento circular, gravitación. En esta lección aprenderás qué dice cada ley, cómo usar la segunda ($\vec F=m\vec a$) para calcular y cómo evitar las confusiones más típicas, sobre todo con la tercera ley.

## 2. Lo que necesitas saber antes

- Unidades SI y conversiones (F01-L01).
- Aceleración y ecuaciones del MRUA (F02-L01): $v=v_0+at$.
- Sumar vectores en una dimensión con signo: una fuerza de 10 N a la derecha y otra de 4 N a la izquierda dan 6 N a la derecha.

## 3. Idea intuitiva

Empuja un carro de supermercado vacío y luego uno lleno con la misma fuerza: el vacío acelera mucho más. La masa mide **cuánto se resiste** un cuerpo a cambiar su velocidad (inercia). Si dejas de empujar, el carro acaba parándose, pero no porque «se le acabe la fuerza», sino porque el rozamiento con el suelo le frena. En una pista de hielo perfecta seguiría moviéndose indefinidamente.

Y cuando empujas una pared, la pared te empuja a ti con la misma fuerza: por eso, si llevas patines, sales hacia atrás. Las fuerzas siempre aparecen **por parejas** entre dos cuerpos.

## 4. Definición precisa

- **Fuerza:** interacción entre dos cuerpos capaz de cambiar su estado de movimiento o deformarlos. Es un vector; su unidad SI es el **newton**: $1\text{ N}=1\text{ kg}\cdot\text{m/s}^2$.
- **Fuerza neta o resultante** $\vec F_{\text{neta}}=\sum\vec F$: suma vectorial de todas las fuerzas que actúan **sobre un mismo cuerpo**.

**Primera ley (inercia).** Si la fuerza neta sobre un cuerpo es cero, el cuerpo mantiene su velocidad: sigue en reposo o se mueve en línea recta a velocidad constante. Velocidad constante **no** necesita fuerza neta; lo que necesita fuerza es **cambiar** de velocidad.

**Segunda ley (fundamental).** $\sum\vec F=m\,\vec a$. La aceleración tiene la dirección y el sentido de la fuerza neta y es inversamente proporcional a la masa. Se aplica eje por eje: $\sum F_x=m\,a_x$ y $\sum F_y=m\,a_y$.

**Tercera ley (acción y reacción).** Si el cuerpo A ejerce una fuerza sobre B, B ejerce sobre A una fuerza de igual módulo, misma dirección y sentido opuesto: $\vec F_{AB}=-\vec F_{BA}$. Estas dos fuerzas **actúan sobre cuerpos distintos**, por eso nunca se anulan entre sí.

**Peso.** La fuerza con que la Tierra atrae a un cuerpo: $P=m\,g$, con $g\approx9{,}8$ m/s² cerca de la superficie. La masa (kg) es la misma en cualquier lugar; el peso (N) depende de $g$.

**Procedimiento para problemas de dinámica:**
1. Aísla el cuerpo que estudias.
2. Dibuja **todas** las fuerzas que actúan sobre él (diagrama de cuerpo libre).
3. Elige ejes, con uno en el sentido del movimiento si se conoce.
4. Escribe $\sum F=m\,a$ en cada eje y resuelve.
5. Usa la cinemática si te piden velocidades, tiempos o distancias.

**Fuerzas equilibradas frente a acción–reacción.** Un libro en reposo sobre una mesa recibe su peso (la Tierra tira de él) y la normal (la mesa lo empuja). Son iguales y opuestas porque el libro no acelera (**primera y segunda ley**), pero **no** son un par de acción y reacción: ambas actúan sobre el libro. La reacción del peso es la fuerza con que el libro atrae a la Tierra; la reacción de la normal es la fuerza con que el libro empuja a la mesa.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Calcular la aceleración
Sobre una caja de 25 kg se ejercen dos fuerzas horizontales: 80 N hacia la derecha y 30 N hacia la izquierda (rozamiento). Calcula la aceleración.

1. Eje $x$ positivo a la derecha: $\sum F_x=80-30=50$ N.
2. $a=\dfrac{50}{25}=2$ m/s² hacia la derecha.
:::

:::ejemplo Ejemplo 2 · Calcular la fuerza necesaria
Un palé de 400 kg debe pasar de 0 a 1,5 m/s en 3 s sobre ruedas sin rozamiento apreciable. ¿Qué fuerza neta hace falta?

1. Cinemática: $a=\dfrac{1{,}5-0}{3}=0{,}5$ m/s².
2. Dinámica: $F=m\,a=400\cdot0{,}5=200$ N.
:::

:::ejemplo Ejemplo 3 · Ascensor (eje vertical)
Una persona de 70 kg está en un ascensor que sube acelerando a 1 m/s². ¿Qué fuerza normal le hace el suelo? ($g=9{,}8$ m/s²)

Eje positivo hacia arriba: $N-mg=ma$ → $N=m(g+a)=70\cdot10{,}8=756$ N. Es mayor que su peso (686 N): por eso «se siente más pesada» al arrancar.
:::

:::error Error típico
Decir que peso y normal son un par de acción y reacción. No lo son: actúan sobre el mismo cuerpo. Otro error: pensar que si un objeto se mueve debe haber una fuerza neta en el sentido del movimiento. Un objeto a velocidad constante tiene fuerza neta **cero**.
:::

## 6. Ejercicio guiado

Una carretilla de 120 kg se mueve a velocidad constante empujada con 90 N horizontales. Después el operario empuja con 150 N. Calcula el rozamiento y la nueva aceleración, suponiendo que el rozamiento no cambia.

:::pista Primera pista
Con velocidad constante la fuerza neta es cero (primera ley). ¿Cuánto vale entonces el rozamiento?
:::

:::pista Segunda pista
Rozamiento: 90 N en sentido contrario. Con 150 N, la fuerza neta es la diferencia.
:::

:::solucion Solución guiada
Rozamiento $=90$ N. Nueva fuerza neta: $150-90=60$ N. $a=\dfrac{60}{120}=0{,}5$ m/s² en el sentido del empuje.
:::

## 7. Práctica

**Fáciles**

1. ¿Qué fuerza neta acelera 3 m/s² a un cuerpo de 8 kg?
2. Calcula el peso de una persona de 60 kg ($g=9{,}8$ m/s²).
3. Un coche se mueve en línea recta a 90 km/h constantes. ¿Cuánto vale la fuerza neta sobre él? Justifica.

**Medios**

4. Sobre un cuerpo de 5 kg actúan 20 N hacia el este y 15 N hacia el oeste. Calcula la aceleración y la velocidad tras 4 s si parte del reposo.
5. Un caballo tira de un carro. Según la tercera ley, el carro tira del caballo con la misma fuerza. ¿Por qué entonces se mueven? Explícalo.

**Tipo examen / transferencia**

6. Una grúa sube una carga de 500 kg con un cable. Calcula la tensión del cable (a) si sube a velocidad constante y (b) si frena con una aceleración de módulo 0,8 m/s² mientras sube. ($g=9{,}8$ m/s²)

:::solucion Soluciones paso a paso
1. $F=8\cdot3=24$ N.
2. $P=60\cdot9{,}8=588$ N.
3. Cero: velocidad constante en línea recta implica aceleración nula (primera ley). El motor compensa el rozamiento y la resistencia del aire.
4. $\sum F=5$ N al este; $a=1$ m/s²; $v=0+1\cdot4=4$ m/s al este.
5. Las dos fuerzas actúan sobre cuerpos distintos. Para saber si el carro acelera hay que sumar las fuerzas **sobre el carro**: el tirón del caballo frente al rozamiento del carro. Si el tirón es mayor, el carro acelera. El caballo avanza porque el suelo le empuja hacia delante (reacción a su pisada).
6. Eje hacia arriba. (a) $T-mg=0$ → $T=4900$ N. (b) Sube frenando: la aceleración apunta hacia abajo, $a=-0{,}8$ m/s². $T-mg=m a$ → $T=500(9{,}8-0{,}8)=4500$ N.
:::

## 8. Cómo revisar tus errores

- ¿Has dibujado todas las fuerzas **sobre** el cuerpo y solo esas?
- ¿El signo de cada fuerza coincide con el eje elegido?
- Comprobación de sentido: si la fuerza neta apunta hacia un lado, la aceleración debe apuntar hacia el mismo lado.
- Comprueba unidades: kg · m/s² = N.
- En la tercera ley, pregúntate siempre: «¿sobre qué cuerpo actúa cada fuerza?».

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- 1.ª ley: sin fuerza neta, velocidad constante (o reposo).
- 2.ª ley: $\sum\vec F=m\vec a$, eje por eje.
- 3.ª ley: fuerzas iguales y opuestas sobre cuerpos distintos.
- Peso $P=mg$; masa y peso son magnitudes diferentes.

**Vocabulario:** fuerza, newton, fuerza neta, inercia, masa, peso, normal, tensión, diagrama de cuerpo libre, par de acción y reacción.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un problema de ascensor y explica con tus palabras un par de acción y reacción.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (Bachillerato). Alineado con el bloque de dinámica del temario oficial de Física +25; continúa con diagramas de cuerpo libre (F03-L02), rozamiento (F03-L03) y plano inclinado (F03-L04).
