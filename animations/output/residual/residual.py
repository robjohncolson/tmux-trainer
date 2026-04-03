from manim import *

class ResidualScene(Scene):
    """~15-second animation: Residual = y - y-hat"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"
        RED_RES = "#FF6B6B"

        # --- Title (0-0.8s) ---
        title = Text("Residual", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Scatterplot + regression line (0.8-3.5s) ---
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=7, y_length=4.5,
            axis_config={"color": GREY_B, "font_size": 20, "include_numbers": True},
        ).shift(DOWN * 0.4 + LEFT * 0.8)
        x_label = Text("x", font_size=20, color=GREY_B).next_to(axes.x_axis, RIGHT, buff=0.15)
        y_label = Text("y", font_size=20, color=GREY_B).next_to(axes.y_axis, UP, buff=0.15)

        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label), run_time=0.6)

        # Regression line: y-hat = 1 + 0.8x
        a_val, b_val = 1.0, 0.8
        reg_line = axes.plot(lambda x: a_val + b_val * x, x_range=[0.5, 9.5], color=GOLD)
        self.play(Create(reg_line), run_time=0.6)

        points_data = [(2, 3.5), (4, 3.8), (5, 6.0), (6, 5.2), (8, 8.5)]
        dots = VGroup(*[
            Dot(axes.c2p(x, y), radius=0.08, color=BLUE_ACCENT)
            for x, y in points_data
        ])
        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.1),
            run_time=0.8
        )
        self.wait(0.2)

        # --- Focus on one point to show residual (3.5-7s) ---
        # Highlight point (5, 6.0), y-hat = 1 + 0.8*5 = 5.0, residual = 1.0
        focus_x, focus_y = 5, 6.0
        y_hat = a_val + b_val * focus_x  # 5.0

        # Enlarge the focus dot
        focus_dot = Dot(axes.c2p(focus_x, focus_y), radius=0.14, color=GOLD)
        hat_dot = Dot(axes.c2p(focus_x, y_hat), radius=0.10, color=SOFT_WHITE)

        self.play(FadeIn(focus_dot, scale=0.5), FadeIn(hat_dot, scale=0.5), run_time=0.5)

        # Labels
        y_label_pt = MathTex(r"y=6.0", font_size=22, color=GOLD).next_to(
            axes.c2p(focus_x, focus_y), RIGHT, buff=0.15
        )
        yhat_label_pt = MathTex(r"\hat{y}=5.0", font_size=22, color=SOFT_WHITE).next_to(
            axes.c2p(focus_x, y_hat), RIGHT, buff=0.15
        )
        self.play(FadeIn(y_label_pt), FadeIn(yhat_label_pt), run_time=0.5)

        # Draw the residual segment
        res_line = Line(
            axes.c2p(focus_x, y_hat), axes.c2p(focus_x, focus_y),
            color=RED_RES, stroke_width=3
        )
        res_brace = Brace(res_line, direction=RIGHT, color=RED_RES, buff=0.05)
        res_label = MathTex(r"e = 1.0", font_size=22, color=RED_RES).next_to(res_brace, RIGHT, buff=0.1)

        self.play(Create(res_line), run_time=0.5)
        self.play(FadeIn(res_brace), FadeIn(res_label), run_time=0.5)
        self.wait(0.3)

        # --- Formula (7-10s) ---
        formula = MathTex(
            r"\text{residual}", "=", "y", "-", r"\hat{y}",
            font_size=42
        ).to_edge(RIGHT, buff=0.6).shift(DOWN * 1.5)
        formula[0].set_color(RED_RES)
        formula[2].set_color(GOLD)
        formula[4].set_color(SOFT_WHITE)

        self.play(Write(formula), run_time=1.0)

        calc = MathTex(
            "=", "6.0", "-", "5.0", "=", "1.0",
            font_size=34
        ).next_to(formula, DOWN, buff=0.3)
        calc[1].set_color(GOLD)
        calc[3].set_color(SOFT_WHITE)
        calc[5].set_color(RED_RES)

        self.play(Write(calc), run_time=0.8)
        self.wait(0.3)

        # --- Show all residuals (10-12s) ---
        all_res = VGroup()
        for x, y in points_data:
            yh = a_val + b_val * x
            seg = Line(axes.c2p(x, yh), axes.c2p(x, y), color=RED_RES, stroke_width=2)
            all_res.add(seg)

        self.play(
            LaggedStart(*[Create(r) for r in all_res], lag_ratio=0.08),
            run_time=0.8
        )
        self.wait(0.3)

        # --- Highlight (12-13s) ---
        self.play(
            Indicate(formula, color=GOLD, scale_factor=1.05),
            run_time=0.6
        )

        # --- Takeaway (13-15s) ---
        takeaway = Text(
            "Residual: the vertical distance from a point to the line",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
