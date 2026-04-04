"""
random-condition: Data must come from random sample or randomized experiment
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"
ORANGE = "#FFA500"


class RandomConditionScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("Randomization Condition", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Two paths diagram (0.8-5s) ---
        # Left: Random Sampling
        rs_title = Text("Random Sampling", font_size=24, color=BLUE_ACCENT)
        rs_title.shift(LEFT * 3 + UP * 1.3)

        # Population -> arrow -> Sample
        pop_circle = Circle(radius=0.6, color=GREY_A, stroke_width=2).shift(LEFT * 3 + UP * 0.2)
        pop_text = Text("Population", font_size=14, color=GREY_A).move_to(pop_circle)
        samp_circle = Circle(radius=0.4, color=BLUE_ACCENT, stroke_width=2).shift(LEFT * 3 + DOWN * 1.4)
        samp_text = Text("Sample", font_size=14, color=BLUE_ACCENT).move_to(samp_circle)
        arrow1 = Arrow(pop_circle.get_bottom(), samp_circle.get_top(), color=BLUE_ACCENT, buff=0.1)
        rand_label1 = Text("random\nselection", font_size=12, color=BLUE_ACCENT).next_to(arrow1, RIGHT, buff=0.1)

        generalize = Text("→ Generalize to\n   population", font_size=16, color=BLUE_ACCENT)
        generalize.next_to(samp_circle, DOWN, buff=0.3)

        # Right: Random Assignment
        ra_title = Text("Random Assignment", font_size=24, color=GREEN)
        ra_title.shift(RIGHT * 3 + UP * 1.3)

        subj_circle = Circle(radius=0.6, color=GREY_A, stroke_width=2).shift(RIGHT * 3 + UP * 0.2)
        subj_text = Text("Subjects", font_size=14, color=GREY_A).move_to(subj_circle)

        g1 = Circle(radius=0.35, color=GREEN, stroke_width=2).shift(RIGHT * 1.8 + DOWN * 1.4)
        g1_text = Text("Trt", font_size=12, color=GREEN).move_to(g1)
        g2 = Circle(radius=0.35, color=GREEN, stroke_width=2).shift(RIGHT * 4.2 + DOWN * 1.4)
        g2_text = Text("Ctrl", font_size=12, color=GREEN).move_to(g2)

        arrow2 = Arrow(subj_circle.get_bottom() + LEFT * 0.3, g1.get_top(), color=GREEN, buff=0.1)
        arrow3 = Arrow(subj_circle.get_bottom() + RIGHT * 0.3, g2.get_top(), color=GREEN, buff=0.1)
        rand_label2 = Text("random", font_size=12, color=GREEN).next_to(arrow2, LEFT, buff=0.05)

        causation = Text("→ Establish\n   causation", font_size=16, color=GREEN)
        causation.shift(RIGHT * 3 + DOWN * 2.3)

        # Animate left side
        self.play(
            FadeIn(rs_title), Create(pop_circle), FadeIn(pop_text),
            run_time=0.5,
        )
        self.play(GrowArrow(arrow1), FadeIn(rand_label1), run_time=0.4)
        self.play(Create(samp_circle), FadeIn(samp_text), run_time=0.4)
        self.play(FadeIn(generalize), run_time=0.3)

        # Animate right side
        self.play(
            FadeIn(ra_title), Create(subj_circle), FadeIn(subj_text),
            run_time=0.5,
        )
        self.play(
            GrowArrow(arrow2), GrowArrow(arrow3), FadeIn(rand_label2),
            run_time=0.4,
        )
        self.play(
            Create(g1), FadeIn(g1_text), Create(g2), FadeIn(g2_text),
            run_time=0.4,
        )
        self.play(FadeIn(causation), run_time=0.3)
        self.wait(0.3)

        # --- Divider (5-6s) ---
        divider = DashedLine(UP * 2, DOWN * 2.5, color=GREY_B, stroke_width=1)
        self.play(Create(divider), run_time=0.3)

        # --- Bottom warning (6-9s) ---
        warn = VGroup(
            Text("Without randomization:", font_size=20, color=RED),
            Text("• Bias may distort results", font_size=18, color=SOFT_WHITE),
            Text("• Cannot generalize or infer causation", font_size=18, color=SOFT_WHITE),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.1).to_edge(DOWN, buff=0.3)

        self.play(FadeIn(warn, shift=UP * 0.2), run_time=0.8)
        self.wait(2.0)
