"""
z-test-stat: Standardized Test Statistic z = (statistic - parameter) / SE
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class ZTestStatScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Standardized Test Statistic", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Build formula step by step (0.8-4s) ---
        formula = MathTex(
            "z", "=",
            r"\frac{ \mathrm{statistic} - \mathrm{parameter} }{ \mathrm{SE} }",
            font_size=42,
        )
        formula[0].set_color(GOLD)
        formula[2].set_color(BLUE_ACCENT)
        formula.move_to(UP * 1.5)

        self.play(Write(formula[:2]), run_time=0.6)
        self.play(Write(formula[2:]), run_time=1.0)
        self.wait(0.3)

        # --- Numeric example (4-7s) ---
        example_label = Text(
            "Example: sample mean = 52, null = 50, SE = 1.5",
            font_size=22, color=GREY_B,
        )
        example_label.next_to(formula, DOWN, buff=0.5)
        self.play(FadeIn(example_label, shift=UP * 0.1), run_time=0.6)

        calc = MathTex(
            "z", "=", r"\frac{52 - 50}{1.5}", "=",
            r"\frac{2}{1.5}", r"\approx 1.33",
            font_size=36, color=SOFT_WHITE,
        )
        calc[0].set_color(GOLD)
        calc[-1].set_color(GOLD)
        calc.next_to(example_label, DOWN, buff=0.4)

        self.play(Write(calc[:3]), run_time=0.6)
        self.play(Write(calc[3:]), run_time=0.6)
        self.wait(0.3)

        # --- Normal curve with test stat marked (7-13s) ---
        axes = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[0, 0.45, 0.1],
            x_length=8,
            y_length=2.5,
            tips=False,
            axis_config={"color": GREY_B, "stroke_width": 1.5},
        ).to_edge(DOWN, buff=0.6)

        def normal_pdf(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x ** 2)

        curve = axes.plot(normal_pdf, x_range=[-3.5, 3.5], color=BLUE_ACCENT)

        self.play(
            FadeOut(example_label), FadeOut(calc),
            run_time=0.4,
        )
        self.play(Create(axes), run_time=0.6)
        self.play(Create(curve), run_time=0.8)

        # Mark H0 center
        h0_dot = Dot(axes.c2p(0, 0), radius=0.06, color=SOFT_WHITE)
        h0_label = MathTex(r"H_0", font_size=24, color=SOFT_WHITE)
        h0_label.next_to(h0_dot, DOWN, buff=0.15)
        self.play(FadeIn(h0_dot), FadeIn(h0_label), run_time=0.4)

        # Mark test statistic
        z_val = 1.33
        z_line = DashedLine(
            axes.c2p(z_val, 0),
            axes.c2p(z_val, normal_pdf(z_val)),
            color=GOLD, stroke_width=2.5, dash_length=0.08,
        )
        z_dot = Dot(axes.c2p(z_val, normal_pdf(z_val)), radius=0.08, color=GOLD)
        z_label = MathTex(r"z = 1.33", font_size=24, color=GOLD)
        z_label.next_to(z_dot, UR, buff=0.15)

        self.play(Create(z_line), FadeIn(z_dot, scale=0.5), run_time=0.6)
        self.play(FadeIn(z_label, shift=DOWN * 0.1), run_time=0.4)

        # Shade right tail (rejection region)
        right_tail = axes.get_area(
            curve, x_range=[z_val, 3.5],
            color=RED, opacity=0.35,
        )
        p_label = Text("p-value", font_size=18, color=RED)
        p_label.next_to(right_tail, RIGHT, buff=0.15).shift(UP * 0.3)

        self.play(FadeIn(right_tail), FadeIn(p_label), run_time=0.8)
        self.wait(0.4)

        # --- Takeaway (13-15s) ---
        self.play(
            Indicate(formula[0], color=GOLD, scale_factor=1.3),
            run_time=0.5,
        )
        takeaway = Text(
            "How many SEs the statistic falls from the null parameter",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
