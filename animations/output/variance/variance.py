"""
variance: Sample Variance s² = Σ(xi - x̄)² / (n-1)
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class VarianceScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("Sample Variance", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Data points on number line (0.8-3s) ---
        data = [2, 5, 7, 8, 13]
        xbar = sum(data) / len(data)  # 7.0

        nline = NumberLine(
            x_range=[0, 15, 1], length=10,
            include_numbers=True, font_size=18, color=GREY_B,
        ).shift(DOWN * 0.3)
        self.play(Create(nline), run_time=0.5)

        dots = VGroup(*[
            Dot(nline.n2p(v), radius=0.1, color=BLUE_ACCENT) for v in data
        ])
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.1), run_time=0.8)

        # Mean line
        mean_line = DashedLine(
            nline.n2p(xbar) + UP * 0.6, nline.n2p(xbar) + DOWN * 0.4,
            color=GOLD, stroke_width=2,
        )
        mean_label = MathTex(r"\bar{x}=7", font_size=24, color=GOLD)
        mean_label.next_to(mean_line, UP, buff=0.15)
        self.play(Create(mean_line), FadeIn(mean_label), run_time=0.5)
        self.wait(0.3)

        # --- Show deviations as arrows (3-6s) ---
        arrows = VGroup()
        dev_labels = VGroup()
        for i, v in enumerate(data):
            diff = v - xbar
            start_pt = nline.n2p(xbar) + UP * 0.05
            end_pt = nline.n2p(v) + UP * 0.05
            color = RED if diff < 0 else GREEN
            arrow = Arrow(start_pt, end_pt, color=color, buff=0, stroke_width=3, max_tip_length_to_length_ratio=0.15)
            label = MathTex(f"{diff:+.0f}", font_size=20, color=color)
            label.next_to(arrow, UP, buff=0.1)
            arrows.add(arrow)
            dev_labels.add(label)

        self.play(
            LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.12),
            LaggedStart(*[FadeIn(l) for l in dev_labels], lag_ratio=0.12),
            run_time=1.5,
        )
        self.wait(0.3)

        # --- Formula reveal (6-10s) ---
        formula = MathTex(
            r"s^2", r"=", r"\frac{\sum(x_i - \bar{x})^2}{n-1}",
            font_size=38,
        ).to_edge(DOWN, buff=1.0)
        formula[0].set_color(GOLD)
        formula[2].set_color(BLUE_ACCENT)
        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # --- Compute step (10-13s) ---
        sq_devs = [(v - xbar) ** 2 for v in data]
        numerator = sum(sq_devs)
        result = numerator / (len(data) - 1)

        computation = MathTex(
            r"= \frac{25+4+0+1+36}{4}",
            r"= \frac{66}{4}",
            r"= 16.5",
            font_size=30,
        ).next_to(formula, DOWN, buff=0.3)
        computation[0].set_color(SOFT_WHITE)
        computation[1].set_color(SOFT_WHITE)
        computation[2].set_color(GOLD)

        self.play(Write(computation[0]), run_time=0.6)
        self.play(Write(computation[1]), run_time=0.5)
        self.play(Write(computation[2]), run_time=0.5)
        self.wait(0.3)

        # --- SD connection flash (13-15s) ---
        sd_note = MathTex(
            r"s = \sqrt{16.5} \approx 4.06",
            font_size=28, color=GREEN,
        ).next_to(computation, DOWN, buff=0.3)
        self.play(FadeIn(sd_note, shift=UP * 0.2), run_time=0.6)
        self.wait(1.0)
