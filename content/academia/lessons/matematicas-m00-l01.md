---
id: matematicas-m00-l01
course: matematicas
module: M00
level: N0
title: Enteros, signos y jerarquía de operaciones
learning_objectives:
  - Situar y comparar números enteros en la recta numérica
  - Operar con signos sin errores en sumas, productos y potencias
  - Resolver expresiones mixtas respetando la jerarquía de operaciones
prerequisites: []
skill_ids: [integer_signs, operation_order, signed_powers]
exam_alignment: [numeros-y-operaciones]
estimated_minutes: 40
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

En esta lección vas a operar con números positivos y negativos y a resolver expresiones con paréntesis, potencias, productos y sumas en el orden correcto. Parece poco, pero es la base de todo lo que viene después: en el examen +25 de Matemáticas casi ningún ejercicio se pierde por no saber la teoría avanzada, sino por un signo perdido o una operación hecha antes de tiempo. Una derivada bien planteada con un signo mal copiado da un resultado falso, y el tribunal solo puntúa parcialmente.

Al terminar sabrás: comparar enteros, aplicar la regla de los signos, distinguir $-3^2$ de $(-3)^2$ y resolver cualquier expresión numérica escribiendo un paso por línea.

## 2. Lo que necesitas saber antes

Solo necesitas sumar, restar, multiplicar y dividir números naturales (0, 1, 2, 3…). Si las tablas de multiplicar te fallan, repásalas cinco minutos antes de empezar: el resto de la lección asume que $7\times 8=56$ sale sin pensar.

## 3. Idea intuitiva

Piensa en el saldo de una cuenta bancaria. Si tienes 50 € y pagas 80 €, tu saldo es $-30$ €: debes 30. Los números negativos expresan «lo que falta» o «lo que está por debajo de cero», igual que una temperatura de $-5\,^\circ\text{C}$ o un sótano en la planta $-2$.

La **recta numérica** ordena todos los enteros: a la izquierda los negativos, a la derecha los positivos. Cuanto más a la derecha, mayor es el número. Por eso $-2 > -7$: deber 2 € es mejor que deber 7 €.

El **valor absoluto** $|a|$ es la distancia de un número al cero, sin importar el lado: $|-7|=7$ y $|7|=7$.

Sobre el orden de operaciones, imagina una receta: primero preparas lo que está dentro de los paréntesis (los ingredientes que se mezclan aparte), luego aplicas las potencias, después multiplicas y divides, y por último sumas y restas. Si cambias el orden, el plato es otro.

## 4. Definición precisa

**Números enteros** $\mathbb{Z}=\{\dots,-3,-2,-1,0,1,2,3,\dots\}$.

**Regla de los signos** (para multiplicar y dividir):

| Operación | Resultado |
|---|---|
| $(+)\cdot(+)$ | $+$ |
| $(-)\cdot(-)$ | $+$ |
| $(+)\cdot(-)$ | $-$ |
| $(-)\cdot(+)$ | $-$ |

**Suma de enteros.** Si tienen el mismo signo, se suman los valores absolutos y se conserva el signo: $-4+(-6)=-10$. Si tienen signos distintos, se restan los valores absolutos y se pone el signo del que tiene mayor valor absoluto: $-9+4=-5$.

**Restar es sumar el opuesto:** $a-b=a+(-b)$. Así, $3-(-5)=3+5=8$.

**Jerarquía de operaciones:**

1. Paréntesis (de dentro hacia fuera).
2. Potencias y raíces.
3. Multiplicaciones y divisiones, **de izquierda a derecha**.
4. Sumas y restas, **de izquierda a derecha**.

**Potencias y signos.** En $-3^2$ la potencia solo afecta al 3: $-3^2=-(3\cdot 3)=-9$. En $(-3)^2$ afecta al $-3$ completo: $(-3)(-3)=9$. Una base negativa elevada a exponente par da positivo; a exponente impar, negativo: $(-2)^3=-8$.

**Signo menos delante de un paréntesis:** cambia el signo de todos los términos interiores: $-(4-9+2)=-4+9-2$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Paréntesis, potencia y producto
Calcula $8-2\cdot(3-5)^2$.

1. Paréntesis: $3-5=-2$.
2. Potencia: $(-2)^2=4$.
3. Producto: $2\cdot 4=8$.
4. Resta: $8-8=0$.

**Resultado: 0.** El error más frecuente es hacer primero $8-2=6$; eso viola el paso 3 antes del 4.
:::

