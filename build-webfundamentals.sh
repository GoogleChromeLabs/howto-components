#!/bin/bash

npm run build
rm -rf webfundamentals
mkdir -p webfundamentals/src/content/en/fundamentals/architecture/building-components/examples
find docs -type d -name 'howto-*' | while read line; do cp -r $line/*.md webfundamentals/src/content/en/fundamentals/architecture/building-components/examples/; done
cp docs/styles/main.devsite.css webfundamentals/src/content/en/fundamentals/architecture/building-components/examples/main.css
cp -r docs/images webfundamentals/src/content/en/fundamentals/architecture/building-components/examples/
cat site-resources/static-header.md overview.md | sed "s/{%DATE%}/$(date +%Y-%m-%d)/" > webfundamentals/src/content/en/fundamentals/architecture/building-components/examples/overview.md
cat site-resources/static-header.md glossary.md | sed "s/{%DATE%}/$(date +%Y-%m-%d)/" > webfundamentals/src/content/en/fundamentals/architecture/building-components/examples/glossary.md
