---
id: economia-b10-l02
course: economia
module: B10
level: N2
title: Costes, umbral de rentabilidad y decisión de fabricar o comprar
learning_objectives:
  - Clasificar costes en fijos y variables y calcular coste total y coste medio
  - Calcular el umbral de rentabilidad (punto muerto) y el beneficio para un volumen dado
  - Decidir entre fabricar o comprar (o subcontratar) calculando el volumen de indiferencia
prerequisites: [economia-b10-l01, economia-b07-l01]
skill_ids: [costs, break_even, make_or_buy]
exam_alignment: [produccion]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/economia_empresa/
content_version: 1
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Casi todas las decisiones de producción dependen de **cuánto cuesta producir según el volumen**. En esta lección clasificarás los costes, calcularás el coste total y el medio, repasarás a fondo el **umbral de rentabilidad** (punto muerto, que ya viste en B07-L01) y aprenderás una decisión que cae a menudo en los ejercicios: **¿fabricar una pieza (o hacer un servicio) por nuestra cuenta o comprarla a otro?** En logística la pregunta es la misma con otro nombre: ¿transporte propio o subcontratado?

## 2. Lo que necesitas saber antes

- Ecuaciones de primer grado: $20.000+4Q=8Q\Rightarrow Q=5.000$.
- Porcentajes y regla de tres (B00-L01).
- Ingresos $=$ precio $\times$ cantidad.

## 3. Idea intuitiva

Algunos costes existen aunque no produzcas nada: el alquiler de la nave, el seguro, la amortización de la maquinaria, el sueldo fijo del encargado. Son **fijos**. Otros crecen con cada unidad: materiales, energía de las máquinas, comisiones, embalaje. Son **variables**.

Como los fijos se reparten entre todas las unidades, **cuanto más produces, menos cuesta cada unidad de media**. Por eso fabricar uno mismo compensa a partir de cierto volumen: pagas unos fijos altos (máquinas, personal) pero cada unidad te sale más barata que comprarla fuera. Con poco volumen, en cambio, conviene comprar o subcontratar y no cargar con esos fijos.

## 4. Definición precisa

- **Costes fijos (CF):** no dependen del volumen a corto plazo.
- **Costes variables (CV):** $CV=cv\cdot Q$, con $cv$ el coste variable unitario.
- **Coste total:** $CT=CF+cv\cdot Q$.
- **Coste medio (unitario):** $CMe=\dfrac{CT}{Q}=\dfrac{CF}{Q}+cv$. Disminuye al aumentar $Q$ (economías de escala a corto plazo).
- **Margen de contribución unitario:** $p-cv$: lo que cada unidad vendida aporta para cubrir los fijos.
- **Umbral de rentabilidad o punto muerto:** $Q^{*}=\dfrac{CF}{p-cv}$. Por debajo hay pérdidas; por encima, beneficios.
- **Beneficio:** $B=(p-cv)\cdot Q-CF$.

**Fabricar o comprar.** Si comprar cuesta $p_c$ por unidad y fabricar cuesta $CF+cv\cdot Q$:
$$\text{Volumen de indiferencia: }p_c\cdot Q=CF+cv\cdot Q\Rightarrow Q_I=\frac{CF}{p_c-cv}$$
- Si $Q>Q_I$: **fabricar** es más barato.
- Si $Q<Q_I$: **comprar** es más barato.

**Fijos a corto plazo, variables a largo.** La distinción entre fijos y variables depende del horizonte: a corto plazo la nave y la plantilla fija no cambian, pero a largo plazo la empresa puede ampliar o cerrar instalaciones, y entonces todos los costes son variables. Por eso el punto muerto y la decisión de fabricar o comprar son análisis **a corto plazo** con una capacidad dada. Si el volumen necesario supera la capacidad de la instalación, habría que añadir nuevos costes fijos y repetir el cálculo.

**Cómo se lee el gráfico.** En el gráfico del punto muerto, el eje horizontal es la cantidad y el vertical, euros. La recta de ingresos sale del origen con pendiente $p$; la de costes totales sale de la altura CF con pendiente $cv$. Donde se cortan está $Q^{*}$: a la izquierda, zona de pérdidas; a la derecha, de beneficios. En fabricar o comprar el gráfico es el mismo, cambiando ingresos por coste de comprar.

Además del coste, se valoran factores cualitativos: control de calidad, plazos, dependencia del proveedor, saber hacer propio, capacidad ociosa y flexibilidad.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Coste medio y escala
CF 30.000 €; $cv=12$ €.

1. Con 5.000 unidades: $CT=30.000+60.000=90.000$ €; $CMe=18$ €.
2. Con 10.000 unidades: $CT=150.000$ €; $CMe=15$ €.

Doblar la producción no dobla el coste total, porque los fijos no cambian; el coste por unidad baja de 18 € a 15 €.
:::

:::ejemplo Ejemplo 2 · Fabricar o comprar una pieza
Un proveedor vende la pieza a 8 €. Fabricarla exige CF de 20.000 € al año y $cv=4$ €. Se necesitan 7.000 piezas.

1. $Q_I=\dfrac{20.000}{8-4}=5.000$ piezas.
2. Con 7.000: comprar $=56.000$ €; fabricar $=20.000+28.000=48.000$ €.
3. Como $7.000>5.000$, **fabricar** ahorra 8.000 € al año.
:::

