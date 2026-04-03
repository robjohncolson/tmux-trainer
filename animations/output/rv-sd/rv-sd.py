"""
rv-sd: Spread of a Random Variable  σ_X = √(Σ(x_i - μ)² · P(x_i))
Manim Community Edition v0.19 — 720p30, ~16 seconds
"""
from manim import *
import math

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class RvSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Standard Deviation of a Random Variable", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Data
        x_vals = [1, 2, 3, 4, 5]
        p_vals = [0.10, 0.20, 0.30, 0.25, 0.15]
        mu = sum(x * p for x, p in zip(x_vals, p_vals))

        # Mean reference
        mean_text = MathTex(
            rf"\mu_X = {mu:.2f}", font_size=32, color=BLUE_ACCENT,
        )
        mean_text.move_to(UP * 1.8 + LEFT * 3.5)
        self.play(FadeIn(mean_text), run_time=0.5)

        # Formula build
        formula_var = MathTex(
            r"\sigma_X^2", "=", r"\sum", r"(x_i - \mu)^2", r"\cdot", r"P(x_i)",
            font_size=38, color=SOFT_WHITE,
        )
        formula_var.move_to(UP * 0.8)
        self.play(Write(formula_var), run_time=1.2)
        self.wait(0.3)

        # Show each deviation squared times probability
        dev_lines = VGroup()
        for x, p in zip(x_vals, p_vals):
            dev = x - mu
            line = MathTex(
                rf"({x} - {mu:.2f})^2 \cdot {p:.2f} = {dev**2 * p:.4f}",
                font_size=24, color=SOFT_WHITE,
            )
            dev_lines.add(line)
        dev_lines.arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        dev_lines.move_to(LEFT * 2.5 + DOWN * 0.8)

        self.play(
            LaggedStart(*[FadeIn(d) for d in dev_lines], lag_ratio=0.15),
            run_time=1.8,
        )
        self.wait(0.3)

        # Sum = variance
        variance = sum((x - mu) ** 2 * p for x, p in zip(x_vals, p_vals))
        sd = math.sqrt(variance)

        var_result = MathTex(
            rf"\sigma_X^2 = {variance:.4f}",
            font_size=34, color=SOFT_WHITE,
        )
        var_result.move_to(RIGHT * 2.8 + DOWN * 0.2)
        self.play(Write(var_result), run_time=0.8)
        self.wait(0.3)

        # Square root for SD
        sd_formula = MathTex(
            r"\sigma_X", "=", r"\sqrt{\sigma_X^2}",
            font_size=38, color=SOFT_WHITE,
        )
        sd_formula.move_to(RIGHT * 2.8 + DOWN * 1.0)
        self.play(Write(sd_formula), run_time=0.8)

        sd_result = MathTex(
            rf"\sigma_X = {sd:.4f}",
            font_size=38, color=GOLD,
        )
        sd_result.move_to(RIGHT * 2.8 + DOWN * 1.8)
        self.play(Write(sd_result), run_time=0.8)
        self.wait(0.3)

        # Visual: bar chart with spread arrows
        bar = BarChart(
            values=p_vals,
            bar_names=[str(v) for v in x_vals],
            y_range=[0, 0.35, 0.1],
            x_length=4.5, y_length=1.6,
            bar_colors=[BLUE_ACCENT] * 5,
            bar_width=0.45,
        )
        bar.move_to(DOWN * 2.8 + LEFT * 0.5)

        self.play(FadeIn(bar), run_time=0.7)

        # Spread bracket
        x_start = bar.x_axis.n2p(0)[0]
        x_end = bar.x_axis.n2p(4)[0]
        frac_lo = (mu - sd - 1) / 4
        frac_hi = (mu + sd - 1) / 4
        lo_x = x_start + frac_lo * (x_end - x_start)
        hi_x = x_start + frac_hi * (x_end - x_start)
        bracket_y = bar.y_axis.n2p(0)[1] - 0.25

        bracket = DoubleArrow(
            start=[lo_x, bracket_y, 0],
            end=[hi_x, bracket_y, 0],
            color=GOLD, buff=0, tip_length=0.12,
            stroke_width=2,
        )
        sd_label = MathTex(r"\sigma_X", font_size=22, color=GOLD).next_to(bracket, DOWN, buff=0.08)
        self.play(Create(bracket), FadeIn(sd_label), run_time=0.7)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "σ_X measures how far outcomes typically fall from the mean.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.25)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
