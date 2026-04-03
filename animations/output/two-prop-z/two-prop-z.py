"""
two-prop-z: Two-proportion z-test
z = (p-hat1 - p-hat2) / sqrt(p-hat_c(1-p-hat_c)(1/n1 + 1/n2)) — Pooled for test
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class TwoPropZScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("Two-Proportion z-Test", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # Hypothesis
        hyp = MathTex(
            r"H_0: p_1 = p_2", font_size=28, color=GREY_B,
        ).next_to(title, DOWN, buff=0.25)
        self.play(FadeIn(hyp), run_time=0.5)

        # Build z formula step by step
        z_label = MathTex(r"z", font_size=48, color=BLUE_ACCENT)
        equals = MathTex(r"=", font_size=48, color=SOFT_WHITE)

        numerator = MathTex(
            r"\hat{p}_1 - \hat{p}_2",
            font_size=38, color=SOFT_WHITE,
        )

        frac_line = Line(LEFT * 2.5, RIGHT * 2.5, color=SOFT_WHITE, stroke_width=2)

        denominator = MathTex(
            r"\sqrt{\hat{p}_c(1-\hat{p}_c)\left(\frac{1}{n_1}+\frac{1}{n_2}\right)}",
            font_size=32, color=SOFT_WHITE,
        )

        # Position
        frac_line.shift(RIGHT * 1.0 + UP * 0.3)
        numerator.next_to(frac_line, UP, buff=0.15)
        denominator.next_to(frac_line, DOWN, buff=0.15)
        z_label.next_to(frac_line, LEFT, buff=0.7)
        equals.move_to((z_label.get_right() + frac_line.get_left()) / 2)

        formula_group = VGroup(z_label, equals, numerator, frac_line, denominator)
        formula_group.move_to(ORIGIN + UP * 0.2)

        # Step 1: z =
        self.play(Write(z_label), Write(equals), run_time=0.5)

        # Step 2: numerator — difference in sample proportions
        num_note = Text("Observed difference", font_size=18, color=GOLD)
        num_note.next_to(numerator, RIGHT, buff=0.6)
        num_arrow = Arrow(num_note.get_left(), numerator.get_right(), color=GOLD, stroke_width=1.5, buff=0.1)
        self.play(Write(numerator), FadeIn(num_note), GrowArrow(num_arrow), run_time=0.8)

        # Step 3: fraction line
        self.play(Create(frac_line), run_time=0.3)

        # Step 4: denominator — pooled SE
        den_note = Text("Pooled SE (uses p\u0302_c)", font_size=18, color=GOLD)
        den_note.next_to(denominator, RIGHT, buff=0.4)
        den_arrow = Arrow(den_note.get_left(), denominator.get_right(), color=GOLD, stroke_width=1.5, buff=0.1)
        self.play(Write(denominator), FadeIn(den_note), GrowArrow(den_arrow), run_time=1.0)

        # Box
        box = SurroundingRectangle(formula_group, color=GOLD, buff=0.2, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # Clean up annotations
        self.play(
            FadeOut(num_note), FadeOut(num_arrow),
            FadeOut(den_note), FadeOut(den_arrow),
            run_time=0.4,
        )

        # Pooled proportion reminder
        pc_reminder = MathTex(
            r"\hat{p}_c = \frac{x_1 + x_2}{n_1 + n_2}",
            font_size=26, color=BLUE_ACCENT,
        ).next_to(box, DOWN, buff=0.3)
        self.play(FadeIn(pc_reminder), run_time=0.6)

        # Standard normal curve at bottom
        ax = Axes(
            x_range=[-3.5, 3.5, 1], y_range=[0, 0.45, 0.1],
            x_length=5, y_length=1.2,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).to_edge(DOWN, buff=0.5)

        def std_normal(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x ** 2)

        curve = ax.plot(std_normal, x_range=[-3.5, 3.5], color=BLUE_ACCENT, stroke_width=2)

        # Shade both tails
        left_tail = ax.get_area(curve, x_range=[-3.5, -1.96], color=RED, opacity=0.35)
        right_tail = ax.get_area(curve, x_range=[1.96, 3.5], color=RED, opacity=0.35)

        self.play(Create(ax), Create(curve), FadeIn(left_tail), FadeIn(right_tail), run_time=0.8)

        # Takeaway
        takeaway = Text(
            "Compare two groups: pool under H\u2080, then compute z with the combined p\u0302_c.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.15)

        self.play(FadeIn(takeaway), run_time=0.7)
        self.wait(2.0)
