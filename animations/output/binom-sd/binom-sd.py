"""
binom-sd: Binomial SD  σ_X = √(np(1-p))
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
from math import comb, sqrt

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class BinomSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Binomial Standard Deviation", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Parameters
        n, p = 20, 0.4
        mu = n * p
        sd = sqrt(n * p * (1 - p))

        param_text = MathTex(
            rf"n = {n}, \quad p = {p}",
            font_size=30, color=BLUE_ACCENT,
        )
        param_text.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(param_text), run_time=0.4)

        # Formula step-by-step
        f_sigma = MathTex(r"\sigma_X", font_size=42, color=SOFT_WHITE)
        f_eq = MathTex(r"=", font_size=42, color=SOFT_WHITE)
        f_body = MathTex(r"\sqrt{n \cdot p \cdot (1 - p)}", font_size=42, color=SOFT_WHITE)

        formula = VGroup(f_sigma, f_eq, f_body).arrange(RIGHT, buff=0.2)
        formula.move_to(UP * 1.0)

        self.play(Write(f_sigma), run_time=0.4)
        self.play(Write(f_eq), Write(f_body), run_time=0.8)
        self.wait(0.3)

        # Substitution
        sub1 = MathTex(
            rf"= \sqrt{{{n} \cdot {p} \cdot {1 - p}}}",
            font_size=36, color=SOFT_WHITE,
        )
        sub1.next_to(formula, DOWN, buff=0.35).align_to(f_eq, LEFT)
        self.play(Write(sub1), run_time=0.7)

        sub2 = MathTex(
            rf"= \sqrt{{{n * p * (1 - p):.1f}}} = {sd:.2f}",
            font_size=36, color=GOLD,
        )
        sub2.next_to(sub1, DOWN, buff=0.3).align_to(f_eq, LEFT)
        self.play(Write(sub2), run_time=0.8)
        self.wait(0.3)

        # Bar chart
        pmf = [comb(n, k) * p**k * (1 - p)**(n - k) for k in range(n + 1)]

        bar = BarChart(
            values=pmf,
            bar_names=[str(k) if k % 4 == 0 else "" for k in range(n + 1)],
            y_range=[0, 0.18, 0.05],
            x_length=9, y_length=2.4,
            bar_colors=[BLUE_ACCENT] * (n + 1),
            bar_width=0.35,
        )
        bar.move_to(DOWN * 1.6)

        self.play(FadeIn(bar), run_time=0.8)

        # Mean line
        x_left = bar.bars[0].get_center()[0]
        x_right = bar.bars[n].get_center()[0]
        bar_spacing = (x_right - x_left) / n

        mean_x = x_left + mu * bar_spacing
        y_bot = bar.y_axis.n2p(0)[1]
        y_top = bar.y_axis.n2p(0.18)[1]

        mean_line = DashedLine(
            [mean_x, y_bot - 0.1, 0], [mean_x, y_top, 0],
            color=GOLD, dash_length=0.08,
        )
        self.play(Create(mean_line), run_time=0.5)

        # SD brackets: μ ± σ
        lo_x = mean_x - sd * bar_spacing
        hi_x = mean_x + sd * bar_spacing
        bracket_y = y_bot - 0.25

        left_arr = DoubleArrow(
            [lo_x, bracket_y, 0], [mean_x, bracket_y, 0],
            color="#FF6B6B", buff=0, tip_length=0.1, stroke_width=2.5,
        )
        right_arr = DoubleArrow(
            [mean_x, bracket_y, 0], [hi_x, bracket_y, 0],
            color="#FF6B6B", buff=0, tip_length=0.1, stroke_width=2.5,
        )
        sd_lbl_l = MathTex(r"\sigma", font_size=20, color="#FF6B6B").next_to(left_arr, DOWN, buff=0.05)
        sd_lbl_r = MathTex(r"\sigma", font_size=20, color="#FF6B6B").next_to(right_arr, DOWN, buff=0.05)

        self.play(
            Create(left_arr), Create(right_arr),
            FadeIn(sd_lbl_l), FadeIn(sd_lbl_r),
            run_time=0.8,
        )
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "Spread of a binomial depends on n, p, and (1 - p).",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
