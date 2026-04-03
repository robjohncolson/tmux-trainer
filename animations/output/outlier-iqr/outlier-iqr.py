from manim import *

class OutlierIqrScene(Scene):
    """~16-second animation: Outlier Rule (1.5 * IQR)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"
        RED_WARN = "#FF6B6B"

        # --- Title (0-0.8s) ---
        title = Text("Outlier Rule (1.5 \u00D7 IQR)", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Number line with data (0.8-2.5s) ---
        number_line = NumberLine(
            x_range=[0, 30, 5], length=11,
            include_numbers=True, font_size=18,
            color=GREY_B
        ).shift(UP * 0.8)
        self.play(Create(number_line), run_time=0.5)

        # Data with an outlier at 28
        data = [3, 6, 8, 10, 12, 14, 16, 18, 28]
        # Q1=6, Q3=18, IQR=12, fences: 6-18=12, 1.5*12=18
        # Lower fence = 6 - 18 = -12, Upper fence = 18 + 18 = 36
        # Outlier: 28 is NOT an outlier by this data; let me adjust
        # Better: Q1=7, Q3=17, IQR=10, upper fence=17+15=32, lower fence=7-15=-8
        # Use data where 28 IS an outlier: Q1=6, Q3=14, IQR=8, fence=14+12=26
        data = [2, 4, 6, 8, 10, 12, 14, 16, 28]
        q1, q3 = 5, 15
        iqr_val = 10

        dots = VGroup()
        for val in data:
            color = RED_WARN if val == 28 else BLUE_ACCENT
            dot = Dot(number_line.n2p(val), radius=0.1, color=color)
            dots.add(dot)

        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.06),
            run_time=0.8
        )
        self.wait(0.2)

        # --- Show Q1, Q3, IQR (2.5-4.5s) ---
        stats = MathTex(
            r"Q_1=5", r"\qquad", r"Q_3=15", r"\qquad", r"IQR=10",
            font_size=26, color=SOFT_WHITE
        ).shift(DOWN * 0.2)
        stats[0].set_color(BLUE_ACCENT)
        stats[2].set_color(BLUE_ACCENT)
        stats[4].set_color(GOLD)
        self.play(Write(stats), run_time=0.8)
        self.wait(0.2)

        # --- Formula (4.5-7s) ---
        rule_upper = MathTex(
            r"\text{Outlier if } x", ">", r"Q_3", "+", r"1.5 \cdot IQR",
            font_size=28
        ).shift(DOWN * 1.2)
        rule_upper[0].set_color(SOFT_WHITE)
        rule_upper[2].set_color(BLUE_ACCENT)
        rule_upper[4].set_color(GOLD)

        rule_lower = MathTex(
            r"\text{or } x", "<", r"Q_1", "-", r"1.5 \cdot IQR",
            font_size=28
        ).next_to(rule_upper, DOWN, buff=0.25)
        rule_lower[0].set_color(SOFT_WHITE)
        rule_lower[2].set_color(BLUE_ACCENT)
        rule_lower[4].set_color(GOLD)

        self.play(Write(rule_upper), run_time=0.8)
        self.play(Write(rule_lower), run_time=0.8)
        self.wait(0.3)

        # --- Compute fences (7-9.5s) ---
        fence_calc = MathTex(
            r"Q_3 + 1.5(10)", "=", "15 + 15", "=", "30",
            font_size=26, color=SOFT_WHITE
        ).shift(DOWN * 2.6)
        fence_calc[4].set_color(GOLD)
        self.play(Write(fence_calc), run_time=0.8)

        # Draw fence line at 30
        fence_line = DashedLine(
            number_line.n2p(30) + UP * 0.5, number_line.n2p(30) + DOWN * 0.3,
            color=GOLD, stroke_width=2
        )
        fence_label = MathTex(r"30", font_size=22, color=GOLD).next_to(fence_line, UP, buff=0.1)
        self.play(Create(fence_line), FadeIn(fence_label), run_time=0.5)
        self.wait(0.2)

        # --- Check the suspect point (9.5-12s) ---
        check = MathTex(
            r"28", "<", "30", r"\implies", r"\text{Not an outlier!}",
            font_size=28
        ).shift(DOWN * 3.3)
        check[0].set_color(RED_WARN)
        check[4].set_color(SOFT_WHITE)

        self.play(Write(check), run_time=0.8)

        # Change the suspect dot to show it's OK
        self.play(dots[-1].animate.set_color(BLUE_ACCENT), run_time=0.4)
        self.wait(0.3)

        # --- Highlight (12-13s) ---
        self.play(
            Indicate(rule_upper, color=GOLD, scale_factor=1.05),
            run_time=0.6
        )

        # --- Takeaway (13-15.5s) ---
        takeaway = Text(
            "Points beyond 1.5 \u00D7 IQR from Q1 or Q3 are outliers",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeOut(check), run_time=0.2)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
