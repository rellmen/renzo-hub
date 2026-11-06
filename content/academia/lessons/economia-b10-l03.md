---
id: economia-b10-l03
course: economia
module: B10
level: N2
title: Gestión de inventarios: stock de seguridad, punto de pedido, rotación, ABC y modelo de Wilson
learning_objectives:
  - Identificar los tipos de existencias y los costes asociados a tenerlas o no tenerlas
  - Calcular el punto de pedido, el stock medio, la rotación y el periodo medio de almacenamiento
  - Clasificar referencias con el método ABC y calcular el volumen óptimo de pedido (modelo de Wilson)
prerequisites: [economia-b10-l02]
skill_ids: [inventory_costs, reorder_point, stock_turnover, abc_analysis, eoq]
exam_alignment: [produccion]
estimated_minutes: 45
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/economia_empresa/
content_version: 1
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Las **existencias** (inventario) son los materiales y productos que la empresa guarda para producir o vender. Tener demasiadas inmoviliza dinero y espacio; tener pocas provoca roturas de stock, clientes perdidos y líneas paradas. Gestionar inventarios es encontrar el equilibrio. En esta lección calcularás cuándo pedir (punto de pedido), cuánto stock se tiene de media, cuántas veces «gira» el almacén al año y cuánto conviene pedir cada vez. También aprenderás el método **ABC** para decidir a qué referencias dedicar más control. Son conceptos del área de producción del temario y, además, el día a día de un *inventory controller*.

## 2. Lo que necesitas saber antes

- Producto y cociente: $40\cdot5=200$; $\dfrac{14.000}{700}=20$.
- Raíz cuadrada: $\sqrt{400.000}\approx632{,}46$.
- Porcentajes acumulados (B00-L01).

## 3. Idea intuitiva

Piensa en el depósito de gasolina de una furgoneta de reparto. No esperas a quedarte a cero: repostas cuando te queda lo justo para llegar a la gasolinera, más un margen por si hay atasco. Ese momento es el **punto de pedido**; ese margen, el **stock de seguridad**.

¿Cuánto repostar cada vez? Si llenas poco, paras muchas veces (cada pedido tiene un coste: gestión, transporte). Si llenas mucho, llevas peso y dinero parado (el almacenamiento cuesta). El **modelo de Wilson** busca el tamaño de pedido que minimiza la suma de esos dos costes.

Y no todas las referencias merecen la misma atención: unas pocas suelen concentrar la mayor parte del valor. El método **ABC** las separa para vigilarlas más de cerca.

## 4. Definición precisa

**Tipos de existencias:** materias primas, productos en curso, productos terminados, mercaderías y repuestos.

**Costes del inventario:** de adquisición (precio), de **pedido** o reposición (gestión, transporte, recepción), de **almacenamiento** o posesión (espacio, seguros, obsolescencia, coste del dinero inmovilizado) y de **ruptura** (ventas perdidas, paradas).

**Stock de seguridad (SS):** cantidad mínima que se mantiene para cubrir retrasos del proveedor o picos de demanda.

**Punto de pedido:** $PP=SS+d\cdot L$, con $d$ la demanda diaria y $L$ el plazo de entrega en días. Cuando el stock baja a $PP$, se lanza el pedido.

**Stock medio:** $\bar S=\dfrac{Q}{2}+SS$, si cada pedido es de $Q$ unidades y el consumo es regular.

**Rotación de existencias:** $R=\dfrac{\text{consumo (o ventas a coste) del periodo}}{\text{stock medio}}$ (en las mismas unidades: o todo en unidades, o todo en euros a precio de coste).

**Periodo medio de almacenamiento:** $PMA=\dfrac{365}{R}$ días. Es la primera parte del periodo medio de maduración (B03-L01).

**Método ABC (Pareto):** se ordenan las referencias por valor anual de consumo (unidades $\times$ coste) y se acumulan porcentajes. Orientativamente: **A** ≈ 20 % de referencias con ≈ 80 % del valor (control estricto, recuentos frecuentes); **B**, intermedias; **C**, muchas referencias de poco valor (control simple).

**Just in time.** Algunas empresas reducen las existencias al mínimo y reciben los materiales justo cuando los necesitan. Ahorran almacenamiento y dinero inmovilizado, pero dependen mucho de proveedores fiables y cercanos: un retraso para la línea entera.

**Modelo de Wilson (volumen óptimo de pedido):**
$$Q^{*}=\sqrt{\frac{2\cdot D\cdot S}{H}}$$
con $D$ la demanda anual, $S$ el coste de cada pedido y $H$ el coste de almacenar una unidad durante un año. Número de pedidos al año $=\dfrac{D}{Q^{*}}$. Supone demanda constante y conocida; es una referencia, no una ley.

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Punto de pedido
Consumo de 40 unidades al día, plazo del proveedor de 5 días, stock de seguridad de 100 unidades.

$PP=100+40\cdot5=300$ unidades. Cuando el sistema marque 300 unidades, se lanza el pedido; si el proveedor cumple, llegará justo cuando queden 100.
:::

:::ejemplo Ejemplo 2 · Stock medio, rotación y periodo de almacenamiento
Pedidos de 1.200 unidades, SS de 100 unidades, consumo anual de 14.000 unidades.

1. $\bar S=\dfrac{1.200}{2}+100=700$ unidades.
2. $R=\dfrac{14.000}{700}=20$ veces al año.
3. $PMA=\dfrac{365}{20}=18{,}25$ días.
:::

