"""SD of Difference in Means: sigma = sqrt(sigma1^2/n1 + sigma2^2/n2)"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class DiffXSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("SD of Difference in Means", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Two group curves
        ax = Axes(
            x_range=[-6, 10, 2],
            y_range=[0, 0.45, 0.1],
            x_length=9,
            y_length=2.8,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(DOWN * 0.1)
        self.play(Create(ax), run_time=0.6)

        # Group 1 centered at 0
        g1 = ax.plot(
            lambda x: (1 / np.sqrt(2 * np.pi)) * np.exp(-x**2 / 2),
            color=BLUE_ACCENT, x_range=[-4, 4],
        )
        g1_lbl = MathTex(r"\bar{x}_1", font_size=28, color=BLUE_ACCENT)
        g1_lbl.next_to(ax.c2p(0, 0.42), UP, buff=0.1)

        # Group 2 centered at 4
        g2 = ax.plot(
            lambda x: (1 / (1.3 * np.sqrt(2 * np.pi)))
            * np.exp(-(x - 4) ** 2 / (2 * 1.3**2)),
            color=RED, x_range=[-1, 9],
        )
        g2_lbl = MathTex(r"\bar{x}_2", font_size=28, color=RED)
        g2_lbl.next_to(ax.c2p(4, 0.32), UP, buff=0.1)

        self.play(Create(g1), FadeIn(g1_lbl), run_time=0.8)
        self.play(Create(g2), FadeIn(g2_lbl), run_time=0.8)

        # Difference arrow
        diff_arrow = DoubleArrow(
            ax.c2p(0, -0.06), ax.c2p(4, -0.06),
            color=GOLD, buff=0,
        )
        diff_lbl = MathTex(r"\bar{x}_1 - \bar{x}_2", font_size=24, color=GOLD)
        diff_lbl.next_to(diff_arrow, DOWN, buff=0.1)
        self.play(Create(diff_arrow), FadeIn(diff_lbl), run_time=0.8)

        # Variance addition principle
        step1 = MathTex(
            r"\text{Var}(\bar{x}_1 - \bar{x}_2)",
            r"=",
            r"\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}",
            font_size=34,
        )
        step1[0].set_color(GOLD)
        step1[2].set_color(SOFT_WHITE)
        step1.to_edge(DOWN, buff=2.2)

        self.play(Write(step1), run_time=1.2)

        # Final SD formula
        formula = MathTex(
            r"\sigma_{\bar{x}_1 - \bar{x}_2}",
            r"=",
            r"\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}",
            font_size=42,
        )
        formula[0].set_color(GOLD)
        formula[2].set_color(SOFT_WHITE)
        formula.to_edge(DOWN, buff=1.0)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(
            ReplacementTransform(step1, formula),
            run_time=1.0,
        )
        self.play(Create(box), run_time=0.5)

        takeaway = Text(
            "Variances add when combining two independent groups.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
