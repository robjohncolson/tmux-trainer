"""
width-ci: CI Width and Sample Size — Width proportional to 1/sqrt(n)
Manim Community Edition v0.19 — 720p30, ~15 seconds
Show interval shrinking as n grows.
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class WidthCiScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("CI Width and Sample Size", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Key relationship (0.8-3s) ---
        relation = MathTex(
            r"\text{Width}", r"\;\propto\;", r"\frac{1}{\sqrt{n}}",
            font_size=42,
        )
        relation[0].set_color(GOLD)
        relation[2].set_color(BLUE_ACCENT)
        relation.move_to(UP * 2.0)

        self.play(Write(relation[:2]), run_time=0.6)
        self.play(Write(relation[2]), run_time=0.6)
        self.wait(0.3)

        detail = MathTex(
            r"\text{Width} = 2 \cdot z^* \cdot \frac{\sigma}{\sqrt{n}}",
            font_size=30, color=SOFT_WHITE,
        )
        detail.next_to(relation, DOWN, buff=0.35)
        self.play(FadeIn(detail, shift=UP * 0.1), run_time=0.6)
        self.wait(0.3)

        # --- Vertical stack showing intervals for different n (3-12s) ---
        # Use sigma=10, z*=1.96 (95% CI), center=50
        sigma = 10.0
        z_star = 1.96
        center = 50.0

        sample_sizes = [10, 25, 50, 100, 400]

        nline = NumberLine(
            x_range=[38, 62, 2], length=10,
            include_numbers=True, font_size=16,
            color=GREY_B,
        ).shift(DOWN * 0.3)

        self.play(
            FadeOut(detail),
            Create(nline),
            run_time=0.6,
        )

        # Center dot
        c_dot = Dot(nline.n2p(center), radius=0.08, color=BLUE_ACCENT)
        self.play(FadeIn(c_dot), run_time=0.3)

        intervals = VGroup()
        n_labels = VGroup()

        for i, n in enumerate(sample_sizes):
            me = z_star * sigma / np.sqrt(n)
            lo = center - me
            hi = center + me
            y_offset = DOWN * (0.6 + i * 0.45)

            left_tick = Line(
                nline.n2p(lo) + y_offset + UP * 0.12,
                nline.n2p(lo) + y_offset + DOWN * 0.12,
                color=GOLD, stroke_width=2.5,
            )
            right_tick = Line(
                nline.n2p(hi) + y_offset + UP * 0.12,
                nline.n2p(hi) + y_offset + DOWN * 0.12,
                color=GOLD, stroke_width=2.5,
            )
            span = Line(
                nline.n2p(lo) + y_offset,
                nline.n2p(hi) + y_offset,
                color=GOLD, stroke_width=2.5,
            )
            center_mark = Dot(
                nline.n2p(center) + y_offset,
                radius=0.05, color=BLUE_ACCENT,
            )

            bracket = VGroup(left_tick, right_tick, span, center_mark)
            intervals.add(bracket)

            label = MathTex(
                f"n = {n}", font_size=20, color=SOFT_WHITE,
            )
            label.next_to(span, LEFT, buff=0.3)
            n_labels.add(label)

            width_val = 2 * me
            w_label = MathTex(
                f"W = {width_val:.1f}", font_size=18, color=GREY_B,
            )
            w_label.next_to(span, RIGHT, buff=0.3)
            n_labels.add(w_label)

        # Animate intervals appearing one by one
        for i in range(len(sample_sizes)):
            bracket_idx = i
            label_idx = i * 2
            self.play(
                Create(intervals[bracket_idx]),
                FadeIn(n_labels[label_idx]),
                FadeIn(n_labels[label_idx + 1]),
                run_time=0.6,
            )
            self.wait(0.15)

        self.wait(0.4)

        # --- Highlight the shrinking pattern (12-14s) ---
        arrow = Arrow(
            intervals[0].get_right() + RIGHT * 1.5,
            intervals[-1].get_right() + RIGHT * 1.5,
            buff=0, color=GREEN, stroke_width=2,
            max_tip_length_to_length_ratio=0.15,
        )
        arrow_label = Text(
            "Larger n = narrower CI",
            font_size=20, color=GREEN,
        )
        arrow_label.next_to(arrow, RIGHT, buff=0.2)

        self.play(Create(arrow), FadeIn(arrow_label), run_time=0.6)
        self.wait(0.3)

        # --- Takeaway (14-16s) ---
        takeaway = Text(
            "Quadruple the sample size to halve the interval width",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
