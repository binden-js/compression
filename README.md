# @kauai/compression ![CI Status](https://github.com/b2broker/compression/workflows/CI/badge.svg) [![version](https://img.shields.io/github/package-json/v/b2broker/compression?style=plastic)](https://github.com/b2broker/compression) [![Known Vulnerabilities](https://snyk.io/test/github/b2broker/compression/badge.svg)](https://snyk.io/test/github/b2broker/compression) [![Coverage Status](https://coveralls.io/repos/github/b2broker/compression/badge.svg?branch=main)](https://coveralls.io/github/b2broker/compression?branch=main) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) ![GitHub top language](https://img.shields.io/github/languages/top/b2broker/compression) ![node version](https://img.shields.io/node/v/@kauai/compression) ![npm downloads](https://img.shields.io/npm/dt/@kauai/compression) ![License](https://img.shields.io/github/license/b2broker/compression)

[Kauai](https://github.com/b2broker/kauai) compression middleware (supports `br`, `gzip` and `deflate`).

## Installation

```bash
npm install @kauai/compression
```

## Usage

```typescript
import Compression from "@kauai/compression";

app.use(new Compression({ format: "br" }));
```

### Test

```bash
npm run test:ci
```
