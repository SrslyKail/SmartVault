#!/bin/bash
# Start Ollama in the background.
ollama serve &
# Record Process ID.
pid=$!
# Pause for Ollama to start.
sleep 5 
echo $OLLAMA_MODEL
echo "🔴 Retrieving model $OLLAMA_MODEL..."
ollama pull $OLLAMA_MODEL
echo "🟢 Done!"
# Wait for Ollama process to finish.
wait $pid
ollama run $OLLAMA_MODEL
