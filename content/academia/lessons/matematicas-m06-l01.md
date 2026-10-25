---
id: matematicas-m06-l01
course: matematicas
module: M06
level: N2
title: Vectores en el plano y en el espacio, suma y producto escalar
learning_objectives:
  - Calcular las componentes de un vector a partir de dos puntos y su módulo
  - Sumar vectores y multiplicarlos por un número, gráfica y analíticamente
  - Calcular el producto escalar y usarlo para hallar ángulos y comprobar perpendicularidad
prerequisites: [matematicas-m04-l01]
skill_ids: [vectors_basic, dot_product]
exam_alignment: [geometria, algebra-lineal]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Un vector es una flecha: tiene longitud, dirección y sentido. Con vectores se describen desplazamientos, velocidades, fuerzas y, en matemáticas, rectas y planos. En el examen de Matemáticas +25 los vectores son la base de la geometría analítica 3D (rectas, planos, distancias y ángulos) y del álgebra lineal. En esta lección aprenderás a operar con ellos y a usar el **producto escalar**, la herramienta que convierte una pregunta geométrica («¿son perpendiculares?», «¿qué ángulo forman?») en una cuenta.

## 2. Lo que necesitas saber antes

- Coordenadas en el plano cartesiano (M04-L01).
- Raíces cuadradas y el teorema de Pitágoras: en un triángulo rectángulo de catetos 3 y 4, la hipotenusa es $\sqrt{9+16}=5$.
- Coseno de algunos ángulos: $\cos0^\circ=1$, $\cos60^\circ=\dfrac{1}{2}$, $\cos90^\circ=0$, $\cos180^\circ=-1$. (Lo verás a fondo en M05.)

## 3. Idea intuitiva

Imagina que un carretillero sale del punto $A(1,2)$ y llega al punto $B(5,5)$. Lo que importa del movimiento no es dónde empezó, sino «cuánto se movió»: 4 a la derecha y 3 hacia arriba. Ese desplazamiento es el vector $\vec{AB}=(4,3)$. Si otro carretillero sale de $(10,0)$ y llega a $(14,3)$, ha hecho **el mismo** vector, aunque en otro lugar.

**Sumar vectores** es encadenar movimientos: 4 a la derecha y 3 arriba, y después 1 a la derecha y 2 abajo, equivalen a 5 a la derecha y 1 arriba. **Multiplicar por un número** alarga o acorta la flecha (y si el número es negativo, le da la vuelta).

El **producto escalar** mide «cuánto apunta un vector en la dirección del otro». Si apuntan en la misma dirección, es grande y positivo; si son perpendiculares, es cero; si van en sentidos opuestos, es negativo.

## 4. Definición precisa

- **Vector entre dos puntos:** $\vec{AB}=B-A$. En el plano, si $A(a_1,a_2)$ y $B(b_1,b_2)$, entonces $\vec{AB}=(b_1-a_1,\,b_2-a_2)$. En el espacio se añade la tercera coordenada.
- **Módulo (longitud):** $|\vec{u}|=\sqrt{u_1^2+u_2^2}$ en el plano y $|\vec{u}|=\sqrt{u_1^2+u_2^2+u_3^2}$ en el espacio. Es Pitágoras.
- **Suma:** $\vec{u}+\vec{v}=(u_1+v_1,\,u_2+v_2,\,u_3+v_3)$. Gráficamente, se pone el origen de $\vec v$ en el extremo de $\vec u$ (regla del triángulo o del paralelogramo).
- **Producto por un escalar** $k$: $k\vec{u}=(ku_1,\,ku_2,\,ku_3)$. Su módulo es $|k|\cdot|\vec u|$.
- **Vectores paralelos:** $\vec v=k\vec u$ para algún $k$; sus componentes son proporcionales.
- **Vector unitario** en la dirección de $\vec u$: $\dfrac{\vec u}{|\vec u|}$, de módulo 1.
- **Producto escalar** (dos definiciones equivalentes):
  - Analítica: $\vec u\cdot\vec v=u_1v_1+u_2v_2+u_3v_3$.
  - Geométrica: $\vec u\cdot\vec v=|\vec u|\,|\vec v|\cos\alpha$, donde $\alpha$ es el ángulo entre ambos.
- **Consecuencias:**
  - Ángulo: $\cos\alpha=\dfrac{\vec u\cdot\vec v}{|\vec u|\,|\vec v|}$.
  - **Perpendicularidad:** $\vec u\perp\vec v\iff\vec u\cdot\vec v=0$ (con vectores no nulos).
  - $\vec u\cdot\vec u=|\vec u|^2$.

El resultado del producto escalar es un **número**, no un vector. Por eso se llama «escalar».

**Combinación lineal y punto medio.** Una expresión como $2\vec u-3\vec v$ es una **combinación lineal** de $\vec u$ y $\vec v$: los vectores se escalan y se suman. Una aplicación directa: el punto medio $M$ del segmento $AB$ se obtiene sumando a $A$ la mitad del vector $\vec{AB}$, es decir, $M=A+\dfrac{1}{2}\vec{AB}=\dfrac{A+B}{2}$; sus coordenadas son la media de las de $A$ y $B$. Con el mismo razonamiento, el punto que está a un tercio del camino de $A$ a $B$ es $A+\dfrac{1}{3}\vec{AB}$.

**Por qué coinciden las dos definiciones.** Aplicando el teorema del coseno al triángulo formado por $\vec u$, $\vec v$ y $\vec u-\vec v$ se obtiene $|\vec u-\vec v|^2=|\vec u|^2+|\vec v|^2-2|\vec u||\vec v|\cos\alpha$. Desarrollando el lado izquierdo con componentes aparece $-2(u_1v_1+u_2v_2+u_3v_3)$. Igualando, ambas expresiones del producto escalar son la misma.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Vector y módulo en el espacio
Dados $A(1,-2,3)$ y $B(3,2,7)$, calcula $\vec{AB}$ y su módulo.

