"""
phat-sd: Sampling Distribution SD of p-hat
sigma_{p-hat} = sqrt(p(1-p)/n) — Spread of sampling distribution
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class PhatSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("Standard Deviation of the Sampling Distribution of p\u0302", font_size=34, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=1.0)

        # Axes
        ax = Axes(
            x_range=[0.2, 0.8, 0.1],
            y_range=[0, 12, 3],
            x_length=8,
            y_length=3.2,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).shift(DOWN * 0.5 + LEFT * 0.5)

        x_labels = VGroup()
        for val in np.arange(0.2, 0.85, 0.1):
            label = MathTex(f"{val:.1f}", font_size=18, color=SOFT_WHITE)
            label.next_to(ax.c2p(val, 0), DOWN, buff=0.12)
            x_labels.add(label)

        self.play(Create(ax), FadeIn(x_labels), run_time=0.8)

        p = 0.5

        # Wide curve (small n)
        sd_small = 0.10
        def pdf_small(x):
            return (1 / (sd_small * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - p) / sd_small) ** 2)

        curve_small = ax.plot(pdf_small, x_range=[0.2, 0.8], color=RED, stroke_width=3)
        label_small = Text("n = 25", font_size=20, color=RED)
        label_small.next_to(ax.c2p(0.7, pdf_small(0.7)), UR, buff=0.1)

        self.play(Create(curve_small), FadeIn(label_small), run_time=1.0)

        # Narrow curve (large n)
        sd_large = 0.05
        def pdf_large(x):
            return (1 / (sd_large * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - p) / sd_large) ** 2)

        curve_large = ax.plot(pdf_large, x_range=[0.3, 0.7], color=GREEN, stroke_width=3)
        label_large = Text("n = 100", font_size=20, color=GREEN)
        label_large.next_to(ax.c2p(0.62, pdf_large(0.62)), UR, buff=0.1)

        self.play(Create(curve_large), FadeIn(label_large), run_time=1.0)

        # SD arrows on wide curve
        sd_arrow_l = DoubleArrow(
            ax.c2p(p - sd_small, pdf_small(p) * 0.5),
            ax.c2p(p + sd_small, pdf_small(p) * 0.5),
            color=RED, stroke_width=2, buff=0,
            max_tip_length_to_length_ratio=0.08,
        )
        sd_text = MathTex(r"\sigma_{\hat{p}}", font_size=24, color=RED)
        sd_text.next_to(sd_arrow_l, UP, buff=0.08)

        self.play(GrowArrow(sd_arrow_l), FadeIn(sd_text), run_time=0.8)

        # Formula step-by-step
        formula_parts = VGroup(
            MathTex(r"\sigma_{\hat{p}}", font_size=44, color=SOFT_WHITE),
            MathTex(r"=", font_size=44, color=SOFT_WHITE),
            MathTex(r"\sqrt{\frac{p(1-p)}{n}}", font_size=44, color=BLUE_ACCENT),
        ).arrange(RIGHT, buff=0.15).to_edge(RIGHT, buff=0.5).shift(UP * 0.3)

        box = SurroundingRectangle(formula_parts, color=GOLD, buff=0.15, corner_radius=0.1)

        self.play(Write(formula_parts[0]), run_time=0.6)
        self.play(Write(formula_parts[1]), run_time=0.3)
        self.play(Write(formula_parts[2]), run_time=1.0)
        self.play(Create(box), run_time=0.5)

        # Annotation: p is known
        note = Text("p = true population proportion (known)", font_size=18, color=GOLD)
        note.next_to(formula_parts, DOWN, buff=0.35)
        self.play(FadeIn(note), run_time=0.6)

        # Takeaway
        takeaway = Text(
            "Larger n \u2192 smaller spread. The SD shrinks as sample size grows.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.35)

        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(2.0)
