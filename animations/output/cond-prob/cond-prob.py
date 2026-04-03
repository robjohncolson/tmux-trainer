"""
Conditional Probability: P(A|B) = P(A ∩ B) / P(B)
Manim Community Edition v0.19 — 720p30, ~16 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class CondProbScene(Scene):
    def construct(self):
        # ── Title ──
        title = Text("Conditional Probability", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # ── Sample space rectangle ──
        sample_space = Rectangle(
            width=6, height=3.2, color=GREY_B, fill_opacity=0.08, stroke_width=2,
        )
        sample_space.shift(UP * 0.2)
        s_label = Text("S", font_size=22, color=GREY_B)
        s_label.move_to(sample_space.get_corner(UL) + DR * 0.25)

        # ── Circles ──
        circle_a = Circle(radius=1.1, color=BLUE_ACCENT, fill_opacity=0.25)
        circle_b = Circle(radius=1.1, color=RED_B, fill_opacity=0.25)
        circle_a.shift(LEFT * 0.65 + UP * 0.2)
        circle_b.shift(RIGHT * 0.65 + UP * 0.2)

        label_a = Text("A", font_size=24, color=BLUE_ACCENT).next_to(circle_a, UL, buff=0.05)
        label_b = Text("B", font_size=24, color=RED_B).next_to(circle_b, UR, buff=0.05)

        self.play(
            Create(sample_space), FadeIn(s_label),
            Create(circle_a), Create(circle_b),
            FadeIn(label_a), FadeIn(label_b),
            run_time=1.2,
        )

        # ── Narration: "Given B occurred…" ──
        given_text = Text("Given B occurred…", font_size=24, color=RED_B)
        given_text.next_to(sample_space, DOWN, buff=0.35)
        self.play(FadeIn(given_text), run_time=0.6)

        # ── Dim everything outside B ──
        # Grey-out the sample space, keep B vivid
        dim_overlay = sample_space.copy().set_fill(BLACK, opacity=0.6).set_stroke(width=0)
        b_highlight = circle_b.copy().set_fill(RED_B, opacity=0.35).set_stroke(RED_B, width=3)

        self.play(FadeIn(dim_overlay), run_time=0.5)
        self.play(FadeIn(b_highlight), run_time=0.5)
        self.wait(0.3)

        # ── Highlight intersection ──
        intersection = Intersection(circle_a, circle_b, color=GOLD, fill_opacity=0.55, stroke_width=0)
        int_label = MathTex(r"A \cap B", font_size=24, color=GOLD)
        int_label.move_to(intersection.get_center())

        self.play(FadeIn(intersection), FadeIn(int_label), run_time=0.7)
        self.play(FadeOut(given_text), run_time=0.3)

        # ── Formula step-by-step ──
        f_lhs = MathTex(r"P(A \mid B)", font_size=42, color=SOFT_WHITE)
        f_eq = MathTex(r"=", font_size=42, color=SOFT_WHITE)
        f_num = MathTex(r"\frac{P(A \cap B)}{P(B)}", font_size=42, color=SOFT_WHITE)

        formula = VGroup(f_lhs, f_eq, f_num).arrange(RIGHT, buff=0.2)
        formula.next_to(sample_space, DOWN, buff=0.5)

        self.play(Write(f_lhs), run_time=0.7)
        self.play(Write(f_eq), run_time=0.3)
        self.play(Write(f_num), run_time=0.9)

        # Emphasize numerator/denominator colors
        f_num[0][2:6].set_color(GOLD)       # A ∩ B in numerator
        f_num[0][8:10].set_color(RED_B)      # B in denominator
        self.wait(0.5)

        # ── Takeaway ──
        takeaway = Text(
            "Restrict the sample space to B, then find A within it.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
