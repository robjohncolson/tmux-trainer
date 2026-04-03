from manim import *

class YInterceptScene(Scene):
    """~15-second animation: Y-Intercept of Regression Line (a = y-bar - b*x-bar)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Y-Intercept of the Regression Line", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Formula (0.8-3s) ---
        formula = MathTex(
            "a", "=", r"\bar{y}", "-", "b", r"\bar{x}",
            font_size=48
        ).shift(UP * 1.5)
        formula[0].set_color(GOLD)
        formula[2].set_color(BLUE_ACCENT)
        formula[4].set_color(BLUE_ACCENT)
        formula[5].set_color(BLUE_ACCENT)

        self.play(Write(formula[:2]), run_time=0.5)
        self.play(Write(formula[2:4]), run_time=0.5)
        self.play(Write(formula[4:]), run_time=0.5)
        self.wait(0.3)

        # --- Explain why (3-5s) ---
        explain = MathTex(
            r"\hat{y}", "=", "a", "+", "b", "x",
            r"\quad\Longrightarrow\quad",
            r"\bar{y}", "=", "a", "+", "b", r"\bar{x}",
            font_size=28, color=SOFT_WHITE
        ).shift(UP * 0.3)
        explain[0].set_color(GOLD)
        explain[7].set_color(BLUE_ACCENT)
        explain[12].set_color(BLUE_ACCENT)

        self.play(Write(explain), run_time=1.2)
        self.wait(0.3)

        # --- Numeric example (5-8.5s) ---
        vals = MathTex(
            r"\bar{y} = 5.4", r"\qquad", r"b = 0.8", r"\qquad", r"\bar{x} = 4.5",
            font_size=28, color=SOFT_WHITE
        ).shift(DOWN * 0.6)
        vals[0].set_color(BLUE_ACCENT)
        vals[2].set_color(BLUE_ACCENT)
        vals[4].set_color(BLUE_ACCENT)

        self.play(Write(vals), run_time=0.8)

        calc = MathTex(
            "a", "=", "5.4", "-", "0.8", r"\cdot", "4.5",
            "=", "5.4", "-", "3.6", "=", "1.8",
            font_size=32
        ).shift(DOWN * 1.5)
        calc[0].set_color(GOLD)
        calc[12].set_color(GOLD)

        self.play(Write(calc[:7]), run_time=0.8)
        self.play(Write(calc[7:11]), run_time=0.6)
        self.play(Write(calc[11:]), run_time=0.5)
        self.wait(0.3)

        # --- Scatterplot showing intercept (8.5-12s) ---
        axes = Axes(
            x_range=[0, 10, 2], y_range=[0, 10, 2],
            x_length=5, y_length=3,
            axis_config={"color": GREY_B, "font_size": 16, "include_numbers": True},
        ).shift(DOWN * 3.0 + LEFT * 2.0)

        reg_line = axes.plot(lambda x: 1.8 + 0.8 * x, x_range=[0, 9.5], color=GOLD)

        # Mark the y-intercept
        intercept_dot = Dot(axes.c2p(0, 1.8), radius=0.12, color=GOLD)
        a_label = MathTex(r"a = 1.8", font_size=22, color=GOLD).next_to(
            intercept_dot, RIGHT + UP, buff=0.15
        )

        # Mark the point of means
        mean_dot = Dot(axes.c2p(4.5, 5.4), radius=0.10, color=BLUE_ACCENT)
        mean_label = MathTex(r"(\bar{x}, \bar{y})", font_size=20, color=BLUE_ACCENT).next_to(
            mean_dot, UP + RIGHT, buff=0.1
        )

        self.play(Create(axes), run_time=0.5)
        self.play(Create(reg_line), run_time=0.6)
        self.play(
            FadeIn(intercept_dot, scale=0.5), FadeIn(a_label, shift=DOWN * 0.1),
            FadeIn(mean_dot, scale=0.5), FadeIn(mean_label, shift=DOWN * 0.1),
            run_time=0.7
        )
        self.wait(0.3)

        # --- Highlight (12-13s) ---
        self.play(
            Indicate(formula[0], color=GOLD, scale_factor=1.3),
            Indicate(intercept_dot, color=GOLD, scale_factor=1.5),
            run_time=0.6
        )

        # --- Takeaway (13-15s) ---
        takeaway = Text(
            "Solve for a using the point of means on the line",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
