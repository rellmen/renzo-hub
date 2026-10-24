---
id: fisica-f01-l01
course: fisica
module: F01
level: N1
title: Magnitudes, Sistema Internacional y prefijos
learning_objectives:
  - Distinguir magnitudes fundamentales y derivadas y reconocer sus unidades SI
  - Convertir unidades con prefijos y con factores de conversión encadenados
  - Expresar resultados en notación científica y comprobar la coherencia dimensional
prerequisites: [fisica-f00-l01]
skill_ids: [si_units, unit_conversion, dimensional_check]
exam_alignment: [magnitudes]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/fisica/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

En física, un número sin unidad no significa nada: «la velocidad es 20» puede ser 20 m/s (un coche en ciudad) o 20 km/h (una bicicleta lenta). En esta lección aprenderás qué es una magnitud, cuáles son las unidades del Sistema Internacional (SI), cómo se usan los prefijos (kilo, mili, micro…) y cómo convertir unidades sin errores. Los criterios de corrección del examen de Física +25 penalizan los resultados sin unidades o con unidades incorrectas, y casi todos los fallos numéricos de un problema empiezan por una conversión mal hecha.

## 2. Lo que necesitas saber antes

- Potencias de 10: $10^3=1000$, $10^{-2}=0{,}01$, $10^a\cdot10^b=10^{a+b}$, $\dfrac{10^a}{10^b}=10^{a-b}$.
- Notación científica: $0{,}00045=4{,}5\cdot10^{-4}$; el primer factor está entre 1 y 10.
- Despejar en una igualdad sencilla y operar con fracciones.

## 3. Idea intuitiva

Medir es **comparar** con un patrón. Cuando dices que una caja mide 2 metros, afirmas que cabe 2 veces la longitud patrón «metro». Para que todos entiendan lo mismo, la comunidad científica usa un único conjunto de patrones: el **Sistema Internacional**.

Las unidades se pueden tratar como si fueran letras de álgebra: se multiplican, se dividen y se simplifican. Esa es la clave de las conversiones. Como 1 km son 1000 m, la fracción $\dfrac{1000\text{ m}}{1\text{ km}}$ vale exactamente 1; multiplicar por ella no cambia la cantidad, solo la unidad en que la expresas. Es como cambiar euros por céntimos: el dinero es el mismo.

## 4. Definición precisa

- **Magnitud:** propiedad que se puede medir y expresar como número × unidad. Ejemplos: longitud, masa, tiempo, temperatura. El color o la belleza no son magnitudes.
- **Magnitudes fundamentales del SI** (las que usarás en el examen):

| Magnitud | Unidad | Símbolo |
|---|---|---|
| Longitud | metro | m |
| Masa | kilogramo | kg |
| Tiempo | segundo | s |
| Intensidad de corriente | amperio | A |
| Temperatura | kelvin | K |
| Cantidad de sustancia | mol | mol |

- **Magnitudes derivadas:** se definen a partir de las fundamentales. Velocidad (m/s), aceleración (m/s²), fuerza en newtons ($1\text{ N}=1\text{ kg·m/s}^2$), energía en julios ($1\text{ J}=1\text{ N·m}$), potencia en vatios ($1\text{ W}=1\text{ J/s}$).
- **Prefijos** (multiplican la unidad por una potencia de 10):

| Prefijo | Símbolo | Factor |
|---|---|---|
| giga | G | $10^9$ |
| mega | M | $10^6$ |
| kilo | k | $10^3$ |
| centi | c | $10^{-2}$ |
| mili | m | $10^{-3}$ |
| micro | µ | $10^{-6}$ |
| nano | n | $10^{-9}$ |

- **Factor de conversión:** fracción igual a 1 con unidades distintas arriba y abajo, colocada para que la unidad que quieres eliminar se simplifique.
- **Unidades al cuadrado o al cubo:** el prefijo también se eleva. $1\text{ cm}^2=(10^{-2}\text{ m})^2=10^{-4}\text{ m}^2$ y $1\text{ cm}^3=10^{-6}\text{ m}^3$. Además, $1\text{ L}=1\text{ dm}^3=10^{-3}\text{ m}^3$.
- **Homogeneidad dimensional:** en una ecuación física correcta, los dos miembros tienen las mismas unidades, y solo se pueden sumar cantidades de la misma magnitud.

**Atención al kilogramo.** Es la única unidad fundamental que ya lleva prefijo. Por eso 1 g $=10^{-3}$ kg y 1 mg $=10^{-6}$ kg.

**Notación científica en física.** Las magnitudes muy grandes o muy pequeñas (la masa de la Tierra, $5{,}97\cdot10^{24}$ kg, o la carga del electrón, $1{,}6\cdot10^{-19}$ C) se escriben siempre así. Al multiplicar, se multiplican los factores y se suman los exponentes; al dividir, se restan.

**Por qué conviene trabajar en SI.** Las fórmulas de la física están escritas para unidades coherentes. Si sustituyes la masa en gramos en $F=m\cdot a$, el resultado no sale en newtons y el error pasa desapercibido. La regla práctica del examen es: **convierte todos los datos a SI antes de sustituir** y deja la unidad escrita en cada paso.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · De km/h a m/s
Convierte 90 km/h a m/s.

$$90\,\frac{\text{km}}{\text{h}}\cdot\frac{1000\text{ m}}{1\text{ km}}\cdot\frac{1\text{ h}}{3600\text{ s}}=\frac{90000}{3600}\,\frac{\text{m}}{\text{s}}=25\text{ m/s}$$

