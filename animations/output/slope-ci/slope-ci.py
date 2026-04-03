"""Confidence Interval for Slope: b +/- t* * SE_b"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class SlopeCiScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Confidence Interval for Slope", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Scatter plot with regression line and confidence band
        ax = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 12, 2],
            x_length=6,
            y_length=3.2,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(LEFT * 2 + DOWN * 0.2)

        np.random.seed(15)
        xs = np.random.uniform(1, 9, 18)
        ys = 1 + 0.9 * xs + np.random.normal(0, 1.0, 18)
        dots = VGroup(*[
            Dot(ax.c2p(x, y), color=BLUE_ACCENT, radius=0.05)
            for x, y in zip(xs, ys)
        ])

        self.play(Create(ax), FadeIn(dots), run_time=0.6)

        # Best fit line: b = 0.9
        reg_line = ax.plot(lambda x: 1 + 0.9 * x, color=GOLD, x_range=[0.5, 9.5])
        b_label = MathTex(r"b = 0.9", font_size=24, color=GOLD)
        b_label.next_to(ax.c2p(8.5, 8.8), RIGHT, buff=0.1)
        self.play(Create(reg_line), FadeIn(b_label), run_time=0.8)

        # Show confidence band (upper and lower slope lines)
        upper = ax.plot(lambda x: 1 + 1.15 * x, color=GREEN, x_range=[0.5, 9.5],
                        stroke_opacity=0.5, stroke_width=2)
        lower = ax.plot(lambda x: 1 + 0.65 * x, color=GREEN, x_range=[0.5, 9.5],
                        stroke_opacity=0.5, stroke_width=2)

        # Fill between for band effect
        band_pts = []
        for xv in np.linspace(0.5, 9.5, 40):
            band_pts.append(ax.c2p(xv, 1 + 1.15 * xv))
        for xv in np.linspace(9.5, 0.5, 40):
            band_pts.append(ax.c2p(xv, 1 + 0.65 * xv))
        band = Polygon(*band_pts, color=GREEN, fill_opacity=0.15, stroke_width=0)

        self.play(FadeIn(band), Create(upper), Create(lower), run_time=1.0)

        band_lbl = Text("95% CI for slope", font_size=20, color=GREEN)
        band_lbl.next_to(ax, DOWN, buff=0.2)
        self.play(FadeIn(band_lbl), run_time=0.4)

        # Formula on the right
        formula_parts = VGroup(
            MathTex(r"\text{CI for } \beta:", font_size=28, color=SOFT_WHITE),
            MathTex(r"b", r"\pm", r"t^*", r"\cdot", r"SE_b", font_size=44),
        ).arrange(DOWN, buff=0.3).shift(RIGHT * 3.5)

        formula_parts[1][0].set_color(GOLD)
        formula_parts[1][2].set_color(RED)
        formula_parts[1][4].set_color(GREEN)

        self.play(Write(formula_parts[0]), run_time=0.6)
        self.play(Write(formula_parts[1]), run_time=1.0)

        box = SurroundingRectangle(formula_parts[1], color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # Label what each piece is
        b_note = Text("b = point estimate", font_size=16, color=GOLD)
        b_note.next_to(formula_parts[1], DOWN, buff=0.4)
        t_note = Text("t* = critical value (df = n \u2212 2)", font_size=16, color=RED)
        t_note.next_to(b_note, DOWN, buff=0.15)
        se_note = Text("SE\u2086 = standard error of slope", font_size=16, color=GREEN)
        se_note.next_to(t_note, DOWN, buff=0.15)

        self.play(FadeIn(b_note), FadeIn(t_note), FadeIn(se_note), run_time=0.8)

        # Number line illustration
        num_line = NumberLine(
            x_range=[0.4, 1.4, 0.1],
            length=5,
            color=GREY_B,
            include_numbers=True,
            font_size=16,
        ).to_edge(DOWN, buff=0.7)

        b_dot = Dot(num_line.n2p(0.9), color=GOLD, radius=0.08)
        ci_left = num_line.n2p(0.65)
        ci_right = num_line.n2p(1.15)
        ci_bracket = BraceBetweenPoints(ci_left, ci_right, direction=DOWN, color=GREEN)
        ci_lbl = Text("[0.65, 1.15]", font_size=18, color=GREEN)
        ci_lbl.next_to(ci_bracket, DOWN, buff=0.1)

        self.play(Create(num_line), FadeIn(b_dot), run_time=0.5)
        self.play(Create(ci_bracket), FadeIn(ci_lbl), run_time=0.6)

        takeaway = Text(
            "The interval captures plausible true slopes around b.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.1)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
