# FROM linuxserver/obsidian:latest AS obs
# obsidian is at ./opt/obsidian

#Setup Ollama
FROM ollama/ollama
# Copy the script to the docker image
COPY ./wait_for_ollama.sh /wait_for_ollama.sh
# Ensure the script is executable
RUN chmod +x /wait_for_ollama.sh

# Setup uv for... reasons.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
ADD https://astral.sh/uv/0.4.17/install.sh /uv-installer.sh
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin/:$PATH"

# Setup go for installing and running MCP server
RUN apt-get update 
RUN apt-get install -y golang-go

# Install the MCP server
RUN go install github.com/mark3labs/mcphost@latest


# RUN apt-get install -y curl
# RUN apt update
# RUN apt install -y flatpak
# RUN flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
# RUN flatpak install -y flathub md.obsidian.Obsidian
# RUN curl -o \
#     /tmp/obsidian.deb -L \
#     https://github.com/obsidianmd/obsidian-releases/releases/download/v1.9.14/obsidian_1.9.14_amd64.deb

# COPY --from=obs /opt/obsidian ./obsidian
# COPY --from=obs /usr/lib/x86_64-linux-gnu/libglib-2.0.so.0 /usr/lib/x86_64-linux-gnu/libglib-2.0.so.0
ENV PATH="/root/go/bin:${PATH}"
ENTRYPOINT [ "/bin/sh", "/wait_for_ollama.sh" ]

