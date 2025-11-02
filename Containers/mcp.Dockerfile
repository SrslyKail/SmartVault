FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install uv for package management
RUN pip install uv

# Copy requirements
COPY ./helpers/mcp/requirements.txt requirements.txt

# Install dependencies
RUN uv pip install --system -r requirements.txt

# # Copy the rest of the application
# COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

RUN echo OBSIDIAN_API_KEY=$OBSIDIAN_TOKEN > .env

# Command to run the server
CMD ["uv", "run", "mcp-obsidian"] 