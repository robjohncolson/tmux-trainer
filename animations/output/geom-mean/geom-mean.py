"""
geom-mean: Geometric Mean  μ_X = 1/p
Manim Community Edition v0.19 — 720p30, ~14 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"


class GeomMeanScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Geometric Mean", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Formula
        formula = MathTex(
            r"\mu_X", "=", r"\frac{1}{p}",
            font_size=48, color=SOFT_WHITE,
        )
        formula.move_to(UP * 1.5)
        self.play(Write(formula), run_time=1.0)
        self.wait(0.3)

        # Show three examples side by side
        examples = [
            (0.5, "p = 0.5"),
            (0.25, "p = 0.25"),
            (0.1, "p = 0.1"),
        ]

        ex_group = VGroup()
        for p_val, label_str in examples:
            mu = 1 / p_val
            col = VGroup(
                MathTex(label_str, font_size=26, color=BLUE_ACCENT),
                MathTex(
                    rf"\mu = \frac{{1}}{{{p_val}}} = {mu:.0f}",
                    font_size=28, color=SOFT_WHITE,
                ),
            ).arrange(DOWN, buff=0.2)
            ex_group.add(col)

        ex_group.arrange(RIGHT, buff=1.2)
        ex_group.move_to(UP * 0.15)

        self.play(
            LaggedStart(*[FadeIn(e) for e in ex_group], lag_ratio=0.3),
            run_time=1.5,
        )
        self.wait(0.4)

        # Visual: bar chart for p=0.25, show mean line at 4
        p = 0.25
        mu_val = 1 / p
        num_bars = 12
        geom_vals = [(1 - p)**(k - 1) * p for k in range(1, num_bars + 1)]

        bar = BarChart(
            values=geom_vals,
            bar_names=[str(k) for k in range(1, num_bars + 1)],
            y_range=[0, 0.30, 0.10],
            x_length=9, y_length=2.2,
            bar_colors=[BLUE_ACCENT] * num_bars,
            bar_width=0.5,
        )
        bar.move_to(DOWN * 1.5)

        x_label = Text("Trial number", font_size=18, color=GREY_B)
        x_label.next_to(bar.x_axis, DOWN, buff=0.1)

        self.play(FadeIn(bar), FadeIn(x_label), run_time=0.8)
        self.wait(0.2)

        # Mean line at trial 4
        mu_idx = int(mu_val) - 1  # index 3 for trial 4
        mean_bar_x = bar.bars[mu_idx].get_center()[0]
        y_bot = bar.y_axis.n2p(0)[1]
        y_top = bar.y_axis.n2p(0.30)[1]

        mean_line = DashedLine(
            [mean_bar_x, y_bot - 0.1, 0], [mean_bar_x, y_top, 0],
            color=GOLD, dash_length=0.08,
        )
        mu_label = MathTex(
            rf"\mu = {mu_val:.0f}", font_size=24, color=GOLD,
        ).next_to(mean_line, UP, buff=0.1)

        self.play(Create(mean_line), FadeIn(mu_label), run_time=0.7)
        self.wait(0.3)

        # Intuition
        note = Text(
            "Lower p  \u2192  more trials expected before first success",
            font_size=22, color=SOFT_WHITE,
        )
        note.next_to(bar, DOWN, buff=0.5)
        self.play(FadeIn(note), run_time=0.6)
        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "On average, you need 1/p trials to get the first success.",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
