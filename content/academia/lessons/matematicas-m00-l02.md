---
id: matematicas-m00-l02
course: matematicas
module: M00
level: N0
title: Divisibilidad, MCD y mcm
learning_objectives:
  - Reconocer múltiplos y divisores con los criterios de divisibilidad
  - Descomponer un número en factores primos
  - Calcular el máximo común divisor y el mínimo común múltiplo y saber cuándo usar cada uno
prerequisites: [matematicas-m00-l01]
skill_ids: [divisibility, prime_factorization, gcd_lcm]
exam_alignment: [numeros-y-operaciones]
estimated_minutes: 40
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Vas a aprender a descomponer números en factores primos y a calcular el **máximo común divisor** (MCD) y el **mínimo común múltiplo** (mcm). Son la herramienta que necesitarás en la próxima lección para sumar fracciones con distinto denominador, para simplificar fracciones algebraicas y, más adelante, para factorizar polinomios. Fuera del examen resuelven problemas muy reales: cada cuánto coinciden dos turnos de trabajo, en cuántas cajas iguales cabe un pedido o qué tamaño máximo de palé permite repartir dos lotes sin que sobre nada.

## 2. Lo que necesitas saber antes

Multiplicar y dividir enteros con soltura (lección anterior) y saber que dividir de forma **exacta** significa que el resto es 0: $12\div 4=3$ con resto 0, pero $13\div 4=3$ con resto 1.

## 3. Idea intuitiva

Un número $a$ es **divisor** de $b$ si puedes repartir $b$ objetos en grupos de $a$ sin que sobre ninguno. Las 12 latas de un pack se pueden agrupar de 1, 2, 3, 4, 6 o 12 en 12: esos son los divisores de 12. Al revés, los **múltiplos** de 4 son las cantidades que obtienes juntando grupos de 4: 4, 8, 12, 16…

Los **números primos** (2, 3, 5, 7, 11, 13…) son los «ladrillos» de todos los demás: solo se pueden dividir entre 1 y entre ellos mismos. Cualquier número mayor que 1 se construye multiplicando primos de una única manera, igual que una palabra se escribe con unas letras concretas. Ver esos ladrillos es lo que permite comparar dos números.

- **MCD:** el mayor tamaño de grupo que sirve para repartir **dos cantidades a la vez** sin que sobre nada. Pregunta típica: «¿cuál es el máximo…?», «¿en cuántas partes iguales lo más grandes posible…?».
- **mcm:** el primer momento en que **dos ciclos vuelven a coincidir**. Pregunta típica: «¿cada cuánto coinciden…?», «¿cuál es la menor cantidad que…?».

## 4. Definición precisa

- $a$ es divisor de $b$ (se escribe $a\mid b$) si existe un entero $k$ tal que $b=a\cdot k$.
- Un número $p>1$ es **primo** si sus únicos divisores positivos son 1 y $p$. El 1 **no** es primo.
- **Teorema fundamental de la aritmética:** todo entero mayor que 1 se escribe de forma única (salvo el orden) como producto de primos. Ejemplo: $360=2^3\cdot 3^2\cdot 5$.

**Criterios de divisibilidad útiles:**

| Divisible entre | Si… | Ejemplo |
|---|---|---|
| 2 | acaba en cifra par | 538 |
| 3 | la suma de sus cifras es múltiplo de 3 | 471 → 4+7+1=12 |
| 5 | acaba en 0 o 5 | 1 235 |
| 9 | la suma de sus cifras es múltiplo de 9 | 3 627 → 18 |
| 10 | acaba en 0 | 4 870 |

**Regla de cálculo con factores primos:**

- **MCD** = producto de los primos **comunes**, cada uno con el **menor** exponente.
- **mcm** = producto de **todos** los primos que aparecen, cada uno con el **mayor** exponente.

Para dos números positivos se cumple $\text{MCD}(a,b)\cdot\text{mcm}(a,b)=a\cdot b$, una comprobación excelente.

**Por qué funcionan estas reglas.** Un divisor común de $a$ y $b$ solo puede estar hecho de primos que aparezcan en los dos números, y no puede usar un primo más veces de las que aparece en cualquiera de ellos; por eso se toma el exponente **menor**. Un múltiplo común tiene que «contener» completo a cada número, así que necesita todos sus primos con el exponente **mayor**. Entender este porqué te permite resolver el caso de tres números sin aprender una regla nueva.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Descomposición en factores primos
Descompón 84. Se divide sucesivamente entre el primo más pequeño posible:

| Número | Primo |
|---|---|
| 84 | 2 |
| 42 | 2 |
| 21 | 3 |
| 7 | 7 |
| 1 | |

$84=2^2\cdot 3\cdot 7$. Comprobación: $4\cdot 3\cdot 7=84$.
:::

:::ejemplo Ejemplo 2 · MCD y mcm de 84 y 90
$84=2^2\cdot 3\cdot 7$ y $90=2\cdot 3^2\cdot 5$.

