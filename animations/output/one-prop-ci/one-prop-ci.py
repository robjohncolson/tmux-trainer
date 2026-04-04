"""
one-prop-ci: p̂ ± z* √(p̂(1-p̂)/n)
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class OnePropCiScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("CI for One Proportion", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Formula build (0.8-4s) ---
        formula = MathTex(
            r"\hat{p}", r"\;\pm\;", r"z^*",
            r"\sqrt{\frac{\hat{p}(1-\hat{p})}{n}}",
            font_size=38,
        ).shift(UP * 1.5)
        formula[0].set_color(BLUE_ACCENT)
        formula[1].set_color(GOLD)
        formula[2].set_color(RED)
        formula[3].set_color(GREEN)

        labels = VGroup(
            Text("statistic", font_size=16, color=BLUE_ACCENT),
            Text("critical value", font_size=16, color=RED),
            Text("standard error", font_size=16, color=GREEN),
        )
        labels[0].next_to(formula[0], DOWN, buff=0.4)
        labels[1].next_to(formula[2], DOWN, buff=0.4)
        labels[2].next_to(formula[3], DOWN, buff=0.4)

        self.play(Write(formula[0]), FadeIn(labels[0]), run_time=0.5)
        self.play(Write(formula[1:3]), FadeIn(labels[1]), run_time=0.6)
        self.play(Write(formula[3]), FadeIn(labels[2]), run_time=0.6)
        self.wait(0.3)

        # --- Numerical example (4-8s) ---
        self.play(FadeOut(labels), run_time=0.3)

        example = VGroup(
            MathTex(r"\hat{p} = 0.60,\quad n = 200,\quad z^* = 1.96", font_size=26, color=SOFT_WHITE),
        ).shift(UP * 0.3)
        self.play(FadeIn(example), run_time=0.5)

        calc = MathTex(
            r"0.60 \pm 1.96\sqrt{\frac{0.60 \times 0.40}{200}}",
            font_size=28,
        ).next_to(example, DOWN, buff=0.4)
        self.play(Write(calc), run_time=0.8)

        result = MathTex(
            r"= 0.60 \pm 0.068",
            font_size=28, color=GOLD,
        ).next_to(calc, DOWN, buff=0.3)
        self.play(Write(result), run_time=0.6)
        self.wait(0.3)

        # --- Number line with interval (8-13s) ---
        nline = NumberLine(
            x_range=[0.45, 0.75, 0.05], length=10,
            include_numbers=True, font_size=18, color=GREY_B,
            decimal_number_config={"num_decimal_places": 2},
        ).shift(DOWN * 1.5)
        self.play(Create(nline), run_time=0.5)

        # Point estimate
        pe_dot = Dot(nline.n2p(0.60), radius=0.1, color=BLUE_ACCENT)
        self.play(FadeIn(pe_dot, scale=0.5), run_time=0.3)

        # Interval brackets
        lo, hi = 0.532, 0.668
        left_tick = Line(nline.n2p(lo) + UP * 0.3, nline.n2p(lo) + DOWN * 0.3, color=GOLD, stroke_width=3)
        right_tick = Line(nline.n2p(hi) + UP * 0.3, nline.n2p(hi) + DOWN * 0.3, color=GOLD, stroke_width=3)
        span = Line(nline.n2p(lo), nline.n2p(hi), color=GOLD, stroke_width=3).shift(DOWN * 0.3)
        bracket = VGroup(left_tick, right_tick, span)

        interval_label = MathTex(r"(0.532,\; 0.668)", font_size=24, color=GOLD)
        interval_label.next_to(span, DOWN, buff=0.25)

        self.play(Create(bracket), run_time=0.8)
        self.play(FadeIn(interval_label), run_time=0.4)
        self.wait(0.3)

        # --- 95% confidence note (13-15s) ---
        note = Text("95% confident the true p is in this interval",
                     font_size=20, color=GREY_A)
        note.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(note, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
