#!/usr/bin/env python3
"""RISE HUB Academia +25 · verificación independiente de claves de corrección.

Recalcula desde cero (aritmética exacta o SymPy) la respuesta de cada pregunta numérica
y de cada pregunta de opción múltiple con contenido matemático/físico/económico, y la
compara con la clave guardada en content/academia/questions/*.json.

- Una pregunta numérica SIN verificador registrado aquí hace fallar el script: así ninguna
  clave nueva entra sin cálculo independiente.
- Las preguntas de lengua (opción múltiple sobre gramática o comprensión) no se pueden
  verificar por cálculo: se listan como «revisión humana».

Uso: python3 tools/academy/verify_keys.py   (requiere sympy)
"""
import json, glob, math, os, sys
from fractions import Fraction as F
import sympy as sp

x, k, r = sp.symbols("x k r")
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")


def van(A, flows, rate):
    return -A + sum(q / (1 + rate) ** (t + 1) for t, q in enumerate(flows))


def word_count(s):
    return len([w for w in s.split() if any(c.isalnum() for c in w)])


# ---- Numéricas: id -> valor calculado de forma independiente ----
NUMERIC = {
    # Castellano / Inglés (recuento de palabras)
    "c06l01-x5": lambda: word_count("La recompensa no es solo entender mejor"),
    "e05l01-x3": lambda: word_count("The council doesn't know what to do."),
    # Economía
    "b00l01-x1": lambda: F(15, 100) * 340,
    "b00l01-x2": lambda: F(46000 - 40000, 40000) * 100,
    "b00l01-x4": lambda: F(605) / F(121, 100),
    "b00l01-x5": lambda: F(6 * 10, 4),
    "b02l01-x2": lambda: 250000 - 140000,
    "b02l01-x5": lambda: (300000 - 240000 - 10000) * F(75, 100),
    "b05l01-x1": lambda: 3 if 2000 + 3000 + 4000 == 9000 else None,
    "b05l01-x3": lambda: round(van(5000, [2000, 2000, 2000], 0.04), 2),
    "b05l01-x4": lambda: 2 + F(20000 - 16000, 10000),
    "b05l01-x5": lambda: sp.solve(sp.Eq(-1000 + 1150 / (1 + r), 0), r)[0] * 100,
    # Física
    "f01l01-x2": lambda: F(72 * 1000, 3600),
    "f01l01-x3": lambda: F(3500, 10**4),
    "f02l01-x2": lambda: F(16 - 4, 3),
    "f02l01-x3": lambda: F(15**2, 2 * 3),  # v0=54 km/h=15 m/s; v^2=v0^2-2ad
    "f02l01-x4": lambda: F(150) / (F(12, 10) + F(18, 10)),
    "f03l01-x1": lambda: F(36, 12),
    "f03l01-x4": lambda: 1200 * F(20, 8),
    "f03l01-x5": lambda: 80 * (F(98, 10) - 2),
    "f08l01-x1": lambda: F(6, 15),
    "f08l01-x2": lambda: F(12 * 4, 12 + 4),
    "f08l01-x4": lambda: F(1500, 1000) * 2,
    "f08l01-x5": lambda: 12 - F(12, 5 + 1) * 1,
    # Matemáticas
    "m00l01-x1": lambda: 9 - 3 * 2 + 4,
    "m00l01-x3": lambda: -7 - (-3) + (-2) * (-5),
    "m00l01-x4": lambda: F(36, 6) * 2 - (1 - 4) ** 2,
    "m00l02-x2": lambda: math.gcd(42, 56),
    "m00l02-x3": lambda: math.lcm(10, 12, 15),
    "m00l02-x5": lambda: math.gcd(90, 126),
    "m00l04-x2": lambda: F(6, 35) * F(14, 9),
    "m00l04-x4": lambda: 1 - F(2, 3) * (F(1, 2) + F(1, 4)),
    "m00l04-x5": lambda: (360 - 360 * F(1, 4)) * (1 - F(2, 3)),
    "m01l01-x3": lambda: (3 * x**2 - 2 * x + 5).subs(x, -2),
    "m01l02-x1": lambda: sp.solve(sp.Eq(7 * x - 4, 2 * x + 11), x)[0],
    "m01l02-x2": lambda: sp.solve(sp.Eq(2 * (3 * x - 1) - (x + 4), 9), x)[0],
    "m01l02-x3": lambda: sp.solve(sp.Eq(x / 3 + x / 6, 5), x)[0],
    "m02l01-x4": lambda: 102 * 98,
    "m04l01-x1": lambda: F(-4 - 4, 3 - (-1)),
    "m04l01-x5": lambda: (2 * x + 1).subs(x, sp.solve(sp.Eq(2 * x + 1, -x + 7), x)[0]),
    "m06l01-x2": lambda: sp.sqrt(2**2 + 3**2 + 6**2),
    "m06l01-x3": lambda: 3 * -2 + -1 * 4 + 2 * 5,
    "m06l01-x4": lambda: sp.solve(sp.Eq(3 * k + 2 * k - 4, 0), k)[0],
    "m08l01-x1": lambda: sp.limit(2 * x**3 + x - 4, x, -1),
    "m08l01-x2": lambda: sp.limit((x**2 - 16) / (x - 4), x, 4),
    "m08l01-x3": lambda: sp.limit((6 * x**3 - 2 * x) / (3 * x**3 + x**2 + 1), x, sp.oo),
    "m08l01-x5": lambda: sp.solve(sp.Eq(2 * 3 + k, 3**2 - 1), k)[0],
}

