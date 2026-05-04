#!/bin/bash
set -e

# Install coturn if not present
if ! command -v turnserver &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        apt-get update && apt-get install -y coturn curl
    elif command -v yum &> /dev/null; then
        yum install -y coturn curl
    fi
fi

PUBLIC_IP=${TURN_EXTERNAL_IP:-$(curl -s http://checkip.amazonaws.com)}
PRIVATE_IP=$(hostname -I | awk '{print $1}')

cp $(dirname "$0")/turnserver.conf /etc/turnserver.conf
sed -i "s|EXTERNAL_IP_PLACEHOLDER|${PUBLIC_IP}/${PRIVATE_IP}|" /etc/turnserver.conf

if [ ! -f /etc/systemd/system/coturn.service ]; then
    cat > /etc/systemd/system/coturn.service <<EOF
[Unit]
Description=coturn TURN server
After=network.target

[Service]
ExecStart=/usr/bin/turnserver -c /etc/turnserver.conf
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable coturn
fi

systemctl restart coturn
echo "TURN running: turn:${PUBLIC_IP}:3478"
