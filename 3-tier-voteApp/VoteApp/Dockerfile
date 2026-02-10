FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies needed for some Python packages (psycopg2)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

# Install runtime Python dependencies (locked to Django 4.x as project indicates)
RUN pip install Django==4.2.12 djangorestframework django-cors-headers psycopg2-binary gunicorn

# Copy project
COPY . /app

# Create a directory for collected static files (optional mount)
RUN mkdir -p /vol/static

EXPOSE 8000

CMD ["gunicorn", "VoteApp.wsgi:application", "--bind", "0.0.0.0:8000"]
