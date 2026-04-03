"""
large-counts: Large Counts Condition
np >= 10 and n(1-p) >= 10 — Show why normal approximation needs this
"""
from manim import *
import numpy as np
from scipy.stats import binom

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class LargeCountsScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("Large Counts Condition", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # The condition
        condition = MathTex(
            r"np \geq 10", r"\quad \text{and} \quad", r"n(1-p) \geq 10",
            font_size=40, color=SOFT_WHITE,
        ).next_to(title, DOWN, buff=0.35)
        condition[0].set_color(GREEN)
        condition[2].set_color(GREEN)

        cond_box = SurroundingRectangle(condition, color=GOLD, buff=0.12, corner_radius=0.1)

        self.play(Write(condition[0]), run_time=0.6)
        self.play(Write(condition[1]), run_time=0.3)
        self.play(Write(condition[2]), run_time=0.6)
        self.play(Create(cond_box), run_time=0.4)

        # Two examples side by side: bad (skewed) vs good (normal-ish)
        # BAD: n=10, p=0.1 -> np=1 (fails)
        ax_bad = Axes(
            x_range=[-0.5, 6.5, 1], y_range=[0, 0.45, 0.1],
            x_length=3.2, y_length=2.0,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).shift(LEFT * 3.2 + DOWN * 1.0)

        n_bad, p_bad = 10, 0.1
        bars_bad = VGroup()
        for k in range(7):
            prob = binom.pmf(k, n_bad, p_bad)
            bar = Rectangle(
                width=0.35, height=prob * 4.5,
                color=RED, fill_opacity=0.7, stroke_width=1,
            )
            bar.move_to(ax_bad.c2p(k, 0), aligned_edge=DOWN)
            bars_bad.add(bar)

        bad_title = Text("n=10, p=0.1", font_size=18, color=RED)
        bad_title.next_to(ax_bad, UP, buff=0.1)
        bad_check = MathTex(r"np = 1 < 10 \;\; \boldsymbol{\times}", font_size=20, color=RED)
        bad_check.next_to(ax_bad, DOWN, buff=0.15)
        bad_label = Text("Skewed!", font_size=18, color=RED)
        bad_label.next_to(bad_check, DOWN, buff=0.1)

        # GOOD: n=100, p=0.3 -> np=30 (passes)
        ax_good = Axes(
            x_range=[15, 45, 5], y_range=[0, 0.1, 0.025],
            x_length=3.2, y_length=2.0,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).shift(RIGHT * 3.2 + DOWN * 1.0)

        n_good, p_good = 100, 0.3
        bars_good = VGroup()
        for k in range(15, 46):
            prob = binom.pmf(k, n_good, p_good)
            bar = Rectangle(
                width=0.1, height=prob * 20,
                color=GREEN, fill_opacity=0.7, stroke_width=0.5,
            )
            bar.move_to(ax_good.c2p(k, 0), aligned_edge=DOWN)
            bars_good.add(bar)

        good_title = Text("n=100, p=0.3", font_size=18, color=GREEN)
        good_title.next_to(ax_good, UP, buff=0.1)
        good_check = MathTex(r"np = 30 \geq 10 \;\; \checkmark", font_size=20, color=GREEN)
        good_check.next_to(ax_good, DOWN, buff=0.15)
        good_label = Text("Approximately Normal", font_size=18, color=GREEN)
        good_label.next_to(good_check, DOWN, buff=0.1)

        # Show bad example
        self.play(Create(ax_bad), FadeIn(bad_title), run_time=0.6)
        self.play(FadeIn(bars_bad, shift=UP * 0.2), run_time=0.8)
        self.play(FadeIn(bad_check), FadeIn(bad_label), run_time=0.6)

        # Show good example
        self.play(Create(ax_good), FadeIn(good_title), run_time=0.6)
        self.play(FadeIn(bars_good, shift=UP * 0.2), run_time=0.8)
        self.play(FadeIn(good_check), FadeIn(good_label), run_time=0.6)

        # VS between them
        vs = Text("vs", font_size=24, color=SOFT_WHITE)
        vs.move_to(ORIGIN + DOWN * 1.0)
        self.play(FadeIn(vs), run_time=0.3)

        # Explanation
        explanation = Text(
            "Both np and n(1\u2212p) must be at least 10",
            font_size=20, color=GOLD,
        ).next_to(VGroup(bad_label, good_label), DOWN, buff=0.25)
        self.play(FadeIn(explanation), run_time=0.5)

        # Takeaway
        takeaway = Text(
            "Enough successes AND failures needed for the normal curve to fit well.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.25)

        self.play(FadeIn(takeaway), run_time=0.7)
        self.wait(2.0)
