prod:
	gunicorn main:app

dev:
	python main.py

model:
	prisma generate --schema=./prisma/schema.postgres.prisma

migrate:
	prisma db push --schema=./prisma/schema.postgres.prisma

sync:
	prisma db pull --schema=./prisma/schema.postgres.prisma

lint:
	black .  --line-length=120 && isort . --line-length=120

req:
	pipenv requirements > requirements.txt

buildbase:
	docker build -f Dockerfile-base -t caat-backend-base .

studio:
	prisma studio --schema=./prisma/schema.postgres.prisma

build:
	docker build -f Dockerfile -t caat-backend-service .