# ---- Banco del kit (content/academia/kit/preguntas_iniciales.json): numéricas ----
KIT_NUMERIC = {
    "mat-005": lambda: sp.solve(sp.Eq(3 * x + 5, 20), x)[0],
    "mat-006": lambda: sp.solve(sp.Eq(4 * (x + 1), 2 * x + 10), x)[0],
    "mat-011": lambda: sp.diff(x**2, x).subs(x, -1),
    "mat-012": lambda: sp.Matrix([[3, 2], [1, 4]]).det(),
    "mat-013": lambda: sp.solve([x + k - 5, x - k - 1], [x, k])[x],
    "fis-001": lambda: F(72 * 1000, 3600),
    "fis-002": lambda: F(500, 1000),
    "fis-005": lambda: F(15, 10) * 40,
    "fis-006": lambda: F(17 - 5, 4),
    "fis-007": lambda: F(1, 2) * 3 * 2**2,
    "fis-008": lambda: F(12, 4),
    "fis-009": lambda: 3 * F(98, 10),
    "fis-010": lambda: F(12, 6),
    "fis-011": lambda: F(6 * 6, 6 + 6),
    "eco-001": lambda: F(12, 100) * 150,
    "eco-002": lambda: 200 * F(105, 100),
    "eco-003": lambda: F(75 - 60, 60) * 100,
    "eco-004": lambda: 25000 - 9000,
    "eco-006": lambda: round(van(500, [550], 0.10), 2),
    "eco-007": lambda: round(van(1000, [600, 600], 0.10), 2),
}

