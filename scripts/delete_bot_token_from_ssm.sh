#!/bin/bash
set -e

PARAMETER_NAME="/serverless-telegram-bot/bot-token"

aws ssm delete-parameter --name "$PARAMETER_NAME"

if [ $? -eq 0 ]; then
    echo "Bot token deleted successfully"
else
    echo "Failed to delete bot token"
    exit 1
fi