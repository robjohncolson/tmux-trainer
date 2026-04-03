from manim import *
import numpy as np

class ZscoreScene(Scene):
    """~15-second animation: Z-Score"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Z-Score", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Normal curve sketch (0.8-3s) ---
        axes = Axes(
            x_range=[-4, 4, 1], y_range=[0, 0.45, 0.1],
            x_length=8, y_length=3,
            axis_config={"color": GREY_B, "include_numbers": False},
        ).shift(DOWN * 0.2)

        # Labels on x-axis
        mu_label = MathTex(r"\mu", font_size=24, color=SOFT_WHITE).next_to(axes.c2p(0, 0), DOWN, buff=0.25)
        sig_labels = VGroup(
            MathTex(r"-2\sigma", font_size=18, color=GREY_B).next_to(axes.c2p(-2, 0), DOWN, buff=0.25),
            MathTex(r"-\sigma", font_size=18, color=GREY_B).next_to(axes.c2p(-1, 0), DOWN, buff=0.25),
            MathTex(r"\sigma", font_size=18, color=GREY_B).next_to(axes.c2p(1, 0), DOWN, buff=0.25),
            MathTex(r"2\sigma", font_size=18, color=GREY_B).next_to(axes.c2p(2, 0), DOWN, buff=0.25),
        )

        curve = axes.plot(
            lambda x: (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x**2),
            x_range=[-3.5, 3.5], color=BLUE_ACCENT
        )

        self.play(Create(axes), run_time=0.5)
        self.play(Create(curve), run_time=0.8)
        self.play(
            FadeIn(mu_label), FadeIn(sig_labels),
            run_time=0.5
        )
        self.wait(0.2)

        # --- Formula (3-5.5s) ---
        formula = MathTex(
            "z", "=", r"\frac{x - \mu}{\sigma}",
            font_size=48
        ).to_edge(RIGHT, buff=1.0).shift(UP * 1.5)
        formula[0].set_color(GOLD)
        formula[2].set_color(SOFT_WHITE)

        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # --- Numeric example (5.5-9s) ---
        example_vals = MathTex(
            r"\mu = 70", r"\qquad", r"\sigma = 5", r"\qquad", r"x = 82",
            font_size=26, color=SOFT_WHITE
        ).next_to(formula, DOWN, buff=0.6)

        self.play(Write(example_vals), run_time=0.7)

        calc = MathTex(
            "z", "=", r"\frac{82 - 70}{5}", "=", r"\frac{12}{5}", "=", "2.4",
            font_size=32
        ).next_to(example_vals, DOWN, buff=0.4)
        calc[0].set_color(GOLD)
        calc[6].set_color(GOLD)

        self.play(Write(calc[:3]), run_time=0.6)
        self.play(Write(calc[3:5]), run_time=0.5)
        self.play(Write(calc[5:]), run_time=0.5)

        # --- Mark z=2.4 on the curve (9-11s) ---
        z_pos = 2.4
        dot = Dot(axes.c2p(z_pos, 0), radius=0.12, color=GOLD)
        dashed = DashedLine(
            axes.c2p(z_pos, 0), axes.c2p(z_pos, 0.02),
            color=GOLD, stroke_width=2
        ).set_length(2.5).move_to(axes.c2p(z_pos, 0.12))
        z_label = MathTex(r"z=2.4", font_size=22, color=GOLD).next_to(dashed, UP, buff=0.1)

        self.play(
            FadeIn(dot, scale=0.5), Create(dashed), FadeIn(z_label, shift=DOWN * 0.1),
            run_time=0.8
        )
        self.wait(0.3)

        # --- Highlight (11-12.5s) ---
        self.play(
            Indicate(formula[0], color=GOLD, scale_factor=1.3),
            Indicate(calc[6], color=GOLD, scale_factor=1.3),
            run_time=0.6
        )

        # --- Takeaway (12.5-15s) ---
        takeaway = Text(
            "How many standard deviations a value is from the mean",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
