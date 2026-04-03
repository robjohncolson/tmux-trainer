"""
geom-sd: Geometric SD  σ_X = √(1-p) / p
Manim Community Edition v0.19 — 720p30, ~14 seconds
"""
from manim import *
from math import sqrt

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class GeomSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Geometric Standard Deviation", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Formula
        formula = MathTex(
            r"\sigma_X", "=", r"\frac{\sqrt{1 - p}}{p}",
            font_size=48, color=SOFT_WHITE,
        )
        formula.move_to(UP * 1.5)
        self.play(Write(formula), run_time=1.0)
        self.wait(0.3)

        # Concrete example
        p = 0.25
        mu = 1 / p
        sd = sqrt(1 - p) / p

        sub = MathTex(
            rf"= \frac{{\sqrt{{1 - {p}}}}}{{{p}}} = \frac{{\sqrt{{{1 - p}}}}}{{{p}}} = {sd:.2f}",
            font_size=34, color=SOFT_WHITE,
        )
        sub.next_to(formula, DOWN, buff=0.4)
        param_text = MathTex(
            rf"p = {p}", font_size=28, color=BLUE_ACCENT,
        ).next_to(sub, LEFT, buff=0.8)

        self.play(FadeIn(param_text), Write(sub), run_time=1.0)
        self.wait(0.3)

        # Result highlighted
        result = MathTex(
            rf"\sigma_X = {sd:.2f}", font_size=40, color=GOLD,
        )
        result.next_to(sub, DOWN, buff=0.4)
        self.play(Write(result), run_time=0.7)
        self.wait(0.3)

        # Bar chart with spread visualization
        num_bars = 12
        geom_vals = [(1 - p)**(k - 1) * p for k in range(1, num_bars + 1)]

        bar = BarChart(
            values=geom_vals,
            bar_names=[str(k) for k in range(1, num_bars + 1)],
            y_range=[0, 0.30, 0.10],
            x_length=9, y_length=2.2,
            bar_colors=[BLUE_ACCENT] * num_bars,
            bar_width=0.5,
        )
        bar.move_to(DOWN * 1.6)

        self.play(FadeIn(bar), run_time=0.8)

        # Mean and SD markers
        x_left = bar.bars[0].get_center()[0]
        x_right = bar.bars[num_bars - 1].get_center()[0]
        bar_spacing = (x_right - x_left) / (num_bars - 1)

        mean_x = x_left + (mu - 1) * bar_spacing
        y_bot = bar.y_axis.n2p(0)[1]
        y_top = bar.y_axis.n2p(0.30)[1]

        mean_line = DashedLine(
            [mean_x, y_bot - 0.1, 0], [mean_x, y_top, 0],
            color=GOLD, dash_length=0.08,
        )
        self.play(Create(mean_line), run_time=0.5)

        # SD bracket
        lo_x = mean_x - sd * bar_spacing
        hi_x = mean_x + sd * bar_spacing
        bracket_y = y_bot - 0.2

        sd_arrow = DoubleArrow(
            [lo_x, bracket_y, 0], [hi_x, bracket_y, 0],
            color="#FF6B6B", buff=0, tip_length=0.1, stroke_width=2.5,
        )
        sd_lbl = MathTex(
            rf"\sigma = {sd:.2f}", font_size=20, color="#FF6B6B",
        ).next_to(sd_arrow, DOWN, buff=0.05)

        self.play(Create(sd_arrow), FadeIn(sd_lbl), run_time=0.7)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "Geometric distributions are right-skewed; SD captures that spread.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
