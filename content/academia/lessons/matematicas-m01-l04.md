---
id: matematicas-m01-l04
course: matematicas
module: M01
level: N1
title: Proporcionalidad algebraica, regla de tres compuesta y repartos
learning_objectives:
  - Modelizar la proporcionalidad directa como y = kx y la inversa como y = k/x, e interpretar la constante
  - Resolver problemas de regla de tres compuesta razonando con cada magnitud
  - Hacer repartos directa e inversamente proporcionales
prerequisites: [matematicas-m01-l03, matematicas-m00-l07]
skill_ids: [proportional_models, compound_rule_of_three, proportional_sharing]
exam_alignment: [algebra, funciones]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

En M00-L07 resolviste reglas de tres con dos magnitudes. Aquí das el paso al álgebra: escribirás la proporcionalidad como una **función** ($y=kx$ o $y=\dfrac{k}{x}$), resolverás problemas en los que intervienen **tres o más magnitudes** (regla de tres compuesta) y harás **repartos** proporcionales, como repartir un beneficio según lo que aportó cada socio o un bonus en proporción inversa a los errores. Estas ideas reaparecen en funciones (M04), en Física (leyes como $F=k\,x$) y en Economía.

## 2. Lo que necesitas saber antes

- Distinguir proporcionalidad directa e inversa y la regla de tres simple (M00-L07).
- Despejar una variable de una fórmula (M01-L03).
- Operar con fracciones (M00-L04).

## 3. Idea intuitiva

Si el precio por kilo es 3 €, el coste es «3 veces los kilos»: $y=3x$. La constante 3 es el **precio unitario**. Si un trabajo fijo requiere 60 horas-operario, el tiempo es «60 entre el número de operarios»: $t=\dfrac{60}{n}$. La constante 60 es la **cantidad total de trabajo**.

En un problema con varias magnitudes, por ejemplo operarios, horas al día y días, la estrategia es comparar **cada** magnitud con la incógnita por separado, como si las demás estuvieran congeladas: «si hay más operarios, ¿necesito más o menos días?», «si trabajan más horas al día, ¿más o menos días?».

## 4. Definición precisa

- **Proporcionalidad directa:** $y=kx$ con $k\neq0$. La constante $k=\dfrac{y}{x}$ es la razón de proporcionalidad. Gráficamente, una **recta que pasa por el origen** de pendiente $k$.
- **Proporcionalidad inversa:** $y=\dfrac{k}{x}$ con $k\neq0$, $x\neq0$. La constante $k=x\cdot y$. Gráficamente, una **hipérbola** que nunca toca los ejes.
- **Regla de tres compuesta.** Si la incógnita $x$ depende de varias magnitudes, se compara cada una con $x$:
  - si es directa, el cociente de esa magnitud entra **igual** (nuevo/antiguo);
  - si es inversa, entra **invertido** (antiguo/nuevo).
  Entonces $x=$ valor conocido $\times$ producto de esos cocientes.
- **Reparto directamente proporcional** de una cantidad $T$ a $a_1,a_2,\dots$: a cada parte le corresponde $T\cdot\dfrac{a_i}{a_1+a_2+\dots}$. La constante es $k=\dfrac{T}{a_1+a_2+\dots}$.
- **Reparto inversamente proporcional** a $a_1,a_2,\dots$: equivale a repartir directamente a $\dfrac{1}{a_1},\dfrac{1}{a_2},\dots$ Para evitar fracciones, se multiplican esos inversos por su mcm.

**Por qué la regla compuesta funciona.** Cada comparación cambia la incógnita en un factor: más operarios la dividen, más horas por día la dividen, más trabajo la multiplica. Como esos efectos son independientes, se multiplican. Es la misma idea que encadenar índices de variación (M00-L05).

**Proporcionalidad en otras materias.** Muchas leyes son proporcionalidades: en Física, la ley de Hooke $F=k\,x$ (la fuerza es directamente proporcional al alargamiento) y la ley de Ohm $I=\dfrac{V}{R}$ (con tensión fija, la intensidad es inversamente proporcional a la resistencia); en Economía, el IVA es directamente proporcional a la base imponible. Reconocer el tipo de relación te dice de inmediato cómo cambia una magnitud cuando otra se duplica, sin necesidad de calcular.

**Cómo detectar el tipo de relación en una tabla.** Si los cocientes $\dfrac{y}{x}$ son todos iguales, es directa; si los productos $x\cdot y$ son iguales, es inversa; si no se cumple ninguna, no hay proporcionalidad (por ejemplo, $y=2x+5$ es lineal pero no proporcional, porque no pasa por el origen).

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Hallar y usar la constante
Un depósito pierde agua de forma proporcional al tiempo: en 8 minutos pierde 36 litros. Escribe la función y calcula la pérdida en 20 minutos.

$k=\dfrac{36}{8}=4{,}5$ L/min → $y=4{,}5\,x$. En 20 minutos: $y=90$ L.
:::

:::ejemplo Ejemplo 2 · Regla de tres compuesta
6 operarios, trabajando 8 horas al día, preparan 960 pedidos en 5 días. ¿Cuántos días necesitan 4 operarios trabajando 6 horas al día para preparar 1.200 pedidos?

Incógnita: días.
- Operarios $6\to4$: menos operarios, **más** días → inversa → factor $\dfrac{6}{4}$.
- Horas/día $8\to6$: menos horas, **más** días → inversa → factor $\dfrac{8}{6}$.
- Pedidos $960\to1200$: más pedidos, **más** días → directa → factor $\dfrac{1200}{960}$.