1. $\vec{AB}=(3-1,\;2-(-2),\;7-3)=(2,4,4)$.
2. $|\vec{AB}|=\sqrt{4+16+16}=\sqrt{36}=6$.

La distancia entre $A$ y $B$ es 6 unidades.
:::

:::ejemplo Ejemplo 2 · Operaciones combinadas
Con $\vec u=(2,-1,0)$ y $\vec v=(1,3,-2)$, calcula $3\vec u-2\vec v$.

$3\vec u=(6,-3,0)$; $2\vec v=(2,6,-4)$; resta: $(6-2,\,-3-6,\,0-(-4))=(4,-9,4)$.
:::

:::ejemplo Ejemplo 3 · Ángulo y perpendicularidad
Calcula el ángulo entre $\vec u=(1,1)$ y $\vec v=(2,0)$, y halla $k$ para que $\vec w=(k,3)$ sea perpendicular a $\vec u$.

1. $\vec u\cdot\vec v=2+0=2$. $|\vec u|=\sqrt2$, $|\vec v|=2$.
2. $\cos\alpha=\dfrac{2}{2\sqrt2}=\dfrac{1}{\sqrt2}\approx0{,}7071$ → $\alpha=45^\circ$.
3. $\vec u\cdot\vec w=k+3=0$ → $k=-3$.
:::

:::error Error típico
Calcular $\vec{AB}$ como $A-B$: da el vector opuesto. El vector «de $A$ a $B$» es **extremo menos origen**. Otro error: escribir que $\vec u\cdot\vec v$ es un vector, por ejemplo $(1\cdot2,\,1\cdot0)=(2,0)$; el producto escalar es la **suma** de esos productos, el número 2.
:::

## 6. Ejercicio guiado

¿Es rectángulo el triángulo de vértices $A(0,0,0)$, $B(2,1,0)$ y $C(-1,2,3)$? Si lo es, ¿en qué vértice?

:::pista Primera pista
Calcula los vectores que salen de cada vértice: $\vec{AB}$, $\vec{AC}$, y comprueba si su producto escalar es 0.
:::

:::pista Segunda pista
$\vec{AB}=(2,1,0)$ y $\vec{AC}=(-1,2,3)$. Multiplica componente a componente y suma.
:::

:::solucion Solución guiada
$\vec{AB}\cdot\vec{AC}=2(-1)+1\cdot2+0\cdot3=-2+2+0=0$. Son perpendiculares: el triángulo es rectángulo en $A$.
Comprobación con Pitágoras: $|\vec{AB}|^2=5$, $|\vec{AC}|^2=14$, $|\vec{BC}|^2=|(-3,1,3)|^2=19=5+14$. ✔
:::

## 7. Práctica

**Fáciles**

1. Calcula el vector de $P(3,-1)$ a $Q(-2,4)$.
2. Calcula el módulo de $(6,-8)$.
3. Calcula $(1,2,-3)\cdot(4,0,1)$.

**Medios**

4. Halla un vector unitario en la dirección de $(3,0,4)$.
5. ¿Son paralelos $(2,-6,4)$ y $(-1,3,-2)$? Justifica.

**Tipo examen / transferencia**

6. Dados $\vec u=(1,2,2)$ y $\vec v=(2,-1,k)$: (a) halla $k$ para que sean perpendiculares; (b) con $k=2$, calcula el ángulo que forman.

:::solucion Soluciones paso a paso
1. $\vec{PQ}=(-2-3,\;4-(-1))=(-5,5)$.
2. $\sqrt{36+64}=\sqrt{100}=10$.
3. $4+0-3=1$.
4. Módulo $\sqrt{9+0+16}=5$; unitario $\left(\dfrac{3}{5},0,\dfrac{4}{5}\right)$.
5. Sí: $(2,-6,4)=-2\cdot(-1,3,-2)$; las componentes son proporcionales con razón $-2$ (sentidos opuestos).
6. (a) $2-2+2k=0$ → $k=0$. (b) Con $k=2$: $\vec u\cdot\vec v=2-2+4=4$; $|\vec u|=3$, $|\vec v|=\sqrt{4+1+4}=3$; $\cos\alpha=\dfrac{4}{9}\approx0{,}444$ → $\alpha\approx63{,}6^\circ$.
:::

## 8. Cómo revisar tus errores

- El módulo nunca es negativo; si te sale una raíz de número negativo, olvidaste elevar al cuadrado algún signo.
- En los ángulos, $\cos\alpha$ debe estar entre $-1$ y $1$. Si no, hay un error en el producto escalar o en los módulos.
- Para comprobar perpendicularidad, usa el producto escalar, no «a ojo».
- En 3D, revisa que has escrito tres componentes en todos los vectores.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $\vec{AB}=B-A$; $|\vec u|=\sqrt{u_1^2+u_2^2+u_3^2}$.
- Suma y producto por escalar, componente a componente.
- $\vec u\cdot\vec v=u_1v_1+u_2v_2+u_3v_3=|\vec u||\vec v|\cos\alpha$; perpendiculares si vale 0.

**Vocabulario:** vector, componentes, módulo, dirección, sentido, escalar, vector unitario, producto escalar, ortogonal.

**Repaso:** a 1, 3, 7, 14 y 30 días. En cada repaso, toma tres puntos en el espacio, comprueba si forman un triángulo rectángulo y calcula un ángulo.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (Bachillerato). Alineado con los bloques de geometría y álgebra lineal del temario oficial de Matemáticas +25; base de matrices (M06-L02), rectas y planos (M07) y producto vectorial (M07-L04).
