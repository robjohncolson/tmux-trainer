"""
lincomb-mean: Linear Combination Mean  μ_{aX+bY} = aμ_X + bμ_Y
Manim Community Edition v0.19 — 720p30, ~16 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class LincombMeanScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Linear Combination Mean", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Formula build
        f_lhs = MathTex(r"\mu_{aX + bY}", font_size=42, color=SOFT_WHITE)
        f_eq = MathTex(r"=", font_size=42, color=SOFT_WHITE)
        f_rhs = MathTex(r"a\mu_X + b\mu_Y", font_size=42, color=SOFT_WHITE)

        formula = VGroup(f_lhs, f_eq, f_rhs).arrange(RIGHT, buff=0.2)
        formula.move_to(UP * 1.8)

        self.play(Write(f_lhs), run_time=0.6)
        self.play(Write(f_eq), Write(f_rhs), run_time=0.8)
        self.wait(0.3)

        # Setup: two distributions
        mu_x, mu_y = 5.0, 8.0
        a, b = 2, 3

        params = VGroup(
            MathTex(rf"\mu_X = {mu_x:.0f}", font_size=28, color=BLUE_ACCENT),
            MathTex(rf"\mu_Y = {mu_y:.0f}", font_size=28, color="#77DD77"),
            MathTex(rf"a = {a}, \quad b = {b}", font_size=28, color=SOFT_WHITE),
        ).arrange(RIGHT, buff=1.0)
        params.next_to(formula, DOWN, buff=0.4)
        self.play(FadeIn(params), run_time=0.6)
        self.wait(0.3)

        # Two normal-ish curves side by side
        axes_x = Axes(
            x_range=[0, 10, 2], y_range=[0, 0.5, 0.1],
            x_length=3.5, y_length=1.8,
            axis_config={"include_ticks": True, "font_size": 18},
        ).move_to(LEFT * 3.2 + DOWN * 0.6)

        axes_y = Axes(
            x_range=[3, 13, 2], y_range=[0, 0.5, 0.1],
            x_length=3.5, y_length=1.8,
            axis_config={"include_ticks": True, "font_size": 18},
        ).move_to(RIGHT * 3.2 + DOWN * 0.6)

        def normal_curve(x, mu, sigma=1.2):
            return 0.4 * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

        curve_x = axes_x.plot(lambda x: normal_curve(x, mu_x), color=BLUE_ACCENT)
        curve_y = axes_y.plot(lambda x: normal_curve(x, mu_y), color="#77DD77")

        lbl_x = MathTex("X", font_size=26, color=BLUE_ACCENT).next_to(axes_x, UP, buff=0.1)
        lbl_y = MathTex("Y", font_size=26, color="#77DD77").next_to(axes_y, UP, buff=0.1)

        self.play(
            FadeIn(axes_x), Create(curve_x), FadeIn(lbl_x),
            FadeIn(axes_y), Create(curve_y), FadeIn(lbl_y),
            run_time=1.0,
        )

        # Mean lines on each
        mx_line = DashedLine(
            axes_x.c2p(mu_x, 0), axes_x.c2p(mu_x, 0.45),
            color=GOLD, dash_length=0.06,
        )
        my_line = DashedLine(
            axes_y.c2p(mu_y, 0), axes_y.c2p(mu_y, 0.45),
            color=GOLD, dash_length=0.06,
        )
        self.play(Create(mx_line), Create(my_line), run_time=0.6)
        self.wait(0.3)

        # Calculation
        mu_combo = a * mu_x + b * mu_y
        calc = MathTex(
            rf"\mu_{{aX+bY}} = {a}({mu_x:.0f}) + {b}({mu_y:.0f})",
            font_size=32, color=SOFT_WHITE,
        )
        calc.move_to(DOWN * 2.2)
        self.play(Write(calc), run_time=0.8)

        result = MathTex(
            rf"= {a * mu_x:.0f} + {b * mu_y:.0f} = {mu_combo:.0f}",
            font_size=36, color=GOLD,
        )
        result.next_to(calc, DOWN, buff=0.3)
        self.play(Write(result), run_time=0.8)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "Means always combine linearly, regardless of independence.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
