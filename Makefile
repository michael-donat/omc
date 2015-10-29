GIT_BRANCH=$(shell git rev-parse --abbrev-ref HEAD)
GIT_REV=$(shell git rev-parse HEAD)

gh:
	gulp gh
	git diff --quiet HEAD || (git add . && git commit && git push)
	git checkout gh-pages
	git pull
	cp -rfv dist/* .
	git add .
	git commit -m"auto-generated $(GIT_BRANCH):$(GIT_REV)" || true
	git push
	git checkout $(GIT_BRANCH)

fixtures:
	node bin/loot.js
	cp cache/loot.json server/data/
	node bin/roster.js
	cp cache/members.json server/data/
	node bin/activities.js
	cp cache/activities.json server/data/
