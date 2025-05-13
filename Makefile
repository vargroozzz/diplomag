up:
	docker-compose up --build -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

rebuild:
	docker-compose down
	docker-compose up --build -d

# LaTeX Thesis Commands
THESIS_DIR = thesis
THESIS_MAIN_FILE = Дипломна-Робота
PDF_FILE = $(THESIS_DIR)/$(THESIS_MAIN_FILE).pdf

.PHONY: thesis_compile thesis_clean thesis_view

thesis_compile:
	@echo "Compiling LaTeX thesis..."
	cd $(THESIS_DIR) && latexmk -xelatex $(THESIS_MAIN_FILE).tex
	@echo "Thesis PDF generated at $(PDF_FILE)"

thesis_clean:
	@echo "Cleaning LaTeX auxiliary files..."
	cd $(THESIS_DIR) && latexmk -C $(THESIS_MAIN_FILE).tex
	@echo "Cleaned."

thesis_view:
	@echo "Opening thesis PDF..."
	open $(PDF_FILE)

# Alias for easier use
compile_thesis: thesis_compile
clean_thesis: thesis_clean
view_thesis: thesis_view

# Practice Report Commands
PRACTICE_REPORT_DIR = thesis/practice_report
PRACTICE_REPORT_MAIN_FILE = Науково-Дослідна-Практика-Звіт
PRACTICE_PDF_FILE = $(PRACTICE_REPORT_DIR)/$(PRACTICE_REPORT_MAIN_FILE).pdf

.PHONY: practice_report_compile practice_report_clean practice_report_view

practice_report_compile:
	@echo "Compiling LaTeX practice report..."
	cd $(PRACTICE_REPORT_DIR) && latexmk -xelatex $(PRACTICE_REPORT_MAIN_FILE).tex
	@echo "Practice report PDF generated at $(PRACTICE_PDF_FILE)"

practice_report_clean:
	@echo "Cleaning LaTeX auxiliary files for practice report..."
	cd $(PRACTICE_REPORT_DIR) && latexmk -C $(PRACTICE_REPORT_MAIN_FILE).tex
	@echo "Cleaned practice report."

practice_report_view:
	@echo "Opening practice report PDF..."
	open $(PRACTICE_PDF_FILE)

# Alias for easier use
compile_practice_report: practice_report_compile
clean_practice_report: practice_report_clean
view_practice_report: practice_report_view 