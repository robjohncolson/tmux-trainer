"""
diff-p-sd: SD of Difference in Proportions
sigma = sqrt(p1(1-p1)/n1 + p2(1-p2)/n2) — Two groups combining
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class DiffPSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("SD of Difference in Proportions", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # Two small normal curves side by side (groups)
        ax1 = Axes(
            x_range=[0.2, 0.7, 0.1], y_range=[0, 10, 5],
            x_length=3, y_length=2,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).shift(LEFT * 3.5 + UP * 0.6)

        ax2 = Axes(
            x_range=[0.4, 0.9, 0.1], y_range=[0, 10, 5],
            x_length=3, y_length=2,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).shift(RIGHT * 0.5 + UP * 0.6)

        p1, sd1 = 0.45, 0.06
        p2, sd2 = 0.65, 0.06

        def pdf1(x):
            return (1 / (sd1 * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - p1) / sd1) ** 2)

        def pdf2(x):
            return (1 / (sd2 * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - p2) / sd2) ** 2)

        curve1 = ax1.plot(pdf1, x_range=[0.25, 0.65], color=RED, stroke_width=3)
        area1 = ax1.get_area(curve1, x_range=[0.25, 0.65], color=RED, opacity=0.2)
        label1 = Text("Group 1", font_size=20, color=RED)
        label1.next_to(ax1, UP, buff=0.1)

        curve2 = ax2.plot(pdf2, x_range=[0.45, 0.85], color=GREEN, stroke_width=3)
        area2 = ax2.get_area(curve2, x_range=[0.45, 0.85], color=GREEN, opacity=0.2)
        label2 = Text("Group 2", font_size=20, color=GREEN)
        label2.next_to(ax2, UP, buff=0.1)

        self.play(
            Create(ax1), Create(curve1), FadeIn(area1), FadeIn(label1),
            Create(ax2), Create(curve2), FadeIn(area2), FadeIn(label2),
            run_time=1.5,
        )

        # Plus sign between variances
        plus_sign = MathTex("+", font_size=40, color=GOLD)
        plus_sign.move_to((ax1.get_right() + ax2.get_left()) / 2 + UP * 0.6)
        self.play(FadeIn(plus_sign), run_time=0.4)

        # Variance terms under each curve
        var1 = MathTex(r"\frac{p_1(1-p_1)}{n_1}", font_size=28, color=RED)
        var1.next_to(ax1, DOWN, buff=0.3)

        var2 = MathTex(r"\frac{p_2(1-p_2)}{n_2}", font_size=28, color=GREEN)
        var2.next_to(ax2, DOWN, buff=0.3)

        self.play(Write(var1), run_time=0.7)
        self.play(Write(var2), run_time=0.7)

        # Arrow indicating "variances add"
        add_text = Text("Variances add!", font_size=22, color=GOLD)
        add_text.move_to((var1.get_right() + var2.get_left()) / 2 + DOWN * 0.05)
        self.play(FadeIn(add_text), run_time=0.5)

        # Full formula
        formula = MathTex(
            r"\sigma_{\hat{p}_1 - \hat{p}_2}",
            r"=",
            r"\sqrt{\frac{p_1(1-p_1)}{n_1} + \frac{p_2(1-p_2)}{n_2}}",
            font_size=36, color=SOFT_WHITE,
        ).shift(DOWN * 2.0)

        formula[0].set_color(BLUE_ACCENT)
        formula[2][0:10].set_color(RED)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.12, corner_radius=0.1)

        self.play(Write(formula), run_time=1.5)
        self.play(Create(box), run_time=0.5)

        # Takeaway
        takeaway = Text(
            "Independent groups: add variances, then take the square root.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.3)

        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(2.0)
