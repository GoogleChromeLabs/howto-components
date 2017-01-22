#!/bin/bash

set -e

# Exit if this is not a pull request
if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  echo "This is not a pull request. Aborting"
  exit 0;
fi
NAME=pr_${TRAVIS_PULL_REQUEST}

npm i
npm run build
go get github.com/surma/s3put
cd docs
s3put -b s3://s3-eu-west-1.amazonaws.com/${ARTIFACTS_BUCKET} -k ${ARTIFACTS_KEY} -s ${ARTIFACTS_SECRET} -p pr/${TRAVIS_PULL_REQUEST} put .
