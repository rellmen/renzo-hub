---
id: economia-b05-l01
course: economia
module: B05
level: N2
title: Selección de inversiones: flujos de caja, payback, VAN y TIR
learning_objectives:
  - Representar una inversión mediante su desembolso inicial y sus flujos netos de caja
  - Calcular e interpretar el plazo de recuperación (payback)
  - Calcular el VAN, interpretar la TIR y elegir entre proyectos justificando la decisión
prerequisites: [economia-b00-l01, matematicas-m03-l04]
skill_ids: [cash_flows, payback, npv_irr]
exam_alignment: [inversion]
estimated_minutes: 55
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/economia_empresa/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Una empresa invierte cuando gasta dinero hoy esperando recuperar más en el futuro: una máquina nueva, una furgoneta, un almacén automatizado. Como el dinero es limitado, hay que elegir. En esta lección aprenderás los métodos de selección de inversiones del temario de Economía de la Empresa +25: el **plazo de recuperación** (payback), el **valor actual neto** (VAN) y la **tasa interna de rentabilidad** (TIR). Es uno de los ejercicios más previsibles del examen y se puntúa sobre todo por el procedimiento y la **interpretación** del resultado.

## 2. Lo que necesitas saber antes

- Porcentajes y decimales (B00-L01): un 8 % es $0{,}08$.
- Potencias: $(1{,}08)^2=1{,}1664$, $(1{,}08)^3=1{,}259712$.
- Interés compuesto (M03-L04): un capital $C_0$ al tipo $k$ durante $n$ años se convierte en $C_n=C_0(1+k)^n$. La operación inversa, $C_0=\dfrac{C_n}{(1+k)^n}$, se llama **actualizar** o **descontar**.

## 3. Idea intuitiva

¿Prefieres 1.000 € hoy o 1.000 € dentro de tres años? Hoy, sin duda: podrías invertirlos y tener más dentro de tres años, y además hay inflación y riesgo. Por eso **un euro futuro vale menos que un euro de hoy**. Para comparar cantidades que llegan en años distintos hay que traerlas todas al presente, «descontándolas» con un tipo de interés.

El **payback** responde a «¿cuánto tardo en recuperar lo que pongo?». Es fácil, pero ignora ese valor del dinero en el tiempo y lo que pasa después de recuperar la inversión. El **VAN** responde a «¿cuánto valor, en euros de hoy, me aporta el proyecto por encima de lo que me exige el dinero?». La **TIR** responde a «¿qué rentabilidad anual da el proyecto?».

## 4. Definición precisa

- **Desembolso inicial** $A$: lo que se paga en el momento 0.
- **Flujo neto de caja** del año $t$: $Q_t=\text{cobros}_t-\text{pagos}_t$.
- **Tipo de descuento** $k$: rentabilidad mínima exigida (coste del dinero o rentabilidad de la mejor alternativa).

**Plazo de recuperación (payback):** tiempo necesario para que la suma de flujos iguale el desembolso inicial. Si en un año solo se necesita una parte del flujo, se supone que se genera de forma uniforme y se calcula la fracción del año: $\dfrac{\text{importe pendiente}}{\text{flujo de ese año}}$. **Criterio:** se prefiere el proyecto con menor payback. **Limitaciones:** no tiene en cuenta el valor temporal del dinero ni los flujos posteriores a la recuperación. Por eso se llama método **estático**.

**Valor actual neto (VAN):**
$$\text{VAN}=-A+\frac{Q_1}{(1+k)}+\frac{Q_2}{(1+k)^2}+\dots+\frac{Q_n}{(1+k)^n}$$
- VAN $>0$: el proyecto crea valor por encima de la rentabilidad exigida; **es aceptable**.
- VAN $=0$: rinde exactamente $k$; indiferente.
- VAN $<0$: no alcanza la rentabilidad exigida; se rechaza.
- Entre varios proyectos aceptables, se prefiere el de **mayor VAN**. Es un método **dinámico** porque descuenta los flujos.

