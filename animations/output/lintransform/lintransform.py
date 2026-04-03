"""
lintransform: Linear Transformation  Y = a + bX:  μ_Y = a + bμ_X,  σ_Y = |b|σ_X
Manim Community Edition v0.19 — 720p30, ~17 seconds
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class LintransformScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Linear Transformation of a Random Variable", font_size=34, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Transformation definition
        defn = MathTex(
            r"Y = a + bX",
            font_size=42, color=SOFT_WHITE,
        )
        defn.next_to(title, DOWN, buff=0.35)
        self.play(Write(defn), run_time=0.7)
        self.wait(0.2)

        # Two formulas
        mean_formula = MathTex(
            r"\mu_Y", "=", "a", "+", r"b \mu_X",
            font_size=38, color=SOFT_WHITE,
        )
        sd_formula = MathTex(
            r"\sigma_Y", "=", r"|b|", r"\sigma_X",
            font_size=38, color=SOFT_WHITE,
        )

        formulas = VGroup(mean_formula, sd_formula).arrange(DOWN, buff=0.35, aligned_edge=LEFT)
        formulas.move_to(LEFT * 3.0 + UP * 0.0)

        self.play(Write(mean_formula), run_time=0.8)
        self.wait(0.2)
        self.play(Write(sd_formula), run_time=0.8)
        self.wait(0.3)

        # Highlight key insight for SD
        note_shift = Text("a shifts the center", font_size=20, color=BLUE_ACCENT)
        note_shift.next_to(mean_formula[2], DOWN, buff=0.25)
        note_scale = Text("|b| scales the spread", font_size=20, color="#FF6B6B")
        note_scale.next_to(sd_formula[2], DOWN, buff=0.25)

        self.play(FadeIn(note_shift), FadeIn(note_scale), run_time=0.6)
        self.wait(0.4)
        self.play(FadeOut(note_shift), FadeOut(note_scale), run_time=0.3)

        # Concrete example
        mu_x, sigma_x = 50, 10
        a_val, b_val = 20, 2
        mu_y = a_val + b_val * mu_x
        sigma_y = abs(b_val) * sigma_x

        example_params = MathTex(
            rf"X: \mu_X={mu_x},\; \sigma_X={sigma_x} \quad a={a_val},\; b={b_val}",
            font_size=24, color=GREY_B,
        )
        example_params.next_to(formulas, DOWN, buff=0.5)
        self.play(FadeIn(example_params), run_time=0.4)

        calc_mean = MathTex(
            rf"\mu_Y = {a_val} + {b_val}({mu_x}) = {mu_y}",
            font_size=28, color=GOLD,
        )
        calc_sd = MathTex(
            rf"\sigma_Y = |{b_val}| \cdot {sigma_x} = {sigma_y}",
            font_size=28, color=GOLD,
        )
        calcs = VGroup(calc_mean, calc_sd).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        calcs.next_to(example_params, DOWN, buff=0.3)
        self.play(Write(calc_mean), run_time=0.6)
        self.play(Write(calc_sd), run_time=0.6)
        self.wait(0.3)

        # Visual: original X curve and transformed Y curve
        axes = Axes(
            x_range=[0, 200, 50], y_range=[0, 0.05, 0.01],
            x_length=5.5, y_length=2.0,
            axis_config={"include_ticks": True, "font_size": 16},
        )
        axes.move_to(RIGHT * 2.8 + DOWN * 0.5)

        def normal_pdf(x, mu, sigma):
            return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

        curve_x = axes.plot(
            lambda x: normal_pdf(x, mu_x, sigma_x),
            x_range=[10, 90], color=BLUE_ACCENT,
        )
        curve_y = axes.plot(
            lambda x: normal_pdf(x, mu_y, sigma_y),
            x_range=[60, 180], color=GOLD,
        )

        lbl_x = MathTex("X", font_size=22, color=BLUE_ACCENT).next_to(curve_x, UP, buff=0.05)
        lbl_y = MathTex("Y", font_size=22, color=GOLD).next_to(curve_y, UP, buff=0.05)

        self.play(FadeIn(axes), run_time=0.4)
        self.play(Create(curve_x), FadeIn(lbl_x), run_time=0.7)

        # Arrow showing shift + scale
        shift_arrow = Arrow(
            curve_x.get_center(), curve_y.get_center(),
            color=SOFT_WHITE, stroke_width=2, tip_length=0.15, buff=0.2,
        )
        shift_lbl = Text("shift + scale", font_size=16, color=SOFT_WHITE)
        shift_lbl.next_to(shift_arrow, UP, buff=0.05)

        self.play(Create(shift_arrow), FadeIn(shift_lbl), run_time=0.5)
        self.play(Create(curve_y), FadeIn(lbl_y), run_time=0.7)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "Adding a shifts the mean; multiplying by b scales both mean and SD.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
