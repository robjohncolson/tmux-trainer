"""Sampling Distribution SD of x-bar: sigma_xbar = sigma / sqrt(n)"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class XbarSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Sampling Dist SD of x\u0304", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        ax = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 1.0, 0.2],
            x_length=8,
            y_length=3.5,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(DOWN * 0.2)
        self.play(Create(ax), run_time=0.6)

        # Population curve (wide)
        pop = ax.plot(
            lambda x: (1 / np.sqrt(2 * np.pi)) * np.exp(-x**2 / 2),
            color=BLUE_ACCENT, x_range=[-3.5, 3.5],
        )
        pop_lbl = Text("\u03c3 (population)", font_size=20, color=BLUE_ACCENT)
        pop_lbl.next_to(ax.c2p(2.5, 0.15), RIGHT, buff=0.1)
        self.play(Create(pop), FadeIn(pop_lbl), run_time=1.0)

        # n=4 curve
        sd4 = 1 / np.sqrt(4)
        curve_n4 = ax.plot(
            lambda x: (1 / (sd4 * np.sqrt(2 * np.pi))) * np.exp(-x**2 / (2 * sd4**2)),
            color=RED, x_range=[-3, 3],
        )
        lbl_n4 = Text("n = 4", font_size=20, color=RED)
        lbl_n4.next_to(ax.c2p(1.5, 0.55), RIGHT, buff=0.1)
        self.play(Create(curve_n4), FadeIn(lbl_n4), run_time=1.0)

        # n=25 curve
        sd25 = 1 / np.sqrt(25)
        curve_n25 = ax.plot(
            lambda x: (1 / (sd25 * np.sqrt(2 * np.pi))) * np.exp(-x**2 / (2 * sd25**2)),
            color=GREEN, x_range=[-2, 2],
        )
        lbl_n25 = Text("n = 25", font_size=20, color=GREEN)
        lbl_n25.next_to(ax.c2p(0.8, 0.85), RIGHT, buff=0.1)
        self.play(Create(curve_n25), FadeIn(lbl_n25), run_time=1.0)

        # Formula build
        formula = MathTex(
            r"\sigma_{\bar{x}}", r"=", r"\frac{\sigma}{\sqrt{n}}",
            font_size=48,
        )
        formula[0].set_color(GOLD)
        formula[2].set_color(SOFT_WHITE)
        formula.to_edge(DOWN, buff=1.5).shift(RIGHT * 3)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Write(formula), run_time=1.2)
        self.play(Create(box), run_time=0.5)

        # Shrink arrow
        arrow_text = Text("Larger n \u2192 narrower spread", font_size=22, color=GOLD)
        arrow_text.next_to(formula, LEFT, buff=0.5)
        self.play(FadeIn(arrow_text), run_time=0.8)

        takeaway = Text(
            "Standard deviation shrinks with larger n.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
