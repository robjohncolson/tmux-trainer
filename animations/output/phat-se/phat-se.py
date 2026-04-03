"""
phat-se: Standard Error of p-hat
s_{p-hat} = sqrt(p-hat(1-p-hat)/n) — SE uses p-hat (sample), SD uses p (population)
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class PhatSeScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("Standard Error of p\u0302", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # Side-by-side comparison
        sd_header = Text("SD (population)", font_size=24, color=RED)
        se_header = Text("SE (sample)", font_size=24, color=GREEN)

        sd_formula = MathTex(
            r"\sigma_{\hat{p}} = \sqrt{\frac{p(1-p)}{n}}",
            font_size=38, color=RED,
        )
        se_formula = MathTex(
            r"s_{\hat{p}} = \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}",
            font_size=38, color=GREEN,
        )

        left_group = VGroup(sd_header, sd_formula).arrange(DOWN, buff=0.3).shift(LEFT * 3 + UP * 0.8)
        right_group = VGroup(se_header, se_formula).arrange(DOWN, buff=0.3).shift(RIGHT * 3 + UP * 0.8)

        self.play(Write(sd_header), run_time=0.6)
        self.play(Write(sd_formula), run_time=1.0)
        self.play(Write(se_header), run_time=0.6)
        self.play(Write(se_formula), run_time=1.0)

        # Highlight the key difference
        # Circle "p" in SD formula and "p-hat" in SE formula
        vs_text = Text("vs", font_size=28, color=SOFT_WHITE)
        vs_text.move_to(ORIGIN + UP * 0.8)
        self.play(FadeIn(vs_text), run_time=0.4)

        # Arrow pointing at key difference
        diff_box_left = SurroundingRectangle(sd_formula, color=RED, buff=0.1, corner_radius=0.05)
        diff_box_right = SurroundingRectangle(se_formula, color=GREEN, buff=0.1, corner_radius=0.05)

        self.play(Create(diff_box_left), Create(diff_box_right), run_time=0.8)

        # Explanation blocks
        pop_note = VGroup(
            Text("p = true proportion", font_size=20, color=RED),
            Text("(known from H\u2080 or given)", font_size=18, color=GREY_B),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT).shift(LEFT * 3 + DOWN * 0.8)

        samp_note = VGroup(
            Text("p\u0302 = sample proportion", font_size=20, color=GREEN),
            Text("(estimated from data)", font_size=18, color=GREY_B),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT).shift(RIGHT * 3 + DOWN * 0.8)

        self.play(FadeIn(pop_note), run_time=0.7)
        self.play(FadeIn(samp_note), run_time=0.7)

        # When to use each
        use_text = VGroup(
            Text("SD \u2192 when p is known", font_size=20, color=RED),
            Text("SE \u2192 for confidence intervals (p unknown)", font_size=20, color=GREEN),
        ).arrange(DOWN, buff=0.15, aligned_edge=LEFT).shift(DOWN * 2.0)

        self.play(FadeIn(use_text[0]), run_time=0.6)
        self.play(FadeIn(use_text[1]), run_time=0.6)

        # Takeaway
        takeaway = Text(
            "SE replaces the unknown p with the observed p\u0302 from your sample.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.35)

        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(2.0)
