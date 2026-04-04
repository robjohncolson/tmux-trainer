"""
normal-condition: Normal/Large Sample Condition
  Proportions: np, n(1-p) ≥ 10  |  Means: n ≥ 30 or population Normal
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"
PURPLE = "#BB86FC"


class NormalConditionScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("Normal / Large Sample Condition", font_size=32, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Two columns (0.8-7s) ---
        # Left: Proportions
        prop_title = Text("Proportions", font_size=26, color=BLUE_ACCENT)
        prop_title.shift(LEFT * 3.2 + UP * 1.5)

        prop_rule = MathTex(
            r"n\hat{p} \geq 10", r"\quad\text{and}\quad",
            r"n(1-\hat{p}) \geq 10",
            font_size=26,
        ).next_to(prop_title, DOWN, buff=0.3)
        prop_rule[0].set_color(GREEN)
        prop_rule[2].set_color(GREEN)

        prop_note = Text("(Use p₀ for tests, p̂ for CIs)", font_size=16, color=GREY_A)
        prop_note.next_to(prop_rule, DOWN, buff=0.2)

        # Example: pass
        prop_ex = VGroup(
            MathTex(r"n=200,\;\hat{p}=0.6", font_size=20, color=SOFT_WHITE),
            MathTex(r"200(0.6)=120 \geq 10\;\checkmark", font_size=20, color=GREEN),
            MathTex(r"200(0.4)=80 \geq 10\;\checkmark", font_size=20, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        prop_ex.next_to(prop_note, DOWN, buff=0.3)

        # Right: Means
        mean_title = Text("Means", font_size=26, color=PURPLE)
        mean_title.shift(RIGHT * 3.2 + UP * 1.5)

        mean_rule = MathTex(
            r"n \geq 30", r"\quad\text{or}\quad",
            r"\text{population Normal}",
            font_size=26,
        ).next_to(mean_title, DOWN, buff=0.3)
        mean_rule[0].set_color(GREEN)
        mean_rule[2].set_color(GREEN)

        mean_note = Text("(CLT kicks in at n ≥ 30)", font_size=16, color=GREY_A)
        mean_note.next_to(mean_rule, DOWN, buff=0.2)

        mean_ex = VGroup(
            MathTex(r"n=15,\;\text{pop is Normal}", font_size=20, color=SOFT_WHITE),
            MathTex(r"\text{OK — any } n \text{ works}\;\checkmark", font_size=20, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        mean_ex.next_to(mean_note, DOWN, buff=0.3)

        # Animate left
        self.play(FadeIn(prop_title), run_time=0.3)
        self.play(Write(prop_rule), run_time=0.8)
        self.play(FadeIn(prop_note), run_time=0.3)
        self.play(FadeIn(prop_ex), run_time=0.6)
        self.wait(0.2)

        # Divider
        divider = DashedLine(UP * 1.8, DOWN * 2, color=GREY_B, stroke_width=1)
        self.play(Create(divider), run_time=0.3)

        # Animate right
        self.play(FadeIn(mean_title), run_time=0.3)
        self.play(Write(mean_rule), run_time=0.8)
        self.play(FadeIn(mean_note), run_time=0.3)
        self.play(FadeIn(mean_ex), run_time=0.5)
        self.wait(0.3)

        # --- Bottom: Why different? (7-10s) ---
        why = VGroup(
            Text("Why different rules?", font_size=22, color=GOLD),
            Text("Proportions → binomial → need enough successes & failures",
                 font_size=18, color=BLUE_ACCENT),
            Text("Means → CLT → need large n to overcome skew",
                 font_size=18, color=PURPLE),
        ).arrange(DOWN, buff=0.12).to_edge(DOWN, buff=0.4)

        self.play(FadeIn(why, shift=UP * 0.2), run_time=0.8)
        self.wait(2.0)
