#!/bin/bash
set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 {my_bot_token}"
    exit 1
fi

BOT_TOKEN=$1

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook?drop_pending_updates=true")
echo "Telegram API response: $RESPONSE"