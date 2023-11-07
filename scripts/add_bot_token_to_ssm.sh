#!/bin/bash
set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 {token}"
    exit 1
fi

PARAMETER_VALUE=$1
PARAMETER_NAME="/serverless-telegram-bot/bot-token"

aws ssm put-parameter --name "$PARAMETER_NAME" --value "$PARAMETER_VALUE" --type SecureString --overwrite

if [ $? -eq 0 ]; then
    echo "Bot token set successfully"
else
    echo "Failed to set bot token"
    exit 1
fi