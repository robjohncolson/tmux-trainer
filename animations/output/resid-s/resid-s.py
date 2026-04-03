"""Residual Standard Deviation: s = sqrt(sum(yi - yhat_i)^2 / (n-2))"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class ResidSScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Residual Standard Deviation", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Scatter with regression line
        ax = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 12, 2],
            x_length=7,
            y_length=3.5,
            axis_config={"color": GREY_B, "include_ticks": True, "font_size": 16},
            x_axis_config={"numbers_to_include": [2, 4, 6, 8]},
            y_axis_config={"numbers_to_include": [2, 4, 6, 8, 10]},
        ).shift(DOWN * 0.3)

        self.play(Create(ax), run_time=0.6)

        # Data points
        np.random.seed(21)
        xs = np.array([1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5])
        slope, intercept = 1.0, 1.0
        ys_true = intercept + slope * xs
        noise = np.array([0.8, -1.2, 0.5, 1.5, -0.8, -0.3, 1.0, -0.6])
        ys = ys_true + noise

        dots = VGroup(*[
            Dot(ax.c2p(x, y), color=BLUE_ACCENT, radius=0.07)
            for x, y in zip(xs, ys)
        ])
        self.play(FadeIn(dots), run_time=0.6)

        # Regression line
        reg_line = ax.plot(
            lambda x: intercept + slope * x,
            color=GOLD, x_range=[0.5, 9.5],
        )
        reg_lbl = MathTex(r"\hat{y} = a + bx", font_size=24, color=GOLD)
        reg_lbl.next_to(ax.c2p(9, 10), RIGHT, buff=0.1)
        self.play(Create(reg_line), FadeIn(reg_lbl), run_time=0.8)

        # Show residuals as vertical lines
        resid_lines = VGroup()
        for x, y in zip(xs, ys):
            y_hat = intercept + slope * x
            line = Line(
                ax.c2p(x, y), ax.c2p(x, y_hat),
                color=RED, stroke_width=2.5,
            )
            resid_lines.add(line)

        resid_label = Text("Residuals: y\u1d62 \u2212 \u0177\u1d62", font_size=22, color=RED)
        resid_label.next_to(ax, RIGHT, buff=0.3).shift(UP * 0.5)

        self.play(
            *[Create(rl) for rl in resid_lines],
            FadeIn(resid_label),
            run_time=1.0,
        )

        # Formula step by step
        step1 = MathTex(
            r"\text{Residual} = y_i - \hat{y}_i",
            font_size=30, color=SOFT_WHITE,
        )
        step1.to_edge(DOWN, buff=2.5)
        self.play(Write(step1), run_time=0.8)

        step2 = MathTex(
            r"\text{Sum of squares} = \sum (y_i - \hat{y}_i)^2",
            font_size=30, color=SOFT_WHITE,
        )
        step2.to_edge(DOWN, buff=2.5)
        self.play(ReplacementTransform(step1, step2), run_time=0.8)

        # Final formula
        formula = MathTex(
            r"s", r"=",
            r"\sqrt{\frac{\sum (y_i - \hat{y}_i)^2}{n - 2}}",
            font_size=44,
        )
        formula[0].set_color(GOLD)
        formula[2].set_color(SOFT_WHITE)
        formula.to_edge(DOWN, buff=1.2)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(ReplacementTransform(step2, formula), run_time=1.0)
        self.play(Create(box), run_time=0.5)

        # n-2 note
        note = Text("n \u2212 2 because we estimated a and b", font_size=20, color=GOLD)
        note.next_to(formula, DOWN, buff=0.2)
        self.play(FadeIn(note), run_time=0.5)

        takeaway = Text(
            "s measures typical residual size (n\u22122 df for slope + intercept).",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
