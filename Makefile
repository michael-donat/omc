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
