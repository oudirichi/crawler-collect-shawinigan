.PHONY: help build test run clean release-patch release-minor release-major

help:
	@echo "Available targets:"
	@echo ""
	@echo "  build           - Build the prod Docker image"
	@echo "  test            - Run parse.sh tests (CI image, no browser)"
	@echo "  run             - Run the collect, e.g. make run ADDRESS=\"742 Avenue des Pins\""
	@echo "  clean           - Remove collect images"
	@echo ""
	@echo "  Release"
	@echo "  release-patch   - Bump patch version and push tag"
	@echo "  release-minor   - Bump minor version and push tag"
	@echo "  release-major   - Bump major version and push tag"

build:
	docker compose --profile prod build

test:
	docker compose --profile ci build collect-ci

run:
	@docker compose --profile prod run --rm -T collect

clean:
	docker compose --profile ci --profile prod down --rmi all
	docker image prune -f

release-patch:
	npm version patch
	git push --follow-tags

release-minor:
	npm version minor
	git push --follow-tags

release-major:
	npm version major
	git push --follow-tags
