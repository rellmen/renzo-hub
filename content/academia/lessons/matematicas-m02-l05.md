---
id: matematicas-m02-l05
course: matematicas
module: M02
level: N1
title: Radicales y potencias de exponente racional
learning_objectives:
  - Escribir raíces como potencias de exponente fraccionario y viceversa
  - Operar y simplificar radicales aplicando las propiedades de las potencias
  - Racionalizar denominadores con una raíz o con una suma o resta de raíces
prerequisites: [matematicas-m00-l06, matematicas-m02-l04]
skill_ids: [rational_exponents, radicals, rationalize]
exam_alignment: [algebra]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Las raíces aparecen en la fórmula de segundo grado, en distancias y módulos de vectores, en derivadas de $\sqrt{x}$ y en integrales. Escribirlas como **potencias de exponente fraccionario** ($\sqrt{x}=x^{1/2}$) permite usar todas las propiedades de las potencias que ya conoces, y es la forma más cómoda de derivarlas e integrarlas (M08, M09). También aprenderás a **racionalizar**, es decir, a quitar raíces del denominador, algo que los criterios de corrección suelen pedir en el resultado final.

## 2. Lo que necesitas saber antes

- Propiedades de las potencias con exponente entero y raíces sencillas (M00-L06).
- Identidad suma por diferencia (M02-L01): $(a+b)(a-b)=a^2-b^2$.
- Fracciones y su simplificación (M00-L03).

## 3. Idea intuitiva

Si $(x^{1/2})^2$ debe cumplir la regla «potencia de potencia multiplica exponentes», tiene que valer $x^{1}=x$. Es decir, $x^{1/2}$ es el número que al cuadrado da $x$: la raíz cuadrada. Del mismo modo, $x^{1/3}$ es la raíz cúbica. Así, las raíces no son una operación nueva, sino **potencias con exponente fraccionario**, y obedecen las mismas reglas.

Racionalizar es como «limpiar» un resultado: $\dfrac{1}{\sqrt2}$ y $\dfrac{\sqrt2}{2}$ valen lo mismo (0,707…), pero la segunda forma es más fácil de comparar, sumar y aproximar.

## 4. Definición precisa

- **Potencia de exponente racional** (con $a>0$): $a^{m/n}=\sqrt[n]{a^m}=\left(\sqrt[n]{a}\right)^m$. En particular, $a^{1/n}=\sqrt[n]{a}$ y $a^{-m/n}=\dfrac{1}{a^{m/n}}$.
- Todas las propiedades de M00-L06 siguen valiendo: $a^p\cdot a^q=a^{p+q}$, $a^p:a^q=a^{p-q}$, $(a^p)^q=a^{pq}$, $(ab)^p=a^pb^p$.
- **Propiedades de los radicales** (con radicandos no negativos):
  - $\sqrt[n]{a}\cdot\sqrt[n]{b}=\sqrt[n]{ab}$ y $\dfrac{\sqrt[n]{a}}{\sqrt[n]{b}}=\sqrt[n]{\dfrac ab}$ (mismo índice).
  - $\sqrt[m]{\sqrt[n]{a}}=\sqrt[mn]{a}$.
  - **Extraer factores**: $\sqrt[n]{a^n b}=a\sqrt[n]{b}$. Ejemplo: $\sqrt[3]{54}=\sqrt[3]{27\cdot2}=3\sqrt[3]{2}$.
  - **Radicales semejantes** (mismo índice y radicando) se suman como términos semejantes: $3\sqrt5+2\sqrt5=5\sqrt5$. Radicales distintos no se suman: $\sqrt2+\sqrt3\neq\sqrt5$.
  - Radicales de distinto índice se multiplican pasando a exponentes fraccionarios: $\sqrt{2}\cdot\sqrt[3]{2}=2^{1/2+1/3}=2^{5/6}$.
- **Racionalizar**:
  - Denominador $\sqrt a$: multiplica arriba y abajo por $\sqrt a$. $\dfrac{k}{\sqrt a}=\dfrac{k\sqrt a}{a}$.
  - Denominador $\sqrt[n]{a^m}$: multiplica por $\sqrt[n]{a^{n-m}}$ para completar la potencia $n$.
  - Denominador $b\pm\sqrt a$: multiplica por el **conjugado** $b\mp\sqrt a$, porque $(b+\sqrt a)(b-\sqrt a)=b^2-a$.

**Raíces de índice par y signo.** $\sqrt{x^2}=|x|$, no $x$: si $x=-3$, $\sqrt{9}=3=|-3|$. Con raíces de índice impar no hay problema de signo: $\sqrt[3]{-8}=-2$. Las potencias de exponente fraccionario se usan solo con base positiva para evitar estas ambigüedades.

**Reducir a índice común.** Para comparar o multiplicar radicales de distinto índice sin pasar a fracciones, se busca el mcm de los índices. Por ejemplo, $\sqrt{3}=\sqrt[6]{3^3}=\sqrt[6]{27}$ y $\sqrt[3]{5}=\sqrt[6]{5^2}=\sqrt[6]{25}$; por tanto $\sqrt3>\sqrt[3]5$. Es la misma idea que reducir fracciones a común denominador, porque $\dfrac12=\dfrac36$ y $\dfrac13=\dfrac26$.

**Cuándo un resultado está «simplificado».** En los criterios de corrección se considera simplificado un radical cuando no quedan factores que puedan salir de la raíz, cuando no hay raíces en el denominador y cuando los radicales semejantes están agrupados. Por ejemplo, $\dfrac{4}{\sqrt8}$ debe expresarse como $\sqrt2$. No es solo estética: así es más fácil comparar tu respuesta con la de la solución oficial y detectar errores.

