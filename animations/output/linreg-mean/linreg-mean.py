from manim import *

class LinregMeanScene(Scene):
    """~15-second animation: Regression Line Passes Through (x-bar, y-bar)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Regression Through the Means", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Scatterplot with regression line (0.8-3.5s) ---
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=7, y_length=4.5,
            axis_config={"color": GREY_B, "font_size": 20, "include_numbers": True},
        ).shift(DOWN * 0.3)
        self.play(Create(axes), run_time=0.6)

        points_data = [(1, 1.8), (2, 3.1), (3, 3.5), (5, 5.2), (6, 5.8),
                       (7, 7.0), (8, 7.5), (9, 8.8)]
        dots = VGroup(*[
            Dot(axes.c2p(x, y), radius=0.08, color=BLUE_ACCENT)
            for x, y in points_data
        ])
        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.08),
            run_time=0.8
        )

        # Regression line: y ≈ 0.88x + 0.67
        a_val, b_val = 0.67, 0.88
        line = axes.plot(lambda x: a_val + b_val * x, x_range=[0.5, 9.5], color=GOLD)
        self.play(Create(line), run_time=0.8)

        # --- Compute means (3.5-6s) ---
        x_mean = sum(x for x, y in points_data) / len(points_data)  # 5.125
        y_mean = sum(y for x, y in points_data) / len(points_data)  # 5.3375

        means_tex = MathTex(
            r"\bar{x}", "=", "5.1", r"\qquad", r"\bar{y}", "=", "5.3",
            font_size=30, color=SOFT_WHITE
        ).to_edge(RIGHT, buff=0.6).shift(UP * 1.5)
        means_tex[0].set_color(BLUE_ACCENT)
        means_tex[4].set_color(BLUE_ACCENT)

        self.play(Write(means_tex), run_time=1.0)
        self.wait(0.3)

        # --- Highlight the point (x-bar, y-bar) on the line (6-9s) ---
        mean_point = Dot(axes.c2p(x_mean, y_mean), radius=0.18, color=GOLD, fill_opacity=0.9)
        mean_ring = Circle(radius=0.3, color=GOLD, stroke_width=2).move_to(axes.c2p(x_mean, y_mean))

        self.play(
            FadeIn(mean_point, scale=0.5),
            Create(mean_ring),
            run_time=0.8
        )

        point_label = MathTex(
            r"(\bar{x},\,\bar{y})", font_size=28, color=GOLD
        ).next_to(mean_point, UP + RIGHT, buff=0.2)
        self.play(FadeIn(point_label, shift=DOWN * 0.1), run_time=0.6)
        self.wait(0.3)

        # --- Show the key formula (9-12s) ---
        formula = MathTex(
            r"\bar{y}", "=", "a", "+", "b", r"\bar{x}",
            font_size=42
        ).to_edge(DOWN, buff=0.9)
        formula[0].set_color(GOLD)
        formula[5].set_color(GOLD)

        self.play(Write(formula), run_time=1.2)
        self.wait(0.3)

        # --- Pulse the mean point (12-13s) ---
        self.play(
            Indicate(mean_point, color=GOLD, scale_factor=1.5),
            Indicate(formula, color=GOLD, scale_factor=1.05),
            run_time=0.7
        )

        # --- Takeaway (13-15s) ---
        takeaway = Text(
            "The LSRL always passes through the point of means",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeOut(formula), run_time=0.2)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