**Tasa interna de rentabilidad (TIR):** el tipo de descuento $r$ que hace el VAN igual a cero:
$$0=-A+\frac{Q_1}{(1+r)}+\dots+\frac{Q_n}{(1+r)^n}$$
- Se acepta el proyecto si $\text{TIR}>k$.
- Con uno o dos periodos se puede calcular a mano (ecuación de primer o segundo grado haciendo $x=\tfrac{1}{1+r}$). Con más periodos se usa calculadora u hoja de cálculo; en el examen se suele pedir plantearla o interpretarla.

**Por qué el VAN es el criterio de referencia.** El payback puede preferir un proyecto que se recupera antes pero genera mucho menos dinero en total. El VAN suma todos los flujos y los pondera por el momento en que llegan, de modo que mide directamente cuánto aumenta el valor de la empresa. Cuando VAN y payback discrepan, se suele seguir el VAN, aunque una empresa con problemas de liquidez puede valorar recuperar antes el dinero; en el examen, justifica la elección con estos argumentos.

**Factores de descuento útiles** con $k=10\,\%$: $\tfrac{1}{1{,}1}\approx0{,}9091$, $\tfrac{1}{1{,}21}\approx0{,}8264$, $\tfrac{1}{1{,}331}\approx0{,}7513$. Redondea los resultados al final, no en cada paso.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · VAN y payback de un proyecto
Una empresa compra una carretilla eléctrica por 10.000 €. Espera flujos netos de 4.000 €, 4.000 € y 5.000 € en los años 1, 2 y 3. Tipo de descuento: 8 %.

1. Payback: tras 2 años lleva 8.000 €; faltan 2.000 € del flujo de 5.000 € → $\tfrac{2000}{5000}=0{,}4$ años. **Payback = 2,4 años** (unos 2 años y 5 meses).
2. VAN: $-10.000+\tfrac{4000}{1{,}08}+\tfrac{4000}{1{,}1664}+\tfrac{5000}{1{,}259712}=-10.000+3703{,}70+3429{,}36+3969{,}16=1102{,}22$ €.
3. Interpretación: VAN positivo, la inversión aporta unos 1.102 € de hoy por encima del 8 % exigido. Es aceptable.
:::

:::ejemplo Ejemplo 2 · Payback y VAN no coinciden
Dos proyectos de 50.000 €, con $k=10\,\%$. Flujos A: 25.000, 25.000, 10.000. Flujos B: 10.000, 20.000, 40.000.

1. Payback A: 2 años exactos. Payback B: $30.000$ en 2 años, faltan $20.000$ de $40.000$ → 2,5 años. **Por payback, A.**
2. VAN A $=-50.000+22.727{,}27+20.661{,}16+7.513{,}15=901{,}58$ €. VAN B $=-50.000+9.090{,}91+16.528{,}93+30.052{,}59=5.672{,}43$ €. **Por VAN, B.**
3. Decisión razonada: B crea mucho más valor; A solo sería preferible si la empresa necesitara recuperar liquidez cuanto antes.
:::

:::ejemplo Ejemplo 3 · TIR de un proyecto de dos años
Desembolso 2.000 €; flujos 1.100 € y 1.210 €. Comprueba que la TIR es del 10 %.

Con $r=0{,}10$: $-2000+\tfrac{1100}{1{,}1}+\tfrac{1210}{1{,}21}=-2000+1000+1000=0$. Como el VAN se anula, TIR $=10\,\%$. Si la rentabilidad exigida es el 7 %, se acepta ($10\,\%>7\,\%$).
:::

:::error Error típico
Sumar los flujos sin descontar para el VAN, o dividir todos los flujos por $(1+k)$ con el mismo exponente. El flujo del año $t$ se divide por $(1+k)^t$. Otro error: dar el VAN sin interpretarlo. En el examen, el resultado numérico sin conclusión («se acepta porque…») pierde puntos.
:::

## 6. Ejercicio guiado

Una inversión de 30.000 € genera 12.000 € anuales durante 3 años. Con $k=6\,\%$, calcula el payback y el VAN, y decide.

:::pista Primera pista
Payback: ¿cuántos flujos de 12.000 € hacen falta para llegar a 30.000 €?
:::

