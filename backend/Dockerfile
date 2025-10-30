#Setup Ollama
FROM ollama/ollama
# Copy the script to the docker image
COPY ./wait_for_ollama.sh /wait_for_ollama.sh
# Ensure the script is executable
RUN chmod +x /wait_for_ollama.sh

# Setup uv for... reasons.
# RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
# ADD https://astral.sh/uv/0.4.17/install.sh /uv-installer.sh
# RUN curl -LsSf https://astral.sh/uv/install.sh | sh
# ENV PATH="/root/.local/bin/:$PATH"

# Setup go for installing and running MCP server
RUN apt update 
RUN apt install -y software-properties-common
RUN add-apt-repository ppa:longsleep/golang-backports
RUN apt install -y golang-go

# Install the MCP server
RUN go install github.com/mark3labs/mcphost@latest

ENTRYPOINT [ "/bin/sh", "/wait_for_ollama.sh" ]

