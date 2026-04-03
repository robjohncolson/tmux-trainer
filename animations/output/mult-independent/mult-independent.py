"""
Multiplication Rule (Independent): P(A ∩ B) = P(A) · P(B)
Manim Community Edition v0.19 — 720p30, ~15 seconds
Two independent events shown as separate, non-overlapping probability bars.
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class MultIndependentScene(Scene):
    def construct(self):
        # ── Title ──
        title = Text("Multiplication Rule (Independent)", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # ── Two separate events shown as probability bars ──
        # Event A bar
        bar_a_bg = Rectangle(width=4, height=0.6, color=GREY_B, fill_opacity=0.15, stroke_width=1.5)
        bar_a_fill = Rectangle(width=2.4, height=0.6, color=BLUE_ACCENT, fill_opacity=0.45, stroke_width=0)
        bar_a_fill.align_to(bar_a_bg, LEFT)

        bar_a = VGroup(bar_a_bg, bar_a_fill)
        lbl_a = Text("Event A", font_size=22, color=BLUE_ACCENT)
        pa_val = MathTex(r"P(A) = 0.6", font_size=24, color=BLUE_ACCENT)

        # Event B bar
        bar_b_bg = Rectangle(width=4, height=0.6, color=GREY_B, fill_opacity=0.15, stroke_width=1.5)
        bar_b_fill = Rectangle(width=2.0, height=0.6, color=RED_B, fill_opacity=0.45, stroke_width=0)
        bar_b_fill.align_to(bar_b_bg, LEFT)

        bar_b = VGroup(bar_b_bg, bar_b_fill)
        lbl_b = Text("Event B", font_size=22, color=RED_B)
        pb_val = MathTex(r"P(B) = 0.5", font_size=24, color=RED_B)

        # Arrange
        bar_a.move_to(UP * 1.2 + LEFT * 0.5)
        lbl_a.next_to(bar_a, LEFT, buff=0.3)
        pa_val.next_to(bar_a, RIGHT, buff=0.3)

        bar_b.move_to(UP * 0.1 + LEFT * 0.5)
        lbl_b.next_to(bar_b, LEFT, buff=0.3)
        pb_val.next_to(bar_b, RIGHT, buff=0.3)

        self.play(
            Create(bar_a_bg), FadeIn(lbl_a),
            Create(bar_b_bg), FadeIn(lbl_b),
            run_time=0.8,
        )
        self.play(
            FadeIn(bar_a_fill), Write(pa_val),
            FadeIn(bar_b_fill), Write(pb_val),
            run_time=0.8,
        )

        # ── Independence callout ──
        indep_text = Text("A and B are independent", font_size=24, color=GREY_B)
        indep_text.next_to(bar_b, DOWN, buff=0.4)
        arrow_sym = MathTex(r"\Longrightarrow", font_size=36, color=GREY_B)
        meaning = MathTex(r"P(B|A) = P(B)", font_size=26, color=GREY_B)
        indep_line = VGroup(indep_text, arrow_sym, meaning).arrange(RIGHT, buff=0.25)
        indep_line.next_to(bar_b, DOWN, buff=0.45)

        self.play(FadeIn(indep_line), run_time=0.8)
        self.wait(0.3)

        # ── Combined probability area model ──
        area_width = 2.4   # proportional to P(A)=0.6 on a 4-wide scale
        area_height = 1.2   # proportional to P(B)=0.5 on a 2.4-tall scale

        area_rect = Rectangle(
            width=area_width, height=area_height,
            color=GOLD, fill_opacity=0.40, stroke_width=2,
        )
        area_rect.next_to(indep_line, DOWN, buff=0.45)
        area_label = MathTex(r"P(A \cap B) = 0.30", font_size=26, color=GOLD)
        area_label.next_to(area_rect, RIGHT, buff=0.25)

        self.play(Create(area_rect), run_time=0.6)
        self.play(Write(area_label), run_time=0.5)

        # ── Formula ──
        f1 = MathTex(r"P(A \cap B)", font_size=42, color=SOFT_WHITE)
        f2 = MathTex(r"= P(A) \cdot P(B)", font_size=42, color=GOLD)
        formula = VGroup(f1, f2).arrange(RIGHT, buff=0.15)
        formula.to_edge(DOWN, buff=1.2)

        self.play(Write(f1), run_time=0.7)
        self.play(Write(f2), run_time=0.7)

        # ── Takeaway ──
        takeaway = Text(
            "When events don't affect each other, just multiply.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
