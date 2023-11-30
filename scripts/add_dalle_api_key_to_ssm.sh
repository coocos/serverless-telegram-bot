#!/bin/bash
set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 {apiKey}"
    exit 1
fi

PARAMETER_VALUE=$1
PARAMETER_NAME="/serverless-telegram-bot/dalle-api-key"

aws ssm put-parameter --name "$PARAMETER_NAME" --value "$PARAMETER_VALUE" --type SecureString --overwrite

if [ $? -eq 0 ]; then
    echo "API key set successfully"
else
    echo "Failed to set API key"
    exit 1
fi