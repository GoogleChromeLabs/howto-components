#!/bin/bash

set -o

# Exit if this is not a pull request
$TRAVIS_PULL_REQUEST || exit 0
NAME=pr_${TRAVIS_PULL_REQUEST}

npm i
npm run build
mv docs $NAME
mkdir docs
mv $NAME docs/

