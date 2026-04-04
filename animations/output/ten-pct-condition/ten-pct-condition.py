"""
ten-pct-condition: n < 0.10 · N
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class TenPctConditionScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("10% Condition", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Population grid (0.8-4s) ---
        pop_label = Text("Population N = 100", font_size=24, color=SOFT_WHITE)
        pop_label.next_to(title, DOWN, buff=0.5)
        self.play(FadeIn(pop_label), run_time=0.4)

        # 10x10 grid of dots representing population
        grid = VGroup()
        for row in range(10):
            for col in range(10):
                dot = Dot(radius=0.06, color=GREY_B)
                dot.move_to(LEFT * 3.5 + RIGHT * col * 0.35 + DOWN * row * 0.35 + UP * 0.8)
                grid.add(dot)

        self.play(LaggedStart(*[FadeIn(d, scale=0.3) for d in grid], lag_ratio=0.005), run_time=1.0)
        self.wait(0.2)

        # --- Highlight sample n=8 (passes) (4-7s) ---
        sample_indices = [0, 12, 25, 37, 48, 61, 74, 89]
        sample_dots = VGroup(*[grid[i] for i in sample_indices])

        check_label = MathTex(r"n = 8", font_size=28, color=GREEN).shift(RIGHT * 3 + UP * 1.5)
        condition = MathTex(r"8 < 0.10 \times 100 = 10", font_size=26, color=GREEN)
        condition.next_to(check_label, DOWN, buff=0.3)
        check_mark = MathTex(r"\checkmark", font_size=40, color=GREEN)
        check_mark.next_to(condition, DOWN, buff=0.3)

        self.play(
            *[d.animate.set_color(GREEN).scale(1.5) for d in sample_dots],
            FadeIn(check_label),
            run_time=0.8,
        )
        self.play(Write(condition), run_time=0.7)
        self.play(FadeIn(check_mark, scale=1.5), run_time=0.4)
        self.wait(0.3)

        # --- Reset and show fail case n=25 (7-11s) ---
        self.play(
            *[d.animate.set_color(GREY_B).scale(1/1.5) for d in sample_dots],
            FadeOut(check_label), FadeOut(condition), FadeOut(check_mark),
            run_time=0.5,
        )

        fail_indices = list(range(25))
        fail_dots = VGroup(*[grid[i] for i in fail_indices])

        fail_label = MathTex(r"n = 25", font_size=28, color=RED).shift(RIGHT * 3 + UP * 1.5)
        fail_cond = MathTex(r"25 \not< 0.10 \times 100 = 10", font_size=26, color=RED)
        fail_cond.next_to(fail_label, DOWN, buff=0.3)
        x_mark = MathTex(r"\times", font_size=40, color=RED)
        x_mark.next_to(fail_cond, DOWN, buff=0.3)

        self.play(
            *[d.animate.set_color(RED).scale(1.5) for d in fail_dots],
            FadeIn(fail_label),
            run_time=0.8,
        )
        self.play(Write(fail_cond), run_time=0.7)
        self.play(FadeIn(x_mark, scale=1.5), run_time=0.4)
        self.wait(0.3)

        # --- Formula (11-14s) ---
        formula_box = MathTex(
            r"n", r"<", r"0.10", r"\cdot", r"N",
            font_size=44,
        ).to_edge(DOWN, buff=0.8)
        formula_box[0].set_color(BLUE_ACCENT)
        formula_box[2].set_color(GOLD)
        formula_box[4].set_color(SOFT_WHITE)

        why = Text("Ensures sampling without replacement ≈ independent",
                    font_size=20, color=GREY_A)
        why.next_to(formula_box, DOWN, buff=0.3)

        self.play(Write(formula_box), run_time=0.8)
        self.play(FadeIn(why, shift=UP * 0.1), run_time=0.5)
        self.wait(1.2)
