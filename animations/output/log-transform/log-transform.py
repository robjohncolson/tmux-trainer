"""Log Transformation: log(yhat) = a + bx -> yhat = 10^(a+bx)"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class LogTransformScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Log Transformation", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Left: curved (original) data
        ax_left = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 120, 20],
            x_length=4.5,
            y_length=3.2,
            axis_config={"color": GREY_B, "include_ticks": True, "font_size": 14},
            x_axis_config={"numbers_to_include": [2, 4, 6, 8]},
            y_axis_config={"numbers_to_include": [20, 60, 100]},
        ).shift(LEFT * 3.5 + DOWN * 0.3)

        left_title = Text("Original (curved)", font_size=20, color=RED)
        left_title.next_to(ax_left, UP, buff=0.15)

        np.random.seed(33)
        xs = np.linspace(1, 9, 14)
        # Exponential-ish data: y = 2 * 10^(0.15x) + noise
        ys = 2 * 10 ** (0.15 * xs) + np.random.normal(0, 3, 14)
        ys = np.clip(ys, 1, 120)

        dots_left = VGroup(*[
            Dot(ax_left.c2p(x, y), color=BLUE_ACCENT, radius=0.05)
            for x, y in zip(xs, ys)
        ])

        # Bad linear fit on original
        bad_line = ax_left.plot(
            lambda x: -20 + 12 * x,
            color=RED, x_range=[0.5, 9.5],
            stroke_opacity=0.6,
        )

        self.play(Create(ax_left), FadeIn(left_title), FadeIn(dots_left), run_time=0.8)
        self.play(Create(bad_line), run_time=0.6)

        bad_lbl = Text("Poor fit!", font_size=18, color=RED)
        bad_lbl.next_to(ax_left, DOWN, buff=0.15)
        self.play(FadeIn(bad_lbl), run_time=0.4)

        # Right: log-transformed data (linearized)
        ax_right = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 2.5, 0.5],
            x_length=4.5,
            y_length=3.2,
            axis_config={"color": GREY_B, "include_ticks": True, "font_size": 14},
            x_axis_config={"numbers_to_include": [2, 4, 6, 8]},
            y_axis_config={"numbers_to_include": [0.5, 1.0, 1.5, 2.0]},
        ).shift(RIGHT * 3.5 + DOWN * 0.3)

        right_title = Text("Log-transformed (linear)", font_size=20, color=GREEN)
        right_title.next_to(ax_right, UP, buff=0.15)

        log_ys = np.log10(np.clip(ys, 0.1, None))
        dots_right = VGroup(*[
            Dot(ax_right.c2p(x, ly), color=BLUE_ACCENT, radius=0.05)
            for x, ly in zip(xs, log_ys)
        ])

        # Good linear fit on log data
        good_line = ax_right.plot(
            lambda x: 0.3 + 0.15 * x,
            color=GREEN, x_range=[0.5, 9.5],
        )

        self.play(Create(ax_right), FadeIn(right_title), run_time=0.6)

        # Animate transformation: dots move from curved to linear
        self.play(FadeIn(dots_right), run_time=0.8)
        self.play(Create(good_line), run_time=0.6)

        good_lbl = Text("Great fit!", font_size=18, color=GREEN)
        good_lbl.next_to(ax_right, DOWN, buff=0.15)
        self.play(FadeIn(good_lbl), run_time=0.4)

        # y-axis labels
        y_lbl_left = MathTex(r"y", font_size=22, color=SOFT_WHITE)
        y_lbl_left.next_to(ax_left, LEFT, buff=0.1).shift(UP * 1.2)
        y_lbl_right = MathTex(r"\log(y)", font_size=22, color=SOFT_WHITE)
        y_lbl_right.next_to(ax_right, LEFT, buff=0.1).shift(UP * 1.2)
        self.play(FadeIn(y_lbl_left), FadeIn(y_lbl_right), run_time=0.4)

        # Arrow between plots
        transform_arrow = Arrow(
            ax_left.get_right() + RIGHT * 0.1,
            ax_right.get_left() + LEFT * 0.1,
            color=GOLD, buff=0.05,
        )
        arrow_lbl = MathTex(r"\log", font_size=24, color=GOLD)
        arrow_lbl.next_to(transform_arrow, UP, buff=0.05)
        self.play(Create(transform_arrow), FadeIn(arrow_lbl), run_time=0.6)

        # Formulas at bottom
        log_form = MathTex(
            r"\log(\hat{y})", r"=", r"a + bx",
            font_size=36,
        )
        log_form[0].set_color(GREEN)
        log_form[2].set_color(SOFT_WHITE)
        log_form.to_edge(DOWN, buff=1.6)

        back_form = MathTex(
            r"\hat{y}", r"=", r"10^{a + bx}",
            font_size=36,
        )
        back_form[0].set_color(GOLD)
        back_form[2].set_color(SOFT_WHITE)
        back_form.next_to(log_form, DOWN, buff=0.25)

        self.play(Write(log_form), run_time=0.8)

        back_arrow = MathTex(r"\Rightarrow", font_size=36, color=GOLD)
        back_arrow.move_to((log_form.get_center() + back_form.get_center()) / 2 + LEFT * 2.5)

        self.play(Write(back_form), FadeIn(back_arrow), run_time=0.8)

        box = SurroundingRectangle(
            VGroup(log_form, back_form), color=GOLD, buff=0.15, corner_radius=0.1,
        )
        self.play(Create(box), run_time=0.5)

        takeaway = Text(
            "Log transform linearizes exponential data for regression.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
