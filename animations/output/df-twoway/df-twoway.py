"""
Degrees of Freedom (Two-Way Table): df = (r - 1)(c - 1)
Shows table dimensions and highlights which cells are free vs determined.
Manim Community v0.19 | 720p30 | ~16 seconds
"""
from manim import *

BLUE_ACCENT = "#58C4DD"
GOLD = "#FFD700"
SOFT_WHITE = "#EEEEEE"
RED = "#FF6666"


class DfTwowayScene(Scene):
    def construct(self):
        self.camera.background_color = "#1e1e1e"

        # Title
        title = Text("Degrees of Freedom (Two-Way Table)", font_size=36, color=GOLD)
        title.to_edge(UP, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)

        # Formula
        formula = MathTex(
            r"df", r"=", r"(r - 1)", r"(c - 1)",
            font_size=44, color=SOFT_WHITE,
        )
        formula.next_to(title, DOWN, buff=0.4)
        self.play(Write(formula), run_time=0.8)

        # Dimensions label
        dim_label = MathTex(
            r"r = 3 \text{ rows},\quad c = 4 \text{ columns}",
            font_size=26, color=BLUE_ACCENT,
        )
        dim_label.next_to(formula, DOWN, buff=0.4)
        self.play(FadeIn(dim_label), run_time=0.5)

        # Build a 3x4 grid of squares to represent the table body
        rows, cols = 3, 4
        cell_size = 0.55
        gap = 0.06
        grid = VGroup()
        cells = [[None for _ in range(cols)] for _ in range(rows)]

        for r in range(rows):
            for c in range(cols):
                sq = Square(
                    side_length=cell_size,
                    stroke_width=1.5,
                    stroke_color=GREY_B,
                    fill_opacity=0.0,
                )
                sq.move_to(
                    RIGHT * (c * (cell_size + gap)) + DOWN * (r * (cell_size + gap))
                )
                cells[r][c] = sq
                grid.add(sq)

        grid.center()
        grid.next_to(dim_label, DOWN, buff=0.5)
        self.play(FadeIn(grid), run_time=0.6)
        self.wait(0.3)

        # Row labels
        for r in range(rows):
            lbl = Text(f"R{r+1}", font_size=16, color=SOFT_WHITE)
            lbl.next_to(cells[r][0], LEFT, buff=0.15)
            self.add(lbl)
        # Col labels
        for c in range(cols):
            lbl = Text(f"C{c+1}", font_size=16, color=SOFT_WHITE)
            lbl.next_to(cells[0][c], UP, buff=0.12)
            self.add(lbl)

        # Highlight free cells (r-1)*(c-1) = 2*3 = 6
        # Free cells: rows 0..1, cols 0..2  (top-left 2x3 block)
        free_cells = []
        determined_cells = []
        for r in range(rows):
            for c in range(cols):
                if r < rows - 1 and c < cols - 1:
                    free_cells.append(cells[r][c])
                else:
                    determined_cells.append(cells[r][c])

        # Color free cells blue
        self.play(
            *[sq.animate.set_fill(BLUE_ACCENT, opacity=0.4) for sq in free_cells],
            run_time=0.7,
        )
        free_note = Text("free to vary", font_size=18, color=BLUE_ACCENT)
        free_note.next_to(grid, LEFT, buff=0.5)
        self.play(FadeIn(free_note), run_time=0.3)

        # Color determined cells red
        self.play(
            *[sq.animate.set_fill(RED, opacity=0.35) for sq in determined_cells],
            run_time=0.7,
        )
        det_note = Text("fixed by\nmarginals", font_size=18, color=RED)
        det_note.next_to(grid, RIGHT, buff=0.5)
        self.play(FadeIn(det_note), run_time=0.3)
        self.wait(0.3)

        # Compute result
        result = MathTex(
            r"df", r"=", r"(3-1)(4-1)", r"=", r"2 \times 3", r"=", r"6",
            font_size=34, color=SOFT_WHITE,
        )
        result[-1].set_color(RED)
        result.next_to(grid, DOWN, buff=0.5)
        self.play(Write(result), run_time=0.8)
        self.wait(0.4)

        # Takeaway
        takeaway = Text(
            "Only (r\u22121)(c\u22121) cells are free once row & column totals are set",
            font_size=22, color=GREY_B,
        )
        takeaway.to_edge(DOWN, buff=0.4)
        self.play(FadeIn(takeaway), run_time=0.6)
        self.wait(1.5)
