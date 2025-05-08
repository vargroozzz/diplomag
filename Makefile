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