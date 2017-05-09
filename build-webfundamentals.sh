#!/bin/bash

npm run build
rm -rf webfundamentals
mkdir -p webfundamentals/src/content/en/fundamentals/architecture/howto-components
find docs -type d -name 'howto-*' | while read line; do cp -r $line/*.md webfundamentals/src/content/en/fundamentals/architecture/howto-components/; done
cp docs/styles/main.devsite.css webfundamentals/src/content/en/fundamentals/architecture/howto-components/main.css
cp -r docs/images webfundamentals/src/content/en/fundamentals/architecture/howto-components/
cat site-resources/static-header.md overview.md | sed "s/{%DATE%}/$(date +%Y-%m-%d)/" > webfundamentals/src/content/en/fundamentals/architecture/howto-components/overview.md
cat site-resources/static-header.md glossary.md | sed "s/{%DATE%}/$(date +%Y-%m-%d)/" > webfundamentals/src/content/en/fundamentals/architecture/howto-components/glossary.md
