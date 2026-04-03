from manim import *

class CorrRScene(Scene):
    """~16-second animation: Correlation Coefficient (r)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Correlation Coefficient (r)", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Scatterplot (0.8-3s) ---
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=5.5, y_length=3.8,
            axis_config={"color": GREY_B, "font_size": 18, "include_numbers": True},
        ).shift(LEFT * 2.5 + DOWN * 0.3)

        self.play(Create(axes), run_time=0.6)

        # Strong positive correlation data
        points_data = [(1, 1.5), (2, 2.8), (3, 3.2), (4, 4.5), (5, 5.0),
                       (6, 6.3), (7, 6.8), (8, 8.1), (9, 8.9)]
        dots = VGroup(*[
            Dot(axes.c2p(x, y), radius=0.07, color=BLUE_ACCENT)
            for x, y in points_data
        ])
        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.06),
            run_time=0.8
        )
        self.wait(0.2)

        # --- Formula (3-6.5s) ---
        formula = MathTex(
            r"r", "=",
            r"\frac{1}{n-1}",
            r"\sum",
            r"\left(\frac{x_i - \bar{x}}{s_x}\right)",
            r"\left(\frac{y_i - \bar{y}}{s_y}\right)",
            font_size=30
        ).to_edge(RIGHT, buff=0.5).shift(UP * 0.5)
        formula[0].set_color(GOLD)
        formula[4].set_color(BLUE_ACCENT)
        formula[5].set_color(BLUE_ACCENT)

        self.play(Write(formula[:2]), run_time=0.5)
        self.play(Write(formula[2:4]), run_time=0.6)
        self.play(Write(formula[4]), run_time=0.8)
        self.play(Write(formula[5]), run_time=0.8)
        self.wait(0.3)

        # --- Explain z-score pieces (6.5-9s) ---
        z_x_label = MathTex(
            r"z_x = \frac{x_i - \bar{x}}{s_x}", font_size=24, color=BLUE_ACCENT
        ).next_to(formula, DOWN, buff=0.5)
        z_y_label = MathTex(
            r"z_y = \frac{y_i - \bar{y}}{s_y}", font_size=24, color=BLUE_ACCENT
        ).next_to(z_x_label, DOWN, buff=0.25)

        self.play(FadeIn(z_x_label, shift=UP * 0.1), run_time=0.5)
        self.play(FadeIn(z_y_label, shift=UP * 0.1), run_time=0.5)
        self.wait(0.3)

        # --- Show r value (9-11s) ---
        simplified = MathTex(
            r"r", "=",
            r"\frac{1}{n-1}", r"\sum z_x \cdot z_y",
            font_size=30, color=SOFT_WHITE
        ).next_to(z_y_label, DOWN, buff=0.5)
        simplified[0].set_color(GOLD)
        self.play(Write(simplified), run_time=0.8)

        r_val = MathTex(r"r \approx 0.99", font_size=34, color=GOLD).next_to(
            simplified, DOWN, buff=0.3
        )
        self.play(FadeIn(r_val, shift=UP * 0.1), run_time=0.6)

        # --- Draw best-fit line (11-12.5s) ---
        reg_line = axes.plot(lambda x: 0.2 + 0.95 * x, x_range=[0.5, 9.5], color=GOLD)
        self.play(Create(reg_line), run_time=0.8)

        # --- Highlight (12.5-13.5s) ---
        self.play(
            Indicate(formula[0], color=GOLD, scale_factor=1.3),
            Indicate(r_val, color=GOLD, scale_factor=1.1),
            run_time=0.6
        )

        # --- Takeaway (13.5-16s) ---
        takeaway = Text(
            "r measures the strength and direction of a linear relationship",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
