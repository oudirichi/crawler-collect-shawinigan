#!/bin/sh
# Reads domscrape's JSON output on stdin (browserHtml field) and writes the collection
# schedule as JSON on stdout:
#   [{"date":"2026-11-03","garbage":false,"recycling":true,"compost":true}, ...]
#
# TODAY (yyyy-mm-dd, default: today) is used to infer the year of the dates, which the page
# only shows as e.g. "mardi 12 janvier".
set -eu

TODAY="${TODAY:-$(date +%F)}"

html=$(mktemp)
err=$(mktemp)
trap 'rm -f "$html" "$err"' EXIT
jq -er .browserHtml > "$html" || {
  echo "Error: stdin doit être la sortie JSON de domscrape (champ browserHtml)" >&2
  exit 1
}

extract() {
  pup "#trDataContent > td#tdCollecte$1 ul li text{}" < "$html" | sed '/^[[:space:]]*$/d'
}

result=$({
  for pair in garbage:Ordures recycling:Recyclage compost:Compost; do
    key=${pair%%:*}
    id=${pair##*:}
    extract "$id" | jq -R --arg k "$key" '{k: $k, v: .}'
  done
} | jq -s -c --arg today "$TODAY" '
  def months: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  def days: ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

  # "mardi 12 janvier" -> "2027-01-12": keep the year (previous, current or next)
  # in which the weekday matches.
  def resolve:
    . as $text
    | (gsub("^\\s+|\\s+$"; "") | split(" ")) as $t
    | ($t[1] | tonumber) as $d
    | ($today[0:4] | tonumber) as $y
    | first(
        try (
          (months | index($t[2])) as $m
          | [ ($y - 1), $y, ($y + 1) ][]
          | [., $m, $d, 0, 0, 0, 0, 0] | mktime
          | select((strftime("%w") | tonumber) == (days | index($t[0])) and (strftime("%d") | tonumber) == $d)
          | strftime("%Y-%m-%d")
        ) catch empty
      ) // error("date illisible ou incohérente: \($text)");

  if length == 0 then error("aucune date de collecte extraite (adresse introuvable ou page non chargée ?)") else . end
  | [ .[] | .k as $k | .v | resolve | {date: ., ($k): true} ]
  | group_by(.date)
  | map(add | {date, garbage: (.garbage // false), recycling: (.recycling // false), compost: (.compost // false)})
' 2> "$err") || {
  echo "Error: $(sed 's/^jq: error (at [^)]*): //' "$err")" >&2
  exit 1
}

printf '%s\n' "$result"
