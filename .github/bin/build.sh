#!/bin/bash

set -ex

cd functions || {
	echo "functions directory not found"
	exit 1
}

npm ci --ignore-scripts
npm run lint
npm run test:coverage
npm run build
