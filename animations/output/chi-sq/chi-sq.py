"""
Chi-Square Test Statistic: chi^2 = Sum (O - E)^2 / E
Shows observed vs expected table, computes each cell's contribution.
Manim Community v0.19 | 720p30 | ~15 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"


class ChiSqScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Chi-Square Test Statistic", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Formula
        formula = MathTex(
            r"\chi^2", r"=", r"\sum", r"\frac{(O - E)^2}{E}",
            font_size=42, color=SOFT_WHITE,
        )
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=1.2)

        # --- Observed vs Expected table ---
        headers = ["Category", "O", "E", "(O-E)\u00b2/E"]
        obs = [30, 25, 45]
        exp = [33.3, 33.3, 33.4]
        cats = ["A", "B", "C"]

        def cell(txt, color=SOFT_WHITE, bold=False):
            t = Text(str(txt), font_size=20, color=color)
            if bold:
                t = Text(str(txt), font_size=20, color=color, weight=BOLD)
            return t

        header_row = [cell(h, BLUE_ACCENT, bold=True) for h in headers]
        rows = [header_row]
        contribs = []
        for i in range(3):
            c = round((obs[i] - exp[i]) ** 2 / exp[i], 2)
            contribs.append(c)
            rows.append([
                cell(cats[i]),
                cell(obs[i]),
                cell(exp[i]),
                cell("?", GREY_B),
            ])

        table = MobjectTable(
            rows,
            include_outer_lines=True,
            line_config={"stroke_width": 1, "color": GREY_B},
            h_buff=0.6,
            v_buff=0.35,
        )
        table.scale(0.75)
        table.next_to(formula, DOWN, buff=0.45)
        table.shift(LEFT * 0.3)

        self.play(FadeIn(table), run_time=0.8)
        self.wait(0.4)

        # Fill in contributions one-by-one
        contrib_cells = []
        for i in range(3):
            # Row i+2 (1-indexed header is row 1), column 4
            old_cell = table.get_entries((i + 2, 4))
            new_val = Text(str(contribs[i]), font_size=20, color=RED)
            new_val.move_to(old_cell)
            contrib_cells.append(new_val)
            self.play(
                FadeOut(old_cell),
                FadeIn(new_val),
                run_time=0.5,
            )

        # Show total
        total = round(sum(contribs), 2)
        result = MathTex(
            r"\chi^2", "=",
            f"{contribs[0]}", "+", f"{contribs[1]}", "+", f"{contribs[2]}",
            "=", f"{total}",
            font_size=32, color=SOFT_WHITE,
        )
        result[-1].set_color(RED)
        result.next_to(table, DOWN, buff=0.45)
        self.play(Write(result), run_time=1.0)
        self.wait(0.5)

        # Takeaway
        takeaway = Text(
            "Larger \u03c7\u00b2 \u2192 stronger evidence against H\u2080",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
