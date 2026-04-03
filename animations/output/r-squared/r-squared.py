from manim import *

class RSquaredScene(Scene):
    """~16-second animation: Coefficient of Determination (r-squared)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"
        RED_RES = "#FF6B6B"

        # --- Title (0-0.8s) ---
        title = Text("Coefficient of Determination", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Two scatterplots side by side (0.8-4s) ---
        # Left: no model (just y-bar), Right: regression model
        points_data = [(1, 2.0), (2, 3.1), (3, 3.5), (5, 5.2), (6, 6.0),
                       (7, 6.8), (8, 7.5), (9, 8.9)]
        y_bar = sum(y for _, y in points_data) / len(points_data)  # ~5.375

        axes_left = Axes(
            x_range=[0, 10, 5], y_range=[0, 10, 5],
            x_length=4.5, y_length=3.2,
            axis_config={"color": GREY_B, "font_size": 16, "include_numbers": True},
        ).shift(LEFT * 3.5 + DOWN * 0.3)
        label_left = Text("No model (just mean)", font_size=18, color=GREY_B).next_to(
            axes_left, UP, buff=0.2
        )

        axes_right = Axes(
            x_range=[0, 10, 5], y_range=[0, 10, 5],
            x_length=4.5, y_length=3.2,
            axis_config={"color": GREY_B, "font_size": 16, "include_numbers": True},
        ).shift(RIGHT * 3.5 + DOWN * 0.3)
        label_right = Text("Regression model", font_size=18, color=GREY_B).next_to(
            axes_right, UP, buff=0.2
        )

        self.play(
            Create(axes_left), Create(axes_right),
            FadeIn(label_left), FadeIn(label_right),
            run_time=0.8
        )

        # Dots on both
        dots_left = VGroup(*[
            Dot(axes_left.c2p(x, y), radius=0.06, color=BLUE_ACCENT)
            for x, y in points_data
        ])
        dots_right = VGroup(*[
            Dot(axes_right.c2p(x, y), radius=0.06, color=BLUE_ACCENT)
            for x, y in points_data
        ])
        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots_left], lag_ratio=0.05),
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots_right], lag_ratio=0.05),
            run_time=0.6
        )

        # Left: y-bar line
        ybar_line = axes_left.plot(lambda x: y_bar, x_range=[0.5, 9.5], color=SOFT_WHITE)
        ybar_label = MathTex(r"\bar{y}", font_size=20, color=SOFT_WHITE).next_to(
            axes_left.c2p(9.5, y_bar), RIGHT, buff=0.1
        )
        self.play(Create(ybar_line), FadeIn(ybar_label), run_time=0.5)

        # Right: regression line (y = 0.85x + 1.1)
        reg_line = axes_right.plot(lambda x: 1.1 + 0.85 * x, x_range=[0.5, 9.5], color=GOLD)
        self.play(Create(reg_line), run_time=0.5)

        # --- Show residuals on both (4-6.5s) ---
        res_left = VGroup()
        for x, y in points_data:
            seg = Line(axes_left.c2p(x, y_bar), axes_left.c2p(x, y),
                       color=RED_RES, stroke_width=1.5)
            res_left.add(seg)

        res_right = VGroup()
        for x, y in points_data:
            yh = 1.1 + 0.85 * x
            seg = Line(axes_right.c2p(x, yh), axes_right.c2p(x, y),
                       color=RED_RES, stroke_width=1.5)
            res_right.add(seg)

        self.play(
            LaggedStart(*[Create(r) for r in res_left], lag_ratio=0.06),
            LaggedStart(*[Create(r) for r in res_right], lag_ratio=0.06),
            run_time=1.0
        )

        # Labels: total variation vs remaining variation
        total_label = Text("Total variation", font_size=16, color=RED_RES).next_to(
            axes_left, DOWN, buff=0.3
        )
        remain_label = Text("Remaining variation", font_size=16, color=RED_RES).next_to(
            axes_right, DOWN, buff=0.3
        )
        self.play(FadeIn(total_label), FadeIn(remain_label), run_time=0.5)
        self.wait(0.4)

        # --- Formula (6.5-10s) ---
        formula = MathTex(
            r"r^2", "=",
            r"\frac{\text{variation explained}}{\text{total variation}}",
            font_size=34
        ).shift(DOWN * 2.5)
        formula[0].set_color(GOLD)

        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # Numeric example
        r_val = 0.98
        r_sq = MathTex(
            r"r = 0.98", r"\implies", r"r^2 = 0.96",
            font_size=30
        ).next_to(formula, DOWN, buff=0.35)
        r_sq[0].set_color(BLUE_ACCENT)
        r_sq[2].set_color(GOLD)

        self.play(Write(r_sq), run_time=0.8)
        self.wait(0.3)

        # --- Highlight (10-11.5s) ---
        self.play(
            Indicate(formula[0], color=GOLD, scale_factor=1.3),
            Indicate(r_sq[2], color=GOLD, scale_factor=1.1),
            run_time=0.6
        )

        # --- Interpretation (11.5-13s) ---
        interp = Text(
            "96% of the variation in y is explained by x",
            font_size=22, color=SOFT_WHITE
        ).next_to(r_sq, DOWN, buff=0.3)
        self.play(FadeIn(interp, shift=UP * 0.1), run_time=0.5)
        self.wait(0.3)

        # --- Takeaway (13-15.5s) ---
        takeaway = Text(
            "r-squared: proportion of variation in y explained by the model",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeOut(interp), run_time=0.2)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
