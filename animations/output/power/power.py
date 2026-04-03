"""
power: Statistical Power = 1 - beta
Manim Community Edition v0.19 — 720p30, ~16 seconds
Two overlapping distributions (null vs alternative), shade power region.
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class PowerScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Statistical Power", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Formula (0.8-3s) ---
        formula = MathTex(
            r"\text{Power}", "=", "1", "-", r"\beta",
            font_size=42,
        )
        formula[0].set_color(GREEN)
        formula[4].set_color(RED)
        formula.move_to(UP * 1.8)

        self.play(Write(formula[:2]), run_time=0.5)
        self.play(Write(formula[2:]), run_time=0.6)
        self.wait(0.3)

        # --- Two overlapping normal distributions (3-7s) ---
        axes = Axes(
            x_range=[-4, 7, 1],
            y_range=[0, 0.45, 0.1],
            x_length=10,
            y_length=2.8,
            tips=False,
            axis_config={"color": GREY_B, "stroke_width": 1.5},
        ).shift(DOWN * 0.8)

        mu_0 = 0.0
        mu_a = 2.5

        def null_pdf(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * (x - mu_0) ** 2)

        def alt_pdf(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * (x - mu_a) ** 2)

        null_curve = axes.plot(null_pdf, x_range=[-4, 5], color=BLUE_ACCENT)
        alt_curve = axes.plot(alt_pdf, x_range=[-2, 7], color=GOLD)

        null_label = MathTex(r"H_0", font_size=24, color=BLUE_ACCENT)
        null_label.next_to(axes.c2p(mu_0, null_pdf(mu_0)), UP, buff=0.15)
        alt_label = MathTex(r"H_a", font_size=24, color=GOLD)
        alt_label.next_to(axes.c2p(mu_a, alt_pdf(mu_a)), UP, buff=0.15)

        self.play(Create(axes), run_time=0.6)
        self.play(Create(null_curve), FadeIn(null_label), run_time=0.8)
        self.play(Create(alt_curve), FadeIn(alt_label), run_time=0.8)
        self.wait(0.3)

        # --- Critical value line (7-9s) ---
        z_crit = 1.645  # alpha = 0.05 one-sided
        crit_line = DashedLine(
            axes.c2p(z_crit, 0),
            axes.c2p(z_crit, 0.42),
            color=SOFT_WHITE, stroke_width=2, dash_length=0.08,
        )
        crit_label = MathTex(r"z^* = 1.645", font_size=20, color=SOFT_WHITE)
        crit_label.next_to(crit_line, UP, buff=0.1)

        self.play(Create(crit_line), FadeIn(crit_label), run_time=0.6)
        self.wait(0.3)

        # --- Shade beta region (fail to reject under Ha) (9-11s) ---
        beta_area = axes.get_area(
            alt_curve, x_range=[-2, z_crit],
            color=RED, opacity=0.3,
        )
        beta_label = MathTex(r"\beta", font_size=26, color=RED)
        beta_label.move_to(axes.c2p(0.8, 0.12))

        self.play(FadeIn(beta_area), FadeIn(beta_label), run_time=0.8)
        self.wait(0.3)

        # --- Shade power region (reject under Ha) (11-13s) ---
        power_area = axes.get_area(
            alt_curve, x_range=[z_crit, 7],
            color=GREEN, opacity=0.35,
        )
        power_label = MathTex(r"\text{Power}", font_size=24, color=GREEN)
        power_label.move_to(axes.c2p(3.3, 0.12))

        self.play(FadeIn(power_area), FadeIn(power_label), run_time=0.8)
        self.wait(0.3)

        # --- Indicate formula (13-14s) ---
        self.play(
            Indicate(formula[0], color=GREEN, scale_factor=1.3),
            Indicate(formula[4], color=RED, scale_factor=1.3),
            run_time=0.6,
        )
        self.wait(0.3)

        # --- Takeaway (14-16s) ---
        takeaway = Text(
            "Power is the probability of correctly rejecting a false null",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
