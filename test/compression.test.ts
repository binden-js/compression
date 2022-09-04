import { deepStrictEqual, ok } from "assert";
import { Server, request } from "http";
import {
  brotliDecompress as brotliDecompressAsync,
  gunzip as gunzipAsync,
  inflate as inflateAsync,
  InputType,
} from "zlib";
import { Binden, Middleware, Context } from "binden";

import { Compression } from "../index.js";

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
const url = `http://localhost:${port}`;

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

  setup((done) => {
    app = new Binden();
    server = app.createServer().listen(port, done);
  });

  test("auto", async () => {
    const expected = "Hello World";

    app.use(new Compression(), new TestMiddleware(expected));

    const raw = await new Promise<Buffer>((resolve, reject) => {
      request(
        new URL(url),
        { headers: { "Accept-Encoding": "x-gzip" } },
        (response) => {
          try {
            const ce = response.headers["content-encoding"];
            deepStrictEqual(ce, "x-gzip");
            deepStrictEqual(response.statusCode, 200);

            const chunks = [] as Buffer[];

            response
              .on("data", (data: Buffer) => chunks.push(data))
              .on("end", () => {
                resolve(Buffer.concat(chunks));
              })
              .on("error", reject);
          } catch (error) {
            reject(error);
          }
        }
      )
        .on("error", reject)
        .end();
    });

    const actual = (await gunzip(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (multiple encodings)", async () => {
    const expected = "Hello World";

    app.use(new Compression(), new TestMiddleware(expected));

    const raw = await new Promise<Buffer>((resolve, reject) => {
      const ae = [" x-gzip ;q= 0.5 ", " compress;q=0.4 ", "identity", " * "];

      request(
        new URL(url),
        { headers: { "Accept-Encoding": ae } },
        (response) => {
          try {
            const ce = response.headers["content-encoding"];
            deepStrictEqual(ce, "br");
            deepStrictEqual(response.statusCode, 200);

            const chunks = [] as Buffer[];

            response
              .on("data", (data: Buffer) => chunks.push(data))
              .on("end", () => {
                resolve(Buffer.concat(chunks));
              })
              .on("error", reject);
          } catch (error) {
            reject(error);
          }
        }
      )
        .on("error", reject)
        .end();
    });

    const actual = (await brotliDecompress(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("auto (unsupported)", async () => {
    const expected = "Hello World";

    app.use(new Compression(), new TestMiddleware(expected));

    const actual = await new Promise<string>((resolve, reject) => {
      const ae = [" compress ;q= 0.4 ", "identity"];
      request(
        new URL(url),
        { headers: { "Accept-Encoding": ae } },
        (response) => {
          try {
            const ce = response.headers["content-encoding"];
            deepStrictEqual(typeof ce, "undefined");
            deepStrictEqual(response.statusCode, 200);

            const chunks = [] as Buffer[];
            response
              .on("data", (data: Buffer) => chunks.push(data))
              .on("end", () => {
                resolve(Buffer.concat(chunks).toString());
              })
              .on("error", reject);
          } catch (error) {
            reject(error);
          }
        }
      )
        .on("error", reject)
        .end();
    });

    deepStrictEqual(actual, expected);
  });

  test("gzip", async () => {
    const expected = "Hello World";
    const format = "gzip";

    app.use(new Compression({ format }), new TestMiddleware(expected));

    const raw = await new Promise<Buffer>((resolve, reject) => {
      request(new URL(url), (response) => {
        try {
          const ce = response.headers["content-encoding"];
          deepStrictEqual(ce, format);
          deepStrictEqual(response.statusCode, 200);

          const chunks = [] as Buffer[];
          response
            .on("data", (data: Buffer) => chunks.push(data))
            .on("end", () => {
              resolve(Buffer.concat(chunks));
            })
            .on("error", reject);
        } catch (error) {
          reject(error);
        }
      })
        .on("error", reject)
        .end();
    });
    const actual = (await gunzip(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("x-gzip", async () => {
    const expected = "Hello World";
    const format = "x-gzip";

    app.use(new Compression({ format }), new TestMiddleware(expected));

    const raw = await new Promise<Buffer>((resolve, reject) => {
      request(new URL(url), (response) => {
        try {
          const ce = response.headers["content-encoding"];
          deepStrictEqual(ce, format);
          deepStrictEqual(response.statusCode, 200);

          const chunks = [] as Buffer[];
          response
            .on("data", (data: Buffer) => chunks.push(data))
            .on("end", () => {
              resolve(Buffer.concat(chunks));
            })
            .on("error", reject);
        } catch (error) {
          reject(error);
        }
      })
        .on("error", reject)
        .end();
    });
    const actual = (await gunzip(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("br", async () => {
    const expected = "Hello World";
    const format = "br";

    app.use(new Compression({ format }), new TestMiddleware(expected));

    const raw = await new Promise<Buffer>((resolve, reject) => {
      request(new URL(url), (response) => {
        try {
          const ce = response.headers["content-encoding"];
          deepStrictEqual(ce, format);
          deepStrictEqual(response.statusCode, 200);

          const chunks = [] as Buffer[];
          response
            .on("data", (data: Buffer) => chunks.push(data))
            .on("end", () => {
              resolve(Buffer.concat(chunks));
            })
            .on("error", reject);
        } catch (error) {
          reject(error);
        }
      })
        .on("error", reject)
        .end();
    });
    const actual = (await brotliDecompress(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("deflate", async () => {
    const expected = "Hello World";
    const format = "deflate";

    app.use(new Compression({ format }), new TestMiddleware(expected));

    const raw = await new Promise<Buffer>((resolve, reject) => {
      request(new URL(url), (response) => {
        try {
          const ce = response.headers["content-encoding"];
          deepStrictEqual(ce, format);
          deepStrictEqual(response.statusCode, 200);

          const chunks = [] as Buffer[];
          response
            .on("data", (data: Buffer) => chunks.push(data))
            .on("end", () => {
              resolve(Buffer.concat(chunks));
            })
            .on("error", reject);
        } catch (error) {
          reject(error);
        }
      })
        .on("error", reject)
        .end();
    });
    const actual = (await inflate(raw)).toString();

    deepStrictEqual(actual, expected);
  });

  test("Multiple compressions", async () => {
    const expected = Buffer.from("Hello World");
    const formats = ["x-gzip", "br", "deflate"] as const;

    app.use(
      ...formats.map((format) => new Compression({ format })),
      new TestMiddleware(expected)
    );

    const raw = await new Promise<Buffer>((resolve, reject) => {
      request(new URL(url), (response) => {
        try {
          const ce = response.headers["content-encoding"];
          deepStrictEqual(ce, [...formats].reverse().join(", "));
          deepStrictEqual(response.statusCode, 200);

          const chunks = [] as Buffer[];
          response
            .on("error", reject)
            .on("end", () => {
              resolve(Buffer.concat(chunks));
            })
            .on("data", (data: Buffer) => chunks.push(data));
        } catch (error) {
          reject(error);
        }
      })
        .on("error", reject)
        .end();
    });
    const gzip = await gunzip(raw);
    const br = await brotliDecompress(gzip);
    const actual = await inflate(br);

    deepStrictEqual(actual, expected);
  });

  teardown((done) => server.close(done));
});
