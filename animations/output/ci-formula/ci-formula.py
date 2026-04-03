"""
ci-formula: Confidence Interval = statistic +/- critical value x SE
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class CiFormulaScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Confidence Interval", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Build formula step by step (0.8-4s) ---
        formula = MathTex(
            r"\text{statistic}", r"\;\pm\;",
            r"\text{critical value}", r"\times", r"\text{SE}",
            font_size=38,
        )
        formula[0].set_color(BLUE_ACCENT)
        formula[1].set_color(GOLD)
        formula[2].set_color(RED)
        formula[4].set_color(GREEN)
        formula.move_to(UP * 1.8)

        self.play(Write(formula[0]), run_time=0.5)
        self.play(Write(formula[1:3]), run_time=0.6)
        self.play(Write(formula[3:]), run_time=0.5)
        self.wait(0.3)

        # --- Number line with point estimate (4-7s) ---
        nline = NumberLine(
            x_range=[44, 56, 2], length=10,
            include_numbers=True, font_size=18,
            color=GREY_B,
        ).shift(DOWN * 0.2)
        self.play(Create(nline), run_time=0.6)

        point_est = 50.0
        pe_dot = Dot(nline.n2p(point_est), radius=0.12, color=BLUE_ACCENT)
        pe_label = MathTex(r"\hat{p} = 50", font_size=24, color=BLUE_ACCENT)
        pe_label.next_to(pe_dot, UP, buff=0.25)
        self.play(FadeIn(pe_dot, scale=0.5), FadeIn(pe_label), run_time=0.5)
        self.wait(0.3)

        # --- Expanding interval animation (7-12s) ---
        me_values = [1.0, 2.0, 3.0]
        me_labels_text = ["ME = 1.0", "ME = 2.0", "ME = 3.0"]

        bracket = None
        me_text = None
        interval_label = None

        for i, me in enumerate(me_values):
            lo = point_est - me
            hi = point_est + me

            # Left bracket
            left_tick = Line(
                nline.n2p(lo) + UP * 0.3,
                nline.n2p(lo) + DOWN * 0.3,
                color=GOLD, stroke_width=3,
            )
            right_tick = Line(
                nline.n2p(hi) + UP * 0.3,
                nline.n2p(hi) + DOWN * 0.3,
                color=GOLD, stroke_width=3,
            )
            span_line = Line(
                nline.n2p(lo), nline.n2p(hi),
                color=GOLD, stroke_width=3,
            ).shift(DOWN * 0.3)

            new_bracket = VGroup(left_tick, right_tick, span_line)

            new_me_text = MathTex(
                me_labels_text[i],
                font_size=24, color=GOLD,
            ).next_to(span_line, DOWN, buff=0.25)

            new_interval_label = MathTex(
                f"({lo:.1f},\\;{hi:.1f})",
                font_size=26, color=SOFT_WHITE,
            ).next_to(new_me_text, DOWN, buff=0.2)

            if bracket is None:
                self.play(
                    Create(new_bracket),
                    FadeIn(new_me_text),
                    FadeIn(new_interval_label),
                    run_time=0.8,
                )
            else:
                self.play(
                    Transform(bracket, new_bracket),
                    Transform(me_text, new_me_text),
                    Transform(interval_label, new_interval_label),
                    run_time=0.8,
                )

            if bracket is None:
                bracket = new_bracket
                me_text = new_me_text
                interval_label = new_interval_label

            self.wait(0.3)

        self.wait(0.3)

        # --- Show full formula with numbers (12-14s) ---
        full = MathTex(
            r"50 \;\pm\; 1.96 \times 1.53 \;=\; (47.0,\; 53.0)",
            font_size=30, color=SOFT_WHITE,
        )
        full.next_to(nline, UP, buff=1.4)
        self.play(
            FadeOut(pe_label),
            FadeIn(full, shift=DOWN * 0.1),
            run_time=0.8,
        )
        self.wait(0.3)

        # --- Takeaway (14-16s) ---
        takeaway = Text(
            "Point estimate plus-or-minus a margin of error",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
