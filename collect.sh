#!/bin/sh
# Opens Shawinigan's waste collection page, searches for ADDRESS and writes the schedule as JSON on stdout.
#   ADDRESS=... collect.sh      or      collect.sh "<address>"
set -eu

ADDRESS="${ADDRESS:-${1:-}}"
if [ -z "$ADDRESS" ]; then
  echo 'Error: ADDRESS est requis (ex. ADDRESS="742 Avenue des Pins")' >&2
  exit 1
fi
URL="${URL:-https://geoweb.shawinigan.ca/CollecteMatieresResiduelles/}"
DIR=$(dirname "$0")

spec=$(mktemp)
trap 'rm -f "$spec"' EXIT
jq --arg a "$ADDRESS" '(.actions[] | select(.action == "type") | .text) = $a' "$DIR/scrape.json" > "$spec"

domscrape visit "$URL" -d "@$spec" | "$DIR/parse.sh"
