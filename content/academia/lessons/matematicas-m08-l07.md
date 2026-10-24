---
id: matematicas-m08-l07
course: matematicas
module: M08
level: N2
title: Problemas de optimización
learning_objectives:
  - Traducir un enunciado a una función de una variable que hay que maximizar o minimizar
  - Resolver problemas de optimización geométricos y económicos con derivadas
  - Justificar que el valor obtenido es el óptimo y responder en el contexto del problema
prerequisites: [matematicas-m08-l05, matematicas-m02-l06]
skill_ids: [optimization, modeling]
exam_alignment: [analisis]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Optimizar es encontrar la mejor opción: la caja de mayor volumen con un trozo de cartón, la valla más corta que encierra cierta superficie, el precio que da el máximo beneficio. Estos problemas son la aplicación más valorada de las derivadas y un clásico del examen de Matemáticas +25, porque combinan lectura, planteamiento algebraico y cálculo. En esta lección aprenderás un método en seis pasos que funciona con casi todos los enunciados.

## 2. Lo que necesitas saber antes

- Máximos, mínimos y extremos absolutos en un intervalo (M08-L05).
- Despejar una variable en una ecuación (M02-L06).
- Áreas y volúmenes de figuras básicas: rectángulo, círculo, cilindro, caja (M00-L06).

## 3. Idea intuitiva

En un problema de optimización hay algo que quieres hacer lo más grande o lo más pequeño posible (la **función objetivo**) y unas reglas que no puedes saltarte (la **restricción**). Por ejemplo: con 40 metros de valla (restricción) quieres el mayor huerto rectangular posible (objetivo). Si haces el rectángulo muy alargado, el área es casi cero; si lo haces más equilibrado, el área crece. En algún punto intermedio está el máximo, y justo ahí la derivada del área vale cero, porque es la cima de la gráfica.

El trabajo difícil no es derivar, sino **plantear**: escribir el objetivo como función de una sola variable. Por eso la restricción sirve para eliminar las variables sobrantes.

## 4. Definición precisa

**Método en seis pasos:**
1. **Lee y dibuja.** Haz un esquema y nombra las variables con su unidad ($x$ = base en metros...).
2. **Función objetivo.** Escribe la magnitud que hay que optimizar en función de las variables: $A=x\cdot y$.
3. **Restricción.** Escribe la ecuación que relaciona las variables: $2x+2y=40$.
4. **Una sola variable.** Despeja una variable de la restricción y sustitúyela: $y=20-x$ → $A(x)=x(20-x)$.
5. **Dominio y derivada.** Indica los valores con sentido físico ($0<x<20$), deriva, iguala a cero y resuelve.
6. **Justifica y responde.** Comprueba que es máximo o mínimo (segunda derivada, tabla de signos o comparación con los extremos del dominio) y contesta a la pregunta con todas las magnitudes y unidades.

**Justificar el óptimo.** El examen valora que demuestres que el valor hallado es realmente el máximo o el mínimo:
- Con la **segunda derivada**: $f''(a)<0$ indica máximo; $f''(a)>0$, mínimo.
- Con el **signo de $f'$**: si $f'$ es positiva antes y negativa después, es máximo.
- En un **intervalo cerrado**: compara con los valores en los extremos del intervalo (M08-L05).
Si en el dominio solo hay un punto crítico y es un máximo relativo, también es el máximo absoluto.

**Fórmulas que aparecen a menudo:**
- Rectángulo: perímetro $2x+2y$, área $xy$.
- Círculo: longitud $2\pi r$, área $\pi r^2$.
- Cilindro: volumen $\pi r^2h$; superficie total $2\pi r^2+2\pi rh$.
- Caja de base cuadrada de lado $x$ y altura $h$: volumen $x^2h$; superficie sin tapa $x^2+4xh$.
- Economía: ingreso $I=p\cdot q$; beneficio $B=I-C$.

**Errores de planteamiento frecuentes.** Derivar una función de dos variables sin haber usado la restricción; olvidar el dominio (una longitud no puede ser negativa); responder solo con $x$ cuando la pregunta pide dimensiones, precio o valor máximo.

**Lectura del resultado.** Una buena costumbre es comprobar el sentido común de la respuesta: con perímetro fijo, el rectángulo de área máxima es el cuadrado; una lata de volumen fijo con mínima superficie tiene altura igual al diámetro. Si tu resultado da una altura negativa o un precio absurdo, el planteamiento tiene un error.

**Cuándo el óptimo está en el borde.** Si la derivada no se anula dentro del dominio, o si el dominio es un intervalo cerrado, el óptimo puede estar en un extremo del intervalo. Por ejemplo, si una empresa puede fabricar como máximo 100 unidades al día y el beneficio crece siempre, el óptimo es producir 100.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Huerto de área máxima
Con 40 m de valla se quiere cercar un huerto rectangular de área máxima.

