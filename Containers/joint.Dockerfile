#Get the base image and set the working directory
FROM ghcr.io/sytone/obsidian-remote:latest AS base
# FROM ubuntu:latest AS base
# FROM lscr.io/linuxserver/obsidian:latest AS base
# WORKDIR /config

# #Install Ollama; do this early so we can cache it and not do it often
# # Since it takes like 5 minutes.
# FROM base AS ollama
# RUN curl -fsSL https://ollama.com/install.sh | sh

# #Get UV for running the MCP.
# # Also doing this early since that way its cached and we don't have 
# # to do it often.
# FROM ollama AS uv
# RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
# ADD https://astral.sh/uv/0.4.17/install.sh /uv-installer.sh
# RUN curl -LsSf https://astral.sh/uv/install.sh | sh
# ENV PATH="/root/.local/bin/:$PATH"

# # Setup go for installing and running MCP server
# FROM uv AS go
# RUN apt-get update 
# RUN apt-get install -y wget
# # RUN apt-get install -y golang-go
# RUN rm -rf /usr/local/go
# RUN wget https://go.dev/dl/go1.24.9.linux-amd64.tar.gz
# RUN tar -C /usr/local -xzf go1.24.9.linux-amd64.tar.gz
# ENV PATH="/usr/local/go/bin:$PATH"
# RUN go install github.com/mark3labs/mcphost@latest
# ENV PATH="/vaults/go/bin:$PATH"

# FROM go AS obsidian
# ARG DEST="/config/Obsidian Vault"
# COPY helpers/obsidian/vaults/VAULTS/   ${DEST}/
# RUN echo OBSIDIAN_API_KEY=$OBSIDIAN_API_KEY > .env && \
#     # echo OBSIDIAN_HOST=obsidian >> .env && \
#     echo OBSIDIAN_PORT=$OBSIDIAN_PORT >> .env

# FROM obsidian AS final
# # Copy the script to the docker image
# COPY helpers/ollama/ ./
# # COPY helpers/ollama/.mcp.json .
# # Ensure the script is executable
# RUN apt-get install -y jq
# RUN apt-get install -y jq && chmod +x ./wait_for_ollama.sh 
# RUN sh ./wait_for_ollama.sh &
# # Update the obsidian local rest with the token we want
# RUN jq '.apiKey="'$OBSIDIAN_API_KEY'"' "${DEST}/.obsidian/plugins/obsidian-local-rest-api/data.json"

# # ENTRYPOINT ["tail", "-f", "/dev/null"]
# # ENTRYPOINT [ "/bin/sh", "./Obsidian-1.9.14.AppImage",  "--no-sandbox", "&"]

