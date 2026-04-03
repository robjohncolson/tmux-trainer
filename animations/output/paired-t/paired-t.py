"""Paired t Statistic: t = (d-bar - mu_d0) / (s_d / sqrt(n))"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class PairedTScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Paired t Statistic", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Show paired data concept
        pair_header = Text("Paired data \u2192 compute differences", font_size=24, color=SOFT_WHITE)
        pair_header.move_to(UP * 2)
        self.play(FadeIn(pair_header), run_time=0.6)

        # Table of pairs
        pairs = VGroup()
        headers = VGroup(
            Text("Before", font_size=20, color=BLUE_ACCENT),
            Text("After", font_size=20, color=RED),
            Text("d", font_size=20, color=GREEN),
        ).arrange(RIGHT, buff=1.0).move_to(UP * 1.2)

        data = [(85, 90, 5), (78, 82, 4), (92, 88, -4), (70, 76, 6)]
        rows = VGroup()
        for i, (b, a, d) in enumerate(data):
            row = VGroup(
                Text(str(b), font_size=18, color=BLUE_ACCENT),
                Text(str(a), font_size=18, color=RED),
                Text(str(d), font_size=18, color=GREEN),
            ).arrange(RIGHT, buff=1.2)
            row.move_to(UP * (0.5 - i * 0.35))
            rows.add(row)

        self.play(FadeIn(headers), run_time=0.5)
        self.play(FadeIn(rows), run_time=0.8)

        # Now it's a one-sample problem on d
        reduce_text = Text("Now treat d\u0305 as a one-sample problem!", font_size=22, color=GOLD)
        reduce_text.next_to(rows, DOWN, buff=0.4)
        self.play(FadeIn(reduce_text), run_time=0.6)

        # Build formula
        formula = MathTex(
            r"t", r"=",
            r"\frac{\bar{d} - \mu_{d_0}}{s_d / \sqrt{n}}",
            font_size=48,
        )
        formula[0].set_color(GOLD)
        formula[2].set_color(SOFT_WHITE)
        formula.move_to(DOWN * 1.0)

        self.play(
            FadeOut(headers), FadeOut(rows), FadeOut(reduce_text),
            Write(formula),
            run_time=1.2,
        )

        # Label components
        num_brace = Brace(formula[2], UP, color=BLUE_ACCENT)
        num_lbl = Text("mean diff \u2212 null diff", font_size=18, color=BLUE_ACCENT)
        num_lbl.next_to(num_brace, UP, buff=0.1)

        den_brace = Brace(formula[2], DOWN, color=GREEN)
        den_lbl = Text("SE of differences", font_size=18, color=GREEN)
        den_lbl.next_to(den_brace, DOWN, buff=0.1)

        self.play(Create(num_brace), FadeIn(num_lbl), run_time=0.6)
        self.play(Create(den_brace), FadeIn(den_lbl), run_time=0.6)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # Note about mu_d0
        note = MathTex(
            r"\text{Usually } \mu_{d_0} = 0",
            font_size=24, color=GREY_B,
        )
        note.next_to(den_lbl, DOWN, buff=0.4)
        self.play(FadeIn(note), run_time=0.5)

        takeaway = Text(
            "Paired t reduces to a one-sample t on the differences.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
