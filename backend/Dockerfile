# Lambda container image: API Gateway HTTP API -> lambda_handler.handler.
# Build from repo root: docker build -f backend/Dockerfile -t aiq-backend .
FROM public.ecr.aws/lambda/python:3.13

COPY backend/pyproject.toml backend/README.md ./
COPY backend/app ./app
COPY backend/lambda_handler.py ./
COPY examples ./examples
RUN pip install --no-cache-dir fastapi uvicorn pydantic httpx numpy opencv-python-headless "strands-agents[cedar]"

ENV AIQ_DATA_DIR=/tmp/aiq-data
CMD ["lambda_handler.handler"]
