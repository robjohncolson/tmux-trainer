"""
lincomb-var: Linear Combination Variance  Var(aX+bY) = a²σ²_X + b²σ²_Y
Manim Community Edition v0.19 — 720p30, ~16 seconds
"""
from manim import *
import numpy as np
from math import sqrt

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class LincombVarScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Linear Combination Variance", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Important note
        note = Text(
            "(requires independence of X and Y)",
            font_size=20, color="#FF6B6B",
        )
        note.next_to(title, DOWN, buff=0.2)
        self.play(FadeIn(note), run_time=0.4)

        # Formula step-by-step
        f1 = MathTex(r"\text{Var}(aX + bY)", font_size=40, color=SOFT_WHITE)
        f2 = MathTex(r"=", font_size=40, color=SOFT_WHITE)
        f3 = MathTex(r"a^2 \sigma_X^2", font_size=40, color=BLUE_ACCENT)
        f4 = MathTex(r"+", font_size=40, color=SOFT_WHITE)
        f5 = MathTex(r"b^2 \sigma_Y^2", font_size=40, color="#77DD77")

        formula = VGroup(f1, f2, f3, f4, f5).arrange(RIGHT, buff=0.15)
        formula.move_to(UP * 1.0)

        self.play(Write(f1), Write(f2), run_time=0.7)

        # Highlight a² part
        box_a = SurroundingRectangle(f3, color=BLUE_ACCENT, buff=0.06, stroke_width=1.5)
        lbl_a = Text("squared coefficient!", font_size=16, color=BLUE_ACCENT)
        lbl_a.next_to(box_a, UP, buff=0.08)
        self.play(Write(f3), Create(box_a), FadeIn(lbl_a), run_time=0.7)

        self.play(Write(f4), run_time=0.2)

        box_b = SurroundingRectangle(f5, color="#77DD77", buff=0.06, stroke_width=1.5)
        lbl_b = Text("squared coefficient!", font_size=16, color="#77DD77")
        lbl_b.next_to(box_b, UP, buff=0.08)
        self.play(Write(f5), Create(box_b), FadeIn(lbl_b), run_time=0.7)
        self.wait(0.3)

        self.play(
            FadeOut(box_a), FadeOut(lbl_a),
            FadeOut(box_b), FadeOut(lbl_b),
            run_time=0.3,
        )

        # Concrete example
        a, b = 3, 2
        sigma_x, sigma_y = 2.0, 3.0
        var_combo = a**2 * sigma_x**2 + b**2 * sigma_y**2
        sd_combo = sqrt(var_combo)

        params = MathTex(
            rf"a={a},\; b={b},\; \sigma_X={sigma_x:.0f},\; \sigma_Y={sigma_y:.0f}",
            font_size=26, color=GREY_B,
        )
        params.next_to(formula, DOWN, buff=0.5)
        self.play(FadeIn(params), run_time=0.4)

        calc = MathTex(
            rf"= {a}^2 \cdot {sigma_x:.0f}^2 + {b}^2 \cdot {sigma_y:.0f}^2",
            font_size=30, color=SOFT_WHITE,
        )
        calc.next_to(params, DOWN, buff=0.3)
        self.play(Write(calc), run_time=0.8)

        calc2 = MathTex(
            rf"= {a**2} \cdot {sigma_x**2:.0f} + {b**2} \cdot {sigma_y**2:.0f}"
            rf" = {a**2 * sigma_x**2:.0f} + {b**2 * sigma_y**2:.0f}"
            rf" = {var_combo:.0f}",
            font_size=28, color=SOFT_WHITE,
        )
        calc2.next_to(calc, DOWN, buff=0.25)
        self.play(Write(calc2), run_time=1.0)

        result = MathTex(
            rf"\sigma_{{aX+bY}} = \sqrt{{{var_combo:.0f}}} = {sd_combo:.2f}",
            font_size=34, color=GOLD,
        )
        result.next_to(calc2, DOWN, buff=0.35)
        self.play(Write(result), run_time=0.8)
        self.wait(0.3)

        # Visual: two variance boxes combining
        box_x = Square(side_length=0.8, color=BLUE_ACCENT, fill_opacity=0.3)
        box_x_lbl = MathTex(rf"a^2\sigma_X^2={a**2 * sigma_x**2:.0f}", font_size=16, color=BLUE_ACCENT)
        bx_grp = VGroup(box_x, box_x_lbl).arrange(DOWN, buff=0.08)

        box_y = Square(side_length=0.8, color="#77DD77", fill_opacity=0.3)
        box_y_lbl = MathTex(rf"b^2\sigma_Y^2={b**2 * sigma_y**2:.0f}", font_size=16, color="#77DD77")
        by_grp = VGroup(box_y, box_y_lbl).arrange(DOWN, buff=0.08)

        plus_sign = MathTex("+", font_size=30, color=SOFT_WHITE)
        eq_sign = MathTex("=", font_size=30, color=SOFT_WHITE)

        box_combo = Square(side_length=1.1, color=GOLD, fill_opacity=0.3)
        box_combo_lbl = MathTex(rf"{var_combo:.0f}", font_size=18, color=GOLD)
        bc_grp = VGroup(box_combo, box_combo_lbl).arrange(DOWN, buff=0.08)

        visual = VGroup(bx_grp, plus_sign, by_grp, eq_sign, bc_grp).arrange(RIGHT, buff=0.3)
        visual.to_edge(DOWN, buff=0.8)

        self.play(FadeIn(visual), run_time=0.8)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "Variances add with squared coefficients (for independent RVs).",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
