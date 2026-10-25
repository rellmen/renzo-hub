---
id: economia-b03-l01
course: economia
module: B03
level: N2
title: Análisis de estados financieros: fondo de maniobra, periodo medio de maduración, ratios y rentabilidades
learning_objectives:
  - Calcular e interpretar el fondo de maniobra y diagnosticar el equilibrio financiero
  - Calcular el periodo medio de maduración económico y financiero
  - Calcular e interpretar los ratios de liquidez, tesorería, solvencia y endeudamiento, y la rentabilidad económica y financiera
prerequisites: [economia-b02-l01, economia-b00-l01]
skill_ids: [working_capital, maturation_period, financial_ratios, profitability]
exam_alignment: [analisis_financiero]
estimated_minutes: 65
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/economia_empresa/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

En B02 aprendiste a construir el balance y la cuenta de pérdidas y ganancias. Ahora aprenderás a **leerlos**: saber si una empresa podrá pagar sus deudas a corto plazo, si está demasiado endeudada y si es rentable. Las herramientas son el **fondo de maniobra**, el **periodo medio de maduración** y los **ratios** financieros. Es uno de los ejercicios más habituales del examen de Economía de la Empresa: te dan un balance, calculas varios indicadores y, sobre todo, **interpretas** qué significan y qué recomendarías. La interpretación vale tanto como el cálculo.

## 2. Lo que necesitas saber antes

- Masas patrimoniales: activo no corriente y corriente, patrimonio neto, pasivo no corriente y corriente (B02-L01).
- Dentro del activo corriente: existencias, realizable (clientes, deudores) y disponible (caja, bancos).
- Porcentajes y cocientes (B00-L01).

## 3. Idea intuitiva

Piensa en la economía de una familia. Si este mes tienes que pagar 1.000 € de facturas y solo tienes 600 € en la cuenta y 200 € que te deben, tendrás problemas aunque tengas una casa en propiedad: la casa no paga facturas. Eso es un problema de **liquidez**. La regla de oro de las finanzas es que **lo que hay que pagar pronto se financia con lo que se convierte pronto en dinero**, y las inversiones a largo plazo, con financiación a largo plazo.

Los ratios son como los análisis de sangre de la empresa: cada uno mide un aspecto (liquidez, solvencia, rentabilidad) y se compara con unos valores de referencia. Un solo valor no da un diagnóstico; el conjunto, sí.

## 4. Definición precisa

Notación: ANC = activo no corriente; AC = activo corriente; PN = patrimonio neto; PNC = pasivo no corriente; PC = pasivo corriente; Pasivo exigible = PNC + PC.

**Fondo de maniobra (FM)** o capital circulante:
$$FM=AC-PC=(PN+PNC)-ANC.$$
- $FM>0$: los recursos a largo plazo financian todo el activo no corriente y parte del corriente. Situación normal de **equilibrio**.
- $FM<0$: parte del activo no corriente se financia con deudas a corto. Riesgo de **suspensión de pagos** (salvo empresas que cobran al contado y pagan a plazo, como los supermercados).
- Un FM demasiado alto puede indicar recursos ociosos (mucho dinero parado).

**Ratios financieros** (valores de referencia orientativos; varían según el sector y el manual):

| Ratio | Fórmula | Referencia |
|---|---|---|
| Liquidez | $AC/PC$ | 1,5 – 2 |
| Tesorería | $(R+D)/PC$ | ≈ 1 |
| Disponibilidad | $D/PC$ | 0,1 – 0,3 |
| Solvencia | $AT/PE$ | > 1,5 |
| Endeudamiento | $PE/(PN+PE)$ | 0,4 – 0,6 |

Notación: $R$ = realizable; $D$ = disponible; $AT$ = activo total; $PE$ = pasivo exigible. Qué mide cada ratio:
- **Liquidez** (solvencia a corto plazo): capacidad de pagar las deudas a corto con todo el activo corriente.
- **Tesorería** (prueba ácida): lo mismo, pero sin contar las existencias, que son lo menos líquido.
- **Disponibilidad:** capacidad de pago inmediato con caja y bancos.
- **Solvencia** (garantía): capacidad de pagar todas las deudas con todo el activo.
- **Endeudamiento:** peso de la financiación ajena en el total.

