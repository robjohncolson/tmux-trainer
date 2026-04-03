"""
margin-error: Margin of Error ME = z* x SE  or  ME = t* x SE
Manim Community Edition v0.19 — 720p30, ~15 seconds
Show interval narrowing as ME shrinks.
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class MarginErrorScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Margin of Error", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Build formula step by step (0.8-4s) ---
        formula_z = MathTex(
            r"\text{ME}", "=", "z^*", r"\cdot", r"\text{SE}",
            font_size=40,
        )
        formula_z[0].set_color(GOLD)
        formula_z[2].set_color(RED)
        formula_z[4].set_color(GREEN)
        formula_z.move_to(UP * 2.0 + LEFT * 2.5)

        formula_t = MathTex(
            r"\text{ME}", "=", "t^*", r"\cdot", r"\text{SE}",
            font_size=40,
        )
        formula_t[0].set_color(GOLD)
        formula_t[2].set_color(RED)
        formula_t[4].set_color(GREEN)
        formula_t.move_to(UP * 2.0 + RIGHT * 2.5)

        or_text = Text("or", font_size=28, color=GREY_B)
        or_text.move_to(UP * 2.0)

        self.play(Write(formula_z), run_time=0.8)
        self.play(FadeIn(or_text), Write(formula_t), run_time=0.6)
        self.wait(0.3)

        # --- Number line (4-5.5s) ---
        nline = NumberLine(
            x_range=[40, 60, 2], length=10,
            include_numbers=True, font_size=18,
            color=GREY_B,
        ).shift(DOWN * 0.3)
        self.play(Create(nline), run_time=0.6)

        center = 50.0
        center_dot = Dot(nline.n2p(center), radius=0.1, color=BLUE_ACCENT)
        center_label = MathTex(r"\bar{x} = 50", font_size=22, color=BLUE_ACCENT)
        center_label.next_to(center_dot, UP, buff=0.2)
        self.play(FadeIn(center_dot, scale=0.5), FadeIn(center_label), run_time=0.4)

        # --- Show ME shrinking through three scenarios (5.5-12s) ---
        scenarios = [
            {"me": 6.0, "label": "ME = 6.0", "conf": "99%"},
            {"me": 4.0, "label": "ME = 4.0", "conf": "95%"},
            {"me": 2.0, "label": "ME = 2.0", "conf": "90%"},
        ]

        bracket = None
        me_text = None
        conf_text = None
        interval_text = None

        for s in scenarios:
            me = s["me"]
            lo = center - me
            hi = center + me

            left_tick = Line(
                nline.n2p(lo) + UP * 0.35,
                nline.n2p(lo) + DOWN * 0.35,
                color=GOLD, stroke_width=3,
            )
            right_tick = Line(
                nline.n2p(hi) + UP * 0.35,
                nline.n2p(hi) + DOWN * 0.35,
                color=GOLD, stroke_width=3,
            )
            span = Line(
                nline.n2p(lo), nline.n2p(hi),
                color=GOLD, stroke_width=3,
            ).shift(DOWN * 0.35)

            new_bracket = VGroup(left_tick, right_tick, span)

            new_me_text = MathTex(
                s["label"], font_size=24, color=GOLD,
            ).next_to(span, DOWN, buff=0.25)

            new_conf_text = Text(
                s["conf"] + " confidence",
                font_size=20, color=GREY_B,
            ).next_to(new_me_text, DOWN, buff=0.15)

            new_interval_text = MathTex(
                f"({lo:.1f},\\;{hi:.1f})",
                font_size=24, color=SOFT_WHITE,
            ).next_to(new_conf_text, DOWN, buff=0.15)

            if bracket is None:
                self.play(
                    Create(new_bracket),
                    FadeIn(new_me_text),
                    FadeIn(new_conf_text),
                    FadeIn(new_interval_text),
                    run_time=0.8,
                )
                bracket = new_bracket
                me_text = new_me_text
                conf_text = new_conf_text
                interval_text = new_interval_text
            else:
                self.play(
                    Transform(bracket, new_bracket),
                    Transform(me_text, new_me_text),
                    Transform(conf_text, new_conf_text),
                    Transform(interval_text, new_interval_text),
                    run_time=0.9,
                )

            self.wait(0.4)

        # --- Highlight narrowing (12-13s) ---
        arrow_left = Arrow(
            nline.n2p(44) + DOWN * 1.0,
            nline.n2p(48) + DOWN * 1.0,
            buff=0, color=GREEN, stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )
        arrow_right = Arrow(
            nline.n2p(56) + DOWN * 1.0,
            nline.n2p(52) + DOWN * 1.0,
            buff=0, color=GREEN, stroke_width=2,
            max_tip_length_to_length_ratio=0.2,
        )
        shrink_label = Text("Smaller ME = narrower interval", font_size=20, color=GREEN)
        shrink_label.next_to(VGroup(arrow_left, arrow_right), DOWN, buff=0.15)

        self.play(
            Create(arrow_left), Create(arrow_right),
            FadeIn(shrink_label),
            run_time=0.8,
        )
        self.wait(0.3)

        # --- Takeaway (13-15s) ---
        takeaway = Text(
            "ME = critical value times standard error; controls interval width",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
