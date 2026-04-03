from manim import *

class SlopeBScene(Scene):
    """~15-second animation: Regression Slope (b)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Regression Slope (b)", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Show the formula (0.8-3s) ---
        formula = MathTex(
            "b", "=", "r", r"\cdot", r"\frac{s_y}{s_x}",
            font_size=48
        ).shift(UP * 1.0)
        formula[0].set_color(GOLD)
        formula[2].set_color(BLUE_ACCENT)
        formula[4].set_color(SOFT_WHITE)

        self.play(Write(formula[:2]), run_time=0.5)
        self.play(Write(formula[2]), run_time=0.5)
        self.play(Write(formula[3:]), run_time=0.7)
        self.wait(0.3)

        # --- Label each piece (3-5.5s) ---
        r_label = Text("correlation", font_size=20, color=BLUE_ACCENT).next_to(formula[2], DOWN, buff=0.5)
        r_arrow = Arrow(r_label.get_top(), formula[2].get_bottom(), buff=0.1,
                        stroke_width=2, color=BLUE_ACCENT, max_tip_length_to_length_ratio=0.2)

        ratio_label = Text("ratio of\nspread in y to x", font_size=18, color=SOFT_WHITE).next_to(
            formula[4], DOWN, buff=0.6
        )
        ratio_arrow = Arrow(ratio_label.get_top(), formula[4].get_bottom(), buff=0.1,
                            stroke_width=2, color=SOFT_WHITE, max_tip_length_to_length_ratio=0.2)

        self.play(FadeIn(r_label, shift=UP * 0.1), Create(r_arrow), run_time=0.6)
        self.play(FadeIn(ratio_label, shift=UP * 0.1), Create(ratio_arrow), run_time=0.6)
        self.wait(0.4)

        # --- Numeric example (5.5-9s) ---
        example_box = VGroup()
        vals = MathTex(
            r"r = 0.85", r"\qquad", r"s_y = 4.2", r"\qquad", r"s_x = 3.0",
            font_size=28, color=SOFT_WHITE
        ).shift(DOWN * 1.2)
        vals[0].set_color(BLUE_ACCENT)

        self.play(
            FadeOut(r_label), FadeOut(r_arrow),
            FadeOut(ratio_label), FadeOut(ratio_arrow),
            run_time=0.3
        )
        self.play(Write(vals), run_time=0.8)

        calc = MathTex(
            "b", "=", "0.85", r"\cdot", r"\frac{4.2}{3.0}",
            "=", "0.85", r"\cdot", "1.4", "=", "1.19",
            font_size=32
        ).shift(DOWN * 2.2)
        calc[0].set_color(GOLD)
        calc[10].set_color(GOLD)

        self.play(Write(calc[:5]), run_time=0.8)
        self.play(Write(calc[5:9]), run_time=0.6)
        self.play(Write(calc[9:]), run_time=0.5)
        self.wait(0.3)

        # --- Interpretation (9-12s) ---
        interp = Text(
            "For each 1-unit increase in x, y increases by b units",
            font_size=22, color=SOFT_WHITE
        ).shift(DOWN * 3.2)
        self.play(FadeIn(interp, shift=UP * 0.1), run_time=0.6)
        self.wait(0.5)

        # --- Highlight (12-13.5s) ---
        self.play(
            Indicate(formula, color=GOLD, scale_factor=1.05),
            Indicate(calc[10], color=GOLD, scale_factor=1.3),
            run_time=0.7
        )

        # --- Takeaway (13.5-15s) ---
        takeaway = Text(
            "Slope = correlation scaled by the ratio of standard deviations",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeOut(interp), run_time=0.2)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
