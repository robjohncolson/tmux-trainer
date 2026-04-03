"""SD of Regression Slope: sigma_b = sigma / (sigma_x * sqrt(n))"""
from manim import *
import numpy as np

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"


class SlopeSdScene(Scene):
    def construct(self):
        self.camera.background_color = "#1a1a2e"

        title = Text("SD of Regression Slope", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.8)

        # Show scatter with tight vs wide x-spread
        ax_tight = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 10, 2],
            x_length=3.5,
            y_length=2.8,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(LEFT * 3.5 + UP * 0.3)

        ax_wide = Axes(
            x_range=[0, 10, 2],
            y_range=[0, 10, 2],
            x_length=3.5,
            y_length=2.8,
            axis_config={"color": GREY_B, "include_ticks": False},
        ).shift(RIGHT * 3.5 + UP * 0.3)

        self.play(Create(ax_tight), Create(ax_wide), run_time=0.6)

        # Tight x-spread (small sigma_x) -> more slope variation
        np.random.seed(42)
        tight_x = np.random.normal(5, 0.8, 12)
        tight_y = 1 + 0.8 * tight_x + np.random.normal(0, 0.8, 12)
        tight_dots = VGroup(*[
            Dot(ax_tight.c2p(x, y), color=BLUE_ACCENT, radius=0.05)
            for x, y in zip(tight_x, tight_y)
        ])

        # Wide x-spread (large sigma_x) -> less slope variation
        wide_x = np.random.uniform(1, 9, 12)
        wide_y = 1 + 0.8 * wide_x + np.random.normal(0, 0.8, 12)
        wide_dots = VGroup(*[
            Dot(ax_wide.c2p(x, y), color=BLUE_ACCENT, radius=0.05)
            for x, y in zip(wide_x, wide_y)
        ])

        tight_lbl = Text("Small \u03c3\u2093", font_size=20, color=RED)
        tight_lbl.next_to(ax_tight, UP, buff=0.15)
        wide_lbl = Text("Large \u03c3\u2093", font_size=20, color=GREEN)
        wide_lbl.next_to(ax_wide, UP, buff=0.15)

        self.play(
            FadeIn(tight_dots), FadeIn(wide_dots),
            FadeIn(tight_lbl), FadeIn(wide_lbl),
            run_time=0.8,
        )

        # Show multiple fitted lines on tight data (more variation)
        for slope in [0.5, 1.1, 0.3, 1.3]:
            line = ax_tight.plot(
                lambda x, s=slope: 1 + s * x,
                color=RED, x_range=[1, 9],
                stroke_opacity=0.35, stroke_width=2,
            )
            self.play(Create(line), run_time=0.25)

        # Show multiple fitted lines on wide data (less variation)
        for slope in [0.72, 0.85, 0.78, 0.82]:
            line = ax_wide.plot(
                lambda x, s=slope: 1 + s * x,
                color=GREEN, x_range=[1, 9],
                stroke_opacity=0.35, stroke_width=2,
            )
            self.play(Create(line), run_time=0.25)

        vary_tight = Text("More slope variation", font_size=18, color=RED)
        vary_tight.next_to(ax_tight, DOWN, buff=0.15)
        vary_wide = Text("Less slope variation", font_size=18, color=GREEN)
        vary_wide.next_to(ax_wide, DOWN, buff=0.15)
        self.play(FadeIn(vary_tight), FadeIn(vary_wide), run_time=0.6)

        # Formula
        formula = MathTex(
            r"\sigma_b", r"=",
            r"\frac{\sigma}{\sigma_x \sqrt{n}}",
            font_size=48,
        )
        formula[0].set_color(GOLD)
        formula[2].set_color(SOFT_WHITE)
        formula.to_edge(DOWN, buff=1.0)

        box = SurroundingRectangle(formula, color=GOLD, buff=0.15, corner_radius=0.1)
        self.play(Write(formula), Create(box), run_time=1.0)

        takeaway = Text(
            "More x-spread and larger n reduce slope variability.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.2)
        self.play(FadeIn(takeaway), run_time=0.8)
        self.wait(1.5)
