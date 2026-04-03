"""
df-t: Degrees of Freedom for t-procedures
  df = n-1 (one-sample), min(n1-1, n2-1) (conservative two-sample), n-2 (regression)
Manim Community Edition v0.19 — 720p30, ~16 seconds
Show all three cases.
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class DfTScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Degrees of Freedom (df)", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Case 1: One-sample t (0.8-4.5s) ---
        case1_header = Text("One-Sample t", font_size=28, color=BLUE_ACCENT)
        case1_header.move_to(UP * 1.5 + LEFT * 3.5)

        case1_formula = MathTex(
            r"\text{df}", "=", "n", "-", "1",
            font_size=38,
        )
        case1_formula[0].set_color(GOLD)
        case1_formula[2].set_color(SOFT_WHITE)
        case1_formula.next_to(case1_header, DOWN, buff=0.35)

        case1_example = MathTex(
            r"n = 25 \;\Rightarrow\; \text{df} = 24",
            font_size=26, color=GREY_B,
        )
        case1_example.next_to(case1_formula, DOWN, buff=0.25)

        self.play(FadeIn(case1_header, shift=DOWN * 0.1), run_time=0.4)
        self.play(Write(case1_formula), run_time=0.8)
        self.play(FadeIn(case1_example), run_time=0.5)
        self.wait(0.3)

        # --- Case 2: Two-sample t (4.5-8.5s) ---
        case2_header = Text("Two-Sample t (conservative)", font_size=28, color=BLUE_ACCENT)
        case2_header.move_to(UP * 1.5 + RIGHT * 2.5)

        case2_formula = MathTex(
            r"\text{df}", "=", r"\min(n_1 - 1,\; n_2 - 1)",
            font_size=34,
        )
        case2_formula[0].set_color(GOLD)
        case2_formula.next_to(case2_header, DOWN, buff=0.35)

        case2_example = MathTex(
            r"n_1=30,\; n_2=20 \;\Rightarrow\; \text{df} = 19",
            font_size=24, color=GREY_B,
        )
        case2_example.next_to(case2_formula, DOWN, buff=0.25)

        self.play(FadeIn(case2_header, shift=DOWN * 0.1), run_time=0.4)
        self.play(Write(case2_formula), run_time=0.8)
        self.play(FadeIn(case2_example), run_time=0.5)
        self.wait(0.3)

        # --- Divider (8.5s) ---
        divider = Line(
            LEFT * 0.5 + UP * 2.0,
            LEFT * 0.5 + DOWN * 0.3,
            color=GREY_B, stroke_width=1,
        )
        self.play(Create(divider), run_time=0.3)

        # --- Case 3: Regression (8.5-12s) ---
        case3_header = Text("Linear Regression", font_size=28, color=BLUE_ACCENT)
        case3_header.move_to(DOWN * 1.2)

        case3_formula = MathTex(
            r"\text{df}", "=", "n", "-", "2",
            font_size=38,
        )
        case3_formula[0].set_color(GOLD)
        case3_formula[2].set_color(SOFT_WHITE)
        case3_formula.next_to(case3_header, DOWN, buff=0.35)

        case3_note = Text(
            "(estimating slope and intercept)",
            font_size=20, color=GREY_B,
        )
        case3_note.next_to(case3_formula, DOWN, buff=0.2)

        case3_example = MathTex(
            r"n = 30 \;\Rightarrow\; \text{df} = 28",
            font_size=26, color=GREY_B,
        )
        case3_example.next_to(case3_note, DOWN, buff=0.2)

        self.play(FadeIn(case3_header, shift=DOWN * 0.1), run_time=0.4)
        self.play(Write(case3_formula), run_time=0.8)
        self.play(FadeIn(case3_note), FadeIn(case3_example), run_time=0.5)
        self.wait(0.3)

        # --- Highlight all df (12-13.5s) ---
        box1 = SurroundingRectangle(case1_formula, color=GOLD, buff=0.12, stroke_width=1.5)
        box2 = SurroundingRectangle(case2_formula, color=GOLD, buff=0.12, stroke_width=1.5)
        box3 = SurroundingRectangle(case3_formula, color=GOLD, buff=0.12, stroke_width=1.5)

        self.play(
            Create(box1), Create(box2), Create(box3),
            run_time=0.8,
        )
        self.wait(0.3)

        # --- Takeaway (13.5-16s) ---
        takeaway = Text(
            "df depends on the procedure: n-1, min(n1-1, n2-1), or n-2",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.2)
