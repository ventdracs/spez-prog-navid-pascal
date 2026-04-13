FROM python:3.12-slim

WORKDIR /app

COPY app /app/app

EXPOSE 8001

CMD ["python", "-m", "http.server", "8001", "-d", "/app/app"]

