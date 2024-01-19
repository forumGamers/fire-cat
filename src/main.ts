import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { grpcClientOptions } from "./config/grpc.config";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    grpcClientOptions
  );
  await app.listen();
}
bootstrap();
