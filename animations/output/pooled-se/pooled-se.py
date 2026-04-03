"""
pooled-se: Pooled SE for Two Proportions
Uses p-hat_c (combined proportion) — For hypothesis tests only
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class PooledSeScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("Pooled Standard Error for Two Proportions", font_size=34, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # Context
        context_box = RoundedRectangle(width=6, height=0.5, color=RED, fill_opacity=0.15, corner_radius=0.1)
        context_text = Text("For hypothesis tests only (H\u2080: p\u2081 = p\u2082)", font_size=22, color=RED)
        context = VGroup(context_box, context_text).arrange(ORIGIN)
        context.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(context), run_time=0.7)

        # Show pooling concept: two groups merge into one
        g1_dots = VGroup(*[
            Dot(radius=0.06, color=RED).move_to(LEFT * 4 + UP * np.random.uniform(-0.4, 0.4) + RIGHT * np.random.uniform(0, 1))
            for _ in range(12)
        ])
        g1_label = Text("Sample 1", font_size=18, color=RED).next_to(g1_dots, UP, buff=0.15)

        g2_dots = VGroup(*[
            Dot(radius=0.06, color=GREEN).move_to(RIGHT * 3 + UP * np.random.uniform(-0.4, 0.4) + RIGHT * np.random.uniform(0, 1))
            for _ in range(12)
        ])
        g2_label = Text("Sample 2", font_size=18, color=GREEN).next_to(g2_dots, UP, buff=0.15)

        self.play(
            FadeIn(g1_dots), FadeIn(g1_label),
            FadeIn(g2_dots), FadeIn(g2_label),
            run_time=0.8,
        )

        # Animate dots merging to center
        pool_target = ORIGIN + UP * 0.2
        anims = []
        for dot in g1_dots:
            anims.append(dot.animate.move_to(pool_target + RIGHT * np.random.uniform(-1, 1) + UP * np.random.uniform(-0.3, 0.3)))
        for dot in g2_dots:
            anims.append(dot.animate.move_to(pool_target + RIGHT * np.random.uniform(-1, 1) + UP * np.random.uniform(-0.3, 0.3)))

        pool_label = Text("Pooled", font_size=22, color=GOLD)
        pool_label.next_to(pool_target, UP, buff=0.6)

        self.play(
            *anims,
            FadeOut(g1_label), FadeOut(g2_label),
            FadeIn(pool_label),
            run_time=1.2,
        )

        # Combined proportion formula
        pc_formula = MathTex(
            r"\hat{p}_c = \frac{x_1 + x_2}{n_1 + n_2}",
            font_size=34, color=BLUE_ACCENT,
        ).shift(DOWN * 0.8)

        self.play(Write(pc_formula), run_time=1.0)

        # Fade out dots
        self.play(
            FadeOut(g1_dots), FadeOut(g2_dots), FadeOut(pool_label),
            pc_formula.animate.shift(UP * 1.5),
            run_time=0.6,
        )

        # Main SE formula
        formula = MathTex(
            r"SE_{\text{pooled}}",
            r"=",
            r"\sqrt{\hat{p}_c(1-\hat{p}_c)\left(\frac{1}{n_1}+\frac{1}{n_2}\right)}",
            font_size=36, color=SOFT_WHITE,
        ).shift(DOWN * 0.5)

        formula[0].set_color(BLUE_ACCENT)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.12, corner_radius=0.1)

        self.play(Write(formula[0]), run_time=0.5)
        self.play(Write(formula[1]), run_time=0.3)
        self.play(Write(formula[2]), run_time=1.2)
        self.play(Create(box), run_time=0.5)

        # Why pooled?
        why = Text(
            "Under H\u2080, both groups share the same p, so we pool for a better estimate.",
            font_size=20, color=GOLD,
        ).next_to(formula, DOWN, buff=0.35)
        self.play(FadeIn(why), run_time=0.7)

        # Takeaway
        takeaway = Text(
            "Pool the data when testing H\u2080: p\u2081 = p\u2082. Use separate p\u0302s for CIs.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.3)

        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(2.0)
