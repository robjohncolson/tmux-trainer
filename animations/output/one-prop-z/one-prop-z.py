"""
one-prop-z: One-proportion z-test
z = (p-hat - p0) / sqrt(p0(1-p0)/n) — Uses p0 in denominator (null value)
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class OnePropZScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("One-Proportion z-Test", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # Build the z formula step by step
        z_label = MathTex(r"z", font_size=52, color=BLUE_ACCENT)
        equals = MathTex(r"=", font_size=52, color=SOFT_WHITE)
        numerator = MathTex(r"\hat{p} - p_0", font_size=44, color=SOFT_WHITE)
        frac_line = Line(LEFT * 1.8, RIGHT * 1.8, color=SOFT_WHITE, stroke_width=2)
        denominator = MathTex(
            r"\sqrt{\frac{p_0(1-p_0)}{n}}",
            font_size=40, color=SOFT_WHITE,
        )

        # Position the fraction
        frac_line.shift(RIGHT * 1.2)
        numerator.next_to(frac_line, UP, buff=0.15)
        denominator.next_to(frac_line, DOWN, buff=0.15)
        z_label.next_to(frac_line, LEFT, buff=0.6)
        equals.next_to(z_label, RIGHT, buff=0.25)

        formula_group = VGroup(z_label, equals, numerator, frac_line, denominator)
        formula_group.move_to(ORIGIN + UP * 0.5)

        # Step 1: z =
        self.play(Write(z_label), Write(equals), run_time=0.6)

        # Step 2: numerator (how far is p-hat from p0?)
        num_label = Text("How far is p\u0302 from p\u2080?", font_size=20, color=GOLD)
        num_label.next_to(numerator, RIGHT, buff=0.8)
        self.play(Write(numerator), FadeIn(num_label), run_time=1.0)

        # Step 3: fraction line
        self.play(Create(frac_line), run_time=0.4)

        # Step 4: denominator
        den_label = Text("Scaled by the SD under H\u2080", font_size=20, color=GOLD)
        den_label.next_to(denominator, RIGHT, buff=0.5)
        self.play(Write(denominator), FadeIn(den_label), run_time=1.0)

        # Highlight p0 usage
        p0_note = VGroup(
            Text("p\u2080 = null hypothesis value", font_size=20, color=RED),
            Text("(NOT p\u0302 from sample!)", font_size=18, color=RED),
        ).arrange(DOWN, buff=0.05, aligned_edge=LEFT)
        p0_note.next_to(formula_group, DOWN, buff=0.6)

        arrow = Arrow(
            p0_note.get_top(), denominator.get_bottom() + DOWN * 0.1,
            color=RED, stroke_width=2, buff=0.1,
        )

        self.play(FadeIn(p0_note), GrowArrow(arrow), run_time=0.8)

        # Box around formula
        box = SurroundingRectangle(formula_group, color=GOLD, buff=0.2, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # Fade annotations
        self.play(FadeOut(num_label), FadeOut(den_label), run_time=0.4)

        # Normal curve with z-score marked
        ax = Axes(
            x_range=[-3.5, 3.5, 1], y_range=[0, 0.45, 0.1],
            x_length=5, y_length=1.5,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).to_edge(DOWN, buff=0.8).shift(LEFT * 0.5)

        def std_normal(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x ** 2)

        curve = ax.plot(std_normal, x_range=[-3.5, 3.5], color=BLUE_ACCENT, stroke_width=2)
        z_val = 2.1
        z_line = DashedLine(
            ax.c2p(z_val, 0), ax.c2p(z_val, std_normal(z_val)),
            color=RED, stroke_width=2,
        )
        z_mark = MathTex("z = 2.1", font_size=20, color=RED)
        z_mark.next_to(ax.c2p(z_val, std_normal(z_val)), UR, buff=0.1)

        tail_area = ax.get_area(curve, x_range=[z_val, 3.5], color=RED, opacity=0.35)

        self.play(Create(ax), Create(curve), run_time=0.6)
        self.play(Create(z_line), FadeIn(z_mark), FadeIn(tail_area), run_time=0.8)

        # Takeaway
        takeaway = Text(
            "z measures how many SDs the sample p\u0302 is from the null p\u2080.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.2)

        self.play(FadeIn(takeaway), run_time=0.7)
        self.wait(2.0)
