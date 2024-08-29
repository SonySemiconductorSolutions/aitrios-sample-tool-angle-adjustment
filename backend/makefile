prod:
	gunicorn main:app

dev:
	python main.py

model:
	prisma generate --schema=./prisma/schema.local.prisma

migrate:
	prisma db push --schema=./prisma/schema.local.prisma

sync:
	prisma db pull --schema=./prisma/schema.local.prisma

lint:
	black .  --line-length=120 && isort . --line-length=120

req:
	pipenv requirements > requirements.txt
