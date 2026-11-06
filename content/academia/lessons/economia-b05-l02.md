---
id: economia-b05-l02
course: economia
module: B05
level: N2
title: Inversiones tipo examen: valor residual, TIR a mano y sensibilidad del VAN
learning_objectives:
  - Incluir el valor residual en el último flujo y calcular el VAN
  - Calcular a mano la TIR de un proyecto de uno o dos periodos con el cambio de variable
  - Explicar cómo cambia el VAN con el tipo de descuento y por qué payback y VAN pueden contradecirse
prerequisites: [economia-b05-l01]
skill_ids: [npv_irr, residual_value, payback]
exam_alignment: [inversion]
estimated_minutes: 50
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/economia_empresa/
content_version: 1
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

En B05-L01 aprendiste payback, VAN y TIR. Esta lección es de **entrenamiento tipo examen**: los enunciados reales añaden detalles que hacen perder puntos si no se conocen. Practicarás tres de ellos: el **valor residual** (lo que se recupera al vender el equipo al final), el cálculo de la **TIR a mano** cuando el proyecto dura uno o dos años, y la **sensibilidad del VAN** al tipo de descuento. Terminarás con un caso completo en el que payback y VAN dan decisiones opuestas y tendrás que justificar cuál seguir.

## 2. Lo que necesitas saber antes

- Fórmula del VAN: $-A+\sum\dfrac{Q_t}{(1+k)^t}$ (B05-L01).
- Ecuación de segundo grado: $ax^2+bx+c=0\Rightarrow x=\dfrac{-b\pm\sqrt{b^2-4ac}}{2a}$.
- Factores útiles: $1{,}05^2=1{,}1025$; $1{,}06^2=1{,}1236$; $1{,}06^3=1{,}191016$; $1{,}08^2=1{,}1664$; $1{,}1^3=1{,}331$.

## 3. Idea intuitiva

El **valor residual** es dinero que entra al final: si vendes la máquina por 8.000 € en el año 3, ese año tienes un cobro extra. No cambia la fórmula, solo hay que sumarlo al flujo de ese año.

La **TIR** es la «rentabilidad propia» del proyecto. Con dos años, la ecuación $\text{VAN}=0$ es de segundo grado si llamas $x$ al factor de descuento $\dfrac{1}{1+r}$. Resuelves $x$ y despejas $r$.

**Sensibilidad:** cuanto más exiges al dinero (más alto es $k$), más pequeños son los flujos futuros traídos a hoy y menor es el VAN. El VAN baja al subir $k$ y vale cero justo cuando $k$ es igual a la TIR. Por eso «VAN $>0$» y «TIR $>k$» dan la misma decisión en un proyecto normal.

## 4. Definición precisa

**Flujo con valor residual:** $Q_n^{*}=Q_n+VR$, donde $VR$ es el valor de venta del activo al final (si el enunciado dice que hay impuestos sobre esa venta, se descuentan; si no lo dice, se usa tal cual).

**TIR de un periodo:** $0=-A+\dfrac{Q_1}{1+r}\Rightarrow r=\dfrac{Q_1}{A}-1$.

**TIR de dos periodos:** con $x=\dfrac{1}{1+r}$, la ecuación $0=-A+Q_1x+Q_2x^2$ se resuelve como $Q_2x^2+Q_1x-A=0$. Se toma la raíz **positiva** de $x$ y se calcula $r=\dfrac{1}{x}-1$.

**Relación VAN–$k$:** en un proyecto con desembolso inicial y flujos positivos, el VAN **disminuye** cuando $k$ aumenta; $\text{VAN}(k)=0\iff k=\text{TIR}$.

**Cómo presentar un ejercicio de inversiones.** Los correctores valoran el planteamiento tanto como el resultado. Escribe primero la fórmula con letras, luego la sustitución con los números del enunciado, después el resultado con su unidad (euros, años o porcentaje) y por último una frase de conclusión con el criterio. Si redondeas, hazlo al final y con dos decimales. Si el enunciado da los factores de descuento ya calculados, úsalos tal cual para no arrastrar diferencias.

**Qué hacer cuando la TIR no se puede despejar.** Con tres o más años, la ecuación de la TIR no tiene una solución sencilla a mano. Lo habitual es pedir que la **plantees** (escribir la ecuación igualada a cero) o que la compares con $k$ usando el VAN: si el VAN calculado al tipo $k$ es positivo, la TIR es mayor que $k$; si es negativo, menor. Así puedes razonar la decisión sin calcular la TIR exacta.

**Payback frente a VAN:** el payback premia recuperar pronto (liquidez y menos riesgo); el VAN mide valor creado. Si se contradicen, la decisión de referencia es el VAN, salvo que el enunciado diga que la empresa necesita liquidez urgente o el entorno es muy incierto.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · VAN con valor residual
Una máquina cuesta 50.000 €; genera 18.000 € anuales durante 3 años y se vende al final por 8.000 €. $k=6\,\%$.

1. Flujos: 18.000; 18.000; $18.000+8.000=26.000$ €.
2. VAN $=-50.000+\dfrac{18.000}{1{,}06}+\dfrac{18.000}{1{,}1236}+\dfrac{26.000}{1{,}191016}$.
3. $=-50.000+16.981{,}13+16.019{,}94+21.830{,}10=4.831{,}17$ €. Aceptable.

Sin el valor residual, el último término sería $15.113{,}15$ € y el VAN negativo ($-1.885{,}78$ €): olvidarlo cambia la decisión.
:::

:::ejemplo Ejemplo 2 · TIR de dos periodos y sensibilidad
Desembolso 5.000 €; flujos 2.000 € y 4.000 €.

