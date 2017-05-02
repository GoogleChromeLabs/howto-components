#!/bin/bash

npm run build
rm -rf webfundamentals
mkdir -p webfundamentals/src/content/en/fundamentals/architecture/howto-components
cp docs/*.md webfundamentals/src/content/en/fundamentals/architecture/howto-components
cp docs/styles/main.devsite.css webfundamentals/src/content/en/fundamentals/architecture/howto-components/main.css
# cp docs/styles/prism-solarizedlight.css webfundamentals/src/content/en/fundamentals/architecture/howto-components/
cp -r docs/images webfundamentals/src/content/en/fundamentals/architecture/howto-components/