# ---- Opción múltiple con contenido calculable: id -> (opción esperada, comprobación) ----
E = sp.expand
MC = {
    "m00l04-x1": ("b", lambda: F(3, 4) + F(1, 6) == F(11, 12)),
    "m00l04-x3": ("b", lambda: F(4, 9) / F(8, 3) == F(1, 6)),
    "m01l01-x1": ("b", lambda: E(-2 * (x - 4)) == -2 * x + 8),
    "m01l01-x2": ("a", lambda: E(4 * x**2 + 3 * x - x**2 - 5 * x) == 3 * x**2 - 2 * x),
    "m01l01-x4": ("b", lambda: E(5 * (k - 1) - (2 * k - 7)) == 3 * k + 2),
    "m01l02-x4": ("b", lambda: E(12 * ((x + 1) / 4 - (x - 2) / 3)) == E(3 * x + 3 - 4 * x + 8)),
    "m01l02-x5": ("c", lambda: E(3 * (x - 1) + 2) == E(3 * x - 1)),
    "m02l01-x1": ("c", lambda: E((x - 6) ** 2) == x**2 - 12 * x + 36),
    "m02l01-x2": ("b", lambda: E((5 * x + 1) * (5 * x - 1)) == 25 * x**2 - 1),
    "m02l01-x3": ("a", lambda: E((x + 3) ** 2) == x**2 + 6 * x + 9),
    "m02l01-x5": ("a", lambda: E(2 * x * (x - 2) ** 2) == 2 * x**3 - 8 * x**2 + 8 * x),
    "m04l01-x2": ("b", lambda: E(5 + 3 * (x - 2)) == 3 * x - 1),
    "m04l01-x3": ("a", lambda: (lambda xv: (xv, (x**2 - 6 * x + 5).subs(x, xv)))(sp.Rational(6, 2)) == (3, -4)),
    "m04l01-x4": ("b", lambda: sp.Rational(-8, 2 * -2) == 2),
    "m06l01-x1": ("b", lambda: (4 - 2, 1 - 5, 3 - (-1)) == (2, -4, 4)),
    "m06l01-x5": ("c", lambda: sp.acos(sp.Rational(1, 2)) == sp.pi / 3),
    "m08l01-x4": ("b", lambda: set(sp.solve(x**2 - 5 * x + 6, x)) == {2, 3}),
    "f01l01-x4": ("a", lambda: F(650) * F(1, 10**9) == F(65, 10**8)),
    "f08l01-x3": ("c", lambda: 1 / (F(1, 10) + F(1, 20) + F(1, 50)) < 10),
}


def as_float(v):
    if isinstance(v, F):
        return float(v)
    return float(sp.N(v))


def main():
    errors, ok, human = [], 0, []
    for path in sorted(glob.glob(os.path.join(ROOT, "content", "academia", "questions", "*.json"))):
        for q in json.load(open(path, encoding="utf8"))["questions"]:
            qid, kind = q["id"], q["kind"]
            if kind == "numeric":
                if qid not in NUMERIC:
                    errors.append(f"{qid}: pregunta numérica sin verificador independiente")
                    continue
                got = as_float(NUMERIC[qid]())
                want = q["key"]["value"]
                tol = max(q["key"].get("tolerance", 0), 1e-6)
                if abs(got - want) > tol:
                    errors.append(f"{qid}: clave {want} ≠ cálculo {got}")
                else:
                    ok += 1
            elif kind == "multiple_choice" and qid in MC:
                exp, check = MC[qid]
                if q["key"]["correct_choice_id"] != exp:
                    errors.append(f"{qid}: clave {q['key']['correct_choice_id']} ≠ esperada {exp}")
                elif not check():
                    errors.append(f"{qid}: la comprobación algebraica falla")
                else:
                    ok += 1
            else:
                human.append(qid)
    kit = json.load(open(os.path.join(ROOT, "content", "academia", "kit", "preguntas_iniciales.json"), encoding="utf8"))["questions"]
    for q in kit:
        if q["kind"] != "numeric":
            continue
        g = q.get("grading_private", {})
        if q["id"] not in KIT_NUMERIC:
            errors.append(f"{q['id']}: numérica del kit sin verificador")
            continue
        got, want = as_float(KIT_NUMERIC[q["id"]]()), float(g["correct_value"])
        if abs(got - want) > max(float(g.get("absolute_tolerance", 0) or 0), 1e-6):
            errors.append(f"{q['id']}: clave {want} ≠ cálculo {got}")
        else:
            ok += 1
    for qid in sorted(set(NUMERIC) | set(MC)):
        if not any(qid in open(p, encoding="utf8").read() for p in glob.glob(os.path.join(ROOT, "content", "academia", "questions", "*.json"))):
            errors.append(f"{qid}: verificador sin pregunta (id obsoleto)")
    print(f"Claves verificadas por cálculo: {ok}")
    print(f"Requieren revisión humana (lengua, comprensión, conceptual): {len(human)}")
    if errors:
        print("ERRORES:\n- " + "\n- ".join(errors))
        sys.exit(1)


if __name__ == "__main__":
    main()
