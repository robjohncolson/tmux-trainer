"""
Complement Rule: P(E^C) = 1 - P(E)
Manim Community Edition v0.19 — 720p30, ~14 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class ComplementScene(Scene):
    def construct(self):
        # ── Title ──
        title = Text("Complement Rule", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # ── Sample space rectangle ──
        sample_space = Rectangle(
            width=5.5, height=3.0, color=GREY_B, fill_opacity=0.08, stroke_width=2,
        )
        sample_space.shift(UP * 0.15)
        s_label = Text("S  (whole = 1)", font_size=20, color=GREY_B)
        s_label.next_to(sample_space, UP, buff=0.15)

        self.play(Create(sample_space), FadeIn(s_label), run_time=0.8)

        # ── Event circle E ──
        event_circle = Circle(radius=1.0, color=BLUE_ACCENT, fill_opacity=0.35, stroke_width=2)
        event_circle.move_to(sample_space.get_center() + LEFT * 0.6)

        e_label = Text("E", font_size=26, color=BLUE_ACCENT)
        e_label.move_to(event_circle.get_center())

        self.play(Create(event_circle), FadeIn(e_label), run_time=0.8)

        # ── Label complement region ──
        ec_label = MathTex(r"E^C", font_size=30, color=RED_B)
        ec_label.move_to(sample_space.get_center() + RIGHT * 1.5 + UP * 0.0)

        self.play(FadeIn(ec_label), run_time=0.5)

        # ── Highlight the complement ──
        # Fill the rectangle, then "cut out" the event
        complement_fill = Difference(
            sample_space.copy().set_fill(RED_B, opacity=0.30).set_stroke(width=0),
            event_circle.copy(),
            color=RED_B, fill_opacity=0.30, stroke_width=0,
        )
        self.play(FadeIn(complement_fill), run_time=0.7)
        self.wait(0.3)

        # ── Shift visual up ──
        visual = VGroup(sample_space, s_label, event_circle, e_label, ec_label, complement_fill)
        self.play(visual.animate.shift(UP * 0.3), run_time=0.4)

        # ── Formula step-by-step ──
        line1 = MathTex(r"P(E) + P(E^C) = 1", font_size=40, color=SOFT_WHITE)
        line1.next_to(visual, DOWN, buff=0.5)
        self.play(Write(line1), run_time=1.0)

        arrow = MathTex(r"\Longrightarrow", font_size=40, color=GREY_B)
        arrow.next_to(line1, DOWN, buff=0.25)

        line2 = MathTex(r"P(E^C) = 1 - P(E)", font_size=42, color=GOLD)
        line2.next_to(arrow, DOWN, buff=0.25)

        self.play(Write(arrow), run_time=0.4)
        self.play(Write(line2), run_time=1.0)

        # ── Takeaway ──
        takeaway = Text(
            'Sometimes it\'s easier to find what you DON\'T want.',
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
