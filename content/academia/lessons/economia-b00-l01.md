---
id: economia-b00-l01
course: economia
module: B00
level: N0
title: Porcentajes, variaciones y regla de tres para Economía de la Empresa
learning_objectives:
  - Calcular porcentajes, aumentos y descuentos con el factor multiplicador
  - Calcular variaciones porcentuales y distinguirlas de puntos porcentuales
  - Resolver proporciones con regla de tres directa e inversa
prerequisites: []
skill_ids: [percentages, percent_change, rule_of_three]
exam_alignment: [economia-calculo-base]
estimated_minutes: 40
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/economia_empresa/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Casi todos los ejercicios de Economía de la Empresa terminan en un porcentaje: rentabilidad económica y financiera, ratios de endeudamiento, variación de ventas, margen, tipo de interés, IVA. Si el porcentaje falla, la interpretación posterior también. En esta lección asegurarás el cálculo que sostiene el resto del curso: porcentajes de una cantidad, aumentos y descuentos encadenados, variaciones porcentuales y regla de tres. Recuerda que en el examen hay que **calcular e interpretar**: un número sin explicación no obtiene la puntuación completa.

## 2. Lo que necesitas saber antes

Multiplicar y dividir con decimales y operar con fracciones sencillas. Puedes usar calculadora, pero escribe siempre la operación que haces.

## 3. Idea intuitiva

«Por ciento» significa «de cada cien». Un 20 % es 20 de cada 100, es decir, $0{,}20$ de cada unidad. Por eso:

- Calcular el 20 % de algo = multiplicar por $0{,}20$.
- Subir algo un 20 % = quedarte con el 100 % y añadir el 20 % = multiplicar por $1{,}20$.
- Bajar algo un 20 % = quedarte con el 80 % = multiplicar por $0{,}80$.

Pensar en **factores multiplicadores** evita la mayoría de errores, sobre todo cuando hay varios cambios seguidos: una subida del 20 % y luego una bajada del 20 % **no** te dejan igual, porque la bajada se calcula sobre una cantidad mayor.

## 4. Definición precisa

- **Porcentaje de una cantidad:** $p\,\%$ de $C=C\cdot\dfrac{p}{100}$.
- **Aumento del $p\,\%$:** $C_{\text{final}}=C\cdot\left(1+\dfrac{p}{100}\right)$.
- **Disminución del $p\,\%$:** $C_{\text{final}}=C\cdot\left(1-\dfrac{p}{100}\right)$.
- **Cambios encadenados:** se multiplican los factores: subir 10 % y luego 5 % → $1{,}10\cdot1{,}05=1{,}155$ → subida total del 15,5 %, no del 15 %.
- **Variación porcentual (tasa de variación):**
$$\text{Variación}=\frac{\text{valor final}-\text{valor inicial}}{\text{valor inicial}}\cdot 100$$
  Se divide **siempre entre el valor inicial**.
- **Recuperar la cantidad inicial:** si tras subir un 21 % (IVA) el precio es 121 €, el precio sin IVA es $121\div1{,}21=100$ €, **no** $121-21\,\%\cdot121$.
- **Puntos porcentuales:** diferencia entre dos porcentajes. Si la rentabilidad pasa del 8 % al 10 %, sube **2 puntos porcentuales**, que equivale a un aumento relativo del 25 %.
- **Regla de tres directa:** si una magnitud aumenta y la otra también en la misma proporción ($\dfrac{a}{b}=\dfrac{c}{x}$).
- **Regla de tres inversa:** si una aumenta y la otra disminuye (más trabajadores → menos días): $a\cdot b=c\cdot x$.

**Cómo saber si la proporción es directa o inversa.** Pregúntate qué pasa si duplicas la primera magnitud. Si con el doble de unidades vendidas obtienes el doble de ingresos, es directa. Si con el doble de máquinas tardas la mitad, es inversa. Este razonamiento verbal es justo lo que el corrector quiere ver escrito antes del cálculo.

**Porcentajes en Economía de la Empresa.** A lo largo del curso aparecerán siempre con el mismo esquema: una magnitud dividida entre otra y multiplicada por 100. Por ejemplo, la **rentabilidad económica** compara el beneficio antes de intereses e impuestos con el activo total; la **rentabilidad financiera** compara el beneficio neto con el patrimonio neto; el **margen** compara el beneficio con las ventas. Cambia el numerador y el denominador, pero el cálculo es idéntico al que practicas aquí. Por eso conviene escribir siempre la fórmula con palabras antes de sustituir números: así el corrector ve que sabes qué estás comparando, aunque te equivoques en una cifra.

**Redondeo.** En euros, redondea a céntimos (dos decimales); en porcentajes, a uno o dos decimales salvo que el enunciado diga otra cosa. Redondea solo al final: si redondeas resultados intermedios, el error se acumula.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Variación de ventas
Las ventas pasan de 800 000 € a 920 000 €.

$$\frac{920\,000-800\,000}{800\,000}\cdot100=\frac{120\,000}{800\,000}\cdot100=15\,\%$$

**Interpretación:** las ventas han crecido un 15 % respecto al año anterior.
:::

