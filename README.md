# Collecte des matières résiduelles de Shawinigan

Un container qui ouvre la page de collecte de la Ville, cherche une adresse et écrit l'horaire
en JSON sur stdout. Pas de code applicatif: ce sont des outils existants reliés par un pipe.

```
domscrape (navigateur)  →  pup (extraction HTML)  →  jq (dates)
```

| fichier       | rôle                                                                              |
|---------------|-----------------------------------------------------------------------------------|
| `scrape.json` | actions de [`domscrape`](https://github.com/oudirichi/crawler-helper) (fermer l'écran d'accueil, taper l'adresse, rechercher) |
| `collect.sh`  | injecte `ADDRESS` dans `scrape.json`, lance `domscrape visit`, passe le résultat à `parse.sh` |
| `parse.sh`    | lit le JSON de `domscrape` sur stdin; `pup` extrait les listes de dates, `jq` les convertit en dates ISO |
| `test/`       | test de `parse.sh` sur une sortie figée (sans navigateur)                         |

## Utilisation

```bash
docker build -t collect .
docker run --rm -e ADDRESS="742 Avenue des Pins" collect
```

ou avec compose:

```bash
ADDRESS="742 Avenue des Pins" make run
```

Sortie (une ligne de JSON, triée par date):

```json
[{"date":"2026-11-03","garbage":false,"recycling":true,"compost":true},
 {"date":"2026-11-10","garbage":true,"recycling":false,"compost":false}]
```

Les erreurs (adresse manquante ou introuvable, page non chargée) sortent avec le code 1 et un
message sur stderr, sans rien écrire sur stdout. Dans un pipe, utilise `set -o pipefail`.

### Variables d'environnement

| variable  | défaut                                                       | rôle                                   |
|-----------|--------------------------------------------------------------|----------------------------------------|
| `ADDRESS` | (requis)                                                     | adresse à rechercher                   |
| `URL`     | `https://geoweb.shawinigan.ca/CollecteMatieresResiduelles/`  | page de collecte                       |
| `TODAY`   | date du jour (`yyyy-mm-dd`)                                  | référence pour déduire l'année des dates |

### Dates

La page n'affiche que « mardi 12 janvier », sans année. `parse.sh` choisit l'année (précédente,
courante ou suivante) où le jour de semaine correspond, donc le passage décembre → janvier est
correct. Un jour de semaine incohérent avec la date est une erreur.

## Version du crawler

`domscrape` est construit depuis le dépôt `crawler-helper` à l'étape `crawler` du `Dockerfile`:

```bash
docker build --build-arg CRAWLER_REF=v0.0.3 -t collect .
```

## Tests

```bash
make test
```

Construit l'image `ci`, qui exécute `test/run.sh` (dates, passage d'année, cas d'erreur).
