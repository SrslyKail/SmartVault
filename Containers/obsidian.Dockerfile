FROM lscr.io/linuxserver/obsidian:latest
COPY ./helpers/obsidian/vaults /config/vaults/
# RUN jq '.apiKey="'$OBSIDIAN_TOKEN'"' /config/vaults/VAULTS/.obsidian/plugins/obsidian-local-rest-api/data.json