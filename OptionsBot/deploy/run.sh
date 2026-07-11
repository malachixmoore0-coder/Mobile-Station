#!/usr/bin/env bash
# Wrapper for running OptionsBot unattended on a server, so it keeps
# scanning/trading even after the controlling SSH session (e.g. from an
# iPhone SSH client) disconnects or the phone's screen locks.
#
# Usage:
#   ./deploy/run.sh                 # continuous loop
#   ./deploy/run.sh --once          # single scan pass
#
# Anything after the script name is forwarded to main.py.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d .venv ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

exec python main.py "$@"
