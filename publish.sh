#!/bin/bash
# Copyright 2017 Google Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
set -e

git stash
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
npm run build
git branch -D gh-pages || true
git checkout -f --orphan gh-pages
git reset
touch .nojekyll
git add .nojekyll
mv docs docs2
git add docs2/*
git mv docs2/* .
git clean -fd
git commit -am 'Website'
git checkout $CURRENT_BRANCH
git stash pop