Los km se simplifican con los km y las h con las h. Atajo útil: dividir entre 3,6 pasa de km/h a m/s.
:::

:::ejemplo Ejemplo 2 · Unidades al cubo
Un depósito tiene 2,5 m³. ¿Cuántos litros y cuántos cm³ son?

1. $1\text{ m}^3=1000\text{ L}$ → $2{,}5\cdot1000=2500$ L.
2. $1\text{ m}^3=(100\text{ cm})^3=10^6\text{ cm}^3$ → $2{,}5\cdot10^6$ cm³.
:::

:::ejemplo Ejemplo 3 · Notación científica y prefijos
Un cable transporta una corriente de 350 mA durante 2 min. Expresa la intensidad en A y el tiempo en s, y calcula la carga $Q=I\cdot t$ en culombios.

$I=350\cdot10^{-3}\text{ A}=0{,}35\text{ A}$; $t=120$ s; $Q=0{,}35\cdot120=42$ C $=4{,}2\cdot10^{1}$ C.
:::

:::error Error típico
Convertir $1\text{ cm}^2$ a $0{,}01\text{ m}^2$. El prefijo también se eleva al cuadrado: $1\text{ cm}^2=10^{-4}\text{ m}^2$. Otro error frecuente: escribir «Kg» o «KM»; el símbolo de kilo es **k minúscula**, y los símbolos no llevan punto ni plural (5 kg, no 5 kgs.).
:::

## 6. Ejercicio guiado

Una nave logística tiene una superficie de $4{,}2$ km². Exprésala en m² y en notación científica.

:::pista Primera pista
$1\text{ km}=10^3\text{ m}$. ¿Cuánto vale entonces $1\text{ km}^2$ en m²?
:::

:::pista Segunda pista
$1\text{ km}^2=(10^3\text{ m})^2=10^6\text{ m}^2$.
:::

:::solucion Solución guiada
$4{,}2\cdot10^6\text{ m}^2=4\,200\,000\text{ m}^2$. Comprobación de orden de magnitud: un cuadrado de 2 km de lado tiene 4 km², unos 4 millones de m². ✔
:::

## 7. Práctica

**Fáciles**

1. Expresa 3,7 km en metros.
2. Expresa 250 g en kilogramos.
3. Expresa 0,000052 m en notación científica y con un prefijo adecuado.

**Medios**

4. Convierte 15 m/s a km/h.
5. Convierte 750 cm³ a litros y a m³.

**Tipo examen / transferencia**

6. Comprueba si la fórmula $x=v\cdot t+\dfrac{1}{2}a\,t^2$ es dimensionalmente coherente, sabiendo que $x$ es una posición (m), $v$ una velocidad, $a$ una aceleración y $t$ un tiempo.

:::solucion Soluciones paso a paso
1. $3{,}7\cdot1000=3700$ m.
2. $250\cdot10^{-3}=0{,}25$ kg.
3. $5{,}2\cdot10^{-5}$ m $=52\cdot10^{-6}$ m $=52$ µm.
4. $15\cdot3{,}6=54$ km/h (o con factores: $15\cdot\dfrac{1\text{ km}}{1000\text{ m}}\cdot\dfrac{3600\text{ s}}{1\text{ h}}=54$).
5. $750\text{ cm}^3=0{,}75\text{ dm}^3=0{,}75$ L $=7{,}5\cdot10^{-4}$ m³.
6. $v\cdot t$: $\dfrac{\text{m}}{\text{s}}\cdot\text{s}=\text{m}$. $a\,t^2$: $\dfrac{\text{m}}{\text{s}^2}\cdot\text{s}^2=\text{m}$. El $\dfrac12$ no tiene unidades. Los dos sumandos son metros, igual que $x$: es coherente.
:::

## 8. Cómo revisar tus errores

- Escribe las unidades **en cada paso**, no solo al final. Si al simplificar no te queda la unidad buscada, el factor está al revés.
- Haz una estimación de orden de magnitud: ¿es razonable que un coche vaya a 2500 m/s? Si no, revisa.
- En áreas y volúmenes, eleva el factor del prefijo al cuadrado o al cubo.
- Revisa que el resultado final tenga unidad y que el símbolo esté bien escrito (k minúscula, sin plural).

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Magnitud = número × unidad. SI: m, kg, s, A, K, mol.
- Prefijos: G $10^9$, M $10^6$, k $10^3$, c $10^{-2}$, m $10^{-3}$, µ $10^{-6}$, n $10^{-9}$.
- Conversión con factores iguales a 1; en m² y m³ el factor se eleva.
- Pasar a SI antes de sustituir; comprobar homogeneidad dimensional.

**Vocabulario:** magnitud, unidad, magnitud fundamental, magnitud derivada, prefijo, factor de conversión, homogeneidad dimensional.

**Repaso:** a 1, 3, 7, 14 y 30 días. En cada repaso, convierte una velocidad, un volumen y una cantidad con prefijo micro o nano, y comprueba el orden de magnitud.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N1 (ESO – 1.º Bachillerato). Alineado con el bloque de magnitudes y medida del temario oficial de Física +25. Física figura como optativa en este plan: la elección definitiva de la segunda específica (Física o Economía de la Empresa) está pendiente de confirmar en la matrícula de 2027.
