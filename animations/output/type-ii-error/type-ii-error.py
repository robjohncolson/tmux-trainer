"""
type-ii-error: Type II Error (beta) = P(fail to reject H0 | Ha true)
Manim Community Edition v0.19 — 720p30, ~16 seconds
Show overlapping null/alt distributions with beta shaded on the alt curve.
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class TypeIiErrorScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Type II Error", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Definition and formula (0.8-3.5s) ---
        defn = Text(
            "Failing to reject H0 when Ha is actually true",
            font_size=24, color=SOFT_WHITE,
        )
        defn.move_to(UP * 2.0)
        self.play(FadeIn(defn, shift=UP * 0.1), run_time=0.6)

        formula = MathTex(
            r"\beta", "=", r"P(\text{fail to reject } H_0",
            r"\mid", r"H_a \text{ true})",
            font_size=36,
        )
        formula[0].set_color(RED)
        formula.next_to(defn, DOWN, buff=0.4)

        self.play(Write(formula[:2]), run_time=0.5)
        self.play(Write(formula[2:]), run_time=0.7)
        self.wait(0.3)

        # --- Two overlapping distributions (3.5-7s) ---
        axes = Axes(
            x_range=[-4, 7, 1],
            y_range=[0, 0.45, 0.1],
            x_length=10,
            y_length=2.5,
            tips=False,
            axis_config={"color": GREY_B, "stroke_width": 1.5},
        ).shift(DOWN * 1.0)

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
        alt_label = MathTex(r"H_a \text{ (true)}", font_size=24, color=GOLD)
        alt_label.next_to(axes.c2p(mu_a, alt_pdf(mu_a)), UP, buff=0.15)

        self.play(
            FadeOut(defn),
            formula.animate.scale(0.8).move_to(UP * 2.2),
            run_time=0.5,
        )
        self.play(Create(axes), run_time=0.5)
        self.play(Create(null_curve), FadeIn(null_label), run_time=0.7)
        self.play(Create(alt_curve), FadeIn(alt_label), run_time=0.7)
        self.wait(0.3)

        # --- Critical value line (7-8.5s) ---
        z_crit = 1.645  # one-sided alpha=0.05

        crit_line = DashedLine(
            axes.c2p(z_crit, 0),
            axes.c2p(z_crit, 0.42),
            color=SOFT_WHITE, stroke_width=2, dash_length=0.08,
        )
        crit_label = MathTex(r"z^*", font_size=22, color=SOFT_WHITE)
        crit_label.next_to(crit_line, UP, buff=0.1)

        self.play(Create(crit_line), FadeIn(crit_label), run_time=0.6)

        # "Fail to reject" and "Reject" regions
        fail_text = Text("Fail to reject", font_size=16, color=GREEN)
        fail_text.move_to(axes.c2p(-0.5, -0.07))
        rej_text = Text("Reject", font_size=16, color=RED)
        rej_text.move_to(axes.c2p(2.8, -0.07))

        self.play(FadeIn(fail_text), FadeIn(rej_text), run_time=0.4)
        self.wait(0.3)

        # --- Shade beta on the alternative distribution (8.5-11s) ---
        beta_area = axes.get_area(
            alt_curve, x_range=[-2, z_crit],
            color=RED, opacity=0.35,
        )
        beta_label = MathTex(r"\beta", font_size=28, color=RED)
        beta_label.move_to(axes.c2p(0.8, 0.1))

        self.play(FadeIn(beta_area), run_time=0.8)
        self.play(FadeIn(beta_label), run_time=0.4)
        self.wait(0.3)

        # --- Also shade alpha on null for context (11-12.5s) ---
        alpha_area = axes.get_area(
            null_curve, x_range=[z_crit, 5],
            color=BLUE_ACCENT, opacity=0.2,
        )
        alpha_label = MathTex(r"\alpha", font_size=22, color=BLUE_ACCENT)
        alpha_label.move_to(axes.c2p(2.5, 0.03))

        self.play(FadeIn(alpha_area), FadeIn(alpha_label), run_time=0.6)
        self.wait(0.3)

        # --- Indicate formula (12.5-13.5s) ---
        self.play(
            Indicate(formula[0], color=RED, scale_factor=1.3),
            run_time=0.5,
        )
        self.wait(0.3)

        # --- Takeaway (13.5-16s) ---
        takeaway = Text(
            "Beta is the probability of a false negative (missing a real effect)",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.2)
