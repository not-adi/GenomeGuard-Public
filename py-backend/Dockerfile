# Use Python 3.13 (stable, supports all dependencies)
FROM python:3.13-slim

# Real-time logs in DigitalOcean
ENV PYTHONUNBUFFERED=1

# Install Tesseract OCR + English language data
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (Docker layer caching)
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run with Gunicorn (2 workers to prevent OOM on basic tiers, 120s timeout for large VCF uploads)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]