$x=5\cdot\dfrac{6}{4}\cdot\dfrac{8}{6}\cdot\dfrac{1200}{960}=5\cdot1{,}5\cdot1{,}\overline{3}\cdot1{,}25=12{,}5$ días.

Comprobación por horas-operario: $6\cdot8\cdot5=240$ h-op para 960 pedidos, es decir, 4 pedidos por h-op. Para 1.200 pedidos hacen falta 300 h-op; con $4\cdot6=24$ h-op al día, $\dfrac{300}{24}=12{,}5$ días. ✔
:::

:::ejemplo Ejemplo 3 · Reparto directo
Tres socios aportan 20.000 €, 30.000 € y 50.000 € y reparten 18.000 € de beneficio en proporción a lo aportado.

Total aportado: 100.000 €. $k=\dfrac{18000}{100000}=0{,}18$. Partes: 3.600 €, 5.400 € y 9.000 €. Suma: 18.000 €. ✔
:::

:::error Error típico
En el reparto inverso, repartir directamente a los números dados. Si un bonus de 900 € se reparte inversamente a 1, 2 y 3 errores, quien tiene **menos** errores debe recibir **más**. Otro error en la regla compuesta: decidir si una magnitud es directa o inversa comparándola con otra magnitud en lugar de con la incógnita.
:::

## 6. Ejercicio guiado

Reparte un bonus de 900 € de forma inversamente proporcional a los errores de tres operarios: 1, 2 y 3 errores.

:::pista Primera pista
Reparte directamente a los inversos $1$, $\dfrac12$, $\dfrac13$. Para quitar fracciones, multiplícalos por el mcm de 1, 2 y 3.
:::

:::pista Segunda pista
$6\cdot1=6$, $6\cdot\dfrac12=3$, $6\cdot\dfrac13=2$. Ahora reparte 900 € directamente a 6, 3 y 2.
:::

:::solucion Solución guiada
Suma $6+3+2=11$. $k=\dfrac{900}{11}\approx81{,}82$. Partes: $\dfrac{5400}{11}\approx490{,}91$ €, $\dfrac{2700}{11}\approx245{,}45$ € y $\dfrac{1800}{11}\approx163{,}64$ €. Suma: 900 €. Quien tiene 1 error recibe el triple que quien tiene 3. ✔
:::

## 7. Práctica

**Fáciles**

1. Si $y$ es directamente proporcional a $x$ e $y=21$ cuando $x=3$, escribe la función y calcula $y$ para $x=10$.
2. Si $y$ es inversamente proporcional a $x$ e $y=12$ cuando $x=5$, calcula $y$ para $x=4$.
3. ¿Es proporcional la tabla $x$: 2, 4, 6; $y$: 7, 12, 17? Justifica.

**Medios**

4. Reparte 2.400 € en proporción directa a 3, 4 y 5.
5. 5 grifos iguales llenan 3 depósitos en 6 horas. ¿Cuántas horas tardan 3 grifos en llenar 4 depósitos?

**Tipo examen / transferencia**

6. Una flota de 10 furgonetas reparte 4.000 paquetes en 2 días haciendo 8 horas diarias. Por una baja, quedan 8 furgonetas y hay que repartir 5.000 paquetes. ¿Cuántas horas diarias deben trabajar para hacerlo en 3 días? Justifica el tipo de cada relación.

:::solucion Soluciones paso a paso
1. $k=7$ → $y=7x$; $y(10)=70$.
2. $k=60$ → $y=\dfrac{60}{4}=15$.
3. No: $\dfrac72\neq\dfrac{12}{4}$ y $2\cdot7\neq4\cdot12$. Es lineal ($y=2{,}5x+2$) pero no pasa por el origen.
4. Suma 12; $k=200$ → 600 €, 800 € y 1.000 €.
5. Grifos $5\to3$: inversa, factor $\dfrac53$. Depósitos $3\to4$: directa, factor $\dfrac43$. $x=6\cdot\dfrac53\cdot\dfrac43=\dfrac{120}{9}=13{,}\overline{3}$ horas (13 h 20 min).
6. Incógnita: horas/día. Furgonetas $10\to8$: menos furgonetas, más horas → inversa, $\dfrac{10}{8}$. Paquetes $4000\to5000$: directa, $\dfrac{5000}{4000}$. Días $2\to3$: más días, menos horas diarias → inversa, $\dfrac{2}{3}$. $x=8\cdot\dfrac{10}{8}\cdot\dfrac54\cdot\dfrac23=\dfrac{25}{3}\approx8{,}33$ h (8 h 20 min).
:::

## 8. Cómo revisar tus errores

- En repartos, suma las partes: debe dar el total.
- En la regla compuesta, compara cada magnitud **solo con la incógnita** y escribe al lado si es directa o inversa.
- Comprueba con un razonamiento de «unidades de trabajo» (horas-operario, paquetes por furgoneta y hora).
- Revisa el sentido: en un reparto inverso, el que tiene el número más pequeño recibe más.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Directa: $y=kx$ (recta por el origen). Inversa: $y=\dfrac{k}{x}$ (hipérbola).
- Regla compuesta: factor nuevo/antiguo si es directa, antiguo/nuevo si es inversa; multiplicar.
- Reparto directo: $T\cdot\dfrac{a_i}{\sum a_j}$. Inverso: repartir a los inversos.

**Vocabulario:** constante de proporcionalidad, hipérbola, regla de tres compuesta, reparto proporcional, horas-operario.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una regla compuesta de tres magnitudes y compruébala con unidades de trabajo.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1 (ESO). Alineado con el bloque de álgebra y funciones del temario oficial de Matemáticas +25; conecta con funciones (M04) y con leyes físicas proporcionales.