1. $4.000x^2+2.000x-5.000=0\Rightarrow4x^2+2x-5=0$.
2. $x=\dfrac{-2+\sqrt{4+80}}{8}=\dfrac{-2+9{,}1652}{8}=0{,}8956$.
3. $r=\dfrac{1}{0{,}8956}-1=0{,}1165$. **TIR $\approx11{,}65\,\%$.**
4. Comprobación: VAN al 5 % $=-5.000+1.904{,}76+3.628{,}12=532{,}88$ € $>0$; VAN al 15 % $=-5.000+1.739{,}13+3.024{,}57=-236{,}29$ € $<0$. El VAN cambia de signo entre 5 % y 15 %, donde está la TIR.
:::

:::error Error típico
Poner el valor residual en el año 0 o restarlo, u olvidarlo. Es un **cobro** del último año. En la TIR, otro error es quedarse con $x$ como si fuera la rentabilidad: $x$ es el factor de descuento; la TIR es $\dfrac{1}{x}-1$. Y en la raíz, la solución negativa de $x$ no tiene sentido económico.
:::

## 6. Ejercicio guiado

Desembolso 20.000 €; flujos 10.000 € y 13.200 €. Calcula la TIR y decide si se acepta con $k=8\,\%$.

:::pista Primera pista
Plantea $13.200x^2+10.000x-20.000=0$ y simplifica dividiendo entre 400.
:::

:::pista Segunda pista
Te queda $33x^2+25x-50=0$; el discriminante es $625+6.600=7.225=85^2$.
:::

:::solucion Solución guiada
$x=\dfrac{-25+85}{66}=\dfrac{60}{66}=0{,}9091$ → $r=\dfrac{1}{0{,}9091}-1=0{,}10$. **TIR $=10\,\%>8\,\%$: se acepta.** Comprobación: $\dfrac{10.000}{1{,}1}+\dfrac{13.200}{1{,}21}=9.090{,}91+10.909{,}09=20.000$.
:::

## 7. Práctica

**Fáciles**

1. Desembolso 1.000 €, un único flujo de 1.100 € al año siguiente, $k=5\,\%$. ¿VAN?
2. Si la TIR de un proyecto es 8 % y $k=8\,\%$, ¿cuánto vale el VAN?
3. ¿En qué año se coloca el valor residual de una máquina que se vende al final de su vida útil?

**Medios**

4. Desembolso 12.000 €; flujos de 5.000 € durante 3 años y valor residual de 2.000 €; $k=10\,\%$. ¿VAN?
5. Desembolso 1.000 €; flujo 0 € el año 1 y 1.210 € el año 2. ¿TIR?

**Tipo examen / transferencia**

6. Una empresa con $k=8\,\%$ duda entre dos inversiones de 40.000 €. A: 15.000 € anuales durante 3 años y valor residual de 10.000 €. B: 22.000 € los años 1 y 2, sin valor residual. a) Calcula el payback y el VAN de cada una. b) Calcula la TIR de B. c) ¿Cuál eliges? Justifícalo.

:::solucion Soluciones paso a paso
1. $-1.000+\dfrac{1.100}{1{,}05}=-1.000+1.047{,}62=47{,}62$ €.
2. Cero: la TIR es el tipo que anula el VAN.
3. En el último año, sumado al flujo de ese año.
4. $-12.000+4.545{,}45+4.132{,}23+\dfrac{7.000}{1{,}331}=-12.000+4.545{,}45+4.132{,}23+5.259{,}20\approx1.936{,}9$ €. Aceptable.
5. $(1+r)^2=1{,}21\Rightarrow1+r=1{,}1\Rightarrow$ **TIR $=10\,\%$**.
6. a) Payback A: $15.000+15.000=30.000$; faltan $10.000$ de $25.000$ → **2,4 años**. Payback B: faltan $18.000$ de $22.000$ el año 2 → **1,82 años**. VAN A $=-40.000+13.888{,}89+12.860{,}08+19.845{,}81=6.594{,}78$ €. VAN B $=-40.000+20.370{,}37+18.861{,}45=-768{,}18$ €. b) $22.000x^2+22.000x-40.000=0\Rightarrow11x^2+11x-20=0\Rightarrow x=0{,}9381\Rightarrow$ **TIR $\approx6{,}6\,\%$**. c) **A**: es la única con VAN positivo. B se recupera antes, pero su TIR (6,6 %) no llega al 8 % exigido; solo tendría sentido si la empresa necesitara liquidez urgente, y aun así destruiría valor.
:::

## 8. Cómo revisar tus errores

- ¿Has sumado el valor residual al flujo del **último** año?
- En la TIR de dos periodos, ¿has usado la raíz positiva y calculado $r=\frac{1}{x}-1$?
- ¿Has comprobado la TIR sustituyendo en el VAN (debe dar casi cero)?
- ¿Tu conclusión dice qué criterio sigues y por qué cuando payback y VAN discrepan?

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Valor residual: cobro extra en el último año.
- TIR de dos años: $Q_2x^2+Q_1x-A=0$, $x=\frac{1}{1+r}$.
- VAN baja al subir $k$; VAN $=0$ en $k=$ TIR.
- Si payback y VAN discrepan, manda el VAN salvo necesidad clara de liquidez.

**Vocabulario:** valor residual, factor de descuento, TIR, sensibilidad, liquidez, riesgo, criterio de decisión.

**Repaso:** a 1, 3, 7, 14 y 30 días. Resuelve cada vez una TIR de dos años con números «redondos» y comprueba el resultado en el VAN.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de inversión del temario oficial de Economía de la Empresa +25.
