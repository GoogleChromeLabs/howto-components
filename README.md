# HowTo: Components

![Travis CI Build status badge](https://travis-ci.org/GoogleChrome/howto-components.svg?branch=master)

“HowTo: Components” is [a subsection on Web Fundamentals Architecture section](https://developers.google.com/web/fundamentals/architecture/howto-components/overview), containing a collection of web components that implement common web UI patterns using modern web technologies like Custom Elements v1 and ESnext with a special focus on accessibility, performance and progressive enhancement. Their purpose is to be an educational resource. Users are supposed to read and learn from their implementations. They are explicitly **NOT** a UI library meant to be used in production.

## Demos

You can run the demos locally, after you build them:

```
npm install  # if you haven't already
npm run build
python -m SimpleHTTPServer  # or your favourite local server
```

In your browser, navigate to `http://localhost:8000/docs` (or the port that you're running the local server from.)

You can also run

```
npm run watch
```

to continuously run the build whenever a file changes.

### WebFundamentals

To generate the content for [WebFundamentals](https://github.com/Google/WebFundamentals), run the `build-webfundamentals.sh` script. It will create a `webfundamentals` folder. The contents needs to be moved into the WebFundamentals repository. If new components have been created, they need to be added manually to [WebFundamentals Web Components table of contents](https://github.com/google/WebFundamentals/blob/master/src/content/en/fundamentals/web-components/_toc.yaml).

## Testing

Tests are written using [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/). Each component has tests.

### Local

Tests run using [Karma](https://karma-runner.github.io/1.0/config/browsers.html). Run the tests with

```
$ npm test
```

This assumes that Chrome, Firefox and Safari are installed as the tests run in all of these browser (using the [Custom Elements v1 Polyfill](https://github.com/webcomponents/custom-elements)).

### Local + Docker (or Travis)

Tests can also run in a [Docker](https://www.docker.com/) container (as we do on Travis):

```
$ npm run docker
```

This builds a docker image `googlechrome/howto-components` and runs it. The dockerized tests use Chrome only.

## Staging

All branches and PRs are built and uploaded on Travis CI. The staged version can be viewed at `http://dash-elements.surma.link/<commit hash>`.

## License

Copyright 2017 Google, Inc.

Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to you under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Please note: this is not a Google product
