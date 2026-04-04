"""
std-resid-chi: Standardized Residual = (O - E) / √E
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"
ORANGE = "#FFA500"


class StdResidChiScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("Standardized Residual", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Bar chart: Observed vs Expected (0.8-5s) ---
        categories = ["A", "B", "C", "D"]
        observed = [30, 15, 35, 20]
        expected = [25, 25, 25, 25]

        bars_o = VGroup()
        bars_e = VGroup()
        cat_labels = VGroup()
        x_start = -3.5

        for i in range(4):
            x = x_start + i * 2.0
            # Expected bar (ghost)
            bar_e = Rectangle(
                width=0.6, height=expected[i] * 0.08,
                stroke_color=GREY_A, stroke_width=1.5, fill_opacity=0.1,
            ).move_to(RIGHT * x + DOWN * 0.5 + UP * expected[i] * 0.04)
            bars_e.add(bar_e)
            # Observed bar
            bar_o = Rectangle(
                width=0.6, height=observed[i] * 0.08,
                stroke_color=BLUE_ACCENT, fill_color=BLUE_ACCENT, fill_opacity=0.6,
            ).move_to(RIGHT * x + DOWN * 0.5 + UP * observed[i] * 0.04)
            bars_o.add(bar_o)
            # Label
            lbl = Text(categories[i], font_size=20, color=SOFT_WHITE)
            lbl.next_to(bar_o, DOWN, buff=0.15)
            cat_labels.add(lbl)

        legend_o = VGroup(
            Rectangle(width=0.3, height=0.2, fill_color=BLUE_ACCENT, fill_opacity=0.6, stroke_width=0),
            Text("Observed", font_size=16, color=BLUE_ACCENT),
        ).arrange(RIGHT, buff=0.1).shift(RIGHT * 4 + UP * 2)
        legend_e = VGroup(
            Rectangle(width=0.3, height=0.2, stroke_color=GREY_A, stroke_width=1.5, fill_opacity=0.1),
            Text("Expected", font_size=16, color=GREY_A),
        ).arrange(RIGHT, buff=0.1).next_to(legend_o, DOWN, buff=0.15)

        self.play(
            LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars_e], lag_ratio=0.1),
            LaggedStart(*[FadeIn(l) for l in cat_labels], lag_ratio=0.1),
            FadeIn(legend_o), FadeIn(legend_e),
            run_time=1.0,
        )
        self.play(
            LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars_o], lag_ratio=0.1),
            run_time=1.0,
        )
        self.wait(0.3)

        # --- Highlight cell C: O=35, E=25 (5-8s) ---
        self.play(
            bars_o[2].animate.set_fill(ORANGE, 0.8),
            run_time=0.5,
        )

        formula = MathTex(
            r"\text{std resid}", r"=", r"\frac{O - E}{\sqrt{E}}",
            font_size=36,
        ).to_edge(DOWN, buff=1.4)
        formula[0].set_color(GOLD)
        formula[2].set_color(BLUE_ACCENT)
        self.play(Write(formula), run_time=1.0)
        self.wait(0.2)

        # --- Plug in values (8-12s) ---
        calc = MathTex(
            r"= \frac{35 - 25}{\sqrt{25}}",
            r"= \frac{10}{5}",
            r"= 2.0",
            font_size=30,
        ).next_to(formula, DOWN, buff=0.3)
        calc[2].set_color(ORANGE)

        self.play(Write(calc[0]), run_time=0.6)
        self.play(Write(calc[1]), run_time=0.5)
        self.play(Write(calc[2]), run_time=0.5)
        self.wait(0.3)

        # --- Interpretation (12-15s) ---
        interp = Text("|std resid| > 2 → notable deviation from H₀",
                      font_size=20, color=ORANGE)
        interp.next_to(calc, DOWN, buff=0.3)
        self.play(FadeIn(interp, shift=UP * 0.1), run_time=0.5)

        # Flash the bar
        self.play(
            bars_o[2].animate.set_fill(RED, 0.9),
            run_time=0.3,
        )
        self.play(
            bars_o[2].animate.set_fill(ORANGE, 0.8),
            run_time=0.3,
        )
        self.wait(1.0)
