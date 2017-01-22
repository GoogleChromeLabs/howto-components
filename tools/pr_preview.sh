#!/bin/bash

set -e

NAME=${TRAVIS_COMMIT}

. ~/.nvm/nvm.sh
nvm install 7
nvm use 7
npm i
npm run build
wget https://tools.surma.link/s3put/s3put_linux_amd64
chmod +x s3put_linux_amd64
cd docs
../s3put_linux_amd64 -b s3://s3-eu-west-1.amazonaws.com/${ARTIFACTS_BUCKET} -k ${ARTIFACTS_KEY} -s ${ARTIFACTS_SECRET} -p ${NAME} put .
