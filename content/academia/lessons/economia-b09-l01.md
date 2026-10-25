---
id: economia-b09-l01
course: economia
module: B09
level: N4
title: "Puente universitario: microeconomía, finanzas cuantitativas, sistemas de información y estrategia de productos tecnológicos"
learning_objectives:
  - Calcular el equilibrio de mercado y la elasticidad precio de la demanda e interpretarlos
  - Relacionar rentabilidad y riesgo, y entender la diversificación y el valor del dinero en el tiempo en continuo
  - Explicar el papel de los sistemas de información (ERP, BI) y las métricas básicas de un producto tecnológico (CAC, LTV, churn, efecto red)
prerequisites: [economia-b08-l01, matematicas-m08-l05]
skill_ids: [microeconomics, quantitative_finance, information_systems, tech_product_strategy]
exam_alignment: [puente_universitario]
estimated_minutes: 70
source_kind: original
source_urls:
  - https://universitats.gencat.cat/es/proves-majors/25-anys/temaris-estructura/fase-especifica/economia_empresa/
content_version: 2
editorial_status: draft
---

## 1. Qué aprenderás y para qué sirve

Esta lección **no forma parte del examen** de acceso: es el puente hacia la universidad. Si estudias Informática, Administración de Empresas o algún grado técnico, encontrarás asignaturas de economía, finanzas o gestión de sistemas de información. Aquí verás los conceptos que más se repiten en primer curso: **equilibrio de mercado y elasticidad** (microeconomía), **rentabilidad y riesgo** (finanzas cuantitativas), **sistemas de información** empresariales y las **métricas de productos tecnológicos** que usan las empresas digitales. Muchos conectan con tu experiencia práctica: inventarios en SAP, informes en Power BI o el análisis de datos con Python.

## 2. Lo que necesitas saber antes

- Análisis financiero, VAN y punto muerto (B03, B05, B07).
- Funciones y derivadas (M04, M08), para la elasticidad y los máximos.
- Interés compuesto (M03-L04).

## 3. Idea intuitiva

Un mercado es una balanza: de un lado, los compradores (la demanda baja cuando el precio sube); del otro, los vendedores (la oferta sube cuando el precio sube). El precio en el que los dos lados se igualan es el **equilibrio**. La **elasticidad** mide cuánto reaccionan los compradores ante un cambio de precio: si sube la gasolina, la gente sigue repostando (poco elástica); si sube una marca concreta de refresco, muchos cambian de marca (muy elástica).

En finanzas, la regla central es que **no hay rentabilidad alta sin riesgo**. Y en las empresas tecnológicas, el valor de un cliente se mide por lo que aporta durante toda su relación con la empresa, no por una sola compra.

## 4. Definición precisa

**Microeconomía: oferta, demanda y equilibrio.**
- Demanda: $Q_d=a-bP$ (decreciente con el precio). Oferta: $Q_s=c+dP$ (creciente).
- **Equilibrio:** $Q_d=Q_s$. Por debajo del precio de equilibrio hay **exceso de demanda** (escasez); por encima, **exceso de oferta** (excedente).
- **Elasticidad precio de la demanda:**
$$E=\frac{\%\Delta Q}{\%\Delta P}.$$
Si $|E|>1$, la demanda es **elástica** (los compradores reaccionan mucho); si $|E|<1$, **inelástica**. Consecuencia práctica: subir el precio aumenta los ingresos si la demanda es inelástica y los reduce si es elástica.
- **Maximizar el beneficio:** la empresa produce donde el ingreso marginal es igual al coste marginal, es decir, donde la derivada del beneficio es cero (M08-L05).

**Finanzas cuantitativas: rentabilidad y riesgo.**
- **Rentabilidad esperada:** media de las rentabilidades posibles ponderadas por su probabilidad.
- **Riesgo:** dispersión de los resultados, medida con la **desviación típica** de la rentabilidad.
- **Diversificación:** combinar inversiones que no se mueven igual reduce el riesgo total sin reducir necesariamente la rentabilidad media («no pongas todos los huevos en la misma cesta»).
- **Capitalización continua:** $C_t=C_0\,e^{rt}$, límite del interés compuesto cuando los periodos se hacen infinitamente cortos; se usa en modelos financieros.
- **Valor actual de una renta perpetua:** un flujo constante $F$ para siempre vale hoy $\dfrac{F}{k}$, una idea básica de la valoración de empresas.

**Sistemas de información en la empresa.**
- **ERP** (*Enterprise Resource Planning*, como SAP): integra en una única base de datos compras, inventario, producción, ventas, finanzas y recursos humanos. Evita duplicidades y da una visión común.
- **CRM:** gestión de la relación con los clientes.
- **BI** (*Business Intelligence*, como Power BI): transforma los datos en informes y cuadros de mando para decidir.
- **KPI:** indicadores clave de rendimiento (por ejemplo, la precisión del inventario o el plazo de entrega).
- Ciclo dato → información → conocimiento → decisión. La calidad de los datos es crítica: «si entra basura, sale basura».

