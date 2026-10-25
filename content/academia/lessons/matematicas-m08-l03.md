---
id: matematicas-m08-l03
course: matematicas
module: M08
level: N2
title: Reglas de derivación: potencias, producto, cociente y cadena
learning_objectives:
  - Derivar polinomios, potencias y raíces con la regla de la potencia y la linealidad
  - Aplicar las reglas del producto y del cociente
  - Derivar funciones compuestas con la regla de la cadena, incluidas exponenciales, logaritmos y trigonométricas
prerequisites: [matematicas-m08-l02, matematicas-m05-l01]
skill_ids: [derivative_rules, chain_rule]
exam_alignment: [analisis]
estimated_minutes: 60
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Calcular derivadas con la definición es lento. En la práctica se usan unas pocas **reglas** que, combinadas, permiten derivar cualquier función del temario en pocas líneas: polinomios, raíces, cocientes, exponenciales, logaritmos y funciones trigonométricas. Todos los ejercicios de análisis del examen de Matemáticas +25 (tangentes, crecimiento, máximos, optimización) empiezan con una derivada, así que esta lección es la que más vas a usar del módulo. El objetivo es que derives con seguridad y sin errores de signo.

## 2. Lo que necesitas saber antes

- La derivada como límite y su significado (M08-L02).
- Potencias de exponente fraccionario y negativo (M00-L05).
- Funciones exponencial, logarítmica y trigonométricas (M05-L01 a M05-L04).

## 3. Idea intuitiva

Piensa en las reglas como en un juego de construcción. Hay unas **piezas básicas** (la derivada de $x^n$, de $e^x$, de $\ln x$, de $\sin x$...) y unas **reglas de montaje** para cuando las piezas se suman, se multiplican, se dividen o se meten una dentro de otra. Antes de derivar, identifica cómo está montada la función: ¿es una suma?, ¿un producto?, ¿un cociente?, ¿una función de otra función? La última operación que harías al evaluar la función con la calculadora es la regla que se aplica primero.

La regla de la cadena tiene una idea muy física: si $y$ cambia 3 veces más rápido que $u$, y $u$ cambia 2 veces más rápido que $x$, entonces $y$ cambia $3\cdot2=6$ veces más rápido que $x$. Las velocidades de cambio se **multiplican**.

## 4. Definición precisa

**Derivadas básicas** ($k$ constante):

| $f(x)$ | $f'(x)$ |
|---|---|
| $k$ | $0$ |
| $x^n$ ($n$ real) | $n\,x^{n-1}$ |
| $\sqrt x$ | $\dfrac{1}{2\sqrt x}$ |
| $e^x$ | $e^x$ |
| $a^x$ | $a^x\ln a$ |
| $\ln x$ | $\dfrac1x$ |
| $\sin x$ | $\cos x$ |
| $\cos x$ | $-\sin x$ |
| $\tan x$ | $\dfrac{1}{\cos^2x}=1+\tan^2x$ |

**Reglas de montaje:**
- **Linealidad**: $(f\pm g)'=f'\pm g'$ y $(k\,f)'=k\,f'$.
- **Producto**: $(f\cdot g)'=f'\,g+f\,g'$.
- **Cociente**: $\left(\dfrac fg\right)'=\dfrac{f'\,g-f\,g'}{g^2}$ (donde $g\neq0$).
- **Cadena**: $\big(f(g(x))\big)'=f'(g(x))\cdot g'(x)$. Se deriva la función de fuera dejando dentro lo mismo, y se multiplica por la derivada de lo de dentro.

**Forma «cadena» de las básicas** ($u=u(x)$):
$(u^n)'=n\,u^{n-1}u'$; $(\sqrt u)'=\dfrac{u'}{2\sqrt u}$; $(e^u)'=e^u\,u'$; $(\ln u)'=\dfrac{u'}{u}$; $(\sin u)'=\cos u\cdot u'$; $(\cos u)'=-\sin u\cdot u'$.

