---
id: matematicas-m02-l07
course: matematicas
module: M02
level: N2
title: Números complejos en forma binómica y polar
learning_objectives:
  - Entender la unidad imaginaria y resolver ecuaciones de segundo grado con discriminante negativo
  - Sumar, restar, multiplicar y dividir complejos en forma binómica usando el conjugado
  - Calcular módulo y argumento, pasar a forma polar e interpretar el producto en polar
prerequisites: [matematicas-m02-l04, matematicas-m06-l01]
skill_ids: [complex_binomial, complex_polar]
exam_alignment: [algebra]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Cuando una ecuación de segundo grado tiene discriminante negativo, decimos que no tiene soluciones **reales**. Los números complejos amplían los números para que sí las tenga. En esta lección verás qué es la unidad imaginaria $i$, cómo operar con complejos en **forma binómica** $a+bi$ y la idea de la **forma polar** (módulo y ángulo). En el catálogo, este tema es de nivel introductorio: conviene dominarlo por si aparece en el temario de la convocatoria y porque es imprescindible en Ingeniería Informática (señales, gráficos, circuitos) más adelante.

## 2. Lo que necesitas saber antes

- Ecuación de segundo grado y discriminante (M02-L04).
- Vectores en el plano, módulo y ángulos (M06-L01).
- Racionalizar con el conjugado (M02-L05): $(a+b)(a-b)=a^2-b^2$.

## 3. Idea intuitiva

En los números reales ningún número al cuadrado da $-1$. Los matemáticos decidieron «inventar» uno: $i$, con $i^2=-1$, y comprobaron que todas las reglas del álgebra seguían funcionando. Con él, $\sqrt{-9}=3i$ y la ecuación $x^2+9=0$ tiene soluciones $\pm3i$.

Un complejo $a+bi$ se puede dibujar como un punto (o un vector) del plano: $a$ en el eje horizontal (parte real) y $b$ en el vertical (parte imaginaria). Entonces tiene una longitud (módulo) y un ángulo (argumento), igual que un vector. Multiplicar complejos resulta ser **multiplicar longitudes y sumar ángulos**: una rotación con cambio de escala.

## 4. Definición precisa

- **Unidad imaginaria**: $i$ con $i^2=-1$. Potencias: $i^1=i$, $i^2=-1$, $i^3=-i$, $i^4=1$, y se repiten cada 4: $i^n=i^{\,n \bmod 4}$.
- **Complejo en forma binómica**: $z=a+bi$ con $a,b\in\mathbb R$. $a=\text{Re}(z)$ es la parte real y $b=\text{Im}(z)$ la imaginaria. Si $b=0$, es real; si $a=0$ y $b\neq0$, imaginario puro.
- **Igualdad**: $a+bi=c+di\iff a=c$ y $b=d$.
- **Conjugado**: $\bar z=a-bi$. Se cumple $z\cdot\bar z=a^2+b^2$, un número real no negativo.
- **Operaciones**:
  - Suma y resta: parte real con parte real, imaginaria con imaginaria.
  - Producto: distributiva y sustituir $i^2=-1$: $(a+bi)(c+di)=(ac-bd)+(ad+bc)i$.
  - Cociente: multiplicar numerador y denominador por el **conjugado del denominador**.
- **Ecuaciones de segundo grado con $\Delta<0$**: $x=\dfrac{-b\pm i\sqrt{-\Delta}}{2a}$. Las soluciones son conjugadas.
- **Módulo**: $|z|=\sqrt{a^2+b^2}$ (longitud del vector).
- **Argumento**: ángulo $\alpha$ que forma el vector con el semieje real positivo, con $\tan\alpha=\dfrac ba$; **hay que mirar el cuadrante** del punto $(a,b)$.
- **Forma polar**: $z=r_\alpha$ con $r=|z|$. **Forma trigonométrica**: $z=r(\cos\alpha+i\sin\alpha)$, de donde $a=r\cos\alpha$ y $b=r\sin\alpha$.
- **Producto y cociente en polar**: $r_\alpha\cdot s_\beta=(rs)_{\alpha+\beta}$ y $\dfrac{r_\alpha}{s_\beta}=\left(\dfrac rs\right)_{\alpha-\beta}$. **Potencia**: $(r_\alpha)^n=(r^n)_{n\alpha}$.

**Pasar de polar a binómica.** Con $r$ y $\alpha$ conocidos, $a=r\cos\alpha$ y $b=r\sin\alpha$. Por ejemplo, $2_{90^\circ}=2(\cos90^\circ+i\sin90^\circ)=2i$ y $3_{180^\circ}=-3$. Los complejos de módulo 1 están todos sobre una circunferencia de radio 1 centrada en el origen.

**Por qué el conjugado sirve para dividir.** Igual que al racionalizar (M02-L05), multiplicar por el conjugado elimina la parte imaginaria del denominador, porque $(c+di)(c-di)=c^2+d^2$ es real. Después basta con repartir el denominador entre la parte real y la imaginaria del numerador.

**Cuándo usar cada forma.** Para sumar y restar, la binómica. Para multiplicar, dividir y elevar a potencias, la polar es mucho más rápida.

