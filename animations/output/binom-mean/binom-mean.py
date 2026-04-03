"""
binom-mean: Binomial Mean  μ_X = np
Manim Community Edition v0.19 — 720p30, ~14 seconds
"""
from manim import *
from math import comb

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class BinomMeanScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Binomial Mean", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Parameters
        n, p = 20, 0.4
        mu = n * p

        param_text = MathTex(
            rf"n = {n}, \quad p = {p}",
            font_size=30, color=BLUE_ACCENT,
        )
        param_text.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(param_text), run_time=0.4)

        # Formula build
        formula_lhs = MathTex(r"\mu_X", font_size=44, color=SOFT_WHITE)
        formula_eq = MathTex(r"=", font_size=44, color=SOFT_WHITE)
        formula_rhs = MathTex(r"n \cdot p", font_size=44, color=SOFT_WHITE)

        formula = VGroup(formula_lhs, formula_eq, formula_rhs).arrange(RIGHT, buff=0.2)
        formula.move_to(UP * 1.0)

        self.play(Write(formula_lhs), run_time=0.5)
        self.play(Write(formula_eq), Write(formula_rhs), run_time=0.7)
        self.wait(0.3)

        # Substitution
        sub = MathTex(
            rf"= {n} \cdot {p} = {mu:.0f}",
            font_size=40, color=GOLD,
        )
        sub.next_to(formula, DOWN, buff=0.4)
        self.play(Write(sub), run_time=0.8)
        self.wait(0.4)

        # Bar chart with mean line
        pmf = [comb(n, k) * p**k * (1 - p)**(n - k) for k in range(n + 1)]

        bar = BarChart(
            values=pmf,
            bar_names=[str(k) if k % 4 == 0 else "" for k in range(n + 1)],
            y_range=[0, 0.18, 0.05],
            x_length=9, y_length=2.8,
            bar_colors=[BLUE_ACCENT] * (n + 1),
            bar_width=0.35,
        )
        bar.move_to(DOWN * 1.3)

        self.play(FadeIn(bar), run_time=1.0)
        self.wait(0.3)

        # Mean vertical line
        mu_idx = int(mu)
        mean_bar_x = bar.bars[mu_idx].get_center()[0]
        y_bot = bar.y_axis.n2p(0)[1]
        y_top = bar.y_axis.n2p(0.18)[1]

        mean_line = DashedLine(
            start=[mean_bar_x, y_bot - 0.1, 0],
            end=[mean_bar_x, y_top + 0.1, 0],
            color=GOLD, dash_length=0.08,
        )
        mu_label = MathTex(
            rf"\mu = {mu:.0f}", font_size=26, color=GOLD,
        ).next_to(mean_line, UP, buff=0.1)

        self.play(Create(mean_line), FadeIn(mu_label), run_time=0.8)
        self.wait(0.3)

        # Intuition note
        note = Text(
            f"On average, {mu:.0f} successes in {n} trials",
            font_size=24, color=SOFT_WHITE,
        )
        note.next_to(sub, RIGHT, buff=0.8)
        self.play(FadeIn(note), run_time=0.6)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "The center of a binomial distribution is simply n times p.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
