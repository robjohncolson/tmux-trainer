from manim import *

class LinregScene(Scene):
    """~15-second animation: Least-Squares Regression Line"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Least-Squares Regression Line", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Scatterplot (0.8-4s) ---
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=6, y_length=4,
            axis_config={"color": GREY_B, "font_size": 20, "include_numbers": True},
        ).shift(DOWN * 0.5 + LEFT * 0.5)
        x_label = Text("x", font_size=20, color=GREY_B).next_to(axes.x_axis, RIGHT, buff=0.15)
        y_label = Text("y", font_size=20, color=GREY_B).next_to(axes.y_axis, UP, buff=0.15)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label), run_time=0.8)

        # Data points (roughly linear: y ≈ 0.8x + 1)
        points_data = [(1, 2.2), (2, 2.8), (3, 3.5), (4, 4.0), (5, 5.1),
                       (6, 5.8), (7, 6.5), (8, 7.2), (9, 8.0)]
        dots = VGroup(*[
            Dot(axes.c2p(x, y), radius=0.08, color=BLUE_ACCENT)
            for x, y in points_data
        ])

        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.08),
            run_time=1.2
        )
        self.wait(0.3)

        # --- Formula (4-7s) ---
        formula = MathTex(
            r"\hat{y}", "=", "a", "+", "b", "x",
            font_size=42
        ).to_edge(RIGHT, buff=0.8).shift(UP * 0.5)
        formula[0].set_color(GOLD)
        formula[2].set_color(BLUE_ACCENT)  # a
        formula[4].set_color(BLUE_ACCENT)  # b

        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # --- Draw the regression line (7-10s) ---
        # Best-fit: y = 0.77x + 1.36 (approx)
        a_val, b_val = 1.36, 0.77
        line = axes.plot(lambda x: a_val + b_val * x, x_range=[0.5, 9.5], color=GOLD)

        self.play(Create(line), run_time=1.5)

        # Label a and b
        a_note = MathTex(r"a = 1.36", font_size=26, color=BLUE_ACCENT).next_to(formula, DOWN, buff=0.4)
        b_note = MathTex(r"b = 0.77", font_size=26, color=BLUE_ACCENT).next_to(a_note, DOWN, buff=0.2)
        self.play(FadeIn(a_note, shift=UP * 0.1), FadeIn(b_note, shift=UP * 0.1), run_time=0.7)
        self.wait(0.3)

        # --- Show residuals briefly (10-13s) ---
        residual_lines = VGroup()
        for x, y in points_data:
            y_hat = a_val + b_val * x
            line_seg = Line(
                axes.c2p(x, y), axes.c2p(x, y_hat),
                stroke_width=1.5, color=RED_C
            )
            residual_lines.add(line_seg)

        self.play(
            LaggedStart(*[Create(r) for r in residual_lines], lag_ratio=0.06),
            run_time=1.0
        )
        self.wait(0.4)

        # --- Highlight formula (13-14s) ---
        self.play(
            Indicate(formula, color=GOLD, scale_factor=1.1),
            run_time=0.6
        )

        # --- Takeaway (14-16s) ---
        takeaway = Text(
            "The line that minimizes the sum of squared residuals",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
