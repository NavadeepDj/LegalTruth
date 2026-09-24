FROM python:3.12-slim

# Install uv for fast dependency installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy dependency definition
COPY requirements.txt .

# Install dependencies into system environment
RUN uv pip install --system --no-cache -r requirements.txt

# Copy application source
COPY app/ app/

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
