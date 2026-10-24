---
id: matematicas-m01-l01
course: matematicas
module: M01
level: N1
title: Lenguaje algebraico, distributiva y términos semejantes
learning_objectives:
  - Traducir frases a expresiones algebraicas y al revés
  - Aplicar la propiedad distributiva, también con signo menos
  - Reducir términos semejantes y evaluar expresiones sustituyendo valores
prerequisites: [matematicas-m00-l01]
skill_ids: [algebraic_language, distributive, like_terms]
exam_alignment: [algebra]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

El álgebra es aritmética con huecos: en lugar de trabajar con un número concreto, trabajas con una letra que lo representa. Aquí aprenderás a escribir situaciones con letras, a quitar paréntesis correctamente y a agrupar los términos que se pueden sumar. Todas las ecuaciones, funciones, derivadas e integrales del examen se manipulan con estas tres operaciones. Un fallo en la distributiva al principio de un problema de 4 puntos arrastra todo el resultado.

## 2. Lo que necesitas saber antes

Operar con signos y respetar la jerarquía de operaciones (M00-L01). En especial: $-(a-b)=-a+b$ y $(-2)\cdot(-3)=6$.

## 3. Idea intuitiva

Una **variable** es una caja con etiqueta. Si $x$ es el número de cajas que llegan cada día, «el triple de cajas más 5 sueltas» se escribe $3x+5$. No sabes cuánto vale $x$, pero sí cómo se comporta.

**Términos semejantes** son los que tienen exactamente la misma parte con letras: $3x$ y $-7x$ son semejantes (ambos hablan de «$x$»), y se pueden juntar: $3x-7x=-4x$. En cambio $3x$ y $3x^2$ **no** son semejantes, igual que no puedes sumar 3 cajas y 3 palés y decir que tienes «6 cajapalés».

La **distributiva** reparte un factor entre todo lo que hay dentro del paréntesis: si compras 4 lotes de «2 botellas y 3 latas», te llevas 8 botellas y 12 latas: $4(2b+3l)=8b+12l$.

## 4. Definición precisa

- **Expresión algebraica:** combinación de números y letras con operaciones. Ejemplo: $2x^2-5xy+7$.
- **Término:** cada sumando. En $2x^2-5xy+7$ hay tres términos: $2x^2$, $-5xy$ y $7$. El signo **pertenece** al término que le sigue.
- **Coeficiente:** el número que multiplica a la parte literal ($-5$ en $-5xy$). Si no se ve, es 1: $x=1\cdot x$; $-x=-1\cdot x$.
- **Términos semejantes:** misma parte literal con los mismos exponentes. Se reducen sumando coeficientes: $ax^n+bx^n=(a+b)x^n$.
- **Propiedad distributiva:** $a(b+c)=ab+ac$ y $a(b-c)=ab-ac$. Con un menos delante: $-(b-c)=-b+c$; con un factor negativo, $-3(x-2)=-3x+6$.
- **Valor numérico:** el resultado de sustituir las letras por números. Sustituye **siempre entre paréntesis**: si $x=-2$, entonces $x^2=(-2)^2=4$, no $-4$.

**Traducciones frecuentes:**

| Frase | Expresión |
|---|---|
| el doble de un número | $2x$ |
| un número aumentado en 7 | $x+7$ |
| la mitad de un número menos 3 | $\dfrac{x}{2}-3$ |
| la mitad de (un número menos 3) | $\dfrac{x-3}{2}$ |
| el cuadrado de la suma de dos números | $(x+y)^2$ |
| la suma de los cuadrados de dos números | $x^2+y^2$ |
| dos números consecutivos | $x$ y $x+1$ |

**Por qué la distributiva es fiable.** Multiplicar es sumar repetidamente: $3(x+2)$ significa $(x+2)+(x+2)+(x+2)$. Si reordenas esa suma, obtienes tres $x$ y tres doses: $3x+6$. La distributiva no es un truco, sino una forma abreviada de contar. Esto explica también el signo: $-(x-2)$ es «el opuesto de $x-2$», es decir, $-1\cdot(x-2)=-x+2$.

**Expresión frente a ecuación.** Una expresión como $3x+12$ solo se **simplifica** o se **evalúa**; no se «resuelve», porque no afirma ninguna igualdad. Una ecuación como $3x+12=0$ sí se resuelve: pregunta qué valor de $x$ la hace cierta. En el examen, confundir ambas cosas lleva a errores como «despejar» en un ejercicio que solo pedía simplificar. Las ecuaciones las trabajarás en la lección siguiente con todo lo que aprendes aquí.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Distributiva y reducción
Simplifica $3(2x-4)-2(x-5)$.

