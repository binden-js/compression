import { deepStrictEqual, ok } from "node:assert";
import {
  brotliDecompress as brotliDecompressAsync,
  gunzip as gunzipAsync,
  inflate as inflateAsync,
  InputType,
} from "zlib";
import { Binden, Middleware, Context } from "binden";
import type { Server } from "node:http";

import {
  getGlobalDispatcher,
  request,
  setGlobalDispatcher,
  Agent,
  Dispatcher,
} from "undici";

import { Compression, DefaultCompression, IComressFormats } from "../index.js";

function brotliDecompress(data: InputType): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    brotliDecompressAsync(data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function gunzip(data: InputType): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    gunzipAsync(data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function inflate(data: InputType): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    inflateAsync(data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

const port = 8080;
const url = new URL(`http://localhost:${port}`);

class TestMiddleware extends Middleware {
  #data: Buffer | string | undefined;
  public constructor(data?: Buffer | string) {
    super();
    this.#data = data;
  }
  public run(ct: unknown): Promise<void> {
    ok(ct instanceof Context);
    return ct.send(this.#data);
  }
}

suite("Compression", () => {
  let app: Binden;
  let server: Server;
  let original_agent: Dispatcher;

  suiteSetup(() => {
    original_agent = getGlobalDispatcher();
    const agent = new Agent({ keepAliveTimeout: 1, keepAliveMaxTimeout: 1 });
    setGlobalDispatcher(agent);
  });

  setup((done) => {
    app = new Binden();
    server = app.createServer().listen(port, done);
  });

  test("constructor (with default options)", async () => {
    const expected = "Hello World";
    const format = "deflate";
    app.use(new Compression(), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": format };
    const response = await request(url, { headers });

    deepStrictEqual(response.headers["content-encoding"], format);
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = (await inflate(body)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (x-gzip)", async () => {
    const expected = "Hello World";
    app.use(new Compression({ format: "auto" }), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": "x-gzip" };
    const response = await request(url, { headers });

    deepStrictEqual(response.headers["content-encoding"], "gzip");
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = (await gunzip(body)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (gzip)", async () => {
    const expected = "Hello World";
    const format = "gzip";
    app.use(new Compression({ format: "auto" }), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": format };
    const response = await request(url, { headers });

    deepStrictEqual(response.headers["content-encoding"], format);
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = (await gunzip(body)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (br)", async () => {
    const expected = "Hello World";
    const format = "br";
    app.use(new Compression({ format: "auto" }), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": format };
    const response = await request(url, { headers });

    deepStrictEqual(response.headers["content-encoding"], format);
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = (await brotliDecompress(body)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (identity)", async () => {
    const expected = "Hello World";
    const format = "* ;q= 0.6, identity ;q= 0.7";
    app.use(new Compression({ format: "auto" }), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": format };
    const response = await request(url, { headers });

    ok(typeof response.headers["content-encoding"] === "undefined");
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = Buffer.from(body).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (*)", async () => {
    const expected = "Hello World";
    const format = "* ;q= 0.8, identity ;q= 0.7";
    app.use(new Compression({ format: "auto" }), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": format };
    const response = await request(url, { headers });

    deepStrictEqual(response.headers["content-encoding"], DefaultCompression);
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = (await brotliDecompress(body)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (Default compression when no `Accept-Encoding` header is present)", async () => {
    const expected = "Hello World";
    app.use(new Compression({ format: "auto" }), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": "" };
    const response = await request(url, { headers });

    deepStrictEqual(response.headers["content-encoding"], DefaultCompression);
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = (await brotliDecompress(body)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (unsupported)", async () => {
    const expected = "Hello World";
    const format = "compress";
    app.use(new Compression({ format: "auto" }), new TestMiddleware(expected));

    const headers = { "Accept-Encoding": format };
    const response = await request(url, { headers });

    ok(typeof response.headers["content-encoding"] === "undefined");
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const actual = Buffer.from(body).toString();

    deepStrictEqual(actual, expected);
  });

  test("gzip", async () => {
    const expected = "Hello World";
    const format = "gzip";
    app.use(new Compression({ format }), new TestMiddleware(expected));

    const response = await request(url);

    deepStrictEqual(response.headers["content-encoding"], format);
    deepStrictEqual(response.statusCode, 200);

    const raw = await response.body.arrayBuffer();
    const actual = (await gunzip(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("br", async () => {
    const expected = "Hello World";
    const format = "br";
    app.use(new Compression({ format }), new TestMiddleware(expected));

    const response = await request(url);

    deepStrictEqual(response.headers["content-encoding"], format);
    deepStrictEqual(response.statusCode, 200);

    const raw = await response.body.arrayBuffer();
    const actual = (await brotliDecompress(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("deflate", async () => {
    const expected = "Hello World";
    const format = "deflate";
    app.use(new Compression({ format }), new TestMiddleware(expected));

    const response = await request(url);

    deepStrictEqual(response.headers["content-encoding"], format);
    deepStrictEqual(response.statusCode, 200);

    const raw = await response.body.arrayBuffer();
    const actual = (await inflate(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("Multiple compressions", async () => {
    const expected = "Hello World";
    const formats: readonly IComressFormats[] = ["gzip", "br", "deflate"];
    app.use(
      ...formats.map((format) => new Compression({ format })),
      new TestMiddleware(expected),
    );

    const response = await request(url);

    deepStrictEqual(
      response.headers["content-encoding"],
      [...formats].reverse(),
    );
    deepStrictEqual(response.statusCode, 200);

    const body = await response.body.arrayBuffer();
    const gzip = await gunzip(Buffer.from(body));
    const br = await brotliDecompress(gzip);
    const actual = (await inflate(br)).toString();

    deepStrictEqual(actual, expected);
  });

  teardown((done) => server.close(done));

  suiteTeardown(() => {
    setGlobalDispatcher(original_agent);
  });
});
