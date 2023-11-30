#!/bin/bash
set -e

PARAMETER_NAME="/serverless-telegram-bot/dalle-api-key"

aws ssm delete-parameter --name "$PARAMETER_NAME"

if [ $? -eq 0 ]; then
    echo "API key deleted successfully"
else
    echo "Failed to delete API key"
    exit 1
fi