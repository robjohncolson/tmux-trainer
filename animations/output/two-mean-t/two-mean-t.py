"""Two-sample t statistic: t = (xbar1 - xbar2) / sqrt(s1^2/n1 + s2^2/n2)"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class TwoMeanTScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Two-Sample t Statistic", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Two sample means
        grp1 = VGroup(
            Text("Group 1", font_size=22, color=BLUE_ACCENT),
            MathTex(r"\bar{x}_1,\; s_1,\; n_1", font_size=28, color=BLUE_ACCENT),
        ).arrange(DOWN, buff=0.15).move_to(LEFT * 3.5 + UP * 1.5)

        grp2 = VGroup(
            Text("Group 2", font_size=22, color=RED),
            MathTex(r"\bar{x}_2,\; s_2,\; n_2", font_size=28, color=RED),
        ).arrange(DOWN, buff=0.15).move_to(RIGHT * 3.5 + UP * 1.5)

        self.play(FadeIn(grp1), FadeIn(grp2), run_time=0.8)

        # Numerator
        num_text = Text("Difference in means:", font_size=22, color=SOFT_WHITE)
        num_text.move_to(UP * 0.3)
        num = MathTex(r"\bar{x}_1 - \bar{x}_2", font_size=40, color=GOLD)
        num.next_to(num_text, DOWN, buff=0.2)
        self.play(FadeIn(num_text), Write(num), run_time=0.8)

        # Denominator
        den_text = Text("Divided by pooled SE:", font_size=22, color=SOFT_WHITE)
        den_text.next_to(num, DOWN, buff=0.4)
        den = MathTex(r"\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}", font_size=40, color=GOLD)
        den.next_to(den_text, DOWN, buff=0.2)
        self.play(FadeIn(den_text), Write(den), run_time=0.8)

        # Combine into full formula
        full = MathTex(
            r"t", r"=",
            r"\frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\dfrac{s_1^2}{n_1} + \dfrac{s_2^2}{n_2}}}",
            font_size=44,
        )
        full[0].set_color(GOLD)
        full.move_to(DOWN * 0.5)

        self.play(
            FadeOut(num_text), FadeOut(den_text),
            ReplacementTransform(num, full[2]),
            ReplacementTransform(den, full[2]),
            Write(full[0]), Write(full[1]),
            run_time=1.2,
        )

        box = SurroundingRectangle(full, color=GOLD, buff=0.2, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # t-distribution at bottom
        ax = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.42, 0.1],
            x_length=7,
            y_length=1.5,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).to_edge(DOWN, buff=0.8)

        from scipy.stats import t as t_dist
        t_curve = ax.plot(
            lambda x: t_dist.pdf(x, df=15),
            color=BLUE_ACCENT, x_range=[-3.8, 3.8],
        )
        t_val = -1.8
        t_marker = Dot(ax.c2p(t_val, 0), color=RED, radius=0.07)
        t_lbl = MathTex(r"t", font_size=22, color=RED).next_to(t_marker, DOWN, buff=0.1)

        self.play(Create(ax), Create(t_curve), FadeIn(t_marker), FadeIn(t_lbl), run_time=0.8)

        takeaway = Text(
            "Compares two independent group means in SE units.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