:::pista Segunda pista
Factores: $1{,}06$, $1{,}1236$ y $1{,}191016$. Divide 12.000 entre cada uno.
:::

:::solucion Solución guiada
Payback: 2 años (24.000) + $\tfrac{6000}{12000}=0{,}5$ → **2,5 años**.
VAN $=-30.000+11.320{,}75+10.679{,}96+10.075{,}43=2.076{,}14$ €. Positivo: **se acepta**; el proyecto rinde más que el 6 % exigido.
:::

## 7. Práctica

**Fáciles**

1. Desembolso 12.000 €; flujos de 3.000 € anuales. ¿Payback?
2. ¿Qué significa un VAN de −500 €?
3. Un proyecto tiene TIR del 9 % y la empresa exige un 11 %. ¿Se acepta?

**Medios**

4. Calcula el VAN de una inversión de 8.000 € con flujos 3.000, 3.000 y 4.000 € al 5 %.
5. Plantea la ecuación de la TIR de una inversión de 1.000 € con flujos de 600 € durante dos años y calcúlala.

**Tipo examen / transferencia**

6. Una empresa logística duda entre dos sistemas de 60.000 € con $k=7\,\%$. A: 25.000 € anuales durante 3 años. B: 0 €, 30.000 € y 55.000 €. Calcula el payback y el VAN de cada uno y razona cuál elegir.

:::solucion Soluciones paso a paso
1. $12.000:3.000=4$ años.
2. Que el proyecto no alcanza la rentabilidad exigida: en euros de hoy, destruye 500 € de valor. Se rechaza.
3. No: $9\,\%<11\,\%$.
4. $-8.000+2.857{,}14+2.721{,}09+3.455{,}35=1.033{,}58$ €. Aceptable.
5. $0=-1000+\tfrac{600}{1+r}+\tfrac{600}{(1+r)^2}$. Con $x=\tfrac{1}{1+r}$: $600x^2+600x-1000=0$ → $3x^2+3x-5=0$ → $x=\tfrac{-3+\sqrt{69}}{6}\approx0{,}8844$ → $r\approx0{,}1307$. **TIR ≈ 13,1 %.**
6. Payback A: $\tfrac{60.000}{25.000}=2{,}4$ años. Payback B: 30.000 en 2 años, faltan 30.000 de 55.000 → $2+0{,}545\approx2{,}55$ años. VAN A $\approx5.607{,}90$ €. VAN B $=-60.000+0+\tfrac{30.000}{1{,}1449}+\tfrac{55.000}{1{,}225043}\approx11.099{,}55$ €. Ambos aceptables; **B tiene mayor VAN** y es preferible, salvo necesidad urgente de liquidez (A se recupera algo antes).
:::

## 8. Cómo revisar tus errores

- ¿Cada flujo está dividido por $(1+k)$ elevado a **su** año?
- ¿Has restado el desembolso inicial sin descontarlo (está en el año 0)?
- Para el payback con fracción, ¿has dividido lo que falta entre el flujo de **ese** año?
- ¿Has escrito una conclusión con el criterio (VAN > 0, TIR > k, menor payback)?
- Comprobación rápida: el VAN siempre es menor que la suma simple de flujos menos el desembolso (si $k>0$).

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Payback: tiempo hasta recuperar $A$; estático; ignora flujos posteriores.
- VAN $=-A+\sum\dfrac{Q_t}{(1+k)^t}$; aceptar si $>0$; elegir el mayor.
- TIR: tipo que anula el VAN; aceptar si TIR $>k$.

**Vocabulario:** inversión, desembolso inicial, flujo neto de caja, tipo de descuento, actualizar, payback, método estático, método dinámico, VAN, TIR.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, compara dos proyectos con payback y VAN y escribe una conclusión de dos líneas.

## 11. Procedencia y nivel

Contenido original de RISE HUB Academia. Nivel N2 (2.º Bachillerato). Alineado con el bloque de inversión del temario oficial de Economía de la Empresa +25. La inclusión de esta materia en la modalidad UOC en castellano de 2027 está pendiente de confirmar en la matrícula.
