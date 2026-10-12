# Genera tests/fixtures/revolut-ficticio.pdf: extracto de Revolut FICTICIO con la misma maqueta que el real
# (columnas en las mismas posiciones x), para probar la lectura con pdf.js en el navegador. Uso: python3 tools/fixtures/make_revolut_pdf.py
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
c = canvas.Canvas("tests/fixtures/revolut-ficticio.pdf", pagesize=A4)
def t(x, y, s, size=7): c.setFont("Helvetica", size); c.drawString(x, y, s)
t(434, 757, "Afschrift EUR", 9); t(40, 689, "PERSONA FICTICIA"); t(353, 665, "IBAN"); t(376, 665, "NL00REVO0000000001")
t(40, 434, "Rekeningtransacties van 1 juli 2026 naar 31 juli 2026", 9)
for x, s in [(43, "Datum"), (125, "Beschrijving"), (335, "Uitgegeven geld"), (417, "Ontvangen geld"), (535, "Saldo")]: t(x, 408, s)
rows = [
  ("1 jul 2026", "{xPay} geld toevoegen met {card}", None, "€100,00", "€110,00", ["Van: *0000"]),
  ("2 jul 2026", "PLUS", "€12,50", None, "€97,50", ["Aan: Supermarkt Test, Leende", "Kaart: 400000******0000"]),
  ("3 jul 2026", "Overschrijving naar JUAN PEREZ", "€40,00", None, "€57,50", ["GARCIA", "Referentie: Cena", "Aan: JUAN PEREZ GARCIA"]),
  ("5 jul 2026", "Shell", "€30,00", None, "€27,50", ["Aan: Shell Weert, Weert", "Kaart: 400000******0000"]),
]
y = 389
for d, desc, out, inn, bal, extra in rows:
  t(43, y, d); t(125, y, desc)
  if out: t(335, y, out)
  if inn: t(417, y, inn)
  t(522, y, bal); y -= 8
  for e in extra: t(125, y, e); y -= 7
  y -= 10
t(40, 36, "© 2026 Revolut Bank UAB (Netherlands Branch)"); t(502, 36, "Pagina 1 van 1")
c.save()