**Exponentes fraccionarios en Física y Economía.** Fórmulas como el periodo de un péndulo ($T\propto L^{1/2}$) o el crecimiento compuesto con periodos fraccionarios ($(1+i)^{1/12}$ para pasar de un tipo anual a uno mensual) usan exactamente estas potencias.

**Por qué el conjugado funciona.** La suma por diferencia elimina los términos cruzados: $(3-\sqrt5)(3+\sqrt5)=9-5=4$, un número sin raíces. Es una aplicación directa de M02-L01.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Exponentes fraccionarios
Calcula $8^{2/3}$, $27^{-1/3}$ y $16^{3/4}$.

1. $8^{2/3}=\left(\sqrt[3]{8}\right)^2=2^2=4$.
2. $27^{-1/3}=\dfrac{1}{\sqrt[3]{27}}=\dfrac13$.
3. $16^{3/4}=\left(\sqrt[4]{16}\right)^3=2^3=8$.

Consejo: haz primero la raíz (números pequeños) y después la potencia.
:::

:::ejemplo Ejemplo 2 · Simplificar
Simplifica $\sqrt{12}\cdot\sqrt6$ y $x^{1/2}\cdot x^{1/3}$.

1. $\sqrt{72}=\sqrt{36\cdot2}=6\sqrt2$.
2. $x^{1/2+1/3}=x^{5/6}=\sqrt[6]{x^5}$.
:::

:::ejemplo Ejemplo 3 · Racionalizar
Racionaliza $\dfrac{6}{\sqrt3}$ y $\dfrac{4}{3-\sqrt5}$.

1. $\dfrac{6\sqrt3}{3}=2\sqrt3$.
2. $\dfrac{4(3+\sqrt5)}{(3-\sqrt5)(3+\sqrt5)}=\dfrac{4(3+\sqrt5)}{9-5}=3+\sqrt5$.

Comprobación decimal: $\dfrac{4}{0{,}764}\approx5{,}236$ y $3+2{,}236=5{,}236$. ✔
:::

:::error Error típico
$\sqrt{a+b}=\sqrt a+\sqrt b$ es **falso**: $\sqrt{9+16}=5$, pero $3+4=7$. Otro error: $8^{2/3}=\dfrac{16}{3}$; el exponente fraccionario no se multiplica por la base, indica raíz y potencia.
:::

## 6. Ejercicio guiado

Simplifica $\dfrac{\sqrt{18}+\sqrt{8}}{\sqrt2}$.

:::pista Primera pista
Extrae factores: $\sqrt{18}=3\sqrt2$ y $\sqrt8=2\sqrt2$.
:::

:::pista Segunda pista
El numerador queda $5\sqrt2$. ¿Qué ocurre al dividir entre $\sqrt2$?
:::

:::solucion Solución guiada
$\dfrac{5\sqrt2}{\sqrt2}=5$. Comprobación: $\dfrac{4{,}243+2{,}828}{1{,}414}\approx5{,}00$. ✔
:::

## 7. Práctica

**Fáciles**

1. Calcula $25^{1/2}$, $32^{1/5}$ y $9^{-1/2}$.
2. Escribe $\sqrt[3]{x^2}$ como potencia.
3. Calcula $\sqrt{50}\cdot\sqrt2$.

**Medios**

4. Racionaliza $\dfrac{10}{\sqrt5}$.
5. Simplifica $\dfrac{a^{2/3}\cdot a^{1/6}}{a^{1/2}}$ (con $a>0$).

**Tipo examen / transferencia**

6. Racionaliza $\dfrac{2}{\sqrt3-1}$, comprueba con decimales y explica por qué se multiplica por $\sqrt3+1$.

:::solucion Soluciones paso a paso
1. $5$; $2$; $\dfrac13$.
2. $x^{2/3}$.
3. $\sqrt{100}=10$.
4. $\dfrac{10\sqrt5}{5}=2\sqrt5$.
5. $a^{2/3+1/6-1/2}=a^{(4+1-3)/6}=a^{1/3}=\sqrt[3]{a}$.
6. $\dfrac{2(\sqrt3+1)}{3-1}=\sqrt3+1\approx2{,}732$. Comprobación: $\dfrac{2}{0{,}732}\approx2{,}732$. ✔ El conjugado convierte el denominador en una diferencia de cuadrados sin raíces.
:::

## 8. Cómo revisar tus errores

- Comprueba con la calculadora el valor decimal antes y después de simplificar.
- Revisa que solo sumas radicales semejantes.
- Al racionalizar, multiplica numerador **y** denominador.
- Con exponentes fraccionarios, opera las fracciones con cuidado (mcm).
- Si dudas de una propiedad, pruébala con un número que tenga raíz exacta, como 16 o 64: así verás enseguida si el resultado tiene sentido.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $a^{m/n}=\sqrt[n]{a^m}$; mismas reglas que las potencias enteras.
- Extraer factores y sumar solo radicales semejantes.
- Racionalizar con $\sqrt a$ o con el conjugado.

**Vocabulario:** radical, índice, radicando, exponente racional, radicales semejantes, racionalizar, conjugado.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, pasa tres radicales a potencias, simplifica un producto y racionaliza un denominador con conjugado.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1–N2 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; base de ecuaciones irracionales (M02-L06) y de la derivación de potencias (M08-L03).
