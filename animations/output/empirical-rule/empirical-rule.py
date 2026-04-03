from manim import *
import numpy as np

class EmpiricalRuleScene(Scene):
    """~16-second animation: Empirical Rule (68-95-99.7)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Empirical Rule (68-95-99.7)", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Normal curve (0.8-2.5s) ---
        axes = Axes(
            x_range=[-4, 4, 1], y_range=[0, 0.45, 0.1],
            x_length=10, y_length=3.5,
            axis_config={"color": GREY_B, "include_numbers": False},
        ).shift(DOWN * 0.5)

        def normal(x):
            return (1 / np.sqrt(2 * np.pi)) * np.exp(-0.5 * x**2)

        curve = axes.plot(normal, x_range=[-3.5, 3.5], color=BLUE_ACCENT)
        mu_label = MathTex(r"\mu", font_size=26, color=SOFT_WHITE).next_to(axes.c2p(0, 0), DOWN, buff=0.3)

        self.play(Create(axes), run_time=0.5)
        self.play(Create(curve), FadeIn(mu_label), run_time=0.8)
        self.wait(0.2)

        # --- 68% band: 1 sigma (2.5-5s) ---
        area_1 = axes.get_area(curve, x_range=[-1, 1], color=BLUE_ACCENT, opacity=0.3)
        sigma_marks_1 = VGroup(
            MathTex(r"-\sigma", font_size=20, color=GREY_B).next_to(axes.c2p(-1, 0), DOWN, buff=0.25),
            MathTex(r"\sigma", font_size=20, color=GREY_B).next_to(axes.c2p(1, 0), DOWN, buff=0.25),
        )
        pct_68 = MathTex(r"68\%", font_size=32, color=GOLD).move_to(axes.c2p(0, 0.15))

        self.play(FadeIn(area_1), FadeIn(sigma_marks_1), run_time=0.6)
        self.play(FadeIn(pct_68, scale=0.8), run_time=0.5)
        self.wait(0.4)

        # --- 95% band: 2 sigma (5-7.5s) ---
        area_2 = axes.get_area(curve, x_range=[-2, 2], color=BLUE_ACCENT, opacity=0.15)
        sigma_marks_2 = VGroup(
            MathTex(r"-2\sigma", font_size=20, color=GREY_B).next_to(axes.c2p(-2, 0), DOWN, buff=0.25),
            MathTex(r"2\sigma", font_size=20, color=GREY_B).next_to(axes.c2p(2, 0), DOWN, buff=0.25),
        )
        pct_95 = MathTex(r"95\%", font_size=28, color=SOFT_WHITE).move_to(axes.c2p(0, -0.06))

        self.play(FadeIn(area_2), FadeIn(sigma_marks_2), run_time=0.6)
        self.play(FadeOut(pct_68), FadeIn(pct_95, scale=0.8), run_time=0.5)
        self.wait(0.4)

        # --- 99.7% band: 3 sigma (7.5-10s) ---
        area_3 = axes.get_area(curve, x_range=[-3, 3], color=BLUE_ACCENT, opacity=0.08)
        sigma_marks_3 = VGroup(
            MathTex(r"-3\sigma", font_size=20, color=GREY_B).next_to(axes.c2p(-3, 0), DOWN, buff=0.25),
            MathTex(r"3\sigma", font_size=20, color=GREY_B).next_to(axes.c2p(3, 0), DOWN, buff=0.25),
        )
        pct_997 = MathTex(r"99.7\%", font_size=24, color=GREY_B).move_to(axes.c2p(0, -0.15))

        self.play(FadeIn(area_3), FadeIn(sigma_marks_3), run_time=0.6)
        self.play(FadeOut(pct_95), FadeIn(pct_997, scale=0.8), run_time=0.5)
        self.wait(0.4)

        # --- Summary column (10-13s) ---
        # Bring back all three percentages stacked
        self.play(FadeOut(pct_997), run_time=0.2)
        summary = VGroup(
            MathTex(r"68\%", r"\text{ within }", r"1\sigma", font_size=26),
            MathTex(r"95\%", r"\text{ within }", r"2\sigma", font_size=26),
            MathTex(r"99.7\%", r"\text{ within }", r"3\sigma", font_size=26),
        ).arrange(DOWN, buff=0.25).to_edge(RIGHT, buff=0.8).shift(DOWN * 0.5)
        summary[0][0].set_color(GOLD)
        summary[0][2].set_color(BLUE_ACCENT)
        summary[1][0].set_color(SOFT_WHITE)
        summary[1][2].set_color(BLUE_ACCENT)
        summary[2][0].set_color(GREY_B)
        summary[2][2].set_color(BLUE_ACCENT)

        self.play(
            LaggedStart(*[FadeIn(s, shift=LEFT * 0.2) for s in summary], lag_ratio=0.2),
            run_time=1.2
        )
        self.wait(0.4)

        # --- Highlight (13-14s) ---
        self.play(
            Indicate(summary[0], color=GOLD, scale_factor=1.1),
            run_time=0.6
        )

        # --- Takeaway (14-16s) ---
        takeaway = Text(
            "Nearly all data falls within 3 standard deviations of the mean",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