**Derivadas sucesivas.** La derivada de $f'$ es la segunda derivada $f''$; se usa para la concavidad (M08-L06) y, en física, para la aceleración. Por ejemplo, si $s(t)=t^3-6t$, la velocidad es $s'(t)=3t^2-6$ y la aceleración $s''(t)=6t$. Se pueden encadenar tantas como haga falta: $f'''$, $f^{(4)}$, y así sucesivamente.

**Por qué la regla de la potencia.** Para $n$ natural, $(x+h)^n=x^n+n x^{n-1}h+(\text{términos con }h^2)$. Restando $x^n$, dividiendo entre $h$ y haciendo $h\to0$ solo sobrevive $n x^{n-1}$. La regla se extiende a exponentes negativos y fraccionarios, por eso conviene reescribir antes de derivar: $\dfrac{1}{x^3}=x^{-3}$ y $\sqrt[3]{x^2}=x^{2/3}$.

**Estrategia práctica.**
1. Reescribe la función para que sea lo más simple posible: raíces como potencias, separar fracciones con un solo término en el denominador ($\frac{x^2+1}{x}=x+x^{-1}$), propiedades de logaritmos ($\ln(x^2)=2\ln x$).
2. Identifica la operación principal y aplica su regla.
3. Simplifica el resultado solo lo necesario para lo que te pidan (por ejemplo, para resolver $f'(x)=0$ conviene factorizar).

**Cuándo evitar el cociente.** Si el denominador es una constante, no uses la regla del cociente: $\left(\frac{x^2}{5}\right)'=\frac{2x}{5}$. Y si el numerador es una constante, es más cómodo escribir $\frac{3}{x^2}=3x^{-2}$, con derivada $-6x^{-3}$.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Polinomio y potencias
Deriva $f(x)=4x^3-5x^2+\dfrac{2}{x}+\sqrt x$.

Reescribe: $4x^3-5x^2+2x^{-1}+x^{1/2}$. Derivada: $f'(x)=12x^2-10x-\dfrac{2}{x^2}+\dfrac{1}{2\sqrt x}$.
:::

:::ejemplo Ejemplo 2 · Producto y cociente
Deriva $g(x)=x^2e^x$ y $h(x)=\dfrac{x}{x^2+1}$.

$g'(x)=2x\,e^x+x^2e^x=xe^x(2+x)$.

$h'(x)=\dfrac{1\cdot(x^2+1)-x\cdot2x}{(x^2+1)^2}=\dfrac{1-x^2}{(x^2+1)^2}$.
:::

:::ejemplo Ejemplo 3 · Regla de la cadena
Deriva $f(x)=(3x^2+1)^5$, $g(x)=e^{-2x}$ y $h(x)=\ln(x^2+4)$.

$f'(x)=5(3x^2+1)^4\cdot6x=30x(3x^2+1)^4$. $g'(x)=-2e^{-2x}$. $h'(x)=\dfrac{2x}{x^2+4}$.
:::

:::error Error típico
Derivar un producto multiplicando las derivadas: $(x^2e^x)'\neq2x\cdot e^x$. Otro error frecuente: olvidar multiplicar por la derivada de lo de dentro en la cadena, por ejemplo escribir $(\sin 3x)'=\cos3x$ en lugar de $3\cos3x$. Y en el cociente, invertir el orden del numerador: es $f'g-fg'$, no $fg'-f'g$.
:::

## 6. Ejercicio guiado

Deriva $f(x)=\sqrt{x^2+9}$ y calcula $f'(4)$.

:::pista Primera pista
Es una raíz de una función: $(\sqrt u)'=\dfrac{u'}{2\sqrt u}$ con $u=x^2+9$.
:::

:::pista Segunda pista
$u'=2x$; simplifica el 2.
:::

:::solucion Solución guiada
$f'(x)=\dfrac{2x}{2\sqrt{x^2+9}}=\dfrac{x}{\sqrt{x^2+9}}$. $f'(4)=\dfrac{4}{\sqrt{25}}=\dfrac45=0{,}8$.
:::

## 7. Práctica

**Fáciles**

1. Deriva $f(x)=x^4-3x+7$.
2. Deriva $f(x)=\dfrac{1}{x^2}$.
3. Deriva $f(x)=5e^x-\ln x$.

**Medios**

4. Deriva $f(x)=x\ln x$.
5. Deriva $f(x)=\dfrac{x+1}{x-1}$.

**Tipo examen / transferencia**

6. Sea $f(x)=e^{x^2-1}\cdot(x+1)$. Calcula $f'(x)$, factoriza el resultado y halla $f'(1)$.

:::solucion Soluciones paso a paso
1. $4x^3-3$.
2. $(x^{-2})'=-2x^{-3}=-\dfrac{2}{x^3}$.
3. $5e^x-\dfrac1x$.
4. Producto: $1\cdot\ln x+x\cdot\dfrac1x=\ln x+1$.
5. $\dfrac{1\cdot(x-1)-(x+1)\cdot1}{(x-1)^2}=\dfrac{-2}{(x-1)^2}$.
6. Producto y cadena: $f'(x)=2x\,e^{x^2-1}(x+1)+e^{x^2-1}=e^{x^2-1}(2x^2+2x+1)$. $f'(1)=e^0(2+2+1)=5$.
:::

## 8. Cómo revisar tus errores

- Comprueba una derivada evaluando el cociente de la definición con $h=0{,}001$ en un punto.
- Revisa los signos: en el cociente hay una resta; $(\cos x)'$ lleva signo menos.
- En la cadena, pregúntate siempre: ¿he multiplicado por la derivada de lo de dentro?
- Si la expresión es larga, saca factor común al final (por ejemplo, $e^u$).

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $(x^n)'=nx^{n-1}$; $(e^x)'=e^x$; $(\ln x)'=\frac1x$; $(\sin x)'=\cos x$; $(\cos x)'=-\sin x$.
- Producto $f'g+fg'$; cociente $\dfrac{f'g-fg'}{g^2}$; cadena $f'(g(x))\,g'(x)$.
- Reescribe antes de derivar y simplifica después.

**Vocabulario:** regla de la potencia, linealidad, regla del producto, regla del cociente, regla de la cadena, función compuesta, segunda derivada.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, deriva cinco funciones: un polinomio, un producto, un cociente y dos con regla de la cadena.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de análisis del temario oficial de Matemáticas +25; base de M08-L04 a M08-L07.
