import core from "@nestia/core";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import FastifyMulter from "fastify-multer";

export class Backend {
  private application_?: NestFastifyApplication;

  public async open(): Promise<void> {
    this.application_ = await NestFactory.create(
      await core.EncryptedModule.dynamic(__dirname + "/controllers", {
        key: "A".repeat(32),
        iv: "B".repeat(16),
      }),
      new FastifyAdapter(),
      { logger: false },
    );
    await this.application_.register(FastifyMulter.contentParser as any);
    await this.application_.listen(37_000);
  }

  public async close(): Promise<void> {
    if (this.application_ === undefined) return;

    const app = this.application_;
    await app.close();

    delete this.application_;
  }
}
