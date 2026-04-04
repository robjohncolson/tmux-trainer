"""
one-mean-ci: x̄ ± t* · s/√n
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class OneMeanCiScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("CI for One Mean", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Formula build (0.8-4s) ---
        formula = MathTex(
            r"\bar{x}", r"\;\pm\;", r"t^*",
            r"\frac{s}{\sqrt{n}}",
            font_size=42,
        ).shift(UP * 1.5)
        formula[0].set_color(BLUE_ACCENT)
        formula[1].set_color(GOLD)
        formula[2].set_color(RED)
        formula[3].set_color(GREEN)

        labels = VGroup(
            Text("sample mean", font_size=16, color=BLUE_ACCENT),
            Text("t* (not z*!)", font_size=16, color=RED),
            Text("SE = s/√n", font_size=16, color=GREEN),
        )
        labels[0].next_to(formula[0], DOWN, buff=0.5)
        labels[1].next_to(formula[2], DOWN, buff=0.5)
        labels[2].next_to(formula[3], DOWN, buff=0.5)

        self.play(Write(formula[0]), FadeIn(labels[0]), run_time=0.5)
        self.play(Write(formula[1:3]), FadeIn(labels[1]), run_time=0.6)
        self.play(Write(formula[3]), FadeIn(labels[2]), run_time=0.6)
        self.wait(0.3)

        # --- Why t* not z*? (4-6s) ---
        self.play(FadeOut(labels), run_time=0.3)

        why_t = Text("σ unknown → use s → t-distribution (df = n−1)",
                      font_size=20, color=RED)
        why_t.shift(UP * 0.3)
        self.play(FadeIn(why_t, shift=UP * 0.1), run_time=0.6)
        self.wait(0.5)

        # --- Numerical example (6-10s) ---
        example = MathTex(
            r"\bar{x} = 82.4,\quad s = 12.1,\quad n = 36,\quad t^* = 2.030",
            font_size=24, color=SOFT_WHITE,
        ).next_to(why_t, DOWN, buff=0.4)
        self.play(FadeIn(example), run_time=0.5)

        calc = MathTex(
            r"82.4 \pm 2.030 \cdot \frac{12.1}{\sqrt{36}}",
            r"= 82.4 \pm 4.10",
            font_size=26,
        ).next_to(example, DOWN, buff=0.35)
        calc[1].set_color(GOLD)
        self.play(Write(calc[0]), run_time=0.7)
        self.play(Write(calc[1]), run_time=0.5)
        self.wait(0.3)

        # --- Number line interval (10-14s) ---
        nline = NumberLine(
            x_range=[74, 92, 2], length=10,
            include_numbers=True, font_size=18, color=GREY_B,
        ).shift(DOWN * 1.6)
        self.play(Create(nline), run_time=0.5)

        pe_dot = Dot(nline.n2p(82.4), radius=0.1, color=BLUE_ACCENT)
        self.play(FadeIn(pe_dot, scale=0.5), run_time=0.3)

        lo, hi = 78.3, 86.5
        left_tick = Line(nline.n2p(lo) + UP * 0.3, nline.n2p(lo) + DOWN * 0.3, color=GOLD, stroke_width=3)
        right_tick = Line(nline.n2p(hi) + UP * 0.3, nline.n2p(hi) + DOWN * 0.3, color=GOLD, stroke_width=3)
        span = Line(nline.n2p(lo), nline.n2p(hi), color=GOLD, stroke_width=3).shift(DOWN * 0.3)
        bracket = VGroup(left_tick, right_tick, span)

        interval_label = MathTex(r"(78.3,\; 86.5)", font_size=24, color=GOLD)
        interval_label.next_to(span, DOWN, buff=0.25)

        self.play(Create(bracket), FadeIn(interval_label), run_time=0.8)
        self.wait(1.5)
