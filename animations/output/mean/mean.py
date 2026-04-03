from manim import *

class MeanScene(Scene):
    """15-second 3Blue1Brown-style animation: Sample Mean (x-bar)"""

    def construct(self):
        # Color palette
        BLUE_ACCENT = "#58C4DD"
        GOLD = "#FFD700"
        SOFT_WHITE = "#EEEEEE"

        # --- Scene 1: Show data points (0-4s) ---
        title = Text("Sample Mean", font_size=36, color=GOLD).to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        data_values = [3, 7, 5, 9, 6]
        dots = VGroup()
        labels = VGroup()
        number_line = NumberLine(
            x_range=[0, 12, 1], length=10,
            include_numbers=True, font_size=20,
            color=GREY_B
        ).shift(DOWN * 0.5)

        self.play(Create(number_line), run_time=0.6)

        for val in data_values:
            dot = Dot(number_line.n2p(val), radius=0.12, color=BLUE_ACCENT)
            label = MathTex(str(val), font_size=28, color=SOFT_WHITE).next_to(dot, UP, buff=0.2)
            dots.add(dot)
            labels.add(label)

        self.play(
            LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.15),
            LaggedStart(*[FadeIn(l, shift=UP * 0.2) for l in labels], lag_ratio=0.15),
            run_time=1.5
        )
        self.wait(0.3)

        # --- Scene 2: Build the formula step by step (4-9s) ---
        sum_tex = MathTex(
            r"\sum x_i", "=", "3", "+", "7", "+", "5", "+", "9", "+", "6", "=", "30",
            font_size=32, color=SOFT_WHITE
        ).next_to(number_line, DOWN, buff=0.8)

        # Highlight each value as we sum
        self.play(Write(sum_tex[:2]), run_time=0.4)
        for i, val_idx in enumerate(range(2, 11, 2)):
            self.play(
                dots[i].animate.set_color(GOLD),
                Write(sum_tex[val_idx:val_idx + 2 if val_idx < 10 else val_idx + 1]),
                run_time=0.25
            )
        self.play(Write(sum_tex[11:]), run_time=0.4)

        # n label
        n_tex = MathTex(r"n = 5", font_size=28, color=BLUE_ACCENT).next_to(sum_tex, DOWN, buff=0.4)
        self.play(FadeIn(n_tex, shift=UP * 0.15), run_time=0.4)

        self.wait(0.3)

        # --- Scene 3: Show the formula (9-13s) ---
        formula = MathTex(
            r"\bar{x}", "=", r"\frac{\sum x_i}{n}", "=", r"\frac{30}{5}", "=", "6",
            font_size=40
        ).to_edge(DOWN, buff=0.6)
        formula[0].set_color(GOLD)
        formula[2].set_color(SOFT_WHITE)
        formula[4].set_color(SOFT_WHITE)
        formula[6].set_color(GOLD)

        self.play(
            FadeOut(sum_tex), FadeOut(n_tex),
            run_time=0.4
        )
        self.play(Write(formula[:3]), run_time=1.0)
        self.play(Write(formula[3:5]), run_time=0.6)
        self.play(Write(formula[5:]), run_time=0.6)

        # Show mean on number line
        mean_dot = Dot(number_line.n2p(6), radius=0.18, color=GOLD, fill_opacity=0.9)
        mean_line = DashedLine(
            number_line.n2p(6) + UP * 1.2,
            number_line.n2p(6) + DOWN * 0.1,
            color=GOLD, stroke_width=2
        )
        mean_label = MathTex(r"\bar{x} = 6", font_size=28, color=GOLD).next_to(mean_line, UP, buff=0.1)

        self.play(
            Create(mean_line), FadeIn(mean_dot, scale=0.5),
            FadeIn(mean_label, shift=DOWN * 0.1),
            run_time=0.8
        )

        # --- Scene 4: Takeaway (13-15s) ---
        # Flash the formula
        self.play(
            Indicate(formula[0], color=GOLD, scale_factor=1.3),
            Indicate(formula[6], color=GOLD, scale_factor=1.3),
            run_time=0.6
        )

        takeaway = Text(
            "Add all values, divide by count",
            font_size=22, color=GREY_B
        ).to_edge(DOWN, buff=0.15)
        self.play(FadeIn(takeaway, shift=UP * 0.1), run_time=0.5)
        self.wait(1.0)
