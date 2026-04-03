from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"

class ExpectedTwowayScene(Scene):
    def construct(self):
        title = Text("Expected Count (Two-Way Table)", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title), run_time=0.8)

        # Formula
        formula = MathTex(r"E = \frac{R \times C}{N}", font_size=40, color=SOFT_WHITE)
        legend = Text("R = row total,  C = col total,  N = grand total",
                       font_size=18, color=GREY_B)
        fgroup = VGroup(formula, legend).arrange(DOWN, buff=0.15)
        fgroup.next_to(title, DOWN, buff=0.35)
        self.play(Write(formula), FadeIn(legend, shift=UP*0.1), run_time=1.0)

        # Build table as VGroup grid
        data = [
            ["", "Yes", "No", "Total"],
            ["Male", "30", "20", "50"],
            ["Female", "40", "10", "50"],
            ["Total", "70", "30", "100"],
        ]
        cells = VGroup()
        cell_map = {}
        for r, row in enumerate(data):
            for c, val in enumerate(row):
                is_header = (r == 0 or c == 0)
                is_total = (r == 3 or c == 3)
                color = GOLD if is_total else (BLUE_ACCENT if is_header else SOFT_WHITE)
                weight = BOLD if is_header or is_total else NORMAL
                t = Text(str(val), font_size=20, color=color, weight=weight)
                t.move_to([c * 1.1 - 1.65, -r * 0.45, 0])
                cells.add(t)
                cell_map[(r, c)] = t

        cells.next_to(fgroup, DOWN, buff=0.4)
        self.play(FadeIn(cells), run_time=0.8)
        self.wait(0.3)

        # Highlight row total (50) and col total (70)
        row_tot = cell_map[(1, 3)]  # "50"
        col_tot = cell_map[(3, 1)]  # "70"
        grand = cell_map[(3, 3)]    # "100"

        row_box = SurroundingRectangle(row_tot, color=RED, buff=0.08)
        col_box = SurroundingRectangle(col_tot, color=RED, buff=0.08)
        grand_box = SurroundingRectangle(grand, color=GOLD, buff=0.08)

        self.play(Create(row_box), Create(col_box), run_time=0.5)
        self.play(Create(grand_box), run_time=0.4)

        # Compute
        calc = MathTex(r"E_{11}", r"=", r"\frac{50 \times 70}{100}", r"=", r"35",
                       font_size=32, color=SOFT_WHITE)
        calc[-1].set_color(RED)
        calc.next_to(cells, DOWN, buff=0.5)
        self.play(Write(calc), run_time=1.0)
        self.wait(0.4)

        # Flash target cell
        target = cell_map[(1, 1)]  # "30"
        target_box = SurroundingRectangle(target, color=RED, buff=0.08)
        self.play(Create(target_box), run_time=0.4)

        takeaway = Text("Multiply marginals, divide by grand total",
                        font_size=22, color=GREY_B)
        takeaway.to_edge(DOWN, buff=0.3)
        self.play(FadeIn(takeaway, shift=UP*0.1), run_time=0.5)
        self.wait(1.0)
