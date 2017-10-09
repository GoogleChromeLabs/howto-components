#!/bin/bash

npm run build
rm -rf webfundamentals
mkdir -p webfundamentals/src/content/en/fundamentals/web-components/examples
find docs -type d -name 'howto-*' | while read line; do cp -r $line/*.md webfundamentals/src/content/en/fundamentals/web-components/examples/; done
cp docs/styles/main.devsite.css webfundamentals/src/content/en/fundamentals/web-components/examples/main.css
cp -r docs/images webfundamentals/src/content/en/fundamentals/web-components/examples/
