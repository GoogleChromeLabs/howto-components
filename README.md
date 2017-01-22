# DASH elements

![Travis CI Build status badge](https://travis-ci.org/GoogleChrome/dash-elements.svg?branch=master)

Dash elements are a collection of implementations of common web UI patterns using modern web technologies like Custom Elements v1 and ESnext with a special focus on accessibility, performance and progressive enhancement. Their purpose is to be an educational resource. Users are supposed to read their implementation rather than just using the elements.

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

This builds a docker image `googlechrome/dash-elements` and runs it. The dockerized tests use Chrome only.

## Staging

All branches and PRs are built and uploaded on Travis CI. The staged version can be viewed at `https://dash-elements.surma.link/<commit hash>`.

## License

Copyright 2017 Google, Inc.

Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to you under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Please note: this is not a Google product
