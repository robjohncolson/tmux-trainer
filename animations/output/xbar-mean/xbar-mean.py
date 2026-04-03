"""Sampling Distribution Mean of x-bar: mu_xbar = mu"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class XbarMeanScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("Sampling Distribution Mean of x\u0304", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Population curve
        ax = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.5, 0.1],
            x_length=8,
            y_length=3,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(DOWN * 0.3)

        pop_curve = ax.plot(
            lambda x: (1 / np.sqrt(2 * np.pi)) * np.exp(-x**2 / 2),
            color=BLUE_ACCENT,
            x_range=[-3.5, 3.5],
        )
        pop_label = Text("Population", font_size=22, color=BLUE_ACCENT)
        pop_label.next_to(pop_curve, UP + RIGHT, buff=0.2)

        self.play(Create(ax), run_time=0.8)
        self.play(Create(pop_curve), FadeIn(pop_label), run_time=1.0)

        # Mu line
        mu_line = ax.get_vertical_line(ax.c2p(0, 0.4), color=GOLD, line_func=DashedLine)
        mu_label = MathTex(r"\mu", font_size=36, color=GOLD)
        mu_label.next_to(mu_line, DOWN, buff=0.15)
        self.play(Create(mu_line), Write(mu_label), run_time=0.8)

        # Sampling distribution overlay (narrower)
        samp_curve = ax.plot(
            lambda x: (1 / np.sqrt(2 * np.pi * 0.25)) * np.exp(-x**2 / (2 * 0.25)),
            color=GREEN,
            x_range=[-3, 3],
        )
        samp_label = Text("Sampling dist of x\u0304", font_size=22, color=GREEN)
        samp_label.next_to(samp_curve, UP + LEFT, buff=0.2)

        self.play(Create(samp_curve), FadeIn(samp_label), run_time=1.2)

        # Arrow showing both centered at mu
        arrow = Arrow(
            start=mu_label.get_bottom() + DOWN * 0.1,
            end=mu_label.get_bottom() + DOWN * 0.8,
            color=GOLD,
            buff=0.05,
        )
        center_text = Text("Same center!", font_size=22, color=GOLD)
        center_text.next_to(arrow, DOWN, buff=0.1)
        self.play(Create(arrow), FadeIn(center_text), run_time=0.8)

        # Formula
        formula = MathTex(r"\mu_{\bar{x}}", r"=", r"\mu", font_size=48)
        formula[0].set_color(GREEN)
        formula[2].set_color(BLUE_ACCENT)
        formula.to_edge(DOWN, buff=1.8).shift(RIGHT * 3)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Write(formula), run_time=1.2)
        self.play(Create(box), run_time=0.6)

        # Takeaway
        takeaway = Text(
            "The true mean \u03bc centers the sampling distribution of x\u0304.",
            font_size=22,
            color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
