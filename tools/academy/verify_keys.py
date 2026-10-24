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
    # Matemáticas M00–M02 (ampliación 24-10-2026)
    "m00l03-x2": lambda: sp.solve(sp.Eq(F(9, 12), x / 20), x)[0],
    "m00l03-x5": lambda: F(5, 12) * 360,
    "m00l05-x1": lambda: F(12, 100) * 850,
    "m00l05-x3": lambda: F(30250, 100) / F(121, 100),
    "m00l05-x5": lambda: F(340 - 400, 400) * 100,
    "m00l06-x2": lambda: F(1, 2**3),
    "m00l06-x5": lambda: sp.Integer(9) ** 2 * sp.Rational(1, 3) / 27,
    "m00l07-x1": lambda: sp.solve(sp.Eq(sp.Rational(5, 12), x / 84), x)[0],
    "m00l07-x2": lambda: F(240 * 15, 8),
    "m00l07-x3": lambda: F(8 * 9, 12),
    "m00l07-x5": lambda: F(abs(245 - 250), 250) * 100,
    "m01l03-x4": lambda: sp.solve(sp.Eq(40, sp.Rational(1, 3) * 24 * x), x)[0],
    "m01l03-x5": lambda: sp.solve(sp.Eq(0, 20**2 + 2 * -4 * x), x)[0],
    "m01l04-x1": lambda: F(18, 4) * 10,
    "m01l04-x2": lambda: F(4 * 9, 6),
    "m01l04-x3": lambda: F(3600, 2 + 3 + 7) * 7,
    "m01l04-x4": lambda: 5 * F(4, 6) * F(1080, 600),
    "m01l05-x4": lambda: max(n for n in range(-50, 50) if 3 * (n - 2) < n + 5),
    "m01l06-x1": lambda: abs(4 - (-7)),
    "m01l07-x1": lambda: sp.solve(sp.Eq(x + (x + 1), 131), x)[0] + 1,
    "m01l07-x2": lambda: sp.solve(sp.Eq(45 - x, 4 * (15 - x)), x)[0],
    "m01l07-x3": lambda: 1 / (F(1, 5) + F(1, 20)),
    "m01l07-x5": lambda: sp.solve(sp.Eq(12 * 120 + sp.Rational(8, 10) * x, 1584), x)[0],
    "m02l02-x1": lambda: (3 * x**3 - 2 * x + 5).subs(x, -1),
    "m02l02-x2": lambda: sp.rem(x**4 - 1, x - 2, x),
    "m02l02-x4": lambda: sp.solve((x**2 + k * x - 10).subs(x, 2), k)[0],
    "m02l03-x3": lambda: ((x**2 - 4) / (x - 2)).subs(x, 5),
    "m02l04-x1": lambda: max(sp.solve(x**2 - x - 12, x)),
    "m02l04-x3": lambda: sp.solve(sp.discriminant(x**2 - 8 * x + k, x), k)[0],
    "m02l04-x5": lambda: sp.prod(sp.solve(2 * x**2 - 6 * x - 8, x)),
    "m02l05-x1": lambda: sp.Integer(27) ** sp.Rational(2, 3),
    "m02l05-x2": lambda: sp.Integer(16) ** sp.Rational(-1, 4),
    "m02l05-x3": lambda: sp.sqrt(8) * sp.sqrt(18),
    "m02l06-x1": lambda: sp.solve([2 * x + k - 7, x - k - 2], [x, k])[k],
    "m02l06-x3": lambda: [s for s in sp.solve(sp.Eq(x + 3, (x - 3) ** 2), x) if sp.sqrt(s + 3) == s - 3][0],
    "m02l06-x4": lambda: sp.solve(sp.Eq(4 / (x + 2), 1), x)[0],
    "m02l07-x1": lambda: sp.Abs(6 + 8 * sp.I),
    "m02l07-x5": lambda: sp.deg(sp.arg(sp.sqrt(3) + sp.I)),
}

# ---- Matemáticas M03–M11 (cálculo independiente con SymPy) ----
y, t, h, a, q_ = sp.symbols("y t h a q")