Algunos manuales calculan el endeudamiento como $\dfrac{\text{Pasivo exigible}}{PN}$ (referencia aproximada de 0,5 a 1,5). En el examen, **escribe la fórmula que usas** antes de calcular.

**Rentabilidades:**
- **Rentabilidad económica (RE o ROA):** rendimiento de todos los activos, independientemente de cómo se financian:
$$RE=\frac{\text{BAII}}{\text{Activo total}}\cdot100,$$
donde BAII es el beneficio antes de intereses e impuestos.
- **Rentabilidad financiera (RF o ROE):** rendimiento para los propietarios:
$$RF=\frac{\text{Beneficio neto}}{PN}\cdot100.$$
- **Apalancamiento financiero:** si la RE es mayor que el coste de la deuda, endeudarse aumenta la RF; si es menor, la reduce.

**Periodo medio de maduración (PMM).** Días que tarda, de media, el dinero en dar una vuelta completa: se compran materias primas, se fabrican, se venden y se cobran.
- Subperiodos: almacenamiento de materias primas ($PM_a$), fabricación ($PM_f$), venta o almacenamiento de productos terminados ($PM_v$) y cobro a clientes ($PM_c$).
- Cada uno se calcula como $PM=\dfrac{365}{\text{rotación}}$, con $\text{rotación}=\dfrac{\text{flujo anual}}{\text{saldo medio}}$. Por ejemplo, $\text{rotación de clientes}=\dfrac{\text{ventas anuales}}{\text{saldo medio de clientes}}$.
- **PMM económico** $=PM_a+PM_f+PM_v+PM_c$.
- **PMM financiero** $=$ PMM económico $-PM_p$, donde $PM_p$ es el periodo medio de pago a proveedores.
- Una empresa comercial (que no fabrica) solo tiene $PM_v$ (almacenamiento de mercaderías) y $PM_c$.
- Cuanto **menor** sea el PMM financiero, menos financiación necesita la empresa para su actividad diaria.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Diagnóstico completo
Balance (miles de €): ANC 300; existencias 80; realizable 60; disponible 20; PN 250; PNC 110; PC 100. BAII 45; beneficio neto 30.

- AC $=80+60+20=160$. Activo total $=460$. Pasivo exigible $=210$.
- FM $=160-100=60$ > 0: equilibrio.
- Liquidez $=160/100=1{,}6$: adecuada.
- Tesorería $=(60+20)/100=0{,}8$: algo baja; depende de vender existencias.
- Solvencia $=460/210\approx2{,}19$: buena.
- Endeudamiento $=210/460\approx0{,}46$: equilibrado.
- RE $=45/460\cdot100\approx9{,}78\,\%$. RF $=30/250\cdot100=12\,\%$.

Interpretación: empresa solvente y equilibrada; vigilar la tesorería (por ejemplo, reduciendo existencias o acelerando cobros).
:::

:::ejemplo Ejemplo 2 · Fondo de maniobra negativo
ANC 500; AC 120; PN 300; PNC 100; PC 220. FM $=120-220=-100$.

El activo no corriente (500) no está cubierto por los recursos permanentes ($300+100=400$); faltan 100, financiados con deuda a corto. Riesgo de no poder pagar a corto plazo. Soluciones: ampliar capital, convertir deuda a corto en deuda a largo o vender activos no necesarios.
:::

:::ejemplo Ejemplo 3 · Periodo medio de maduración
Empresa comercial: compras anuales 365.000 €; ventas 730.000 €; existencias medias de mercaderías 30.000 € (a coste); saldo medio de clientes 60.000 €; saldo medio de proveedores 40.000 €.

- Rotación de existencias $=365.000/30.000\approx12{,}17$ → $PM_v=365/12{,}17\approx30$ días.
- Rotación de clientes $=730.000/60.000\approx12{,}17$ → $PM_c\approx30$ días.
- Rotación de proveedores $=365.000/40.000=9{,}125$ → $PM_p=40$ días.
- PMM económico $=30+30=60$ días. PMM financiero $=60-40=20$ días.

