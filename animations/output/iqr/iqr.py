from manim import *

class IqrScene(Scene):
    """~15-second animation: Interquartile Range (IQR)"""

    def construct(self):
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Title (0-0.8s) ---
        title = Text("Interquartile Range (IQR)", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # --- Sorted data set (0.8-2.5s) ---
        data = [2, 4, 5, 7, 8, 10, 11, 13, 15, 18, 20]
        # Q1=5, Med=10, Q3=15

        number_line = NumberLine(
            x_range=[0, 22, 2], length=11,
            include_numbers=True, font_size=18,
            color=GREY_B
        ).shift(DOWN * 0.2)
        self.play(Create(number_line), run_time=0.6)

        dots = VGroup()
        for val in data:
            dot = Dot(number_line.n2p(val), radius=0.1, color=BLUE_ACCENT)
            dots.add(dot)

        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.08),
            run_time=0.8
        )
        self.wait(0.2)

        # --- Mark Q1, Median, Q3 (2.5-5.5s) ---
        q1, med, q3 = 5, 10, 15

        q1_line = DashedLine(
            number_line.n2p(q1) + UP * 0.8, number_line.n2p(q1) + DOWN * 0.1,
            color=BLUE_ACCENT, stroke_width=2
        )
        q1_label = MathTex(r"Q_1=5", font_size=24, color=BLUE_ACCENT).next_to(q1_line, UP, buff=0.1)

        med_line = DashedLine(
            number_line.n2p(med) + UP * 0.8, number_line.n2p(med) + DOWN * 0.1,
            color=SOFT_WHITE, stroke_width=2
        )
        med_label = MathTex(r"Med=10", font_size=24, color=SOFT_WHITE).next_to(med_line, UP, buff=0.1)

        q3_line = DashedLine(
            number_line.n2p(q3) + UP * 0.8, number_line.n2p(q3) + DOWN * 0.1,
            color=BLUE_ACCENT, stroke_width=2
        )
        q3_label = MathTex(r"Q_3=15", font_size=24, color=BLUE_ACCENT).next_to(q3_line, UP, buff=0.1)

        self.play(
            Create(q1_line), FadeIn(q1_label, shift=DOWN * 0.1),
            run_time=0.6
        )
        self.play(
            Create(med_line), FadeIn(med_label, shift=DOWN * 0.1),
            run_time=0.6
        )
        self.play(
            Create(q3_line), FadeIn(q3_label, shift=DOWN * 0.1),
            run_time=0.6
        )
        self.wait(0.3)

        # --- Highlight middle 50% box (5.5-7.5s) ---
        box = Rectangle(
            width=number_line.n2p(q3)[0] - number_line.n2p(q1)[0],
            height=0.6, color=GOLD, fill_opacity=0.15, stroke_width=2
        ).move_to(
            (number_line.n2p(q1) + number_line.n2p(q3)) / 2 + DOWN * 0.2
        )
        box_label = Text("Middle 50%", font_size=20, color=GOLD).next_to(box, DOWN, buff=0.15)

        self.play(Create(box), FadeIn(box_label, shift=UP * 0.1), run_time=0.8)
        self.wait(0.3)

        # --- Formula (7.5-10.5s) ---
        formula = MathTex(
            r"IQR", "=", r"Q_3", "-", r"Q_1",
            font_size=44
        ).shift(DOWN * 2.0)
        formula[0].set_color(GOLD)
        formula[2].set_color(BLUE_ACCENT)
        formula[4].set_color(BLUE_ACCENT)

        self.play(Write(formula), run_time=1.0)

        result = MathTex(
            "=", "15", "-", "5", "=", "10",
            font_size=38
        ).next_to(formula, DOWN, buff=0.3)
        result[1].set_color(BLUE_ACCENT)
        result[3].set_color(BLUE_ACCENT)
        result[5].set_color(GOLD)

        self.play(Write(result), run_time=0.8)
        self.wait(0.3)

        # --- Highlight (10.5-11.5s) ---
        self.play(
            Indicate(formula[0], color=GOLD, scale_factor=1.3),
            Indicate(result[5], color=GOLD, scale_factor=1.3),
            run_time=0.6
        )

        # --- Takeaway (11.5-14s) ---
        takeaway = Text(
            "The spread of the middle 50% of the data",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