:::ejemplo Ejemplo 2 · Descuentos encadenados frente a descuento único
Un proveedor ofrece un 10 % de descuento y, sobre el precio resultante, otro 10 % por pronto pago. ¿Es lo mismo que un 20 %?

Factor: $0{,}90\cdot0{,}90=0{,}81$ → se paga el 81 %: descuento total del **19 %**, no del 20 %. Sobre una compra de 5 000 €: $5000\cdot0{,}81=4050$ € frente a $4000$ € con un 20 % único.
:::

:::ejemplo Ejemplo 3 · Regla de tres inversa
Cuatro operarios hacen un inventario en 6 horas. ¿Cuánto tardarían 3 operarios al mismo ritmo?

Más operarios → menos horas: inversa. $4\cdot6=3\cdot x$ → $x=8$ horas.
:::

:::ejemplo Ejemplo 4 · Puntos frente a porcentaje
El endeudamiento de una empresa baja del 60 % al 45 %. Ha bajado **15 puntos porcentuales**, lo que supone una reducción relativa de $\dfrac{45-60}{60}\cdot100=-25\,\%$.
:::

:::error Error típico
Dividir entre el valor final. De 60 € a 75 €: $\dfrac{15}{60}=25\,\%$ (correcto), no $\dfrac{15}{75}=20\,\%$. Otro error: quitar el IVA restando un 21 %: $121\cdot0{,}79=95{,}59$ € ≠ 100 €.
:::

## 6. Ejercicio guiado

Un producto cuesta 250 € sin IVA. Se le aplica un descuento del 12 % y después el IVA del 21 %. ¿Cuál es el precio final?

:::pista Primera pista
Escribe los dos factores: descuento del 12 % → $0{,}88$; IVA del 21 % → $1{,}21$.
:::

:::pista Segunda pista
Multiplica el precio por los dos factores: el orden no cambia el resultado.
:::

:::solucion Solución guiada
$250\cdot0{,}88=220$ €; $220\cdot1{,}21=266{,}20$ €. **Precio final: 266,20 €.** (Directamente: $250\cdot0{,}88\cdot1{,}21=266{,}20$.)
:::

## 7. Práctica

**Fáciles**

1. Calcula el 12 % de 150 €.
2. Un salario de 2 000 € sube un 5 %. ¿Cuál es el nuevo salario?
3. Un precio pasa de 60 € a 75 €. ¿Qué variación porcentual ha tenido?

**Medios**

4. Un gasto baja de 500 € a 425 €. Calcula la variación porcentual e interprétala.
5. Una factura con IVA del 21 % asciende a 1 452 €. ¿Cuál es la base imponible (precio sin IVA)?

**Tipo examen**

6. Una empresa tiene un beneficio de 48 000 € con un activo total de 400 000 €. Al año siguiente el beneficio es de 54 000 € y el activo de 450 000 €. Calcula el porcentaje beneficio/activo de cada año, la variación en puntos porcentuales y la variación relativa del beneficio. Interpreta los resultados en dos líneas.

:::solucion Soluciones paso a paso
1. $150\cdot0{,}12=18$ €.
2. $2000\cdot1{,}05=2100$ €.
3. $\dfrac{75-60}{60}\cdot100=25\,\%$.
4. $\dfrac{425-500}{500}\cdot100=-15\,\%$: el gasto se ha reducido un 15 %.
5. $1452\div1{,}21=1200$ €.
6. Año 1: $\dfrac{48\,000}{400\,000}\cdot100=12\,\%$. Año 2: $\dfrac{54\,000}{450\,000}\cdot100=12\,\%$. Variación: **0 puntos porcentuales**. Variación del beneficio: $\dfrac{54\,000-48\,000}{48\,000}\cdot100=12{,}5\,\%$.
 **Interpretación:** el beneficio crece un 12,5 %, pero el activo crece en la misma proporción ($450/400=1{,}125$), así que la empresa no obtiene más beneficio por cada euro invertido: su eficiencia se mantiene. (Este cociente es la base de la *rentabilidad económica*, que verás en B03.)
:::

## 8. Cómo revisar tus errores

- Antes de calcular, escribe el **factor multiplicador** de cada cambio.
- En variaciones, rodea el **valor inicial**: es siempre el denominador.
- Comprueba a la inversa: si dices que de 60 a 75 hay un +25 %, verifica $60\cdot1{,}25=75$.
- Distingue en la redacción «puntos porcentuales» de «por ciento».
- Termina siempre con una frase de interpretación: en Economía, el número sin interpretación no puntúa completo.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $p\,\%$ de $C$ = $C\cdot p/100$; aumentos y descuentos con factores $(1\pm p/100)$.
- Cambios sucesivos: se multiplican factores.
- Variación = (final − inicial) / inicial · 100.
- Quitar IVA = dividir entre $1{,}21$.
- Puntos porcentuales ≠ variación relativa.

**Vocabulario:** factor multiplicador, base imponible, tasa de variación, punto porcentual, proporcionalidad directa/inversa.

**Repaso:** a 1, 3, 7, 14 y 30 días. En cada repaso, calcula la variación de dos datos reales (por ejemplo, tu gasto mensual de dos meses).

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N0. Base de cálculo para los bloques de contabilidad, análisis, financiación e inversión de Economía de la Empresa +25 (enlace al temario oficial en los metadatos).
