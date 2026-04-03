"""
phat-mean: Sampling Distribution Mean of p-hat
mu_{p-hat} = p — True proportion centers the sampling distribution
"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class PhatMeanScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        # Title
        title = Text("Mean of the Sampling Distribution of p\u0302", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=1.0)

        # Axes for normal curve
        ax = Axes(
            x_range=[0, 1, 0.2],
            y_range=[0, 8, 2],
            x_length=8,
            y_length=3.5,
            axis_config={"color": SOFT_WHITE, "include_numbers": False},
            tips=False,
        ).shift(DOWN * 0.3)

        x_labels = VGroup()
        for val in [0, 0.2, 0.4, 0.6, 0.8, 1.0]:
            label = MathTex(f"{val:.1f}", font_size=20, color=SOFT_WHITE)
            label.next_to(ax.c2p(val, 0), DOWN, buff=0.15)
            x_labels.add(label)

        self.play(Create(ax), FadeIn(x_labels), run_time=1.0)

        # True proportion p = 0.6
        p = 0.6
        sd = 0.08

        def normal_pdf(x):
            return (1 / (sd * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - p) / sd) ** 2)

        curve = ax.plot(normal_pdf, x_range=[0.3, 0.9], color=BLUE_ACCENT, stroke_width=3)
        area = ax.get_area(curve, x_range=[0.3, 0.9], color=BLUE_ACCENT, opacity=0.25)

        self.play(Create(curve), FadeIn(area), run_time=1.5)

        # Dashed line at p
        p_line = DashedLine(
            ax.c2p(p, 0), ax.c2p(p, normal_pdf(p)),
            color=GOLD, stroke_width=2, dash_length=0.1,
        )
        p_label = MathTex("p = 0.6", font_size=28, color=GOLD)
        p_label.next_to(ax.c2p(p, normal_pdf(p)), UP, buff=0.2)

        self.play(Create(p_line), Write(p_label), run_time=1.0)

        # Formula build
        formula = MathTex(
            r"\mu_{\hat{p}}", "=", "p",
            font_size=48, color=SOFT_WHITE,
        ).next_to(ax, RIGHT, buff=0.5).shift(UP * 0.5)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)

        self.play(Write(formula[0]), run_time=0.8)
        self.play(Write(formula[1]), Write(formula[2]), run_time=0.8)
        self.play(Create(box), run_time=0.6)

        # Arrow from p_label to center of curve
        arrow = Arrow(
            p_label.get_bottom(), ax.c2p(p, normal_pdf(p) * 0.5),
            color=GOLD, stroke_width=2, buff=0.1, max_tip_length_to_length_ratio=0.15,
        )
        center_text = Text("center", font_size=20, color=GOLD)
        center_text.next_to(arrow, LEFT, buff=0.1)

        self.play(GrowArrow(arrow), FadeIn(center_text), run_time=0.8)

        # Takeaway
        takeaway = Text(
            "The sampling distribution of p\u0302 is centered at the true proportion p.",
            font_size=22, color=GREY_B,
        ).to_edge(DOWN, buff=0.35)

        self.play(FadeIn(takeaway), run_time=1.0)
        self.wait(2.0)
