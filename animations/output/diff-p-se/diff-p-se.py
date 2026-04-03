"""
diff-p-se: SE of Difference in Proportions
s = sqrt(p-hat1(1-p-hat1)/n1 + p-hat2(1-p-hat2)/n2) — Sample version
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class DiffPSeScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("SE of Difference in Proportions", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # Context: confidence intervals
        context = Text(
            "For confidence intervals (population proportions unknown)",
            font_size=22, color=BLUE_ACCENT,
        ).next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(context), run_time=0.7)

        # Two sample proportion bars
        bar_width = 2.5
        bar_height = 0.6

        # Group 1 bar
        bar1_bg = Rectangle(width=bar_width, height=bar_height, color=GREY_B, fill_opacity=0.2)
        bar1_fill = Rectangle(width=bar_width * 0.42, height=bar_height, color=RED, fill_opacity=0.6)
        bar1_fill.align_to(bar1_bg, LEFT)
        bar1_group = VGroup(bar1_bg, bar1_fill).shift(LEFT * 3 + UP * 0.5)
        bar1_label = MathTex(r"\hat{p}_1 = 0.42", font_size=24, color=RED)
        bar1_label.next_to(bar1_group, DOWN, buff=0.15)
        n1_label = Text("n\u2081 = 150", font_size=18, color=GREY_B)
        n1_label.next_to(bar1_label, DOWN, buff=0.1)

        # Group 2 bar
        bar2_bg = Rectangle(width=bar_width, height=bar_height, color=GREY_B, fill_opacity=0.2)
        bar2_fill = Rectangle(width=bar_width * 0.58, height=bar_height, color=GREEN, fill_opacity=0.6)
        bar2_fill.align_to(bar2_bg, LEFT)
        bar2_group = VGroup(bar2_bg, bar2_fill).shift(RIGHT * 3 + UP * 0.5)
        bar2_label = MathTex(r"\hat{p}_2 = 0.58", font_size=24, color=GREEN)
        bar2_label.next_to(bar2_group, DOWN, buff=0.15)
        n2_label = Text("n\u2082 = 200", font_size=18, color=GREY_B)
        n2_label.next_to(bar2_label, DOWN, buff=0.1)

        sample1 = Text("Sample 1", font_size=20, color=RED)
        sample1.next_to(bar1_group, UP, buff=0.1)
        sample2 = Text("Sample 2", font_size=20, color=GREEN)
        sample2.next_to(bar2_group, UP, buff=0.1)

        self.play(
            FadeIn(bar1_group), FadeIn(bar1_label), FadeIn(n1_label), FadeIn(sample1),
            FadeIn(bar2_group), FadeIn(bar2_label), FadeIn(n2_label), FadeIn(sample2),
            run_time=1.2,
        )

        # Arrow down to formula
        arrow = Arrow(ORIGIN + DOWN * 0.3, ORIGIN + DOWN * 1.2, color=GOLD, stroke_width=2)
        arrow.shift(DOWN * 0.5)
        plug_text = Text("Plug in sample values", font_size=20, color=GOLD)
        plug_text.next_to(arrow, RIGHT, buff=0.15)

        self.play(GrowArrow(arrow), FadeIn(plug_text), run_time=0.6)

        # Formula
        formula = MathTex(
            r"SE",
            r"=",
            r"\sqrt{\frac{\hat{p}_1(1-\hat{p}_1)}{n_1} + \frac{\hat{p}_2(1-\hat{p}_2)}{n_2}}",
            font_size=36, color=SOFT_WHITE,
        ).shift(DOWN * 1.8)

        formula[0].set_color(BLUE_ACCENT)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.12, corner_radius=0.1)

        self.play(Write(formula[0]), run_time=0.5)
        self.play(Write(formula[1]), run_time=0.3)
        self.play(Write(formula[2]), run_time=1.2)
        self.play(Create(box), run_time=0.5)

        # Key difference note
        key_diff = Text(
            "Uses p\u0302 (from data), not p (from H\u2080)",
            font_size=20, color=GOLD,
        ).next_to(formula, DOWN, buff=0.3)

        self.play(FadeIn(key_diff), run_time=0.6)

        # Takeaway
        takeaway = Text(
            "Use SE (with sample p\u0302) for confidence intervals when p is unknown.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.3)

        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(2.0)