**Por qué el producto suma ángulos.** Usando la forma trigonométrica y las fórmulas del coseno y seno de una suma (M05-L03), $(\cos\alpha+i\sin\alpha)(\cos\beta+i\sin\beta)=\cos(\alpha+\beta)+i\sin(\alpha+\beta)$. Por eso, multiplicar por $i=1_{90^\circ}$ equivale a girar 90°.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Ecuación con discriminante negativo
Resuelve $x^2-2x+5=0$.

$\Delta=4-20=-16$; $\sqrt{-16}=4i$. $x=\dfrac{2\pm4i}{2}=1\pm2i$.
Comprobación con $x=1+2i$: $(1+2i)^2=1+4i-4=-3+4i$; $-3+4i-2-4i+5=0$. ✔
:::

:::ejemplo Ejemplo 2 · Operaciones en binómica
Con $z=3+2i$ y $w=1-i$, calcula $z\cdot w$ y $\dfrac{z}{w}$.

1. $z\cdot w=3-3i+2i-2i^2=3-i+2=5-i$.
2. $\dfrac{(3+2i)(1+i)}{(1-i)(1+i)}=\dfrac{3+3i+2i+2i^2}{1+1}=\dfrac{1+5i}{2}=\dfrac12+\dfrac52i$.
:::

:::ejemplo Ejemplo 3 · Forma polar
Expresa $z=1+i$ y $w=-2$ en forma polar y calcula $z\cdot w$.

1. $|z|=\sqrt2$; $(1,1)$ está en el primer cuadrante y $\tan\alpha=1$ → $\alpha=45^\circ$: $z=\sqrt2_{45^\circ}$.
2. $w=2_{180^\circ}$.
3. $z\cdot w=(2\sqrt2)_{225^\circ}$. Comprobación en binómica: $(1+i)(-2)=-2-2i$, de módulo $2\sqrt2$ y en el tercer cuadrante (225°). ✔
:::

:::error Error típico
Escribir $i^2=1$ o $\sqrt{-16}=-4$. Otro error: calcular el argumento solo con $\arctan\dfrac ba$ sin mirar el cuadrante: $-1-i$ y $1+i$ tienen el mismo cociente $\dfrac ba=1$, pero argumentos $225^\circ$ y $45^\circ$.
:::

## 6. Ejercicio guiado

Calcula $i^{27}$.

:::pista Primera pista
Las potencias de $i$ se repiten cada 4. Divide 27 entre 4.
:::

:::pista Segunda pista
$27=4\cdot6+3$, así que $i^{27}=(i^4)^6\cdot i^3$.
:::

:::solucion Solución guiada
$i^{27}=1^6\cdot i^3=-i$.
:::

## 7. Práctica

**Fáciles**

1. Escribe $\sqrt{-25}$ como número imaginario.
2. Calcula $(2-3i)+(-1+5i)$.
3. Escribe el conjugado de $4-7i$ y calcula el módulo de $3-4i$.

**Medios**

4. Calcula $(2+i)(3-2i)$.
5. Resuelve $x^2+6x+13=0$.

**Tipo examen / transferencia**

6. Escribe $z=-1+\sqrt3\,i$ en forma polar, calcula $z^2$ en polar y comprueba el resultado en forma binómica.

:::solucion Soluciones paso a paso
1. $5i$.
2. $1+2i$.
3. $\bar z=4+7i$; $|3-4i|=\sqrt{9+16}=5$.
4. $6-4i+3i-2i^2=8-i$.
5. $\Delta=36-52=-16$ → $x=\dfrac{-6\pm4i}{2}=-3\pm2i$.
6. $|z|=\sqrt{1+3}=2$; el punto $(-1,\sqrt3)$ está en el segundo cuadrante con $\tan\alpha=-\sqrt3$ → $\alpha=120^\circ$: $z=2_{120^\circ}$. $z^2=4_{240^\circ}=4\left(-\tfrac12-\tfrac{\sqrt3}{2}i\right)=-2-2\sqrt3\,i$. Binómica: $(-1+\sqrt3i)^2=1-2\sqrt3i+3i^2=-2-2\sqrt3i$. ✔
:::

## 8. Cómo revisar tus errores

- Cada vez que aparezca $i^2$, sustitúyelo por $-1$ inmediatamente.
- En una división, comprueba que el denominador final es real.
- Para el argumento, dibuja el punto y comprueba el cuadrante.
- Comprueba la forma polar volviendo a binómica con $a=r\cos\alpha$, $b=r\sin\alpha$.
- Las soluciones complejas de una cuadrática con coeficientes reales siempre son conjugadas: si te sale solo una, falta la otra.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $i^2=-1$; potencias de $i$ cíclicas de periodo 4.
- Binómica $a+bi$: sumar por partes, multiplicar con distributiva, dividir con el conjugado.
- Polar $r_\alpha$: $r=\sqrt{a^2+b^2}$, $\alpha$ según cuadrante; producto multiplica módulos y suma argumentos.

**Vocabulario:** unidad imaginaria, parte real, parte imaginaria, conjugado, módulo, argumento, forma binómica, forma polar, forma trigonométrica.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve una cuadrática con $\Delta<0$ y multiplica dos complejos en binómica y en polar.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato), introductorio según el catálogo. Alineado con el bloque de álgebra del temario oficial de Matemáticas +25; su peso en la convocatoria debe confirmarse con el temario vigente. Utiliza nociones de trigonometría que se desarrollan en M05.