Objetivo $A=xy$; restricción $2x+2y=40$ → $y=20-x$. $A(x)=20x-x^2$, con $0<x<20$. $A'(x)=20-2x=0$ → $x=10$; $A''=-2<0$: máximo. Dimensiones $10\times10$ m, área máxima $100$ m².
:::

:::ejemplo Ejemplo 2 · Caja sin tapa
De una lámina cuadrada de 12 cm de lado se recortan cuadrados de lado $x$ en las esquinas y se doblan los bordes para hacer una caja sin tapa. ¿Qué $x$ da el volumen máximo?

$V(x)=x(12-2x)^2$, con $0<x<6$. $V'(x)=(12-2x)^2-4x(12-2x)=(12-2x)(12-6x)$. Críticos: $x=6$ (fuera del dominio abierto) y $x=2$. $V'$ es positiva en $(0,2)$ y negativa en $(2,6)$: máximo en $x=2$. Volumen $2\cdot8^2=128$ cm³.
:::

:::ejemplo Ejemplo 3 · Beneficio máximo
Una empresa vende $q$ unidades a un precio $p=100-2q$ € y producir cuesta $C(q)=20q+50$ €. ¿Qué cantidad maximiza el beneficio?

$B(q)=q(100-2q)-20q-50=-2q^2+80q-50$. $B'(q)=-4q+80=0$ → $q=20$; $B''=-4<0$: máximo. Precio $p=60$ €; beneficio $B(20)=750$ €.
:::

:::error Error típico
Intentar derivar $A=xy$ sin sustituir la restricción, o derivar respecto a una variable tratando la otra como constante. Primero hay que reducir a **una** variable. Otro error: dar como respuesta el valor de $x$ cuando se pide el área o el beneficio máximo.
:::

## 6. Ejercicio guiado

Halla dos números positivos cuya suma sea 30 y cuyo producto sea máximo.

:::pista Primera pista
Números $x$ e $y$ con $x+y=30$; objetivo $P=xy$.
:::

:::pista Segunda pista
$P(x)=x(30-x)$, con $0<x<30$.
:::

:::solucion Solución guiada
$P'(x)=30-2x=0$ → $x=15$, $y=15$. $P''=-2<0$: máximo. Producto máximo $225$.
:::

## 7. Práctica

**Fáciles**

1. Dos números positivos suman 20. ¿Cuál es el máximo de su producto?
2. Un rectángulo tiene área 36 m². ¿Qué dimensiones minimizan el perímetro?
3. Maximiza $B(q)=-q^2+40q-100$.

**Medios**

4. Se quiere cercar un terreno rectangular junto a un río (el lado del río no necesita valla) con 100 m de valla. ¿Qué área máxima se puede encerrar?
5. Encuentra el punto de la recta $y=2x$ más cercano a $(5,0)$. (Minimiza el cuadrado de la distancia.)

**Tipo examen / transferencia**

6. Una lata cilíndrica debe tener un volumen de $250\pi$ cm³. Halla el radio y la altura que minimizan la superficie total de chapa.

:::solucion Soluciones paso a paso
1. $P(x)=x(20-x)$, máximo en $x=10$: producto $100$.
2. $P(x)=2x+\dfrac{72}{x}$; $P'(x)=2-\dfrac{72}{x^2}=0$ → $x=6$. Cuadrado de $6\times6$ m (perímetro 24 m).
3. $B'(q)=-2q+40=0$ → $q=20$; $B(20)=300$.
4. Lados $x$ (perpendiculares al río) y $y=100-2x$. $A(x)=100x-2x^2$; $A'=100-4x=0$ → $x=25$, $y=50$. Área $1250$ m².
5. $D(x)=(x-5)^2+4x^2$; $D'(x)=2(x-5)+8x=10x-10=0$ → $x=1$. Punto $(1,2)$; distancia $\sqrt{20}=2\sqrt5\approx4{,}47$.
6. $\pi r^2h=250\pi$ → $h=\dfrac{250}{r^2}$. $S(r)=2\pi r^2+\dfrac{500\pi}{r}$. $S'(r)=4\pi r-\dfrac{500\pi}{r^2}=0$ → $r^3=125$ → $r=5$ cm, $h=10$ cm. $S''>0$: mínimo. La altura es igual al diámetro.
:::

## 8. Cómo revisar tus errores

- Comprueba que la solución cumple la restricción.
- Revisa que el valor está dentro del dominio con sentido físico.
- Justifica máximo o mínimo; no basta con $f'=0$.
- Responde con la magnitud pedida y sus unidades.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Objetivo + restricción → una variable → derivar → justificar → responder.
- El dominio físico limita los valores posibles; el óptimo puede estar en el borde.
- Comprueba el sentido común del resultado.

**Vocabulario:** optimización, función objetivo, restricción, dominio físico, óptimo, beneficio, ingreso, coste.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un problema geométrico y uno económico completos, con justificación del óptimo.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de análisis del temario oficial de Matemáticas +25; cierra el módulo M08.