1. Distribuye el 3: $6x-12$.
2. Distribuye el $-2$ **con su signo**: $-2x+10$.
3. Junta: $6x-12-2x+10$.
4. Semejantes: $6x-2x=4x$; $-12+10=-2$.

**Resultado: $4x-2$.**
:::

:::ejemplo Ejemplo 2 · Varios tipos de términos
Reduce $5a^2-3ab+2a-a^2+4ab-7$.

Agrupa por parte literal: $a^2$: $5-1=4$; $ab$: $-3+4=1$; $a$: $2$; números: $-7$.

**Resultado: $4a^2+ab+2a-7$.** No se pueden juntar más porque $a^2$, $ab$ y $a$ son partes literales distintas.
:::

:::ejemplo Ejemplo 3 · Traducir y evaluar
El coste de un envío es una tarifa fija de 4 € más 0,75 € por kilo. Escribe la expresión del coste para $k$ kilos y calcula el coste de 12 kg.

$C(k)=4+0{,}75k$. Para $k=12$: $C=4+0{,}75\cdot12=4+9=13$ €.
:::

:::error Error típico
$-(3x-5)=-3x-5$ es **falso**: el menos afecta a los dos términos, $-(3x-5)=-3x+5$. Otro clásico: $2(x+3)=2x+3$; el 2 debe multiplicar también al 3: $2x+6$.
:::

## 6. Ejercicio guiado

Simplifica $4-(2x-3)+5(x+1)$ y calcula su valor para $x=-2$.

:::pista Primera pista
Quita primero cada paréntesis por separado: $-(2x-3)=-2x+3$ y $5(x+1)=5x+5$.
:::

:::pista Segunda pista
Ahora tienes $4-2x+3+5x+5$. Agrupa las $x$ por un lado y los números por otro.
:::

:::solucion Solución guiada
$-2x+5x=3x$; $4+3+5=12$. Expresión: $3x+12$. Para $x=-2$: $3\cdot(-2)+12=-6+12=6$.
Comprobación con la expresión original: $4-(2(-2)-3)+5(-2+1)=4-(-7)+5(-1)=4+7-5=6$. ✔
:::

## 7. Práctica

**Fáciles**

1. Escribe: «el triple de un número disminuido en 8».
2. Reduce $7y-3+2y+10$.
3. Desarrolla $-4(3-2x)$.

**Medios**

4. Simplifica $2(3a-b)-3(a-2b)+b$.
5. Calcula el valor de $2x^2-3x+1$ para $x=-3$.

**Tipo examen / transferencia**

6. En un almacén hay $n$ estanterías con 24 huecos cada una. Se reservan 3 estanterías completas para devoluciones y en cada una de las restantes se dejan 2 huecos libres. Escribe una expresión simplificada del número de huecos ocupados y calcúlala para $n=15$.

:::solucion Soluciones paso a paso
1. $3x-8$ (el triple del número, después se resta 8).
2. $7y+2y=9y$; $-3+10=7$ → $9y+7$.
3. $-4\cdot3=-12$; $-4\cdot(-2x)=+8x$ → $8x-12$.
4. $6a-2b-3a+6b+b=3a+5b$.
5. $2(-3)^2-3(-3)+1=2\cdot9+9+1=28$.
6. Estanterías no reservadas: $n-3$. Huecos ocupados en cada una: $24-2=22$. Expresión: $22(n-3)=22n-66$. Para $n=15$: $22\cdot15-66=330-66=264$ huecos.
:::

## 8. Cómo revisar tus errores

- **Comprueba con un número:** elige $x=1$ o $x=2$ y evalúa la expresión original y la simplificada. Si no coinciden, hay un error.
- Cuando distribuyas un factor negativo, escribe el producto de cada término con paréntesis: $-3\cdot(+x)$ y $-3\cdot(-2)$.
- Marca con colores o subrayados distintos cada familia de términos semejantes antes de sumarlos.
- Cuidado con las traducciones: «la mitad de un número menos 3» y «la mitad de (un número menos 3)» son expresiones diferentes; lee la frase dos veces.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- El signo forma parte del término que le sigue.
- Solo se suman términos con idéntica parte literal.
- $a(b+c)=ab+ac$; un factor negativo cambia el signo de cada término.
- Sustituye siempre entre paréntesis.

**Vocabulario:** variable, término, coeficiente, parte literal, semejantes, distributiva, valor numérico.

**Repaso:** a 1, 3, 7, 14 y 30 días. Antes de cada repaso, inventa tú una expresión con dos paréntesis y simplifícala comprobando con $x=2$.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N1 (ESO). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; prepara las ecuaciones de M01-L02 y los polinomios de M02.