:::ejemplo Ejemplo 3 · Punto muerto y beneficio
$p=25$ €, $cv=15$ €, CF 40.000 €.

1. $Q^{*}=\dfrac{40.000}{25-15}=4.000$ unidades.
2. Con 6.000 unidades: $B=10\cdot6.000-40.000=20.000$ €.
3. Para ganar 30.000 € hacen falta $\dfrac{40.000+30.000}{10}=7.000$ unidades.
:::

:::error Error típico
Tratar los fijos como si fueran variables (multiplicarlos por las unidades) o calcular el punto muerto con el precio en lugar del margen: $Q^{*}=\dfrac{CF}{p-cv}$, no $\dfrac{CF}{p}$. En fabricar o comprar, otro error es olvidar los costes fijos de fabricar y comparar solo $p_c$ con $cv$.
:::

## 6. Ejercicio guiado

Comprar la pieza cuesta 15 €. Fabricarla: CF 36.000 €, $cv=9$ €. Se necesitan 5.000 unidades. ¿Fabricar o comprar?

:::pista Primera pista
Calcula el volumen de indiferencia con $\dfrac{CF}{p_c-cv}$.
:::

:::pista Segunda pista
Compara 5.000 con ese volumen y confirma calculando los dos costes.
:::

:::solucion Solución guiada
$Q_I=\dfrac{36.000}{6}=6.000$. Como $5.000<6.000$, **comprar**: $75.000$ € frente a $36.000+45.000=81.000$ € fabricando.
:::

## 7. Práctica

**Fáciles**

1. CF 10.000 €, $cv=5$ €, $Q=2.000$. ¿Coste total?
2. Con los datos anteriores, ¿coste medio?
3. CF 24.000 €, $p=20$ €, $cv=12$ €. ¿Punto muerto?

**Medios**

4. Comprar: 6 €/unidad. Fabricar: CF 8.000 €, $cv=2$ €. Se necesitan 3.000 unidades. ¿Qué conviene y cuánto se ahorra?
5. Con los datos del ejercicio 3, ¿beneficio con 5.000 unidades? ¿Cuántas unidades para ganar 20.000 €?

**Tipo examen / transferencia**

6. Una distribuidora decide si mantener su reparto propio o subcontratarlo. Subcontratar cuesta 2,50 € por paquete. El reparto propio tiene CF de 60.000 € al año (amortización de furgonetas, seguros, sueldos fijos) y un coste variable de 1,30 € por paquete (combustible y peajes). a) Calcula el volumen de indiferencia. b) ¿Qué conviene con 40.000 paquetes al año? ¿Y con 70.000? c) Cita dos factores no económicos que debería considerar.

:::solucion Soluciones paso a paso
1. $10.000+5\cdot2.000=20.000$ €.
2. $\dfrac{20.000}{2.000}=10$ €.
3. $\dfrac{24.000}{8}=3.000$ unidades.
4. $Q_I=\dfrac{8.000}{4}=2.000$. Con 3.000 conviene **fabricar**: $8.000+6.000=14.000$ € frente a $18.000$ €; ahorro de 4.000 €.
5. $B=8\cdot5.000-24.000=16.000$ €. Para 20.000 €: $\dfrac{24.000+20.000}{8}=5.500$ unidades.
6. a) $Q_I=\dfrac{60.000}{2{,}50-1{,}30}=50.000$ paquetes. b) Con 40.000: subcontratar 100.000 € frente a propio 112.000 € → **subcontratar**. Con 70.000: subcontratar 175.000 € frente a propio 151.000 € → **reparto propio**. c) Calidad y puntualidad del servicio al cliente, control de la imagen de marca, dependencia del proveedor, flexibilidad ante picos de demanda.
:::

## 8. Cómo revisar tus errores

- ¿Has separado bien fijos y variables?
- ¿El punto muerto usa el **margen** $p-cv$?
- En fabricar o comprar, ¿has incluido los fijos de fabricar y comparado el volumen con $Q_I$?
- ¿Has confirmado la decisión calculando los dos costes totales?
- ¿Has añadido algún factor cualitativo cuando el enunciado pide «justifica»?
- Prueba de coherencia: en el volumen de indiferencia los dos costes totales deben salir **iguales**; si no, revisa la división.
- Si te piden un beneficio objetivo, súmalo a los costes fijos antes de dividir entre el margen unitario.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $CT=CF+cv\cdot Q$; $CMe=\dfrac{CF}{Q}+cv$ (baja con el volumen).
- Punto muerto $Q^{*}=\dfrac{CF}{p-cv}$; beneficio $=(p-cv)Q-CF$.
- Fabricar o comprar: $Q_I=\dfrac{CF}{p_c-cv}$; fabricar si $Q>Q_I$.

**Vocabulario:** coste fijo, coste variable, coste total, coste medio, margen de contribución, umbral de rentabilidad, punto muerto, subcontratación, volumen de indiferencia, economías de escala.

**Repaso:** a 1, 3, 7, 14 y 30 días. Busca un servicio que podrías hacer tú o pagar a otro (lavar el coche, preparar comida) y calcula su volumen de indiferencia.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el área de producción y el umbral de rentabilidad del temario oficial de Economía de la Empresa +25.
