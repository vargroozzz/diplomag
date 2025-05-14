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

# Marp Presentation for Practice Report
PRESENTATION_MD_FILE = $(PRACTICE_REPORT_DIR)/practice_report_presentation.md
PRESENTATION_PDF_FILE = $(PRACTICE_REPORT_DIR)/practice_report_presentation.pdf
PRESENTATION_HTML_FILE = $(PRACTICE_REPORT_DIR)/practice_report_presentation.html

.PHONY: presentation_compile_pdf presentation_compile_html presentation_view_pdf presentation_view_html

presentation_compile_pdf:
	@echo "Compiling Marp presentation to PDF..."
	npx @marp-team/marp-cli --pdf $(PRESENTATION_MD_FILE) -o $(PRESENTATION_PDF_FILE)
	@echo "Presentation PDF generated at $(PRESENTATION_PDF_FILE)"

presentation_compile_html:
	@echo "Compiling Marp presentation to HTML..."
	npx @marp-team/marp-cli --html $(PRESENTATION_MD_FILE) -o $(PRESENTATION_HTML_FILE)
	@echo "Presentation HTML generated at $(PRESENTATION_HTML_FILE)"

presentation_view_pdf:
	@echo "Opening presentation PDF..."
	open $(PRESENTATION_PDF_FILE)

presentation_view_html:
	@echo "Opening presentation HTML in default browser..."
	open $(PRESENTATION_HTML_FILE)

# Alias for easier use
compile_practice_report: practice_report_compile
clean_practice_report: practice_report_clean
view_practice_report: practice_report_view

compile_presentation: presentation_compile_pdf
view_presentation: presentation_view_pdf

# CI Commands
.PHONY: lint_ci

lint_ci:
	@echo "Linting client code for CI..."
	cd client && npm run lint
	@echo "Linting server code for CI..."
	cd server && npm run lint -- --max-warnings 0
	@echo "Linting for CI complete." 

deploy:
	docker compose -f docker-compose-deploy.yaml up -d --build

