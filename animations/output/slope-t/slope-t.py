"""Regression slope t stat: t = (b - beta0) / SE_b"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class SlopeTScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Regression Slope t Statistic", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Setup: hypothesis test on slope
        h0 = MathTex(r"H_0: \beta = \beta_0", font_size=32, color=SOFT_WHITE)
        ha = MathTex(r"H_a: \beta \neq \beta_0", font_size=32, color=SOFT_WHITE)
        hyp = VGroup(h0, ha).arrange(RIGHT, buff=1.5).move_to(UP * 2)
        self.play(FadeIn(hyp), run_time=0.8)

        # Usually beta0 = 0
        note = Text("(Usually \u03b2\u2080 = 0: testing if slope exists)", font_size=20, color=GOLD)
        note.next_to(hyp, DOWN, buff=0.2)
        self.play(FadeIn(note), run_time=0.5)

        # Build formula
        numer = MathTex(r"b - \beta_0", font_size=40, color=BLUE_ACCENT)
        numer.move_to(UP * 0.5)
        numer_lbl = Text("observed \u2212 hypothesized", font_size=18, color=BLUE_ACCENT)
        numer_lbl.next_to(numer, RIGHT, buff=0.3)
        self.play(Write(numer), FadeIn(numer_lbl), run_time=0.8)

        denom = MathTex(r"SE_b", font_size=40, color=GREEN)
        denom.next_to(numer, DOWN, buff=0.5)
        denom_lbl = Text("standard error of slope", font_size=18, color=GREEN)
        denom_lbl.next_to(denom, RIGHT, buff=0.3)
        self.play(Write(denom), FadeIn(denom_lbl), run_time=0.8)

        # Full formula
        formula = MathTex(
            r"t", r"=", r"\frac{b - \beta_0}{SE_b}",
            font_size=48,
        )
        formula[0].set_color(GOLD)
        formula.move_to(DOWN * 0.5)

        self.play(
            FadeOut(numer), FadeOut(denom),
            FadeOut(numer_lbl), FadeOut(denom_lbl),
            Write(formula),
            run_time=1.0,
        )

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # t-distribution with test statistic
        ax = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.42, 0.1],
            x_length=7,
            y_length=1.6,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).to_edge(DOWN, buff=0.9)

        from scipy.stats import t as t_dist
        curve = ax.plot(
            lambda x: t_dist.pdf(x, df=12),
            color=BLUE_ACCENT, x_range=[-3.8, 3.8],
        )
        self.play(Create(ax), Create(curve), run_time=0.6)

        # Two-tailed rejection
        t_val = 2.5
        left_area = ax.get_area(curve, x_range=[-3.8, -t_val], color=RED, opacity=0.3)
        right_area = ax.get_area(curve, x_range=[t_val, 3.8], color=RED, opacity=0.3)
        t_dot = Dot(ax.c2p(t_val, 0), color=RED, radius=0.07)
        t_lbl = MathTex(r"t = 2.5", font_size=20, color=RED).next_to(t_dot, UP + RIGHT, buff=0.1)

        self.play(
            FadeIn(left_area), FadeIn(right_area),
            FadeIn(t_dot), FadeIn(t_lbl),
            run_time=0.8,
        )

        takeaway = Text(
            "Tests whether the slope differs from \u03b2\u2080 (often 0).",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
