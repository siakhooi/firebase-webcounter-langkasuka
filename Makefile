clean:
	cd functions && rm -rf node_modules lib
npm-install:
	cd functions && npm install
npm-lint:
	cd functions && npm run lint
npm-build:
	cd functions && npm run build
all: npm-install npm-lint npm-build

build:
	.github/bin/build.sh
install-firebase:
	npm install -g firebase-tools
login:
	firebase login
deploy:
	firebase deploy --non-interactive
deploy-functions-only:
	firebase deploy --only functions --non-interactive


npm-out:
	cd functions && npm outdated
npm-up:
	cd functions && npm update
