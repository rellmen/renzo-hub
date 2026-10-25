---
id: matematicas-m02-l06
course: matematicas
module: M02
level: N1
title: Sistemas 2×2 y ecuaciones racionales e irracionales
learning_objectives:
  - Resolver sistemas lineales 2×2 por sustitución, igualación y reducción, y clasificarlos
  - Resolver ecuaciones racionales descartando las soluciones que anulan un denominador
  - Resolver ecuaciones irracionales elevando al cuadrado y comprobando cada solución
prerequisites: [matematicas-m02-l03, matematicas-m02-l04, matematicas-m02-l05]
skill_ids: [linear_system, rational_equations, irrational_equations]
exam_alignment: [algebra]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Muchos problemas tienen dos incógnitas relacionadas por dos condiciones: eso es un **sistema**. Otros llevan la incógnita en un denominador o dentro de una raíz. En esta lección aprenderás a resolver los tres tipos y, sobre todo, una idea que los une: **comprobar**. En las ecuaciones racionales e irracionales, los pasos algebraicos pueden introducir soluciones falsas, y el examen penaliza darlas por buenas. Los sistemas 2×2 preparan además los sistemas 3×3 con matrices (M06-L04).

## 2. Lo que necesitas saber antes

- Ecuaciones de primer y segundo grado (M01-L02, M02-L04).
- Fracciones algebraicas y restricciones (M02-L03).
- Radicales (M02-L05) y plantear problemas (M01-L07).

## 3. Idea intuitiva

Cada ecuación lineal con dos incógnitas es una recta. Resolver un sistema 2×2 es buscar **dónde se cortan** las dos rectas. Puede haber un punto de corte (una solución), ninguno (rectas paralelas) o infinitos (la misma recta escrita dos veces).

Con raíces, elevar al cuadrado es útil pero «olvida» el signo: $3^2=9$ y $(-3)^2=9$. Por eso, al elevar al cuadrado una ecuación pueden aparecer soluciones que no lo eran. Con denominadores pasa algo parecido: al multiplicar por una expresión que puede valer cero, se pueden colar valores prohibidos.

## 4. Definición precisa

**Sistema lineal 2×2:** $\begin{cases}a_1x+b_1y=c_1\\ a_2x+b_2y=c_2\end{cases}$

Métodos:
- **Sustitución:** despeja una incógnita en una ecuación y sustitúyela en la otra. Cómodo si alguna incógnita tiene coeficiente $\pm1$.
- **Igualación:** despeja la misma incógnita en las dos y iguala.
- **Reducción:** multiplica las ecuaciones por números adecuados para que, al sumarlas, desaparezca una incógnita.

**Clasificación:**
- **Compatible determinado** (una solución): rectas secantes; $\dfrac{a_1}{a_2}\neq\dfrac{b_1}{b_2}$, es decir, $a_1b_2-a_2b_1\neq0$.
- **Incompatible** (sin solución): rectas paralelas; coeficientes proporcionales pero términos independientes no: al reducir aparece algo como $0=5$.
- **Compatible indeterminado** (infinitas): la misma recta; todo proporcional; al reducir aparece $0=0$.

**Ecuación racional** (incógnita en el denominador):
1. Factoriza los denominadores y escribe las **restricciones**.
2. Multiplica todos los términos por el mcm.
3. Resuelve la ecuación polinómica resultante.
4. **Descarta** las soluciones que coincidan con una restricción.

**Ecuación irracional** (incógnita dentro de una raíz):
1. **Aísla** la raíz en un miembro.
2. Eleva los dos miembros al cuadrado (recuerda que $(a+b)^2$ lleva doble producto).
3. Resuelve.
4. **Comprueba cada solución en la ecuación original** y descarta las que no la cumplan.

**Elegir el método.** Sustitución si una incógnita tiene coeficiente $1$ o $-1$; reducción si los coeficientes de una incógnita son iguales u opuestos, o fáciles de igualar; igualación si ya vienen despejadas (por ejemplo, $y=2x+1$ e $y=-x+7$). Cualquier método da la misma solución: elige el que menos operaciones exija.

**Por qué aparecen soluciones falsas.** De $A=B$ se deduce $A^2=B^2$, pero no al revés: $A^2=B^2$ también se cumple si $A=-B$. Las soluciones de esa otra ecuación se cuelan. En las racionales, multiplicar por una expresión que vale 0 en algún punto convierte una igualdad falsa en $0=0$ en ese punto. Por eso la comprobación no es un trámite: forma parte de la solución.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Sistema por sustitución
Resuelve $\begin{cases}2x+3y=12\\ x-y=1\end{cases}$

1. De la segunda: $x=1+y$.
2. Sustituye: $2(1+y)+3y=12$ → $5y=10$ → $y=2$.
3. $x=3$. Comprobación: $6+6=12$ ✔, $3-2=1$ ✔. Solución $(3,2)$: compatible determinado.
:::