:::ejemplo Ejemplo 3 · Modelo de Wilson
Demanda anual 12.000 unidades; cada pedido cuesta 50 €; almacenar una unidad un año cuesta 3 €.

$Q^{*}=\sqrt{\dfrac{2\cdot12.000\cdot50}{3}}=\sqrt{400.000}\approx632$ unidades, unos $\dfrac{12.000}{632}\approx19$ pedidos al año.
:::

:::error Error típico
Confundir el punto de pedido con el stock de seguridad: el SS es el colchón que queda cuando llega el pedido; el punto de pedido es el nivel al que se pide. En la rotación, otro error es mezclar unidades con euros (consumo en euros entre stock en unidades). En Wilson, usar un coste de almacenamiento mensual con una demanda anual.
:::

## 6. Ejercicio guiado

Una referencia se consume a 25 unidades al día durante 360 días al año; el plazo es de 4 días; SS de 50 unidades; se piden 500 unidades cada vez. Calcula el punto de pedido, el stock medio, la rotación y el PMA (usa 365 días para el PMA).

:::pista Primera pista
Punto de pedido: SS más lo que se consume durante el plazo. Consumo anual: $25\cdot360$.
:::

:::pista Segunda pista
Stock medio $=\frac{Q}{2}+SS$. Rotación $=\frac{\text{consumo anual}}{\text{stock medio}}$.
:::

:::solucion Solución guiada
$PP=50+25\cdot4=150$. $\bar S=250+50=300$. Consumo anual $=9.000$; $R=\dfrac{9.000}{300}=30$. $PMA=\dfrac{365}{30}\approx12{,}2$ días.
:::

## 7. Práctica

**Fáciles**

1. Demanda diaria 30 unidades, plazo 6 días, SS 60 unidades. ¿Punto de pedido?
2. Pedidos de 800 unidades sin stock de seguridad. ¿Stock medio?
3. La rotación de un almacén es 24. ¿Periodo medio de almacenamiento?

**Medios**

4. Consumo anual 18.000 unidades y stock medio de 1.500 unidades. ¿Rotación y PMA?
5. Demanda anual 8.000 unidades, coste por pedido 40 €, coste anual de almacenamiento 4 € por unidad. ¿Volumen óptimo de pedido y número de pedidos al año?

**Tipo examen / transferencia**

6. Un almacén tiene cinco referencias con este consumo anual (unidades $\times$ coste unitario): R1 2.000 u $\times$ 40 €; R2 500 u $\times$ 20 €; R3 6.000 u $\times$ 1 €; R4 100 u $\times$ 30 €; R5 1.000 u $\times$ 1 €. a) Calcula el valor anual de cada una, ordénalas y clasifícalas con el método ABC (A hasta ≈80 % acumulado). b) Para R1, con consumo regular de 8 unidades al día, plazo de 10 días y SS de 40 unidades, calcula el punto de pedido. c) Propón cómo controlarías A frente a C.

:::solucion Soluciones paso a paso
1. $60+30\cdot6=240$ unidades.
2. $\dfrac{800}{2}=400$ unidades.
3. $\dfrac{365}{24}\approx15{,}2$ días.
4. $R=\dfrac{18.000}{1.500}=12$; $PMA=\dfrac{365}{12}\approx30{,}4$ días.
5. $Q^{*}=\sqrt{\dfrac{2\cdot8.000\cdot40}{4}}=\sqrt{160.000}=400$ unidades; $\dfrac{8.000}{400}=20$ pedidos.
6. a) Valores: R1 80.000 €; R2 10.000 €; R3 6.000 €; R4 3.000 €; R5 1.000 €; total 100.000 €. Acumulado: R1 80 % → **A**; R2 90 % y R3 96 % → **B**; R4 99 % y R5 100 % → **C**. b) $PP=40+8\cdot10=120$ unidades. c) A: recuento cíclico frecuente, revisión de previsiones, proveedor alternativo y SS calculado con cuidado. C: recuentos espaciados, pedidos grandes y poco seguimiento.
:::

## 8. Cómo revisar tus errores

- ¿Punto de pedido $=SS+d\cdot L$ con la demanda **diaria**?
- ¿Stock medio con $\frac{Q}{2}$ más el SS?
- ¿Rotación con consumo y stock en la misma unidad?
- ¿Wilson con $D$ y $H$ en el mismo periodo (anual)?
- En ABC, ¿has ordenado por **valor** (unidades $\times$ coste), no solo por unidades?

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- $PP=SS+d\cdot L$; $\bar S=\frac{Q}{2}+SS$; $R=\frac{\text{consumo}}{\bar S}$; $PMA=\frac{365}{R}$.
- ABC: pocas referencias con mucho valor (A) reciben más control.
- Wilson: $Q^{*}=\sqrt{\frac{2DS}{H}}$ equilibra coste de pedir y de almacenar.

**Vocabulario:** existencias, rotura de stock, stock de seguridad, plazo de entrega, punto de pedido, stock medio, rotación, periodo medio de almacenamiento, método ABC, coste de pedido, coste de almacenamiento, volumen óptimo de pedido.

**Repaso:** a 1, 3, 7, 14 y 30 días. Aplica las fórmulas a una referencia real de tu trabajo (sin datos confidenciales): calcula su punto de pedido y su rotación.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N2 (2.º Bachillerato). Alineado con el área de producción de Economía de la Empresa; el modelo de Wilson y el método ABC son ampliación habitual del bloque de aprovisionamiento. Comprobar el temario +25 vigente al matricularse.
