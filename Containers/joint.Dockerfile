FROM lscr.io/linuxserver/obsidian:latest AS base
WORKDIR /config
COPY ./helpers/obsidian/vaults ./vaults
# Copy the script to the docker image
COPY ./helpers/ollama ./helpers

FROM base AS ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

FROM ollama AS uv
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
ADD https://astral.sh/uv/0.4.17/install.sh /uv-installer.sh
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/config/.local/bin/:$PATH"

FROM uv AS go
# Setup go for installing and running MCP server
RUN apt-get update 
RUN apt-get install -y golang-go
ENV PATH="/config/go/bin:$PATH"

FROM go AS end
# ARG OLLAMA_MODEL
# Install the MCP server
RUN go install github.com/mark3labs/mcphost@latest

# COPY ./helpers/ollama/.mcp.json ./.mcp.json


RUN echo OBSIDIAN_API_KEY=$OBSIDIAN_API_KEY > .env && \
    echo OBSIDIAN_HOST=obsidian >> .env && \
    echo OBSIDIAN_PORT=$OBSIDIAN_PORT >> .env

# Ensure the script is executable
RUN chmod +x /config/helpers/wait_for_ollama.sh

# ENTRYPOINT ["tail", "-f", "/dev/null"]
# CMD [ "/bin/sh", "/config/wait_for_ollama.sh" ]

