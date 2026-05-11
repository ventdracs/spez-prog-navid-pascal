FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/data-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/data-service/app /app/app
COPY data/csv /app/data/csv

RUN useradd -m appuser
USER appuser

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
