"""Sampling Distribution Mean of b: mu_b = beta"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class SlopeMeanScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Sampling Dist Mean of b", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Scatter plot with true regression line
        ax = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 12, 2],
            x_length=5,
            y_length=3.5,
            axis_config={"color": GREY_B, "include_ticks": True, "font_size": 18},
            x_axis_config={"numbers_to_include": [2, 4, 6, 8]},
            y_axis_config={"numbers_to_include": [2, 4, 6, 8, 10]},
        ).shift(LEFT * 2.5 + DOWN * 0.3)

        ax_labels = ax.get_axis_labels(
            MathTex("x", font_size=24), MathTex("y", font_size=24)
        )
        self.play(Create(ax), FadeIn(ax_labels), run_time=0.6)

        # True line: y = 1 + 1.0x (beta = 1.0)
        true_line = ax.plot(lambda x: 1 + 1.0 * x, color=GOLD, x_range=[0.5, 9.5])
        true_lbl = MathTex(r"\beta = 1.0", font_size=24, color=GOLD)
        true_lbl.next_to(ax.c2p(8, 9.5), RIGHT, buff=0.1)
        self.play(Create(true_line), FadeIn(true_lbl), run_time=0.8)

        # Multiple sample regression lines (varying slopes around beta)
        np.random.seed(42)
        sample_slopes = [0.85, 1.12, 0.95, 1.08, 1.02, 0.91]
        sample_lines = VGroup()
        for slope in sample_slopes:
            line = ax.plot(
                lambda x, s=slope: 1 + s * x,
                color=BLUE_ACCENT, x_range=[0.5, 9.5],
                stroke_opacity=0.4, stroke_width=2,
            )
            sample_lines.add(line)

        self.play(
            *[Create(sl) for sl in sample_lines],
            run_time=1.2,
        )
        samp_lbl = Text("Sample slopes b", font_size=20, color=BLUE_ACCENT)
        samp_lbl.next_to(ax, DOWN, buff=0.3)
        self.play(FadeIn(samp_lbl), run_time=0.4)

        # Sampling distribution of b on the right
        ax2 = Axes(
            x_range=[0.5, 1.5, 0.1],
            y_range=[0, 5, 1],
            x_length=4,
            y_length=3.5,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(RIGHT * 3.5 + DOWN * 0.3)

        sd_b = 0.08
        sampling_curve = ax2.plot(
            lambda x: (1 / (sd_b * np.sqrt(2 * np.pi)))
            * np.exp(-(x - 1.0) ** 2 / (2 * sd_b**2)),
            color=GREEN, x_range=[0.6, 1.4],
        )
        center_line = DashedLine(
            ax2.c2p(1.0, 0), ax2.c2p(1.0, 4.5),
            color=GOLD, stroke_width=2,
        )
        beta_lbl = MathTex(r"\beta", font_size=28, color=GOLD)
        beta_lbl.next_to(ax2.c2p(1.0, 0), DOWN, buff=0.15)

        self.play(Create(ax2), Create(sampling_curve), run_time=0.8)
        self.play(Create(center_line), FadeIn(beta_lbl), run_time=0.6)

        dist_lbl = Text("Distribution of b", font_size=20, color=GREEN)
        dist_lbl.next_to(ax2, DOWN, buff=0.3)
        self.play(FadeIn(dist_lbl), run_time=0.4)

        # Formula
        formula = MathTex(r"\mu_b", r"=", r"\beta", font_size=48)
        formula[0].set_color(GREEN)
        formula[2].set_color(GOLD)
        formula.to_edge(DOWN, buff=0.8)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Write(formula), Create(box), run_time=1.0)

        takeaway = Text(
            "The true slope \u03b2 centers the sampling distribution of b.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
