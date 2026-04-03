"""
rv-mean: Expected Value (μ_X) = Σ x_i · P(x_i)
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class RvMeanScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Expected Value of a Random Variable", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Probability table
        x_vals = [1, 2, 3, 4, 5]
        p_vals = [0.10, 0.20, 0.30, 0.25, 0.15]

        header = VGroup(
            Text("x", font_size=28, color=BLUE_ACCENT),
            Text("P(x)", font_size=28, color=BLUE_ACCENT),
        ).arrange(RIGHT, buff=1.8)

        rows = VGroup()
        for x, p in zip(x_vals, p_vals):
            row = VGroup(
                MathTex(str(x), font_size=30, color=SOFT_WHITE),
                MathTex(f"{p:.2f}", font_size=30, color=SOFT_WHITE),
            ).arrange(RIGHT, buff=1.5)
            rows.add(row)
        rows.arrange(DOWN, buff=0.25)

        table_group = VGroup(header, rows).arrange(DOWN, buff=0.35)
        table_group.move_to(LEFT * 3.2 + UP * 0.3)

        self.play(FadeIn(header), run_time=0.5)
        self.play(LaggedStart(*[FadeIn(r) for r in rows], lag_ratio=0.12), run_time=1.0)
        self.wait(0.4)

        # Formula
        formula = MathTex(
            r"\mu_X", "=", r"\sum", r"x_i", r"\cdot", r"P(x_i)",
            font_size=40, color=SOFT_WHITE,
        )
        formula.move_to(RIGHT * 2.5 + UP * 1.8)
        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # Step-by-step weighted sum
        products = []
        for x, p in zip(x_vals, p_vals):
            products.append(f"{x}({p:.2f})")
        sum_str = " + ".join(products)

        calc_line = MathTex(
            r"=\;" + sum_str,
            font_size=28, color=SOFT_WHITE,
        )
        calc_line.next_to(formula, DOWN, buff=0.5).align_to(formula, LEFT)
        self.play(Write(calc_line), run_time=1.5)
        self.wait(0.3)

        # Result
        mu = sum(x * p for x, p in zip(x_vals, p_vals))
        result = MathTex(
            rf"= {mu:.2f}",
            font_size=40, color=GOLD,
        )
        result.next_to(calc_line, DOWN, buff=0.4).align_to(formula, LEFT)
        self.play(Write(result), run_time=0.8)
        self.wait(0.4)

        # Highlight the mean on a simple bar chart
        bar = BarChart(
            values=p_vals,
            bar_names=[str(v) for v in x_vals],
            y_range=[0, 0.35, 0.1],
            x_length=5,
            y_length=2.2,
            bar_colors=[BLUE_ACCENT] * 5,
            bar_width=0.5,
        )
        bar.move_to(DOWN * 1.8 + RIGHT * 1.5)
        bar_label = Text("P(x)", font_size=18, color=GREY_B).next_to(bar, UP, buff=0.15)

        self.play(FadeIn(bar), FadeIn(bar_label), run_time=1.0)

        # Mean line
        x_axis_start = bar.x_axis.n2p(0)[0]
        x_axis_end = bar.x_axis.n2p(4)[0]
        frac = (mu - x_vals[0]) / (x_vals[-1] - x_vals[0])
        mean_x = x_axis_start + frac * (x_axis_end - x_axis_start)
        mean_line = DashedLine(
            start=[mean_x, bar.y_axis.n2p(0)[1] - 0.1, 0],
            end=[mean_x, bar.y_axis.n2p(0.35)[1], 0],
            color=GOLD, dash_length=0.08,
        )
        mu_label = MathTex(r"\mu_X", font_size=24, color=GOLD).next_to(mean_line, UP, buff=0.1)
        self.play(Create(mean_line), FadeIn(mu_label), run_time=0.8)
        self.wait(0.4)

        # Takeaway
        takeaway = Text(
            "The expected value is the probability-weighted average of all outcomes.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.35)
        self.play(FadeIn(takeaway), run_time=0.7)
        self.wait(1.5)
