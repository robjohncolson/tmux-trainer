"""
Addition Rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class AddRuleScene(Scene):
    def construct(self):
        # ── Title ──
        title = Text("Addition Rule", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # ── Venn diagram ──
        circle_a = Circle(radius=1.3, color=BLUE_ACCENT, fill_opacity=0.30)
        circle_b = Circle(radius=1.3, color=RED_B, fill_opacity=0.30)
        circle_a.shift(LEFT * 0.8)
        circle_b.shift(RIGHT * 0.8)

        label_a = Text("A", font_size=28, color=BLUE_ACCENT).next_to(circle_a, LEFT, buff=0.15)
        label_b = Text("B", font_size=28, color=RED_B).next_to(circle_b, RIGHT, buff=0.15)

        venn = VGroup(circle_a, circle_b, label_a, label_b)
        venn.move_to(ORIGIN).shift(UP * 0.3)

        self.play(Create(circle_a), Create(circle_b), FadeIn(label_a), FadeIn(label_b), run_time=1.2)

        # ── Highlight P(A) ──
        highlight_a = circle_a.copy().set_fill(BLUE_ACCENT, opacity=0.55).set_stroke(width=0)
        self.play(FadeIn(highlight_a), run_time=0.5)
        self.play(FadeOut(highlight_a), run_time=0.3)

        # ── Highlight P(B) ──
        highlight_b = circle_b.copy().set_fill(RED_B, opacity=0.55).set_stroke(width=0)
        self.play(FadeIn(highlight_b), run_time=0.5)
        self.play(FadeOut(highlight_b), run_time=0.3)

        # ── Highlight intersection ──
        intersection = Intersection(circle_a, circle_b, color=GOLD, fill_opacity=0.6, stroke_width=0)
        self.play(FadeIn(intersection), run_time=0.6)

        overlap_label = Text("A ∩ B", font_size=20, color=GOLD)
        overlap_label.move_to(intersection.get_center())
        self.play(FadeIn(overlap_label), run_time=0.4)

        # ── Shift Venn up, show formula ──
        venn_group = VGroup(circle_a, circle_b, label_a, label_b, intersection, overlap_label)
        self.play(venn_group.animate.shift(UP * 0.4), run_time=0.5)

        # ── Step-by-step formula ──
        f1 = MathTex(r"P(A \cup B)", font_size=40, color=SOFT_WHITE)
        f2 = MathTex(r"= P(A) + P(B)", font_size=40, color=SOFT_WHITE)
        f3 = MathTex(r"- P(A \cap B)", font_size=40, color=GOLD)

        formula = VGroup(f1, f2, f3).arrange(RIGHT, buff=0.15)
        formula.next_to(venn_group, DOWN, buff=0.6)

        self.play(Write(f1), run_time=0.8)
        self.play(Write(f2), run_time=0.8)
        self.play(Write(f3), run_time=0.8)

        # ── Highlight union ──
        union = Union(circle_a, circle_b, color=BLUE_ACCENT, fill_opacity=0.35, stroke_width=2)
        self.play(FadeIn(union), run_time=0.6)
        self.wait(0.4)
        self.play(FadeOut(union), run_time=0.4)

        # ── Takeaway ──
        takeaway = Text(
            "Subtract the overlap so you don't count it twice.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.5)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
