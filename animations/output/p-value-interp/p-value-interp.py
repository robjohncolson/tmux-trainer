"""
p-value-interp: P-value = P(observed or more extreme | H₀ true)
Manim Community Edition v0.19 — 720p30, ~15 seconds
"""
from manim import *
import numpy as np
from scipy import stats

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"
GREEN = "#66FF66"
ORANGE = "#FFA500"


class PValueInterpScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        title = Text("P-Value Interpretation", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(Write(title), run_time=0.8)

        # --- Formula (0.8-3s) ---
        formula = MathTex(
            r"P\text{-value} = P(",
            r"\text{observed or more extreme}",
            r"\mid",
            r"H_0 \text{ true}",
            r")",
            font_size=30,
        ).shift(UP * 1.8)
        formula[1].set_color(BLUE_ACCENT)
        formula[2].set_color(GOLD)
        formula[3].set_color(RED)

        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # --- Normal curve with shaded tail (3-8s) ---
        ax = Axes(
            x_range=[-4, 4, 1], y_range=[0, 0.45, 0.1],
            x_length=8, y_length=3,
            axis_config={"include_ticks": False, "color": GREY_B},
        ).shift(DOWN * 0.5)

        x_vals = np.linspace(-4, 4, 200)
        y_vals = stats.norm.pdf(x_vals)
        curve = ax.plot_line_graph(
            x_values=x_vals, y_values=y_vals,
            add_vertex_dots=False, line_color=SOFT_WHITE, stroke_width=2,
        )

        h0_label = MathTex(r"\text{Distribution assuming } H_0",
                           font_size=20, color=GREY_A)
        h0_label.next_to(ax, UP, buff=0.1)

        self.play(Create(ax), run_time=0.5)
        self.play(Create(curve), FadeIn(h0_label), run_time=0.8)

        # Test statistic line at z=2.1
        z_obs = 2.1
        test_line = DashedLine(
            ax.c2p(z_obs, 0), ax.c2p(z_obs, stats.norm.pdf(z_obs)),
            color=ORANGE, stroke_width=2,
        )
        test_label = MathTex(r"z = 2.1", font_size=22, color=ORANGE)
        test_label.next_to(test_line, UP, buff=0.1)

        self.play(Create(test_line), FadeIn(test_label), run_time=0.5)

        # Shade right tail
        tail_x = np.linspace(z_obs, 4, 50)
        tail_y = stats.norm.pdf(tail_x)
        tail_points = [ax.c2p(x, y) for x, y in zip(tail_x, tail_y)]
        tail_points.append(ax.c2p(4, 0))
        tail_points.append(ax.c2p(z_obs, 0))
        tail_polygon = Polygon(*tail_points, fill_color=RED, fill_opacity=0.5,
                               stroke_width=0)

        pval_label = MathTex(r"p\text{-value} = 0.036", font_size=22, color=RED)
        pval_label.next_to(ax.c2p(3, 0.05), UP, buff=0.1)

        self.play(FadeIn(tail_polygon), run_time=0.6)
        self.play(FadeIn(pval_label), run_time=0.4)
        self.wait(0.3)

        # --- Decision (8-11s) ---
        alpha_line = DashedLine(
            ax.c2p(1.96, 0), ax.c2p(1.96, 0.06),
            color=GOLD, stroke_width=2,
        )
        alpha_label = MathTex(r"\alpha = 0.05", font_size=20, color=GOLD)
        alpha_label.next_to(alpha_line, DOWN, buff=0.15)

        self.play(Create(alpha_line), FadeIn(alpha_label), run_time=0.5)

        decision = MathTex(
            r"0.036 < 0.05 \implies \text{Reject } H_0",
            font_size=26, color=GREEN,
        ).shift(DOWN * 2.8)
        self.play(Write(decision), run_time=0.8)
        self.wait(0.3)

        # --- Common misconception (11-15s) ---
        wrong = VGroup(
            MathTex(r"\neq", font_size=24, color=RED),
            Text("P(H₀ is true)", font_size=20, color=RED),
        ).arrange(RIGHT, buff=0.15).to_edge(DOWN, buff=0.3)

        correct = Text("It's P(data this extreme | H₀), not P(H₀ | data)",
                       font_size=18, color=GOLD)
        correct.next_to(wrong, UP, buff=0.15)

        self.play(FadeIn(correct, shift=UP * 0.1), FadeIn(wrong), run_time=0.6)
        self.wait(2.0)
