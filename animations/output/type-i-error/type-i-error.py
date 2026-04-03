"""
type-i-error: Type I Error (alpha) = P(reject H0 | H0 true)
Manim Community Edition v0.19 — 720p30, ~15 seconds
Show normal curve under H0 with shaded tails = alpha.
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class TypeIErrorScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Type I Error", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Definition and formula (0.8-3.5s) ---
        defn = Text(
            "Rejecting H0 when H0 is actually true",
            font_size=24, color=SOFT_WHITE,
        )
        defn.move_to(UP * 2.0)
        self.play(FadeIn(defn, shift=UP * 0.1), run_time=0.6)

        formula = MathTex(
            r"\alpha", "=", r"P(\text{reject } H_0", r"\mid", r"H_0 \text{ true})",
            font_size=38,
        )
        formula[0].set_color(RED)
        formula[2].set_color(SOFT_WHITE)
        formula[4].set_color(SOFT_WHITE)
        formula.next_to(defn, DOWN, buff=0.4)

        self.play(Write(formula[:2]), run_time=0.5)
        self.play(Write(formula[2:]), run_time=0.7)
        self.wait(0.3)

        # --- Normal curve under H0 (3.5-6.5s) ---
        axes = Axes(
            x_range=[-3.5, 3.5, 1],
            y_range=[0, 0.45, 0.1],
            x_length=9,
            y_length=2.5,
            tips=False,
            axis_config={"color": GREY_B, "stroke_width": 1.5},
        ).shift(DOWN * 1.0)

        def normal_pdf(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x ** 2)

        curve = axes.plot(normal_pdf, x_range=[-3.5, 3.5], color=BLUE_ACCENT)

        h0_label = MathTex(
            r"\text{Distribution under } H_0",
            font_size=22, color=BLUE_ACCENT,
        )
        h0_label.next_to(axes, UP, buff=0.15).shift(LEFT * 1.5)

        self.play(
            FadeOut(defn),
            formula.animate.scale(0.85).to_edge(UP, buff=0.4).shift(DOWN * 0.3),
            run_time=0.5,
        )
        self.play(Create(axes), run_time=0.5)
        self.play(Create(curve), FadeIn(h0_label), run_time=0.8)
        self.wait(0.3)

        # --- Critical values and rejection regions (6.5-10.5s) ---
        alpha = 0.05
        z_crit = 1.96  # two-sided

        # Left rejection region
        left_crit = DashedLine(
            axes.c2p(-z_crit, 0),
            axes.c2p(-z_crit, normal_pdf(-z_crit)),
            color=SOFT_WHITE, stroke_width=2, dash_length=0.08,
        )
        right_crit = DashedLine(
            axes.c2p(z_crit, 0),
            axes.c2p(z_crit, normal_pdf(z_crit)),
            color=SOFT_WHITE, stroke_width=2, dash_length=0.08,
        )

        self.play(Create(left_crit), Create(right_crit), run_time=0.6)

        # Shade left tail
        left_tail = axes.get_area(
            curve, x_range=[-3.5, -z_crit],
            color=RED, opacity=0.4,
        )
        left_label = MathTex(
            r"\frac{\alpha}{2}", font_size=22, color=RED,
        )
        left_label.next_to(left_tail, LEFT, buff=0.1).shift(UP * 0.3)

        # Shade right tail
        right_tail = axes.get_area(
            curve, x_range=[z_crit, 3.5],
            color=RED, opacity=0.4,
        )
        right_label = MathTex(
            r"\frac{\alpha}{2}", font_size=22, color=RED,
        )
        right_label.next_to(right_tail, RIGHT, buff=0.1).shift(UP * 0.3)

        self.play(
            FadeIn(left_tail), FadeIn(left_label),
            FadeIn(right_tail), FadeIn(right_label),
            run_time=0.8,
        )
        self.wait(0.3)

        # Rejection region labels
        rej_left = Text("Reject", font_size=18, color=RED)
        rej_left.next_to(left_tail, DOWN, buff=0.15)
        rej_right = Text("Reject", font_size=18, color=RED)
        rej_right.next_to(right_tail, DOWN, buff=0.15)
        no_rej = Text("Fail to reject", font_size=18, color=GREEN)
        no_rej.move_to(axes.c2p(0, -0.08))

        self.play(
            FadeIn(rej_left), FadeIn(rej_right), FadeIn(no_rej),
            run_time=0.6,
        )
        self.wait(0.3)

        # --- Alpha value label (10.5-12s) ---
        alpha_box = MathTex(
            r"\alpha = 0.05 \text{ (two-sided)}",
            font_size=28, color=RED,
        )
        alpha_box.next_to(axes, RIGHT, buff=0.3).shift(UP * 0.5)
        box = SurroundingRectangle(alpha_box, color=RED, buff=0.1, stroke_width=1.5)

        self.play(FadeIn(alpha_box), Create(box), run_time=0.6)
        self.wait(0.3)

        # --- Indicate formula (12-13s) ---
        self.play(
            Indicate(formula[0], color=RED, scale_factor=1.3),
            run_time=0.5,
        )

        # --- Takeaway (13-15s) ---
        takeaway = Text(
            "Alpha is the probability of a false positive (rejecting a true null)",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