:::ejemplo Ejemplo 2 · Signos encadenados
Calcula $-4+3\cdot(-2)-(-6)$.

1. Producto: $3\cdot(-2)=-6$.
2. Reescribe: $-4+(-6)-(-6)$.
3. Restar $-6$ es sumar $6$: $-4-6+6$.
4. De izquierda a derecha: $-10+6=-4$.

**Resultado: $-4$.**
:::

:::ejemplo Ejemplo 3 · División y multiplicación de izquierda a derecha
Calcula $24\div 4\cdot 3$.

Como división y producto tienen la misma prioridad, se hace de izquierda a derecha: $24\div 4=6$ y $6\cdot 3=18$. **Resultado: 18.** Si haces primero $4\cdot 3=12$ obtendrías $2$, que es incorrecto.
:::

:::error Error típico
$-2^4=16$ es **falso**. La potencia se aplica antes que el signo: $-2^4=-(2^4)=-16$. Solo $(-2)^4=16$.
:::

## 6. Ejercicio guiado

Calcula $5-3\cdot\big(2-(-4)\big)\div 2$.

:::pista Primera pista
Resuelve primero el paréntesis interior: $2-(-4)$. Restar un negativo es sumar.
:::

:::pista Segunda pista
El paréntesis vale $6$. Ahora tienes $5-3\cdot 6\div 2$: producto y división de izquierda a derecha.
:::

:::solucion Solución guiada
$2-(-4)=6$; $3\cdot 6=18$; $18\div 2=9$; $5-9=-4$. **Resultado: $-4$.**
:::

## 7. Práctica

**Fáciles**

1. $7+2\cdot 5$
2. $-8+(-5)$
3. $(-3)\cdot(-4)\cdot(-1)$

**Medios**

4. $12\div 3\cdot 2-(-1)$
5. $(-5)^2-5^2+(-2)^3$

**Tipo examen**

6. Una cámara frigorífica está a $-18\,^\circ\text{C}$. Se apaga y la temperatura sube $4\,^\circ\text{C}$ cada hora durante 3 horas; luego vuelve a encenderse y baja $2\,^\circ\text{C}$ cada hora durante 5 horas. Escribe una sola expresión numérica y calcula la temperatura final.

:::solucion Soluciones paso a paso
1. Producto primero: $2\cdot 5=10$; $7+10=17$.
2. Mismo signo: se suman valores absolutos y se conserva el signo: $-13$.
3. $(-3)(-4)=12$; $12\cdot(-1)=-12$. Tres factores negativos dan negativo.
4. $12\div 3=4$; $4\cdot 2=8$; $8-(-1)=8+1=9$.
5. $(-5)^2=25$; $5^2=25$; $(-2)^3=-8$. $25-25-8=-8$.
6. Expresión: $-18+3\cdot 4-5\cdot 2$. Productos: $12$ y $10$. $-18+12-10=-16$. **Temperatura final: $-16\,^\circ\text{C}$.**
:::

## 8. Cómo revisar tus errores

- **Rodea cada signo menos** antes de operar y pregúntate: ¿es una resta, el signo de un número o un menos delante de un paréntesis?
- **Escribe un paso por línea.** Si el resultado falla, podrás localizar la línea exacta del error.
- **Comprueba con estimación:** en el ejercicio 6, la temperatura sube 12 y baja 10, así que debe terminar 2 grados por encima de $-18$. Si te sale $-40$, algo falla.
- Si fallas varias veces la regla de los signos, vuelve a la tabla de la sección 4 y haz cinco productos más antes de seguir.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Restar es sumar el opuesto: $a-b=a+(-b)$.
- Producto o cociente de signos iguales: positivo; distintos: negativo.
- Orden: paréntesis → potencias → multiplicación/división (izq. a der.) → suma/resta (izq. a der.).
- $-a^2\neq(-a)^2$.

**Vocabulario:** entero, valor absoluto, opuesto, base, exponente, jerarquía de operaciones.

**Repaso programado:** la app te lo propondrá a 1, 3, 7, 14 y 30 días si apruebas la evaluación. Antes de cada repaso, intenta escribir de memoria el orden de operaciones y explicar por qué $-2^2$ y $(-2)^2$ son distintos.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N0 (rescate de primaria/ESO). Alineado con el bloque de números y operaciones del temario oficial de Matemáticas de la prueba +25 (enlace en los metadatos). No reproduce enunciados oficiales.
