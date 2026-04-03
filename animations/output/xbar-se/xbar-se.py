"""Standard Error of x-bar: SE = s / sqrt(n)"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class XbarSeScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("Standard Error of x\u0304", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Show the known vs unknown comparison
        known_header = Text("If \u03c3 is known:", font_size=24, color=BLUE_ACCENT)
        known_header.move_to(UP * 1.8 + LEFT * 3)
        known_formula = MathTex(
            r"\sigma_{\bar{x}} = \frac{\sigma}{\sqrt{n}}",
            font_size=40, color=BLUE_ACCENT,
        )
        known_formula.next_to(known_header, DOWN, buff=0.3)

        self.play(FadeIn(known_header), run_time=0.5)
        self.play(Write(known_formula), run_time=1.0)

        # Unknown sigma
        unknown_header = Text("If \u03c3 is unknown (usual case):", font_size=24, color=RED)
        unknown_header.move_to(UP * 1.8 + RIGHT * 3)
        unknown_formula = MathTex(
            r"SE_{\bar{x}} = \frac{s}{\sqrt{n}}",
            font_size=40, color=RED,
        )
        unknown_formula.next_to(unknown_header, DOWN, buff=0.3)

        self.play(FadeIn(unknown_header), run_time=0.5)
        self.play(Write(unknown_formula), run_time=1.0)

        # Arrow from sigma to s
        arrow = Arrow(
            known_formula.get_right() + RIGHT * 0.1,
            unknown_formula.get_left() + LEFT * 0.1,
            color=GOLD, buff=0.1,
        )
        swap_text = Text("Replace \u03c3 with s", font_size=20, color=GOLD)
        swap_text.next_to(arrow, UP, buff=0.1)
        self.play(Create(arrow), FadeIn(swap_text), run_time=0.8)

        # Sampling distribution illustration
        ax = Axes(
            x_range=[-4, 4, 1],
            y_range=[0, 0.6, 0.1],
            x_length=7,
            y_length=2.5,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(DOWN * 1.2)
        self.play(Create(ax), run_time=0.6)

        se_val = 0.8
        curve = ax.plot(
            lambda x: (1 / (se_val * np.sqrt(2 * np.pi)))
            * np.exp(-x**2 / (2 * se_val**2)),
            color=GREEN, x_range=[-3.5, 3.5],
        )
        se_brace_left = ax.c2p(-se_val, 0.15)
        se_brace_right = ax.c2p(se_val, 0.15)
        brace = BraceBetweenPoints(se_brace_left, se_brace_right, direction=DOWN, color=GOLD)
        brace_label = MathTex(r"SE", font_size=28, color=GOLD)
        brace_label.next_to(brace, DOWN, buff=0.1)

        self.play(Create(curve), run_time=0.8)
        self.play(Create(brace), FadeIn(brace_label), run_time=0.8)

        # Main formula boxed
        main = MathTex(r"SE_{\bar{x}} = \frac{s}{\sqrt{n}}", font_size=48, color=SOFT_WHITE)
        main.to_edge(DOWN, buff=1.5).shift(RIGHT * 3)
        box = SurroundingRectangle(main, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Write(main), Create(box), run_time=1.0)

        takeaway = Text(
            "SE uses sample s when population \u03c3 is unknown.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
