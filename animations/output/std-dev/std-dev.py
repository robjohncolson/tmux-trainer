from manim import *

class StdDevScene(Scene):
    """~15-second animation: Sample Standard Deviation (s)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Sample Standard Deviation", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Data on a number line (0.8-3s) ---
        data = [2, 4, 6, 8, 10]
        mean_val = 6.0

        number_line = NumberLine(
            x_range=[0, 12, 1], length=10,
            include_numbers=True, font_size=20,
            color=GREY_B
        ).shift(DOWN * 0.3)
        self.play(Create(number_line), run_time=0.6)

        dots = VGroup()
        labels = VGroup()
        for val in data:
            dot = Dot(number_line.n2p(val), radius=0.12, color=BLUE_ACCENT)
            label = MathTex(str(val), font_size=28, color=SOFT_WHITE).next_to(dot, UP, buff=0.2)
            dots.add(dot)
            labels.add(label)

        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.12),
            LaggedStart(*[FadeIn(l, shift=UP * 0.2) for l in labels], lag_ratio=0.12),
            run_time=1.2
        )

        # --- Show mean line (3-4s) ---
        mean_line = DashedLine(
            number_line.n2p(mean_val) + UP * 1.0,
            number_line.n2p(mean_val) + DOWN * 0.1,
            color=GOLD, stroke_width=2
        )
        mean_label = MathTex(r"\bar{x}=6", font_size=26, color=GOLD).next_to(mean_line, UP, buff=0.1)
        self.play(Create(mean_line), FadeIn(mean_label, shift=DOWN * 0.1), run_time=0.7)

        # --- Show deviations as arrows (4-6s) ---
        arrows = VGroup()
        for i, val in enumerate(data):
            if val != mean_val:
                arrow = Arrow(
                    number_line.n2p(val) + DOWN * 0.3,
                    number_line.n2p(mean_val) + DOWN * 0.3,
                    buff=0.05, stroke_width=2,
                    color=BLUE_ACCENT, max_tip_length_to_length_ratio=0.15
                )
                arrows.add(arrow)

        self.play(
            LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.15),
            run_time=1.2
        )
        self.wait(0.3)

        # --- Build formula (6-11s) ---
        formula_group = VGroup()

        step1 = MathTex(
            r"s_x", "=", r"\sqrt{\frac{\sum(x_i - \bar{x})^2}{n-1}}",
            font_size=36
        ).shift(DOWN * 2.0)
        step1[0].set_color(GOLD)
        step1[2].set_color(SOFT_WHITE)

        self.play(
            FadeOut(arrows),
            run_time=0.3
        )
        self.play(Write(step1), run_time=1.5)
        self.wait(0.4)

        # --- Numeric substitution (11-14s) ---
        step2 = MathTex(
            r"=", r"\sqrt{\frac{16+4+0+4+16}{4}}",
            font_size=34, color=SOFT_WHITE
        ).next_to(step1, DOWN, buff=0.4)
        self.play(Write(step2), run_time=1.0)

        step3 = MathTex(
            r"=", r"\sqrt{\frac{40}{4}}", "=", r"\sqrt{10}", r"\approx 3.16",
            font_size=34
        ).next_to(step2, DOWN, buff=0.3)
        step3[3].set_color(GOLD)
        step3[4].set_color(GOLD)
        self.play(Write(step3), run_time=1.2)
        self.wait(0.3)

        # --- Takeaway (14-16s) ---
        self.play(
            Indicate(step1[0], color=GOLD, scale_factor=1.3),
            run_time=0.5
        )
        takeaway = Text(
            "Average squared distance from the mean (with n\u22121)",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
