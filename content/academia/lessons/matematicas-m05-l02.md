---
id: matematicas-m05-l02
course: matematicas
module: M05
level: N2
title: Resolución de triángulos: rectángulos, teorema del seno y teorema del coseno
learning_objectives:
  - Resolver triángulos rectángulos con las razones trigonométricas y el teorema de Pitágoras
  - Resolver triángulos cualesquiera con el teorema del seno y el del coseno, eligiendo el adecuado
  - Calcular el área de un triángulo con dos lados y el ángulo comprendido y aplicar todo a problemas de distancias y alturas
prerequisites: [matematicas-m05-l01]
skill_ids: [right_triangles, law_of_sines, law_of_cosines]
exam_alignment: [trigonometria, geometria]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/matematiques/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

**Resolver un triángulo** es calcular todos sus lados y ángulos a partir de algunos datos. Con ello se calculan alturas inaccesibles (un edificio, una grúa), distancias entre puntos separados por un obstáculo, fuerzas en Física (descomponer un vector en componentes) o ángulos entre trayectorias. En esta lección verás las tres herramientas: las razones en el triángulo rectángulo, el **teorema del seno** y el **teorema del coseno**, y cómo decidir cuál usar según los datos.

## 2. Lo que necesitas saber antes

- Seno, coseno y tangente, y ángulos notables (M05-L01).
- Teorema de Pitágoras y raíces (M00-L06).
- Despejar en fórmulas (M01-L03).

## 3. Idea intuitiva

En un triángulo rectángulo, las razones trigonométricas son simples cocientes de lados: si conoces un ángulo agudo y un lado, puedes calcular los demás. Para medir la altura de un edificio basta con alejarse una distancia conocida y medir el ángulo con que se ve la azotea.

Si el triángulo no tiene ángulo recto, se usan dos «superpoderes». El **teorema del seno** dice que los lados son proporcionales a los senos de los ángulos opuestos: el lado más largo está frente al ángulo más grande. El **teorema del coseno** es un Pitágoras corregido: añade un término que depende del ángulo, y cuando ese ángulo es 90° el término desaparece y queda Pitágoras.

## 4. Definición precisa

Notación: lados $a$, $b$, $c$ opuestos a los ángulos $A$, $B$, $C$. Siempre $A+B+C=180^\circ$.

**Triángulo rectángulo** (ángulo recto en $C$, hipotenusa $c$):
$$\sin A=\frac{a}{c},\quad \cos A=\frac{b}{c},\quad \tan A=\frac{a}{b},\qquad a^2+b^2=c^2.$$

**Teorema del seno** (cualquier triángulo):
$$\frac{a}{\sin A}=\frac{b}{\sin B}=\frac{c}{\sin C}=2R,$$
donde $R$ es el radio de la circunferencia circunscrita.

**Teorema del coseno**:
$$c^2=a^2+b^2-2ab\cos C$$
(y análogamente para $a^2$ y $b^2$). Despejando: $\cos C=\dfrac{a^2+b^2-c^2}{2ab}$.

**Área**: $\text{Área}=\dfrac12\,a\,b\,\sin C$ (dos lados y el ángulo que forman). Si $C=90^\circ$, es la fórmula de siempre, base por altura entre dos.

**Qué teorema usar:**

| Datos conocidos | Herramienta |
|---|---|
| Hay un ángulo recto | razones y Pitágoras |
| Dos ángulos y un lado | tercer ángulo con la suma; después teorema del seno |
| Dos lados y el ángulo comprendido | teorema del coseno para el tercer lado |
| Los tres lados | teorema del coseno para los ángulos |
| Dos lados y un ángulo opuesto a uno de ellos | teorema del seno; atención al **caso ambiguo** |

**Caso ambiguo.** Si al aplicar el teorema del seno obtienes $\sin B=k$ con $0<k<1$, hay dos ángulos posibles: $B$ y $180^\circ-B$. Los dos son válidos solo si, sumados al ángulo conocido, no superan 180°. Para evitar el problema, cuando puedas calcula un ángulo con el teorema del coseno, que da un único ángulo entre 0° y 180°.

**Vocabulario de problemas.** El **ángulo de elevación** es el que forma la visual hacia arriba con la horizontal; el de **depresión**, hacia abajo. En los problemas de dos observadores, dibuja siempre el triángulo y marca qué ángulos son interiores.

**Precisión en los cálculos.** En estos problemas se encadenan varias operaciones con decimales. Guarda los resultados intermedios en la memoria de la calculadora y redondea solo la respuesta final; si redondeas un ángulo a las unidades y luego lo usas en otra fórmula, el error puede afectar ya a la primera cifra decimal.

**Por qué el teorema del coseno generaliza a Pitágoras.** Si $C=90^\circ$, $\cos C=0$ y queda $c^2=a^2+b^2$. Si $C$ es agudo, $\cos C>0$ y el lado $c$ es más corto que en el triángulo rectángulo; si es obtuso, $\cos C<0$ y $c$ es más largo. La fórmula cuantifica esta intuición.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Triángulo rectángulo
Una rampa de 10 m forma un ángulo de 35° con el suelo. ¿Qué altura salva y qué distancia horizontal ocupa?

