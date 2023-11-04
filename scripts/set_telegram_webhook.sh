#!/bin/bash
set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 {my_bot_token} {url_to_send_updates_to}"
    exit 1
fi

BOT_TOKEN=$1
WEBHOOK_URL=$2

RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=$WEBHOOK_URL")
echo "Telegram API response: $RESPONSE"