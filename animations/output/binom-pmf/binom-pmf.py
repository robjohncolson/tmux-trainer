"""
binom-pmf: Binomial Probability  P(X=x) = C(n,x) p^x (1-p)^(n-x)
Manim Community Edition v0.19 — 720p30, ~16 seconds
"""
from manim import *
from math import comb

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class BinomPmfScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Binomial Probability", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Parameters
        n, p = 10, 0.3
        param_text = MathTex(
            rf"n = {n}, \quad p = {p}",
            font_size=30, color=BLUE_ACCENT,
        )
        param_text.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(param_text), run_time=0.4)

        # Formula — step by step
        f1 = MathTex(r"P(X = x)", font_size=40, color=SOFT_WHITE)
        f2 = MathTex(r"= \binom{n}{x}", font_size=40, color=SOFT_WHITE)
        f3 = MathTex(r"\cdot \; p^x", font_size=40, color=SOFT_WHITE)
        f4 = MathTex(r"\cdot \; (1-p)^{n-x}", font_size=40, color=SOFT_WHITE)

        formula_parts = VGroup(f1, f2, f3, f4).arrange(RIGHT, buff=0.15)
        formula_parts.move_to(UP * 0.7)

        self.play(Write(f1), run_time=0.6)
        self.play(Write(f2), run_time=0.6)
        self.play(Write(f3), run_time=0.5)
        self.play(Write(f4), run_time=0.5)
        self.wait(0.3)

        # Concrete example: P(X=3)
        px3 = comb(n, 3) * p**3 * (1 - p)**7
        example = MathTex(
            rf"P(X=3) = \binom{{10}}{{3}} \cdot 0.3^3 \cdot 0.7^7 = {px3:.4f}",
            font_size=28, color=SOFT_WHITE,
        )
        example.next_to(formula_parts, DOWN, buff=0.45)
        self.play(Write(example), run_time=1.2)
        self.wait(0.3)

        # Bar chart of full distribution
        pmf_vals = [comb(n, k) * p**k * (1 - p)**(n - k) for k in range(n + 1)]
        bar_colors = [BLUE_ACCENT if k != 3 else GOLD for k in range(n + 1)]

        bar = BarChart(
            values=pmf_vals,
            bar_names=[str(k) for k in range(n + 1)],
            y_range=[0, 0.30, 0.10],
            x_length=9, y_length=2.5,
            bar_colors=bar_colors,
            bar_width=0.55,
        )
        bar.move_to(DOWN * 1.6)

        x_label = Text("x", font_size=20, color=GREY_B).next_to(bar.x_axis, DOWN, buff=0.05)
        y_label = Text("P(X=x)", font_size=18, color=GREY_B).next_to(bar.y_axis, LEFT, buff=0.1)

        self.play(FadeIn(bar), FadeIn(x_label), FadeIn(y_label), run_time=1.2)
        self.wait(0.4)

        # Highlight x=3 bar
        arrow = Arrow(
            start=bar.bars[3].get_top() + UP * 0.6,
            end=bar.bars[3].get_top() + UP * 0.05,
            color=GOLD, stroke_width=3, tip_length=0.15,
        )
        self.play(Create(arrow), run_time=0.5)
        self.wait(0.4)

        # Takeaway
        takeaway = Text(
            "The binomial PMF counts successes in n independent trials.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
