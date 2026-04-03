"""SE of Difference in Means: SE = sqrt(s1^2/n1 + s2^2/n2)"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class DiffXSeScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("SE of Difference in Means", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Population version first
        pop_label = Text("Population SD version:", font_size=22, color=BLUE_ACCENT)
        pop_label.move_to(UP * 2 + LEFT * 3)
        pop_formula = MathTex(
            r"\sigma = \sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}",
            font_size=34, color=BLUE_ACCENT,
        )
        pop_formula.next_to(pop_label, DOWN, buff=0.3)

        self.play(FadeIn(pop_label), run_time=0.4)
        self.play(Write(pop_formula), run_time=1.0)

        # Cross out sigma
        cross = Cross(pop_formula, stroke_color=RED, stroke_width=3)
        unknown_txt = Text("\u03c3 unknown!", font_size=20, color=RED)
        unknown_txt.next_to(pop_formula, RIGHT, buff=0.3)
        self.play(Create(cross), FadeIn(unknown_txt), run_time=0.8)

        # Sample version
        samp_label = Text("Sample SE version:", font_size=22, color=GREEN)
        samp_label.move_to(DOWN * 0.2 + LEFT * 3)

        se_formula = MathTex(
            r"SE", r"=", r"\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}",
            font_size=42,
        )
        se_formula[0].set_color(GREEN)
        se_formula[2].set_color(SOFT_WHITE)
        se_formula.next_to(samp_label, DOWN, buff=0.3)

        self.play(FadeIn(samp_label), run_time=0.4)
        self.play(Write(se_formula), run_time=1.2)

        # Highlight substitution
        s1_highlight = MathTex(r"s_1", font_size=34, color=GOLD)
        s1_highlight.move_to(RIGHT * 3 + UP * 0.5)
        s2_highlight = MathTex(r"s_2", font_size=34, color=GOLD)
        s2_highlight.next_to(s1_highlight, DOWN, buff=0.3)
        sub_text = Text("from samples", font_size=20, color=GOLD)
        sub_text.next_to(s2_highlight, DOWN, buff=0.2)

        arr1 = Arrow(s1_highlight.get_left(), se_formula[2].get_right() + RIGHT * 0.1, color=GOLD, buff=0.1)
        self.play(
            FadeIn(s1_highlight), FadeIn(s2_highlight), FadeIn(sub_text),
            Create(arr1),
            run_time=1.0,
        )

        # Box the final formula
        box = SurroundingRectangle(se_formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Create(box), run_time=0.5)

        # Two-sample illustration
        ax = Axes(
            x_range=[-4, 8, 2],
            y_range=[0, 0.45, 0.1],
            x_length=7,
            y_length=1.8,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).to_edge(DOWN, buff=1.2)

        c1 = ax.plot(
            lambda x: 0.4 * np.exp(-x**2 / 2),
            color=BLUE_ACCENT, x_range=[-3, 3],
        )
        c2 = ax.plot(
            lambda x: 0.35 * np.exp(-(x - 4) ** 2 / (2 * 1.5**2)),
            color=RED, x_range=[-1, 8],
        )
        l1 = Text("Sample 1", font_size=16, color=BLUE_ACCENT).next_to(ax.c2p(-1, 0.35), UP, buff=0.05)
        l2 = Text("Sample 2", font_size=16, color=RED).next_to(ax.c2p(5.5, 0.2), UP, buff=0.05)

        self.play(Create(ax), Create(c1), Create(c2), FadeIn(l1), FadeIn(l2), run_time=1.0)

        takeaway = Text(
            "Use sample standard deviations when \u03c3 is unknown.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