def _seq_rec(a1, f, n):
    v = sp.Integer(a1)
    for _ in range(n - 1):
        v = f(v)
    return v


def _lin_solve(eqs, syms):
    return sp.solve(eqs, syms, dict=True)[0]


def _crit_extreme(f, lo, hi, kind=max):
    pts = [p for p in sp.solve(sp.diff(f, x), x) if p.is_real and lo <= p <= hi] + [lo, hi]
    return kind(f.subs(x, p) for p in pts)


def _tax(base):
    tramos = [(0, 10000, 0), (10000, 30000, F(20, 100)), (30000, 10**9, F(30, 100))]
    return sum(max(0, min(base, b) - lo) * tasa for lo, b, tasa in tramos)


def _area_between(f, g):
    xs = sorted(sp.solve(sp.Eq(f, g), x))
    return sum(sp.Abs(sp.integrate(f - g, (x, xs[i], xs[i + 1]))) for i in range(len(xs) - 1))


NUMERIC.update({
    # M03 sucesiones, progresiones y matemática financiera
    "m03l01-x1": lambda: (5 * x - 3).subs(x, 20),
    "m03l01-x3": lambda: _seq_rec(3, lambda v: 2 * v - 1, 4),
    "m03l01-x4": lambda: sp.solve(sp.Eq(3 * x + 7, 64), x)[0],
    "m03l01-x5": lambda: sp.solve(sp.Eq(x, sp.Rational(3, 4) * x + 50), x)[0],
    "m03l02-x1": lambda: 8 + (15 - 1) * (-3),
    "m03l02-x2": lambda: 5 * 3**4,
    "m03l02-x3": lambda: _lin_solve([x + 3 * y - 10, x + 8 * y - 35], [x, y])[y],
    "m03l02-x5": lambda: [12 / r for r in sp.solve(sp.Eq(12 * r**2, 48), r) if r > 0][0],
    "m03l03-x1": lambda: sp.summation(x, (x, 1, 80)),
    "m03l03-x2": lambda: sp.summation(4 + 3 * (x - 1), (x, 1, 10)),
    "m03l03-x3": lambda: sp.summation(2 * 3 ** (x - 1), (x, 1, 5)),
    "m03l03-x5": lambda: sp.summation(6 * sp.Rational(1, 2) ** x, (x, 0, sp.oo)),
    "m03l04-x1": lambda: F(8000) * F(25, 1000) * 4,
    "m03l04-x2": lambda: 1000 * F(11, 10) ** 3,
    "m03l04-x3": lambda: ((1 + sp.Rational(6, 400)) ** 4 - 1) * 100,
    "m03l04-x5": lambda: sp.solve(sp.Eq(x * sp.Rational(105, 100) ** 2, 11025), x)[0],
    # M04 funciones
    "m04l02-x4": lambda: sp.minimum(x**2 - 6 * x + 11, x),
    "m04l03-x1": lambda: len(sp.real_roots(x**3 - 9 * x)),
    "m04l03-x5": lambda: max(sp.real_roots(x**3 - 2 * x**2 - 8 * x)),
    "m04l04-x1": lambda: sp.Piecewise((x**2, x < 2), (3 * x - 1, True)).subs(x, 3),
    "m04l04-x2": lambda: sp.Piecewise((x**2, x < 2), (3 * x - 1, True)).subs(x, -1),
    "m04l04-x4": lambda: ([s for s in sp.solve(x + 4 - 7, x) if s < 0] + [s for s in sp.solve(2 * x + 1 - 7, x) if s >= 0])[0],
    "m04l04-x5": lambda: _tax(18000),
    "m04l05-x1": lambda: (3 * x - 1).subs(x, (x**2).subs(x, 2)),
    "m04l05-x2": lambda: (x**2).subs(x, (3 * x - 1).subs(x, 2)),
    "m04l05-x3": lambda: sp.solve(sp.Eq(2 * x + 6, 10), x)[0],
    "m04l06-x1": lambda: sp.log(64, 2),
    "m04l06-x2": lambda: sp.solve(sp.Eq(2 ** (x - 1), 16), x)[0],
    "m04l06-x3": lambda: sp.solve(sp.Eq(sp.log(x, 10), 2), x)[0],
    "m04l06-x5": lambda: [s for s in sp.solve(sp.Eq((x - 1) * (x + 1), 3), x) if s > 1][0],
    "m04l07-x2": lambda: sp.solve(x - 7, x)[0],
    "m04l07-x3": lambda: sp.limit((4 * x - 1) / (2 * x + 3), x, sp.oo),
    "m04l08-x1": lambda: (sp.Integer(5) ** 2 - 2**2) / (5 - 2),
    "m04l08-x2": lambda: ((2 * x + 7).subs(x, 10) - (2 * x + 7).subs(x, 1)) / 9,
    "m04l08-x3": lambda: ((4 * t**2).subs(t, 3) - (4 * t**2).subs(t, 1)) / 2,
    "m04l08-x5": lambda: sp.limit(((3 + h) ** 2 - 9) / h, h, 0),
    # M05 trigonometría
    "m05l01-x1": lambda: sp.Rational(135, 180),
    "m05l01-x2": lambda: sp.deg(5 * sp.pi / 6),
    "m05l01-x4": lambda: -sp.sqrt(1 - sp.Rational(4, 5) ** 2),
    "m05l02-x1": lambda: 20 * sp.sin(sp.pi / 6),
    "m05l02-x2": lambda: sp.sqrt(5**2 + 12**2),
    "m05l02-x3": lambda: sp.sqrt(25 + 64 - 2 * 5 * 8 * sp.cos(sp.pi / 3)),
    "m05l02-x4": lambda: sp.Rational(1, 2) * 10 * 12 * sp.sin(sp.pi / 6),
    "m05l02-x5": lambda: 8 * sp.sin(sp.pi / 2) / sp.sin(sp.pi / 6),
    "m05l03-x1": lambda: 2 * sp.Rational(6, 10) * sp.Rational(8, 10),
    "m05l03-x3": lambda: len(sp.solveset(sp.Eq(sp.sin(x), sp.Rational(1, 2)), x, sp.Interval.Ropen(0, 2 * sp.pi))),
    "m05l03-x4": lambda: sp.deg(min(sp.solveset(2 * sp.cos(x) - 1, x, sp.Interval.open(0, 2 * sp.pi)))),
    "m05l04-x1": lambda: sp.Rational(1, 2) * 4**2 * sp.pi / 2,
    "m05l04-x2": lambda: 20 * sp.cos(sp.pi / 3),
    "m05l04-x3": lambda: 5 * 8 * sp.sin(sp.pi / 6),
    "m05l04-x4": lambda: 3 * sp.rad(120),
    "m05l04-x5": lambda: 6 * sp.sqrt(3) / 4 * 2**2,
    # M06 álgebra lineal
    "m06l02-x1": lambda: (sp.Matrix([[1, 2], [3, 4]]) * sp.Matrix([[2, 0], [1, 3]]))[0, 1],
    "m06l02-x4": lambda: (sp.Matrix([[1, 2], [0, 3]]) ** 2).trace(),
    "m06l03-x1": lambda: sp.Matrix([[3, -1], [4, 2]]).det(),
    "m06l03-x2": lambda: sp.Matrix([[2, 0, 1], [1, 3, 0], [0, 1, 4]]).det(),
    "m06l03-x3": lambda: sp.solve(sp.Matrix([[k, 6], [2, 3]]).det(), k)[0],
    "m06l03-x5": lambda: sp.Matrix([[1, 2, 1], [2, 4, 2], [0, 1, 1]]).rank(),
    "m06l04-x1": lambda: _lin_solve([x + y + t - 6, y + t - 5, t - 3], [x, y, t])[x],
    "m06l04-x3": lambda: _lin_solve([x + y + t - 6, 2 * x - y + t - 3, x + 2 * y - t - 2], [x, y, t])[t],
    "m06l04-x4": lambda: sp.solve(sp.Matrix([[1, 1, 1], [1, k, 1], [1, 1, k]]).det(), k)[0],
    # M07 geometría analítica
    "m07l01-x1": lambda: sp.Point(0, 0).distance(sp.Point(6, 8)),
    "m07l01-x2": lambda: sp.Point(-3, 5).midpoint(sp.Point(7, 1)).x,
    "m07l01-x3": lambda: sp.Line(sp.Point(1, 2), sp.Point(4, 11)).slope,
    "m07l01-x5": lambda: sp.deg(sp.atan(sp.sqrt(3))),
    "m07l02-x1": lambda: sp.solve(4 * x - 2 * y + 5, y)[0].coeff(x),
    "m07l02-x3": lambda: sp.Abs(3 * 3 + 4 * 4) / sp.sqrt(3**2 + 4**2),
    "m07l02-x4": lambda: _lin_solve([x + y - 7, x - y - 1], [x, y])[x],
    "m07l03-x1": lambda: -sp.Matrix([1, 1, 1]).dot(sp.Matrix([1, 2, 3])),
    "m07l03-x3": lambda: (1 + t).subs(t, sp.solve(3 - t, t)[0]),
    "m07l03-x5": lambda: sp.solve(2 + 1 + k * 1 - 6, k)[0],
    "m07l04-x2": lambda: sp.Matrix([3, 0, 0]).cross(sp.Matrix([0, 4, 0])).norm(),
    "m07l04-x3": lambda: sp.Abs(2 + 2 * 1 + 2 * 2) / sp.sqrt(1 + 4 + 4),
    "m07l04-x4": lambda: sp.Abs(sp.Matrix([[1, 0, 0], [0, 1, 0], [1, 1, 5]]).det()),
    "m07l04-x5": lambda: sp.deg(sp.acos(sp.Matrix([1, 0, 0]).dot(sp.Matrix([1, 1, 0])) / (sp.Matrix([1, 0, 0]).norm() * sp.Matrix([1, 1, 0]).norm()))),
    # M08 derivadas
    "m08l02-x1": lambda: sp.limit(((4 + h) ** 2 - 16) / h, h, 0),
    "m08l02-x2": lambda: sp.diff(7 * x + 3, x),
    "m08l02-x3": lambda: sp.limit((5 * (3 + h) ** 2 - 45) / h, h, 0),
    "m08l02-x5": lambda: sp.limit((1 / (1 + h) - 1) / h, h, 0),
    "m08l03-x1": lambda: sp.diff(x**3 - 4 * x**2 + 2, x).subs(x, 2),
    "m08l03-x3": lambda: sp.diff(x / (x + 1), x).subs(x, 1),
    "m08l03-x4": lambda: sp.diff((2 * x + 1) ** 3, x).subs(x, 1),
    "m08l03-x5": lambda: sp.diff(sp.log(x**2 + 1), x).subs(x, 1),
    "m08l04-x1": lambda: sp.diff(x**2 + 5 * x, x).subs(x, 1),
    "m08l04-x3": lambda: sp.solve(sp.diff(x**2 - 8 * x + 3, x), x)[0],
    "m08l04-x4": lambda: -1 / sp.diff(x**2, x).subs(x, 2),
    "m08l04-x5": lambda: sp.sqrt(16) + sp.diff(sp.sqrt(x), x).subs(x, 16) * sp.Rational(4, 10),
    "m08l05-x1": lambda: sp.solve(sp.diff(x**2 - 10 * x + 3, x), x)[0],
    "m08l05-x3": lambda: _crit_extreme(-x**2 + 4 * x + 1, -100, 100),
    "m08l05-x4": lambda: _crit_extreme(x**3 - 3 * x, -2, 3),
    "m08l05-x5": lambda: sp.solve(sp.diff(x**3 + a * x**2, x).subs(x, 2), a)[0],
    "m08l06-x1": lambda: sp.solve(sp.diff(x**3 - 9 * x**2 + 1, x, 2), x)[0],
    "m08l06-x4": lambda: sp.limit((3 * x - 1) / (x + 2), x, sp.oo),
    "m08l06-x5": lambda: sp.solve(sp.diff(x**3 + a * x**2 + 5, x, 2).subs(x, 1), a)[0],
    "m08l07-x1": lambda: _crit_extreme(x * (16 - x), 0, 16),
    "m08l07-x2": lambda: _crit_extreme(x * (30 - x), 0, 30),
    "m08l07-x3": lambda: [c for c in sp.solve(sp.diff(-3 * q_**2 + 120 * q_ - 200, q_), q_)][0],
    "m08l07-x4": lambda: max((p for p in sp.solve(sp.diff(x * (18 - 2 * x) ** 2, x), x) if 0 < p < 9), key=lambda p: (x * (18 - 2 * x) ** 2).subs(x, p)),
    # M09 integrales
    "m09l01-x1": lambda: sp.integrate(2 * x, (x, 1, 3)),
    "m09l01-x4": lambda: _area_between(9 - x**2, sp.Integer(0)),
    "m09l01-x5": lambda: _area_between(x**2, 2 * x),
    # M10 examen (aritmética de formato y cálculo)
    "m10l01-x1": lambda: 4 * F(3, 2),
    "m10l01-x2": lambda: F(3, 2) + 1 + F(3, 2) + F(1, 2) + 3,
    "m10l01-x4": lambda: sp.diff(x**3 - 2 * x, x).subs(x, 2),
    "m10l01-x5": lambda: sp.solve(sp.Matrix([[1, 1], [2, a]]).det(), a)[0],
    "m10l02-x2": lambda: F(6, 10) * 100 / 4,
    "m10l02-x4": lambda: sp.floor(sp.sqrt(130)),
    "m10l02-x5": lambda: F(1, 2) + F(1, 2) + 0,
    # M11 puente universitario
    "m11l01-x2": lambda: sp.binomial(10, 2),
    "m11l01-x3": lambda: F(3, 3 + 5),
    "m11l01-x4": lambda: len(set(range(18)) | set(range(13, 25))),
    "m11l01-x5": lambda: sp.diff(x**2 * y + 3 * y**2, y).subs({x: 2, y: 1}),
})

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
    # Matemáticas M00–M02 (ampliación 24-10-2026)
    "m00l03-x1": ("b", lambda: F(56, 98) == F(4, 7)),
    "m00l03-x3": ("c", lambda: max([F(5, 8), F(7, 12), F(2, 3), F(3, 5)]) == F(2, 3)),
    "m00l03-x4": ("b", lambda: -F(3, 4) < -F(2, 3)),
    "m00l05-x2": ("c", lambda: sp.nsimplify("0.363636363636363636", rational=True, tolerance=1e-12) == sp.Rational(4, 11)),
    "m00l05-x4": ("b", lambda: F(125, 100) * F(80, 100) == 1),
    "m00l06-x1": ("b", lambda: 4 - 2 + 1 == 3),
    "m00l06-x3": ("b", lambda: sp.simplify(sp.sqrt(75) - sp.sqrt(27) - 2 * sp.sqrt(3)) == 0),
    "m00l06-x4": ("b", lambda: 6 * F(1, 10**4) * 5 * 10**7 == 3 * 10**4),
    "m01l03-x1": ("c", lambda: sp.solve(sp.Symbol("F") - x * k, x)[0] == sp.Symbol("F") / k),
    "m01l03-x2": ("a", lambda: sp.solve(sp.Symbol("y") - (x + 4) / 5, x)[0] == 5 * sp.Symbol("y") - 4),
    "m01l03-x3": ("a", lambda: sp.simplify(sp.solve(sp.Symbol("a") * x - sp.Symbol("b") - sp.Symbol("c") * x, x)[0] - sp.Symbol("b") / (sp.Symbol("a") - sp.Symbol("c"))) == 0),
    "m01l04-x5": ("b", lambda: (F(1, 2) / (F(1, 2) + F(1, 4) + F(1, 8))) == 2 * (F(1, 4) / (F(1, 2) + F(1, 4) + F(1, 8)))),
    "m01l05-x2": ("b", lambda: sp.solve_univariate_inequality(7 - 2 * x > 1, x, relational=False) == sp.Interval.open(-sp.oo, 3)),
    "m01l05-x3": ("a", lambda: sp.Interval.Lopen(-1, 5).intersect(sp.Interval.Ropen(2, 8)) == sp.Interval(2, 5)),
    "m01l05-x5": ("a", lambda: sp.Interval(-3, sp.oo).intersect(sp.solve_univariate_inequality(2 * x - 3 < x, x, relational=False)) == sp.Interval.Ropen(-3, 3)),
    "m01l06-x2": ("b", lambda: set(sp.solve(sp.Abs(sp.Symbol("t", real=True) - 3) - 5, sp.Symbol("t", real=True))) == {8, -2}),
    "m01l06-x3": ("a", lambda: sp.solve_univariate_inequality(sp.Abs(sp.Symbol("t", real=True) - 4) < 2, sp.Symbol("t", real=True), relational=False) == sp.Interval.open(2, 6)),
    "m01l06-x4": ("a", lambda: sp.solve(sp.Abs(2 * sp.Symbol("t", real=True) + 5) + 3, sp.Symbol("t", real=True)) == []),
    "m01l06-x5": ("b", lambda: sp.solve_univariate_inequality(sp.Abs(2 * sp.Symbol("t", real=True) - 1) >= 5, sp.Symbol("t", real=True), relational=False) == sp.Union(sp.Interval(-sp.oo, -2), sp.Interval(3, sp.oo))),
    "m01l07-x4": ("b", lambda: sp.solve(sp.Eq(2 * x + 35, sp.Rational(26, 10) * (x + 10)), x)[0] == 15),
    "m02l02-x3": ("a", lambda: sp.div(x**3 - 6 * x**2 + 11 * x - 6, x - 1, x) == (x**2 - 5 * x + 6, 0)),
    "m02l02-x5": ("b", lambda: E((x + 1) * (x - 2) * (x - 3)) == x**3 - 4 * x**2 + x + 6),
    "m02l03-x1": ("a", lambda: sp.simplify((x**2 - 25) / (x**2 - 5 * x) - (x + 5) / x) == 0),
    "m02l03-x2": ("c", lambda: sp.solve(x**2 - 4 * x + 4, x) == [2]),
    "m02l03-x4": ("b", lambda: sp.simplify(2 / x + 3 / (2 * x) - sp.Rational(7, 2) / x) == 0),
    "m02l03-x5": ("a", lambda: sp.simplify(1 / (x - 3) - 6 / (x**2 - 9) - 1 / (x + 3)) == 0),
    "m02l04-x2": ("c", lambda: sp.discriminant(3 * x**2 - 2 * x + 1, x) < 0),
    "m02l04-x4": ("a", lambda: set(sp.solve(4 * x**2 - 9, x)) == {sp.Rational(3, 2), -sp.Rational(3, 2)}),
    "m02l05-x4": ("a", lambda: sp.simplify(3 / sp.sqrt(6) - sp.sqrt(6) / 2) == 0),
    "m02l05-x5": ("a", lambda: sp.simplify(sp.Symbol("p", positive=True) ** sp.Rational(3, 4) * sp.Symbol("p", positive=True) ** sp.Rational(1, 4) / sp.Symbol("p", positive=True) ** sp.Rational(1, 2) - sp.sqrt(sp.Symbol("p", positive=True))) == 0),
    "m02l06-x2": ("b", lambda: sp.Matrix([[1, -1, 2], [3, -3, 6]]).rank() == 1),
    "m02l06-x5": ("a", lambda: [s for s in sp.solve(sp.Eq(x, 2), x) if s != 2] == []),
    "m02l07-x2": ("b", lambda: E((1 + 2 * sp.I) * (3 - sp.I)) == 5 + 5 * sp.I),
    "m02l07-x3": ("a", lambda: set(sp.solve(x**2 - 4 * x + 13, x)) == {2 + 3 * sp.I, 2 - 3 * sp.I}),
    "m02l07-x4": ("b", lambda: sp.I**10 == -1),
}


