"""
two-mean-ci: (x̄₁ - x̄₂) ± t* √(s₁²/n₁ + s₂²/n₂)
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


class TwoMeanCiScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("CI for Difference of Two Means", font_size=32, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Two groups (0.8-3s) ---
        g1 = MathTex(r"\bar{x}_1 = 74.2,\; s_1 = 8.5,\; n_1 = 40",
                      font_size=22, color=BLUE_ACCENT).shift(LEFT * 0.2 + UP * 1.6)
        g2 = MathTex(r"\bar{x}_2 = 68.9,\; s_2 = 9.1,\; n_2 = 45",
                      font_size=22, color=PURPLE).next_to(g1, DOWN, buff=0.2)

        self.play(FadeIn(g1), FadeIn(g2), run_time=0.6)
        self.wait(0.3)

        # --- Formula (3-6s) ---
        formula = MathTex(
            r"(\bar{x}_1 - \bar{x}_2)", r"\;\pm\;", r"t^*",
            r"\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}",
            font_size=32,
        ).shift(UP * 0.2)
        formula[0].set_color(GOLD)
        formula[2].set_color(RED)
        formula[3].set_color(GREEN)

        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # --- Key insight: s² not s (6-8s) ---
        insight = VGroup(
            MathTex(r"s_1^2 / n_1", font_size=24, color=BLUE_ACCENT),
            MathTex(r"+", font_size=24, color=SOFT_WHITE),
            MathTex(r"s_2^2 / n_2", font_size=24, color=PURPLE),
        ).arrange(RIGHT, buff=0.3).next_to(formula, DOWN, buff=0.5)

        why = Text("Variances add (not SDs!) for independent samples",
                    font_size=18, color=GREEN)
        why.next_to(insight, DOWN, buff=0.2)

        self.play(FadeIn(insight), run_time=0.5)
        self.play(FadeIn(why), run_time=0.4)
        self.wait(0.3)

        # --- Computation (8-12s) ---
        diff_val = MathTex(
            r"\bar{x}_1 - \bar{x}_2 = 5.3", font_size=24, color=GOLD,
        ).next_to(why, DOWN, buff=0.4)
        self.play(Write(diff_val), run_time=0.4)

        se_val = MathTex(
            r"SE = \sqrt{\frac{72.25}{40} + \frac{82.81}{45}} \approx 1.88",
            font_size=22, color=GREEN,
        ).next_to(diff_val, DOWN, buff=0.2)
        self.play(Write(se_val), run_time=0.7)

        interval = MathTex(
            r"5.3 \pm 1.99(1.88) = (1.56,\; 9.04)",
            font_size=24, color=SOFT_WHITE,
        ).next_to(se_val, DOWN, buff=0.2)
        self.play(Write(interval), run_time=0.7)
        self.wait(0.3)

        # --- Conclusion (12-15s) ---
        box = SurroundingRectangle(interval, color=GOLD, buff=0.12)
        note = Text("0 not in interval → significant difference in means",
                     font_size=18, color=GOLD)
        note.next_to(box, DOWN, buff=0.2)

        df_note = Text("df via Welch approximation (not simply n₁+n₂−2)",
                       font_size=16, color=GREY_A)
        df_note.to_edge(DOWN, buff=0.3)

        self.play(Create(box), FadeIn(note), run_time=0.5)
        self.play(FadeIn(df_note), run_time=0.4)
        self.wait(1.2)