- Comunes: 2 y 3. Menores exponentes: $2^1$ y $3^1$. **MCD $=6$.**
- Todos: 2, 3, 5, 7. Mayores exponentes: $2^2,3^2,5,7$. **mcm $=4\cdot9\cdot5\cdot7=1260$.**

Comprobación: $6\cdot 1260=7560$ y $84\cdot 90=7560$. ✔
:::

:::ejemplo Ejemplo 3 · Problema de turnos (mcm)
Un operario revisa la cámara A cada 6 días y la cámara B cada 8 días. Hoy revisa las dos. ¿Dentro de cuántos días volverá a revisar ambas el mismo día?

Se pregunta por la primera coincidencia de dos ciclos → mcm. $6=2\cdot3$, $8=2^3$. mcm $=2^3\cdot 3=24$. **Dentro de 24 días.**
:::

:::ejemplo Ejemplo 4 · Problema de reparto (MCD)
Hay 48 cajas de un producto y 60 de otro. Se quieren hacer palés iguales, cada uno con un solo producto, con el mayor número de cajas posible y sin que sobre ninguna. ¿Cuántas cajas lleva cada palé?

Mayor tamaño que divide a las dos cantidades → MCD. $48=2^4\cdot3$, $60=2^2\cdot3\cdot5$. MCD $=2^2\cdot3=12$. **12 cajas por palé** (4 palés del primer producto y 5 del segundo).
:::

:::error Error típico
Confundir MCD y mcm. Pista: el MCD nunca es mayor que el número más pequeño; el mcm nunca es menor que el número más grande. Si para 48 y 60 obtienes un «MCD» de 240, has calculado el mcm.
:::

## 6. Ejercicio guiado

Calcula el MCD y el mcm de 36 y 120.

:::pista Primera pista
Descompón: $36=2^2\cdot 3^2$. Haz lo mismo con 120 dividiendo entre 2 hasta que no se pueda.
:::

:::pista Segunda pista
$120=2^3\cdot 3\cdot 5$. Para el MCD toma solo 2 y 3 con el menor exponente.
:::

:::solucion Solución guiada
MCD $=2^2\cdot 3=12$. mcm $=2^3\cdot3^2\cdot5=360$. Comprobación: $12\cdot360=4320=36\cdot120$. ✔
:::

## 7. Práctica

**Fáciles**

1. ¿Es 2 451 divisible entre 3? ¿Y entre 9?
2. Descompón 150 en factores primos.
3. Calcula el MCD de 18 y 24.

**Medios**

4. Calcula el mcm de 12, 18 y 30.
5. Simplifica la fracción $\dfrac{84}{126}$ dividiendo numerador y denominador entre su MCD.

**Tipo examen / transferencia**

6. Dos autobuses salen de la misma parada a las 7:00. Uno pasa cada 15 minutos y otro cada 25 minutos. ¿A qué hora vuelven a coincidir por primera vez? Justifica por qué usas MCD o mcm.

:::solucion Soluciones paso a paso
1. Suma de cifras $2+4+5+1=12$: múltiplo de 3 pero no de 9. Es divisible entre 3 ($2451=3\cdot817$) y no entre 9.
2. $150=2\cdot 75=2\cdot3\cdot25=2\cdot3\cdot5^2$.
3. $18=2\cdot3^2$, $24=2^3\cdot3$. MCD $=2\cdot3=6$.
4. $12=2^2\cdot3$, $18=2\cdot3^2$, $30=2\cdot3\cdot5$. mcm $=2^2\cdot3^2\cdot5=180$.
5. $84=2^2\cdot3\cdot7$, $126=2\cdot3^2\cdot7$. MCD $=2\cdot3\cdot7=42$. $\dfrac{84}{126}=\dfrac{2}{3}$.
6. Se busca la primera coincidencia de dos ciclos → mcm. $15=3\cdot5$, $25=5^2$; mcm $=3\cdot5^2=75$ minutos. $7{:}00+1\text{ h }15\text{ min}=$ **8:15**.
:::

## 8. Cómo revisar tus errores

- Multiplica siempre tu descomposición para comprobar que da el número original.
- Usa la comprobación $\text{MCD}\cdot\text{mcm}=a\cdot b$ cuando trabajes con dos números.
- Antes de calcular, subraya la pregunta: «máximo», «mayor tamaño», «repartir» suele ser MCD; «coincidir», «a la vez otra vez», «menor cantidad común» suele ser mcm.
- Si dudas si un número es primo, prueba divisores primos hasta su raíz cuadrada: para 97 basta probar 2, 3, 5 y 7.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Primo: solo divisible entre 1 y sí mismo. El 1 no es primo.
- MCD: primos comunes con el menor exponente. mcm: todos los primos con el mayor exponente.
- MCD responde a repartos máximos; mcm a coincidencias de ciclos.

**Vocabulario:** divisor, múltiplo, primo, compuesto, factorización, MCD, mcm.

**Repaso:** a 1, 3, 7, 14 y 30 días. En cada repaso, factoriza dos números nuevos sin mirar la tabla.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N0. Base para fracciones (M00-L03/L04) y para polinomios (M02). Alineado con el bloque de números del temario oficial de Matemáticas +25.
