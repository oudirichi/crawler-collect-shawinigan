#!/bin/sh
# Tests parse.sh without a browser, against a frozen domscrape output.
set -eu
cd "$(dirname "$0")/.."

# On December 20, "mardi 12 janvier" must land in 2027, not 2026.
actual=$(TODAY=2026-12-20 ./parse.sh < test/browser-output.json)
expected=$(cat test/expected.json)
if [ "$actual" != "$expected" ]; then
  echo "FAIL: horaire inattendu" >&2
  echo "  attendu: $expected" >&2
  echo "  obtenu:  $actual" >&2
  exit 1
fi

# No dates extracted: exit code 1, "Error: …" on stderr, nothing on stdout.
status=0
out=$(echo '{"browserHtml":"<html></html>"}' | ./parse.sh 2>/tmp/parse-err) || status=$?
if [ "$status" -ne 1 ] || [ -n "$out" ] || ! grep -q '^Error: aucune date' /tmp/parse-err; then
  echo "FAIL: une page sans dates devrait échouer avec le code 1 (code=$status)" >&2
  exit 1
fi

# Input that is not domscrape JSON: error.
if echo 'pas du json' | ./parse.sh >/dev/null 2>&1; then
  echo "FAIL: une entrée invalide devrait échouer" >&2
  exit 1
fi

echo "OK"
