"""
two-prop-ci: (p̂₁ - p̂₂) ± z* √(p̂₁(1-p̂₁)/n₁ + p̂₂(1-p̂₂)/n₂)
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"
PURPLE = "#BB86FC"


class TwoPropCiScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("CI for Difference of Two Proportions", font_size=32, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Two groups visual (0.8-4s) ---
        g1_label = Text("Group 1", font_size=22, color=BLUE_ACCENT).shift(LEFT * 3 + UP * 1.5)
        g2_label = Text("Group 2", font_size=22, color=PURPLE).shift(RIGHT * 3 + UP * 1.5)

        g1_data = MathTex(r"\hat{p}_1 = 0.72,\; n_1 = 150", font_size=22, color=BLUE_ACCENT)
        g1_data.next_to(g1_label, DOWN, buff=0.2)
        g2_data = MathTex(r"\hat{p}_2 = 0.58,\; n_2 = 180", font_size=22, color=PURPLE)
        g2_data.next_to(g2_label, DOWN, buff=0.2)

        self.play(
            FadeIn(g1_label), FadeIn(g2_label),
            FadeIn(g1_data), FadeIn(g2_data),
            run_time=0.8,
        )
        self.wait(0.3)

        # --- Formula (4-7s) ---
        formula = MathTex(
            r"(\hat{p}_1 - \hat{p}_2)", r"\;\pm\;", r"z^*",
            r"\sqrt{\frac{\hat{p}_1(1-\hat{p}_1)}{n_1} + \frac{\hat{p}_2(1-\hat{p}_2)}{n_2}}",
            font_size=30,
        ).shift(DOWN * 0.2)
        formula[0].set_color(GOLD)
        formula[2].set_color(RED)
        formula[3].set_color(GREEN)

        self.play(Write(formula), run_time=1.5)
        self.wait(0.3)

        # --- Computation (7-11s) ---
        diff = MathTex(r"\hat{p}_1 - \hat{p}_2 = 0.14", font_size=24, color=GOLD)
        diff.shift(DOWN * 1.3)
        self.play(Write(diff), run_time=0.5)

        se_calc = MathTex(
            r"SE = \sqrt{\frac{0.72 \times 0.28}{150} + \frac{0.58 \times 0.42}{180}} \approx 0.052",
            font_size=22, color=GREEN,
        ).next_to(diff, DOWN, buff=0.25)
        self.play(Write(se_calc), run_time=0.8)

        interval = MathTex(
            r"0.14 \pm 1.96(0.052) = (0.038,\; 0.242)",
            font_size=24, color=SOFT_WHITE,
        ).next_to(se_calc, DOWN, buff=0.25)
        self.play(Write(interval), run_time=0.7)
        self.wait(0.3)

        # --- Key insight (11-15s) ---
        box = SurroundingRectangle(interval, color=GOLD, buff=0.15)
        insight = Text("0 not in interval → evidence of a real difference",
                       font_size=20, color=GOLD)
        insight.next_to(box, DOWN, buff=0.25)

        self.play(Create(box), run_time=0.5)
        self.play(FadeIn(insight, shift=UP * 0.1), run_time=0.5)

        # Variances ADD callout
        add_note = Text("Independent → variances ADD", font_size=18, color=GREEN)
        add_note.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(add_note), run_time=0.5)
        self.wait(1.5)