# ---- Opción múltiple calculable M03–M11 ----
_R = sp.S.Reals
MC.update({
    "m03l01-x2": ("b", lambda: all((5 * n - 1) == v for n, v in zip(range(1, 5), [4, 9, 14, 19]))),
    "m03l03-x4": ("b", lambda: sp.summation(x**2, (x, 1, 4)) == 30),
    "m03l04-x4": ("c", lambda: 1 + F(5, 100) * 20 < F(105, 100) ** 20),
    "m04l02-x1": ("c", lambda: sp.calculus.util.continuous_domain(5 / (x + 2), x, _R) == _R - sp.FiniteSet(-2)),
    "m04l02-x2": ("b", lambda: sp.calculus.util.continuous_domain(sp.sqrt(2 * x - 8), x, _R) == sp.Interval(4, sp.oo)),
    "m04l02-x3": ("c", lambda: sp.calculus.util.continuous_domain(sp.sqrt(x) / (x - 1), x, _R) == sp.Union(sp.Interval.Ropen(0, 1), sp.Interval.open(1, sp.oo))),
    "m04l02-x5": ("b", lambda: sp.calculus.util.function_range(sp.sqrt(x) + 2, x, sp.Interval(0, sp.oo)) == sp.Interval(2, sp.oo)),
    "m04l03-x2": ("a", lambda: sp.solve_univariate_inequality(x**2 - 4 * x < 0, x, relational=False) == sp.Interval.open(0, 4)),
    "m04l03-x3": ("b", lambda: sp.solve_univariate_inequality((x - 5) / (x + 2) >= 0, x, relational=False) == sp.Union(sp.Interval.open(-sp.oo, -2), sp.Interval(5, sp.oo))),
    "m04l03-x4": ("b", lambda: sp.calculus.util.continuous_domain(sp.sqrt(9 - x**2), x, _R) == sp.Interval(-3, 3)),
    "m04l04-x3": ("b", lambda: all(sp.Abs(v - 5) == (5 - v if v < 5 else v - 5) for v in range(-3, 12))),
    "m04l05-x4": ("b", lambda: sp.simplify(((x - 3) / 4).subs(x, 4 * x + 3) - x) == 0),
    "m04l05-x5": ("c", lambda: (x**2).subs(x, 2) == (x**2).subs(x, -2)),
    "m04l06-x4": ("b", lambda: sp.expand_log(sp.log(sp.Symbol("p", positive=True) * sp.Symbol("s", positive=True)), force=True) == sp.log(sp.Symbol("p", positive=True)) + sp.log(sp.Symbol("s", positive=True))),
    "m04l07-x4": ("b", lambda: sp.limit((x**2 + 3 * x) / (x + 1) - (x + 2), x, sp.oo) == 0),
    "m04l07-x5": ("b", lambda: sp.limit((x**2 - 9) / (x - 3), x, 3) == 6 and sp.Integer(3) not in sp.calculus.util.continuous_domain((x**2 - 9) / (x - 3), x, _R)),
    "m05l01-x3": ("c", lambda: sp.sin(sp.rad(250)).evalf() < 0 and sp.cos(sp.rad(250)).evalf() < 0),
    "m05l01-x5": ("b", lambda: sp.cos(sp.rad(240)) == -sp.Rational(1, 2)),
    "m05l03-x2": ("c", lambda: sp.expand_trig(sp.cos(x + y)) == sp.cos(x) * sp.cos(y) - sp.sin(x) * sp.sin(y)),
    "m05l03-x5": ("a", lambda: sp.simplify(1 + sp.tan(x) ** 2 - 1 / sp.cos(x) ** 2) == 0),
    "m06l02-x2": ("b", lambda: (sp.ones(2, 3) * sp.ones(3, 4)).shape == (2, 4)),
    "m06l02-x5": ("a", lambda: sp.Matrix([[1, 2, 3], [4, 5, 6]]).T == sp.Matrix([[1, 4], [2, 5], [3, 6]])),
    "m06l03-x4": ("a", lambda: sp.Matrix([[1, 2], [0, 1]]).inv() == sp.Matrix([[1, -2], [0, 1]])),
    "m06l04-x2": ("c", lambda: sp.linsolve((sp.Matrix([[1, 1, 1], [0, 1, 1], [0, 0, 0]]), sp.Matrix([1, 2, 4])), x, y, k) == sp.EmptySet),
    "m07l01-x4": ("a", lambda: sp.Point.is_collinear(sp.Point(0, 1), sp.Point(2, 5), sp.Point(4, 9))),
    "m07l02-x2": ("b", lambda: sp.Line(sp.Point(0, 3), slope=2).is_parallel(sp.Line(sp.Point(0, -1), slope=2))),
    "m07l03-x2": ("b", lambda: sp.Plane(sp.Point3D(1, 0, 0), normal_vector=(1, 2, -1)).is_parallel(sp.Plane(sp.Point3D(sp.Rational(3, 2), 0, 0), normal_vector=(2, 4, -2))) and sp.Point3D(sp.Rational(3, 2), 0, 0) not in sp.Plane(sp.Point3D(1, 0, 0), normal_vector=(1, 2, -1))),
    "m07l03-x4": ("b", lambda: sp.Matrix([2, 1, 0]).dot(sp.Matrix([1, -2, 5])) == 0),
    "m07l04-x1": ("a", lambda: sp.Matrix([1, 2, 0]).cross(sp.Matrix([0, 1, 1])) == sp.Matrix([2, -1, 1])),
    "m08l03-x2": ("c", lambda: sp.simplify(sp.diff(x**2 * sp.exp(x), x) - x * sp.exp(x) * (x + 2)) == 0),
    "m08l04-x2": ("a", lambda: sp.expand(1 + 3 * (x - 1)) == 3 * x - 2),
    "m08l05-x2": ("b", lambda: sp.solve_univariate_inequality(sp.diff(x**3 - 12 * x, x) < 0, x, relational=False) == sp.Interval.open(-2, 2)),
    "m08l06-x3": ("b", lambda: sp.solve_univariate_inequality(sp.diff(x**4, x, 2) < 0, x, relational=False) == sp.EmptySet),
    "m09l01-x2": ("a", lambda: sp.simplify(sp.diff(3 * sp.log(x) + sp.exp(2 * x) / 2, x) - (3 / x + sp.exp(2 * x))) == 0),
    "m09l01-x3": ("b", lambda: sp.simplify(sp.diff(sp.exp(x) * (x - 1), x) - x * sp.exp(x)) == 0),
    "m10l02-x3": ("b", lambda: sp.integrate(x**2, (x, 0, 3)) == 9),
})
# ---- Castellano C07 (aritmética de puntuación del formato de referencia) ----
NUMERIC.update({
    "c07l01-x1": lambda: F(3, 6),
    "c07l01-x2": lambda: 3 * F(1, 2) - 2 * F(16, 100),
    "c07l01-x3": lambda: 6 * F(1, 10),
    "c07l01-x5": lambda: F(4, 10) * 50,
})
MC.update({
    "c07l01-x4": ("b", lambda: F(1, 2) * F(1, 2) - F(1, 2) * F(16, 100) > 0),
})
# ---- Comentario T06 (aritmética de puntuación del formato de referencia) ----
NUMERIC.update({
    "t06l01-x1": lambda: F(3, 3),
    "t06l01-x2": lambda: 5 * F(1, 2) - F(16, 100),
    "t06l01-x3": lambda: F(4, 10) * 90,
    "t06l02-x1": lambda: 7 * F(1, 10),
})
# ---- Inglés E06 (formato de referencia y valor esperado con penalización) ----
NUMERIC.update({
    "e06l02-x3": lambda: 60,
    "e06l03-x1": lambda: 6 - 2 * F(33, 100),
    "e06l03-x2": lambda: F(1, 2) * 1 - F(1, 2) * F(33, 100),
    "e06l03-x4": lambda: 6 * F(5, 100),
    "e06l03-x5": lambda: F(1, 3) - F(2, 3) * F(33, 100),
})
MC.update({
    "e06l03-x3": ("b", lambda: abs(F(1, 4) - F(3, 4) * F(33, 100)) < F(1, 100)),
})

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
