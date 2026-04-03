"""One-sample t statistic: t = (xbar - mu0) / (s / sqrt(n))"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class OneMeanTScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("One-Sample t Statistic", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Build formula step by step
        step1 = Text("How far is x\u0304 from \u03bc\u2080?", font_size=24, color=SOFT_WHITE)
        step1.move_to(UP * 2)
        self.play(FadeIn(step1), run_time=0.6)

        numerator = MathTex(r"\bar{x} - \mu_0", font_size=44, color=BLUE_ACCENT)
        numerator.next_to(step1, DOWN, buff=0.4)
        self.play(Write(numerator), run_time=0.8)

        step2 = Text("Scale by standard error:", font_size=24, color=SOFT_WHITE)
        step2.next_to(numerator, DOWN, buff=0.4)
        self.play(FadeIn(step2), run_time=0.6)

        full_formula = MathTex(
            r"t", r"=", r"\frac{\bar{x} - \mu_0}{s / \sqrt{n}}",
            font_size=48,
        )
        full_formula[0].set_color(GOLD)
        full_formula[2].set_color(SOFT_WHITE)
        full_formula.move_to(ORIGIN)

        self.play(
            FadeOut(step1), FadeOut(step2),
            ReplacementTransform(numerator, full_formula[2]),
            Write(full_formula[0]), Write(full_formula[1]),
            run_time=1.2,
        )

        box = SurroundingRectangle(full_formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # t-distribution with test stat
        ax = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.42, 0.1],
            x_length=8,
            y_length=2.2,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).to_edge(DOWN, buff=1.2)

        # t-distribution (df=10 approximation)
        from scipy.stats import t as t_dist
        t_curve = ax.plot(
            lambda x: t_dist.pdf(x, df=10),
            color=BLUE_ACCENT, x_range=[-3.8, 3.8],
        )
        self.play(Create(ax), Create(t_curve), run_time=0.8)

        # Test statistic marker
        t_val = 2.1
        t_line = ax.get_vertical_line(ax.c2p(t_val, t_dist.pdf(t_val, df=10)), color=RED)
        t_dot = Dot(ax.c2p(t_val, 0), color=RED, radius=0.08)
        t_label = MathTex(r"t = 2.1", font_size=22, color=RED)
        t_label.next_to(t_dot, DOWN, buff=0.15)

        self.play(Create(t_line), FadeIn(t_dot), FadeIn(t_label), run_time=0.8)

        # Shade tail
        tail_area = ax.get_area(
            t_curve, x_range=[t_val, 3.8], color=RED, opacity=0.3,
        )
        p_label = Text("p-value", font_size=18, color=RED)
        p_label.next_to(ax.c2p(3, 0.05), UP, buff=0.05)
        self.play(FadeIn(tail_area), FadeIn(p_label), run_time=0.8)

        takeaway = Text(
            "t measures how many SEs x\u0304 is from \u03bc\u2080.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
