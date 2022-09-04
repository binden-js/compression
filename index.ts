import { createDeflate, createGzip, createBrotliCompress } from "zlib";
import { Middleware, IMiddlewareParams, Context } from "binden";

export const DefaultCompressionion = "br";

export type IComressFormats = "auto" | "br" | "deflate" | "gzip" | "x-gzip";

export interface ICompressionOptions extends IMiddlewareParams {
  format?: IComressFormats;
}

export class Compression extends Middleware {
  readonly #format: IComressFormats;

  public constructor({ format = "auto", ...rest }: ICompressionOptions = {}) {
    super(rest);
    this.#format = format;
  }

  public get format(): IComressFormats {
    return this.#format;
  }

  public run(context: Context): Context {
    const format = Compression.#getFormat(context, this.format);

    if (format === "identity") {
      return context;
    }

    const { response } = context;

    const raw = response.getHeader("Content-Encoding");

    response.setHeader(
      "Content-Encoding",
      typeof raw === "undefined"
        ? format
        : [format, ...(Array.isArray(raw) ? raw : [`${raw}`])]
    );

    const compress =
      format === "br"
        ? createBrotliCompress()
        : format === "deflate"
        ? createDeflate()
        : createGzip();

    compress.pipe(response);

    const proxyResponse = new Proxy(response, {
      get(_r, p: string): unknown {
        if (p === "write") {
          return function write(
            data?: unknown,
            encoding?: BufferEncoding,
            cb?: (error?: Error | null) => void
          ): void {
            compress.write(data, encoding, cb);
          };
        } else if (p === "end") {
          return function end(
            data?: unknown,
            encoding?: BufferEncoding,
            cb?: () => void
          ): void {
            compress.end(data, encoding, cb);
          };
        }

        return (response as unknown as Record<string, unknown>)[p];
      },
    });

    return new Proxy(context, {
      get(_ct, p: string): unknown {
        if (p === "response") {
          return proxyResponse;
        }

        return (context as unknown as Record<string, unknown>)[p];
      },

      set(_ct, p: string, value: unknown): boolean {
        (context as unknown as Record<string, unknown>)[p] = value;
        return true;
      },
    });
  }

  static #getFormat(
    context: Context,
    format: IComressFormats
  ): Exclude<IComressFormats, "auto"> | "identity" {
    if (format !== "auto") {
      return format;
    }

    const { accept_encoding } = context.request;

    for (const { encoding } of accept_encoding) {
      switch (encoding) {
        case "identity":
        case "compress":
          break;
        case "*":
          return DefaultCompressionion;
        default:
          return encoding;
      }
    }

    return "identity";
  }
}

export default Compression;
