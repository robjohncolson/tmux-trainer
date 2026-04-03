"""
Degrees of Freedom (Goodness of Fit): df = k - 1
Shows k categories and explains why one is determined by the rest.
Manim Community v0.19 | 720p30 | ~14 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"


class DfGofScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Degrees of Freedom (Goodness of Fit)", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Formula
        formula = MathTex(
            r"df", r"=", r"k", r"-", r"1",
            font_size=48, color=SOFT_WHITE,
        )
        formula.next_to(title, DOWN, buff=0.45)
        self.play(Write(formula), run_time=0.8)

        # Show k = 4 categories as boxes
        k_label = MathTex(r"k = 4 \text{ categories}", font_size=28, color=BLUE_ACCENT)
        k_label.next_to(formula, DOWN, buff=0.5)
        self.play(FadeIn(k_label), run_time=0.4)

        cats = ["A", "B", "C", "D"]
        boxes = VGroup()
        for cat in cats:
            box = VGroup(
                Square(side_length=0.9, color=BLUE_ACCENT, stroke_width=2),
                Text(cat, font_size=24, color=SOFT_WHITE),
            )
            box[1].move_to(box[0])
            boxes.add(box)

        boxes.arrange(RIGHT, buff=0.4)
        boxes.next_to(k_label, DOWN, buff=0.5)
        self.play(
            *[FadeIn(b, shift=UP * 0.2) for b in boxes],
            run_time=0.7,
        )
        self.wait(0.3)

        # Label first 3 as "free"
        free_label = Text("free to vary", font_size=18, color=BLUE_ACCENT)
        free_brace = Brace(VGroup(boxes[0], boxes[1], boxes[2]), DOWN, color=BLUE_ACCENT)
        free_label.next_to(free_brace, DOWN, buff=0.1)
        self.play(Create(free_brace), FadeIn(free_label), run_time=0.6)

        # Highlight last box as "determined"
        det_box = SurroundingRectangle(boxes[3], color=RED, buff=0.08, stroke_width=2.5)
        det_label = Text("determined", font_size=18, color=RED)
        det_label.next_to(boxes[3], DOWN, buff=0.35)
        self.play(Create(det_box), FadeIn(det_label), run_time=0.6)
        self.wait(0.3)

        # Explanation
        explain = Text(
            "Proportions must sum to 1, so the last is fixed",
            font_size=22, color=SOFT_WHITE,
        )
        explain.next_to(det_label, DOWN, buff=0.45)
        self.play(FadeIn(explain), run_time=0.5)

        # Show result
        result = MathTex(
            r"df", r"=", r"4", r"-", r"1", r"=", r"3",
            font_size=38, color=SOFT_WHITE,
        )
        result[-1].set_color(RED)
        result.next_to(explain, DOWN, buff=0.4)
        self.play(Write(result), run_time=0.7)
        self.wait(0.4)

        # Takeaway
        takeaway = Text(
            "More categories \u2192 more degrees of freedom \u2192 wider \u03c7\u00b2 distribution",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
