"""SE of Regression Slope: s_b = s / (s_x * sqrt(n-1))"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class SlopeSeScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("SE of Regression Slope", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Population version
        pop_header = Text("Population SD:", font_size=22, color=BLUE_ACCENT)
        pop_header.move_to(UP * 2 + LEFT * 3)
        pop_formula = MathTex(
            r"\sigma_b = \frac{\sigma}{\sigma_x \sqrt{n}}",
            font_size=36, color=BLUE_ACCENT,
        )
        pop_formula.next_to(pop_header, DOWN, buff=0.3)

        self.play(FadeIn(pop_header), Write(pop_formula), run_time=1.0)

        # Arrow showing substitution
        arrow = Arrow(LEFT * 0.5, RIGHT * 0.5, color=GOLD).move_to(UP * 1.5)
        sub_text = Text("Replace \u03c3 \u2192 s,  \u03c3\u2093 \u2192 s\u2093,  n \u2192 n\u22121", font_size=20, color=GOLD)
        sub_text.next_to(arrow, UP, buff=0.1)
        self.play(Create(arrow), FadeIn(sub_text), run_time=0.8)

        # Sample version
        samp_header = Text("Sample SE:", font_size=22, color=GREEN)
        samp_header.move_to(UP * 2 + RIGHT * 3)
        samp_formula = MathTex(
            r"SE_b = \frac{s}{s_x \sqrt{n - 1}}",
            font_size=36, color=GREEN,
        )
        samp_formula.next_to(samp_header, DOWN, buff=0.3)

        self.play(FadeIn(samp_header), Write(samp_formula), run_time=1.0)

        # Scatter + regression line
        ax = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 10, 2],
            x_length=6,
            y_length=2.8,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(DOWN * 1.0)

        np.random.seed(7)
        xs = np.random.uniform(1, 9, 15)
        ys = 1 + 0.8 * xs + np.random.normal(0, 1.0, 15)
        dots = VGroup(*[
            Dot(ax.c2p(x, y), color=BLUE_ACCENT, radius=0.05)
            for x, y in zip(xs, ys)
        ])

        reg_line = ax.plot(lambda x: 1 + 0.8 * x, color=GOLD, x_range=[0.5, 9.5])

        self.play(Create(ax), FadeIn(dots), run_time=0.6)
        self.play(Create(reg_line), run_time=0.6)

        # Label s components
        s_label = MathTex(r"s", font_size=24, color=RED)
        s_label.next_to(ax.c2p(7, 4), RIGHT, buff=0.2)
        sx_brace = BraceBetweenPoints(
            ax.c2p(1, -0.3), ax.c2p(9, -0.3),
            direction=DOWN, color=GREEN,
        )
        sx_label = MathTex(r"s_x", font_size=24, color=GREEN)
        sx_label.next_to(sx_brace, DOWN, buff=0.1)

        self.play(FadeIn(s_label), Create(sx_brace), FadeIn(sx_label), run_time=0.8)

        # Main formula boxed
        main = MathTex(
            r"SE_b", r"=", r"\frac{s}{s_x \sqrt{n-1}}",
            font_size=48,
        )
        main[0].set_color(GOLD)
        main.to_edge(DOWN, buff=0.8).shift(RIGHT * 3)
        box = SurroundingRectangle(main, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Write(main), Create(box), run_time=1.0)

        takeaway = Text(
            "SE of slope uses sample s and s\u2093 with n\u22121 for df.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
