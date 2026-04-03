"""
General Multiplication Rule: P(A ∩ B) = P(A) · P(B|A)
Manim Community Edition v0.19 — 720p30, ~16 seconds
Tree diagram approach.
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class MultRuleScene(Scene):
    def construct(self):
        # ── Title ──
        title = Text("General Multiplication Rule", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # ── Tree diagram ──
        root = Dot(point=LEFT * 4.5 + UP * 0.3, radius=0.06, color=SOFT_WHITE)

        # First branch: A vs A^C
        node_a = Dot(point=LEFT * 1.5 + UP * 1.5, radius=0.06, color=BLUE_ACCENT)
        node_ac = Dot(point=LEFT * 1.5 + DOWN * 1.0, radius=0.06, color=GREY_B)

        line_a = Line(root.get_center(), node_a.get_center(), color=BLUE_ACCENT, stroke_width=2.5)
        line_ac = Line(root.get_center(), node_ac.get_center(), color=GREY_B, stroke_width=1.5)

        lbl_pa = MathTex(r"P(A)", font_size=24, color=BLUE_ACCENT)
        lbl_pa.next_to(line_a, UP, buff=0.08).shift(LEFT * 0.3)

        lbl_pac = MathTex(r"P(A^C)", font_size=22, color=GREY_B)
        lbl_pac.next_to(line_ac, DOWN, buff=0.08).shift(LEFT * 0.3)

        lbl_a = Text("A", font_size=22, color=BLUE_ACCENT).next_to(node_a, UP, buff=0.1)
        lbl_ac = MathTex(r"A^C", font_size=22, color=GREY_B).next_to(node_ac, DOWN, buff=0.1)

        self.play(FadeIn(root), run_time=0.3)
        self.play(
            Create(line_a), Create(line_ac),
            FadeIn(node_a), FadeIn(node_ac),
            FadeIn(lbl_pa), FadeIn(lbl_pac),
            FadeIn(lbl_a), FadeIn(lbl_ac),
            run_time=1.2,
        )

        # Second branch from A: B|A vs B^C|A
        node_b = Dot(point=RIGHT * 1.8 + UP * 2.3, radius=0.06, color=GOLD)
        node_bc = Dot(point=RIGHT * 1.8 + UP * 0.7, radius=0.06, color=GREY_B)

        line_b = Line(node_a.get_center(), node_b.get_center(), color=GOLD, stroke_width=2.5)
        line_bc = Line(node_a.get_center(), node_bc.get_center(), color=GREY_B, stroke_width=1.5)

        lbl_pba = MathTex(r"P(B|A)", font_size=24, color=GOLD)
        lbl_pba.next_to(line_b, UP, buff=0.08).shift(LEFT * 0.2)

        lbl_pbca = MathTex(r"P(B^C|A)", font_size=22, color=GREY_B)
        lbl_pbca.next_to(line_bc, DOWN, buff=0.08).shift(LEFT * 0.2)

        outcome_ab = MathTex(r"A \cap B", font_size=24, color=GOLD)
        outcome_ab.next_to(node_b, RIGHT, buff=0.15)

        self.play(
            Create(line_b), Create(line_bc),
            FadeIn(node_b), FadeIn(node_bc),
            FadeIn(lbl_pba), FadeIn(lbl_pbca),
            run_time=1.2,
        )
        self.play(FadeIn(outcome_ab), run_time=0.5)

        # ── Highlight the A→B path ──
        path_highlight_1 = line_a.copy().set_color(GOLD).set_stroke(width=5)
        path_highlight_2 = line_b.copy().set_color(GOLD).set_stroke(width=5)
        self.play(Create(path_highlight_1), run_time=0.4)
        self.play(Create(path_highlight_2), run_time=0.4)

        # Dim the rest
        dim_group = VGroup(line_ac, node_ac, lbl_pac, lbl_ac, line_bc, node_bc, lbl_pbca)
        self.play(dim_group.animate.set_opacity(0.25), run_time=0.4)

        # ── Formula ──
        f1 = MathTex(r"P(A \cap B)", font_size=42, color=SOFT_WHITE)
        f2 = MathTex(r"= P(A)", font_size=42, color=BLUE_ACCENT)
        f3 = MathTex(r"\cdot P(B|A)", font_size=42, color=GOLD)

        formula = VGroup(f1, f2, f3).arrange(RIGHT, buff=0.15)
        formula.to_edge(DOWN, buff=1.3)

        self.play(Write(f1), run_time=0.7)
        self.play(Write(f2), run_time=0.7)
        self.play(Write(f3), run_time=0.7)

        # ── Takeaway ──
        takeaway = Text(
            "Multiply along the branches of a tree diagram.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