(Para simplificar se usan las compras como consumo de mercaderías; con datos de coste de ventas se usaría ese valor.)
:::

:::error Error típico
Dar solo los números sin interpretarlos. En el examen, cada ratio debe ir acompañado de una frase: qué indica, si está dentro de la referencia y qué haría la empresa para mejorarlo. Otro error: mezclar la fórmula del endeudamiento de un manual con la referencia de otro.
:::

## 6. Ejercicio guiado

Con estos datos (en €): AC 90.000; PC 60.000; existencias 40.000; disponible 10.000. Calcula el FM, la liquidez y la tesorería, e interpreta.

:::pista Primera pista
Realizable $=$ AC $-$ existencias $-$ disponible.
:::

:::pista Segunda pista
Realizable $=90.000-40.000-10.000=40.000$.
:::

:::solucion Solución guiada
FM $=30.000$ € (positivo). Liquidez $=90/60=1{,}5$ (en el límite inferior de la referencia). Tesorería $=(40+10)/60\approx0{,}83$ (por debajo de 1): la empresa depende de vender sus existencias para pagar a corto plazo. Recomendación: reducir existencias o negociar más plazo con los proveedores.
:::

## 7. Práctica

**Fáciles**

1. FM con AC = 200.000 € y PC = 150.000 €.
2. Liquidez con AC = 120.000 € y PC = 100.000 €.
3. RF con beneficio neto 18.000 € y PN 150.000 €.

**Medios**

4. Una empresa tiene un PMM económico de 75 días y paga a proveedores a 50 días. ¿Cuál es su PMM financiero y qué significa?
5. RE: BAII 60.000 €, activo total 500.000 €. Si la deuda cuesta un 6 %, ¿le conviene endeudarse más?

**Tipo examen**

6. Balance (miles de €): ANC 400; existencias 50; clientes 70; caja y bancos 30; PN 280; PNC 170; PC 100. Beneficio neto 28; BAII 50. Calcula FM, liquidez, tesorería, solvencia, endeudamiento (sobre el total), RE y RF, y redacta un diagnóstico de cuatro líneas.

:::solucion Soluciones paso a paso
1. 50.000 €.
2. 1,2: por debajo de la referencia (1,5).
3. 12 %.
4. $75-50=25$ días: la empresa necesita financiar 25 días de su ciclo con recursos propios o deuda.
5. RE $=12\,\%$ > 6 %: el apalancamiento es positivo; endeudarse aumentaría la RF (con más riesgo).
6. AC $=150$; activo total $=550$; pasivo exigible $=270$. FM $=50$; liquidez $=1{,}5$; tesorería $=1{,}0$; solvencia $\approx2{,}04$; endeudamiento $\approx0{,}49$; RE $\approx9{,}09\,\%$; RF $=10\,\%$. Diagnóstico: equilibrio financiero (FM positivo), liquidez y tesorería en valores adecuados, buena solvencia y endeudamiento equilibrado. Es rentable, y la RF supera a la RE, lo que indica que la deuda está siendo favorable para los propietarios.
:::

## 8. Cómo revisar tus errores

- Comprueba que activo total = PN + pasivo exigible antes de empezar.
- Escribe cada fórmula antes de sustituir.
- Interpreta cada ratio con su referencia y propone una mejora si está fuera.
- En el PMM, no restes el periodo de pago al económico; esa resta da el financiero.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- FM $=AC-PC$: positivo, equilibrio; negativo, riesgo a corto.
- Liquidez, tesorería y disponibilidad (corto plazo); solvencia y endeudamiento (largo plazo).
- RE $=$ BAII/Activo; RF $=$ BN/PN. PMM económico y financiero.

**Vocabulario:** fondo de maniobra, liquidez, tesorería, prueba ácida, solvencia, endeudamiento, rentabilidad económica, rentabilidad financiera, apalancamiento, periodo medio de maduración, rotación.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, calcula los ratios de un balance sencillo y escribe un diagnóstico de cuatro líneas.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2. Fórmulas habituales en el bachillerato español; las referencias numéricas son orientativas y algunos manuales usan variantes. Alineado con el bloque de análisis financiero del temario de Economía de la Empresa +25.