**Estrategia de productos tecnológicos.**
- **Efecto red:** el producto vale más cuantas más personas lo usan (redes sociales, plataformas de mensajería, mercados en línea). Tiende a concentrar el mercado en pocos ganadores.
- **Plataformas:** conectan a dos grupos (por ejemplo, conductores y pasajeros) y cobran por facilitar la interacción.
- **Modelo de suscripción (SaaS):** ingresos recurrentes mensuales.
- **Métricas:**
  - **CAC** (coste de adquisición de cliente): gasto en marketing y ventas dividido entre el número de clientes nuevos.
  - **Churn** (tasa de abandono): porcentaje de clientes que se dan de baja cada periodo.
  - **LTV** (valor del cliente en su vida): con un margen mensual por cliente $m$ y un churn mensual $c$, una aproximación sencilla es $LTV\approx\dfrac{m}{c}$.
  - Regla orientativa del sector: el negocio es sano si $LTV$ es claramente mayor que $CAC$ (a menudo se cita una proporción de 3 a 1).

## 5. Ejemplos resueltos

:::ejemplo Ejemplo 1 · Equilibrio de mercado
$Q_d=100-2P$ y $Q_s=20+2P$. Equilibrio: $100-2P=20+2P$ → $4P=80$ → $P=20$; $Q=60$. Si el Estado fija un precio máximo de 15: $Q_d=70$, $Q_s=50$; exceso de demanda (escasez) de 20 unidades.
:::

:::ejemplo Ejemplo 2 · Elasticidad y precio
El precio de un producto sube un 10 % y la cantidad demandada cae un 25 %. $E=-25/10=-2{,}5$: $|E|>1$, demanda elástica. Subir el precio **reduce** los ingresos: es mejor no subirlo o diferenciar el producto para hacerlo menos sustituible.
:::

:::ejemplo Ejemplo 3 · LTV y CAC
Una aplicación por suscripción gana un margen de 8 € al mes por cliente y pierde un 4 % de clientes al mes. Gasta 30.000 € en captar 1.000 clientes nuevos.

$LTV\approx8/0{,}04=200$ €. $CAC=30.000/1.000=30$ €. $LTV/CAC\approx6{,}7$: cada cliente aporta mucho más de lo que cuesta captarlo. El modelo es sano.
:::

:::error Error típico
Pensar que subir el precio siempre aumenta los ingresos: depende de la elasticidad. En las métricas tecnológicas, el error habitual es mirar solo el crecimiento de clientes y no el churn ni el CAC: una empresa puede crecer mucho y perder dinero con cada cliente.
:::

## 6. Ejercicio guiado

$Q_d=120-3P$ y $Q_s=4P-20$. Calcula el precio y la cantidad de equilibrio, y di qué ocurre si el precio es 25.

:::pista Primera pista
Iguala: $120-3P=4P-20$.
:::

:::pista Segunda pista
$7P=140$.
:::

:::solucion Solución guiada
$P=20$, $Q=60$. Con $P=25$: $Q_d=45$ y $Q_s=80$: exceso de oferta de 35 unidades; el precio tenderá a bajar.
:::

## 7. Práctica

**Fáciles**

1. ¿Qué es el efecto red?
2. Si $|E|=0{,}4$, ¿la demanda es elástica o inelástica?
3. ¿Qué integra un ERP?

**Medios**

4. Calcula el CAC: 12.000 € de marketing para 400 clientes nuevos.
5. Una renta perpetua de 500 € al año con un tipo del 5 %: ¿cuánto vale hoy?

**Tipo examen / transferencia**

6. Una empresa de software tiene un margen de 20 € al mes por cliente, un churn mensual del 5 % y un CAC de 150 €. Calcula el LTV, la relación LTV/CAC y propone dos acciones para mejorarla.

:::solucion Soluciones paso a paso
1. El producto vale más cuantos más usuarios tiene.
2. Inelástica: la cantidad reacciona poco al precio.
3. En una sola base de datos: compras, inventario, producción, ventas, finanzas y RR. HH.
4. $12.000/400=30$ € por cliente.
5. $500/0{,}05=10.000$ €.
6. $LTV\approx20/0{,}05=400$ €; $LTV/CAC\approx2{,}67$, por debajo de la referencia orientativa de 3. Acciones: reducir el churn (mejor incorporación de clientes, soporte, funciones que aumenten el uso) y bajar el CAC (más recomendaciones de clientes y contenido orgánico), o subir el margen con planes superiores.
:::

## 8. Cómo revisar tus errores

- Comprueba el equilibrio sustituyendo el precio en las dos funciones.
- Interpreta el signo y el valor absoluto de la elasticidad.
- En las métricas, revisa las unidades (mensual o anual) antes de dividir.
- Recuerda que las reglas de las métricas son orientativas, no leyes.

## 9. Mini evaluación

::evaluacion

## 10. Resumen, vocabulario y repaso

- Equilibrio $Q_d=Q_s$; elasticidad $E=\%\Delta Q/\%\Delta P$.
- Rentabilidad y riesgo; diversificación; capitalización continua; renta perpetua $F/k$.
- ERP, CRM, BI y KPI; efecto red, plataformas, SaaS, CAC, churn y LTV.

**Vocabulario:** oferta, demanda, equilibrio, elasticidad, ingreso marginal, coste marginal, rentabilidad esperada, desviación típica, diversificación, ERP, CRM, BI, KPI, efecto red, plataforma, SaaS, CAC, churn, LTV.

**Repaso:** a 1, 3, 7, 14 y 30 días. Cada vez, identifica en tu trabajo o en una aplicación que uses un KPI, una decisión basada en datos y una métrica de clientes.

## 11. Procedencia y nivel

Contenido original de Rise Academia. Nivel N4 (puente universitario). Las fórmulas de métricas son aproximaciones didácticas habituales; las referencias del sector son orientativas. No forma parte del temario de la prueba +25.
