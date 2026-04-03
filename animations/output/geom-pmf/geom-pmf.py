"""
geom-pmf: Geometric Probability  P(X=x) = (1-p)^(x-1) · p
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class GeomPmfScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Geometric Probability", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Parameters
        p = 0.25
        param_text = MathTex(
            rf"p = {p}", font_size=30, color=BLUE_ACCENT,
        )
        param_text.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(param_text), run_time=0.4)

        # Formula build
        f_lhs = MathTex(r"P(X = x)", font_size=42, color=SOFT_WHITE)
        f_eq = MathTex(r"=", font_size=42, color=SOFT_WHITE)
        f_fail = MathTex(r"(1 - p)^{x-1}", font_size=42, color=SOFT_WHITE)
        f_dot = MathTex(r"\cdot", font_size=42, color=SOFT_WHITE)
        f_succ = MathTex(r"p", font_size=42, color=SOFT_WHITE)

        formula = VGroup(f_lhs, f_eq, f_fail, f_dot, f_succ).arrange(RIGHT, buff=0.15)
        formula.move_to(UP * 0.9)

        self.play(Write(f_lhs), run_time=0.5)
        self.play(Write(f_eq), run_time=0.3)

        # Highlight failures then success
        fail_box = SurroundingRectangle(f_fail, color="#FF6B6B", buff=0.08, stroke_width=2)
        fail_lbl = Text("x - 1 failures", font_size=18, color="#FF6B6B").next_to(fail_box, UP, buff=0.08)
        self.play(Write(f_fail), Create(fail_box), FadeIn(fail_lbl), run_time=0.8)

        succ_box = SurroundingRectangle(f_succ, color="#77DD77", buff=0.08, stroke_width=2)
        succ_lbl = Text("1st success", font_size=18, color="#77DD77").next_to(succ_box, UP, buff=0.08)
        self.play(
            Write(f_dot), Write(f_succ),
            Create(succ_box), FadeIn(succ_lbl),
            run_time=0.7,
        )
        self.wait(0.4)

        # Fade annotations
        self.play(
            FadeOut(fail_box), FadeOut(fail_lbl),
            FadeOut(succ_box), FadeOut(succ_lbl),
            run_time=0.4,
        )

        # Concrete example: P(X=3)
        px3 = (1 - p)**2 * p
        example = MathTex(
            rf"P(X=3) = (0.75)^2 \cdot 0.25 = {px3:.4f}",
            font_size=28, color=SOFT_WHITE,
        )
        example.next_to(formula, DOWN, buff=0.5)
        self.play(Write(example), run_time=0.9)
        self.wait(0.3)

        # Bar chart — decreasing geometric distribution
        num_bars = 10
        geom_vals = [(1 - p)**(k - 1) * p for k in range(1, num_bars + 1)]

        bar = BarChart(
            values=geom_vals,
            bar_names=[str(k) for k in range(1, num_bars + 1)],
            y_range=[0, 0.30, 0.10],
            x_length=8.5, y_length=2.5,
            bar_colors=[BLUE_ACCENT] * num_bars,
            bar_width=0.55,
        )
        bar.move_to(DOWN * 1.6)

        x_label = Text("Trial of first success", font_size=18, color=GREY_B)
        x_label.next_to(bar.x_axis, DOWN, buff=0.15)

        self.play(FadeIn(bar), FadeIn(x_label), run_time=1.0)

        # Highlight x=3 bar
        bar.bars[2].set_color(GOLD)
        self.play(bar.bars[2].animate.set_color(GOLD), run_time=0.4)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "Each additional trial is less likely to be the first success.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