Altura $=10\sin35^\circ\approx5{,}74$ m; distancia horizontal $=10\cos35^\circ\approx8{,}19$ m. Comprobación: $5{,}74^2+8{,}19^2\approx100$. ✔
:::

:::ejemplo Ejemplo 2 · Teorema del seno
En un triángulo, $A=40^\circ$, $B=65^\circ$ y $a=12$. Calcula $C$, $b$ y $c$.

1. $C=180^\circ-40^\circ-65^\circ=75^\circ$.
2. $b=\dfrac{12\sin65^\circ}{\sin40^\circ}\approx16{,}92$; $c=\dfrac{12\sin75^\circ}{\sin40^\circ}\approx18{,}03$.
3. Comprobación de sentido: el lado mayor ($c$) está frente al ángulo mayor ($C$). ✔
:::

:::ejemplo Ejemplo 3 · Teorema del coseno y área
Dos lados miden 7 y 9 y forman 60°. Calcula el tercer lado y el área.

1. $c^2=49+81-2\cdot7\cdot9\cdot\cos60^\circ=130-63=67$ → $c\approx8{,}19$.
2. Área $=\dfrac12\cdot7\cdot9\cdot\sin60^\circ\approx27{,}28$.
:::

:::error Error típico
Aplicar las razones del triángulo rectángulo ($\sin A=\tfrac{a}{c}$) a un triángulo que no es rectángulo. Otro error: en el teorema del coseno, olvidar el factor 2 o el signo menos: $c^2=a^2+b^2-2ab\cos C$.
:::

## 6. Ejercicio guiado

Desde un punto a 30 m de la base de un edificio, la azotea se ve con un ángulo de elevación de 50°. ¿Qué altura tiene el edificio?

:::pista Primera pista
Se forma un triángulo rectángulo: el cateto contiguo al ángulo es la distancia (30 m) y el opuesto, la altura.
:::

:::pista Segunda pista
La razón que relaciona opuesto y contiguo es la tangente.
:::

:::solucion Solución guiada
$h=30\tan50^\circ\approx35{,}75$ m. Comprobación de sentido: como $50^\circ>45^\circ$, la altura debe ser mayor que la distancia (30 m). ✔
:::

## 7. Práctica

**Fáciles**

1. Los catetos de un triángulo rectángulo miden 6 y 8. Calcula la hipotenusa y el ángulo opuesto al cateto de 6.
2. La hipotenusa mide 15 y un ángulo agudo 30°. ¿Cuánto mide el cateto opuesto?
3. Calcula el área de un triángulo con lados 5 y 6 que forman 30°.

**Medios**

4. En un triángulo, $a=10$, $A=30^\circ$ y $B=45^\circ$. Calcula $b$.
5. Los lados de un triángulo miden 5, 7 y 8. Calcula el ángulo opuesto al lado de 7.

**Tipo examen / transferencia**

6. Dos personas, A y B, separadas 100 m en línea recta, ven un dron situado entre ambas con ángulos de elevación de 40° (desde A) y 65° (desde B). Calcula la distancia de A al dron y la altura a la que vuela.

:::solucion Soluciones paso a paso
1. Hipotenusa 10; $\tan A=\dfrac68$ → $A\approx36{,}87^\circ$.
2. $15\sin30^\circ=7{,}5$.
3. $\dfrac12\cdot5\cdot6\cdot\sin30^\circ=7{,}5$.
4. $b=\dfrac{10\sin45^\circ}{\sin30^\circ}=10\sqrt2\approx14{,}14$.
5. $\cos=\dfrac{25+64-49}{2\cdot5\cdot8}=\dfrac{40}{80}=0{,}5$ → $60^\circ$.
6. Triángulo con $AB=100$, $A=40^\circ$, $B=65^\circ$, ángulo en el dron $75^\circ$. Teorema del seno: $AD=\dfrac{100\sin65^\circ}{\sin75^\circ}\approx93{,}83$ m. Altura: $AD\sin40^\circ\approx60{,}31$ m.
:::

## 8. Cómo revisar tus errores

- Comprueba que los ángulos suman 180°.
- El lado mayor debe estar frente al ángulo mayor.
- Revisa la calculadora en modo grados.
- Si usas el teorema del seno para un ángulo, piensa si puede haber dos soluciones.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Rectángulo: razones y Pitágoras.
- Teorema del seno: $\dfrac{a}{\sin A}=\dfrac{b}{\sin B}=\dfrac{c}{\sin C}$.
- Teorema del coseno: $c^2=a^2+b^2-2ab\cos C$.
- Área $=\tfrac12ab\sin C$.

**Vocabulario:** resolver un triángulo, hipotenusa, cateto, teorema del seno, teorema del coseno, caso ambiguo, ángulo de elevación y de depresión.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, resuelve un triángulo con el teorema del seno, otro con el del coseno y un problema de alturas.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (1.º Bachillerato). Alineado con el bloque de trigonometría del temario oficial de Matemáticas +25; se aplica en geometría (M07) y en la descomposición de fuerzas en Física (F01, F03).
