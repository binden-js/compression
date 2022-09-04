# @binden/compression ![CI Status](https://github.com/binden-js/compression/workflows/CI/badge.svg) [![version](https://img.shields.io/github/package-json/v/binden-js/compression?style=plastic)](https://github.com/binden-js/compression) [![Known Vulnerabilities](https://snyk.io/test/github/binden-js/compression/badge.svg)](https://snyk.io/test/github/binden-js/compression) [![Coverage Status](https://coveralls.io/repos/github/binden-js/compression/badge.svg?branch=main)](https://coveralls.io/github/binden-js/compression?branch=main) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) ![GitHub top language](https://img.shields.io/github/languages/top/binden-js/compression) ![node version](https://img.shields.io/node/v/@binden/compression) ![npm downloads](https://img.shields.io/npm/dt/@binden/compression) ![License](https://img.shields.io/github/license/binden-js/compression)

[Binden](https://github.com/binden-js/binden) compression middleware (supports `br`, `gzip` and `deflate`).

## Installation

```bash
npm install @binden/compression
```

## Usage

```typescript
import Compression from "@binden/compression";

app.use(new Compression({ format: "br" }));
```

### Test

```bash
npm run test:ts
```