:::ejemplo Ejemplo 2 · Ecuación racional con solución falsa
Resuelve $\dfrac{3}{x-1}+1=\dfrac{6}{x^2-1}$.

1. Restricciones: $x\neq\pm1$. mcm: $(x-1)(x+1)$.
2. $3(x+1)+(x^2-1)=6$ → $x^2+3x-4=0$ → $(x+4)(x-1)=0$.
3. $x=1$ está prohibido. **Única solución: $x=-4$.**

Comprobación: $\dfrac{3}{-5}+1=0{,}4$ y $\dfrac{6}{15}=0{,}4$. ✔
:::

:::ejemplo Ejemplo 3 · Ecuación irracional
Resuelve $\sqrt{x+7}=x+1$.

1. La raíz ya está aislada. Al cuadrado: $x+7=x^2+2x+1$ → $x^2+x-6=0$ → $x=2$ o $x=-3$.
2. Comprobación: $x=2$: $\sqrt9=3=2+1$ ✔. $x=-3$: $\sqrt4=2$ pero $-3+1=-2$ ✗.

**Solución: $x=2$.**
:::

:::error Error típico
Elevar al cuadrado sin aislar la raíz o elevar término a término: de $\sqrt{x}+1=x$ escribir $x+1=x^2$. Lo correcto es aislar, $\sqrt x=x-1$, y elevar: $x=x^2-2x+1$. Otro error: no comprobar y dar como válida $x=-3$ en el ejemplo 3.
:::

## 6. Ejercicio guiado

En un envío hay 35 cajas, unas de 5 kg y otras de 8 kg, y el peso total es 244 kg. ¿Cuántas cajas hay de cada tipo?

:::pista Primera pista
Sean $p$ las cajas de 5 kg y $g$ las de 8 kg. Una ecuación cuenta cajas y otra cuenta kilos.
:::

:::pista Segunda pista
$p+g=35$ y $5p+8g=244$. Sustituye $p=35-g$.
:::

:::solucion Solución guiada
$5(35-g)+8g=244$ → $175+3g=244$ → $g=23$, $p=12$. Comprobación: $12+23=35$ y $60+184=244$. ✔ **12 cajas de 5 kg y 23 de 8 kg.**
:::

## 7. Práctica

**Fáciles**

1. Resuelve $\begin{cases}x+y=10\\ x-y=4\end{cases}$
2. Resuelve $\begin{cases}3x-y=5\\ x+2y=11\end{cases}$
3. Clasifica $\begin{cases}x+2y=3\\ 2x+4y=7\end{cases}$

**Medios**

4. Resuelve $x-\dfrac{6}{x}=1$.
5. Resuelve $\sqrt{2x+3}=x$.

**Tipo examen / transferencia**

6. Discute según el valor de $k$ el sistema $\begin{cases}x+ky=2\\ 2x+4y=4\end{cases}$ y resuélvelo cuando sea compatible determinado.

:::solucion Soluciones paso a paso
1. Sumando: $2x=14$ → $x=7$, $y=3$.
2. $y=3x-5$ → $x+6x-10=11$ → $x=3$, $y=4$.
3. Multiplicando la primera por 2: $2x+4y=6\neq7$. **Incompatible** (rectas paralelas).
4. Con $x\neq0$: $x^2-x-6=0$ → $x=3$ o $x=-2$; ambas válidas.
5. $2x+3=x^2$ → $x^2-2x-3=0$ → $3$ o $-1$. $x=-1$: $\sqrt1=1\neq-1$ ✗. **Solución $x=3$.**
6. $a_1b_2-a_2b_1=4-2k$. Si $k\neq2$: compatible determinado. Restando a la segunda el doble de la primera: $(4-2k)y=0$ → $y=0$, $x=2$. Si $k=2$: la segunda es el doble de la primera → **compatible indeterminado** ($x=2-2y$, infinitas soluciones).
:::

## 8. Cómo revisar tus errores

- En sistemas, sustituye la solución en **las dos** ecuaciones; si solo compruebas una, un error en la otra pasa desapercibido.
- En racionales, compara cada solución con la lista de restricciones.
- En irracionales, comprueba en la ecuación **original**, no en la elevada al cuadrado.
- Si al reducir un sistema desaparecen las dos incógnitas, mira si queda $0=0$ o $0=k$.
- En problemas, comprueba además que la solución tiene sentido: cantidades enteras y no negativas cuando cuentan objetos.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Sistemas: sustitución, igualación, reducción; determinado, indeterminado o incompatible.
- Racionales: restricciones, mcm, descartar valores prohibidos.
- Irracionales: aislar la raíz, elevar al cuadrado, comprobar siempre.

**Vocabulario:** sistema lineal, sustitución, igualación, reducción, compatible determinado, compatible indeterminado, incompatible, ecuación racional, ecuación irracional, solución extraña.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un sistema por dos métodos distintos y una ecuación irracional con una solución falsa.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N1–N2 (4.º ESO – 1.º Bachillerato). Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; prepara los sistemas 3×3 y su discusión con parámetro (M06-L04).
