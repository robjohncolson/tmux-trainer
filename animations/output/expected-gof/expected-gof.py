"""
Expected Count (Goodness of Fit): E = n * p0
Shows expected proportions from the null hypothesis.
Manim Community v0.19 | 720p30 | ~14 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"


class ExpectedGofScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Expected Count (Goodness of Fit)", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Formula
        formula = MathTex(
            r"E", r"=", r"n", r"\cdot", r"p_0",
            font_size=44, color=SOFT_WHITE,
        )
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=0.8)

        # Null hypothesis
        h0 = MathTex(
            r"H_0:", r"\, p_A = 0.25,\;",
            r"p_B = 0.25,\;",
            r"p_C = 0.25,\;",
            r"p_D = 0.25",
            font_size=26, color=SOFT_WHITE,
        )
        h0[0].set_color(BLUE_ACCENT)
        h0.next_to(formula, DOWN, buff=0.45)
        self.play(Write(h0), run_time=0.8)

        # Sample size
        n_label = MathTex(r"n = 200", font_size=30, color=GOLD)
        n_label.next_to(h0, DOWN, buff=0.35)
        self.play(FadeIn(n_label), run_time=0.4)
        self.wait(0.3)

        # Build expected count table
        def cell(txt, color=SOFT_WHITE, bold=False):
            return Text(
                str(txt), font_size=20, color=color,
                weight=BOLD if bold else NORMAL,
            )

        cats = ["A", "B", "C", "D"]
        props = [0.25, 0.25, 0.25, 0.25]
        n_val = 200

        header = [cell("Category", BLUE_ACCENT, True),
                  cell("p\u2080", BLUE_ACCENT, True),
                  cell("E = n\u00b7p\u2080", BLUE_ACCENT, True)]
        rows = [header]
        for i in range(4):
            exp_val = int(n_val * props[i])
            rows.append([
                cell(cats[i]),
                cell(str(props[i])),
                cell("?", GREY_B),
            ])

        table = MobjectTable(
            rows,
            include_outer_lines=True,
            line_config={"stroke_width": 1, "color": GREY_B},
            h_buff=0.6,
            v_buff=0.3,
        )
        table.scale(0.72)
        table.next_to(n_label, DOWN, buff=0.4)
        self.play(FadeIn(table), run_time=0.7)
        self.wait(0.3)

        # Fill in expected values one by one
        for i in range(4):
            exp_val = int(n_val * props[i])
            old_cell = table.get_entries((i + 2, 3))
            new_val = Text(str(exp_val), font_size=20, color=RED)
            new_val.move_to(old_cell)
            self.play(FadeOut(old_cell), FadeIn(new_val), run_time=0.4)

        self.wait(0.3)

        # Takeaway
        takeaway = Text(
            "Each E must be \u2265 5 for the chi-square test to be valid",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
