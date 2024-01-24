import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { grpcClientOptions } from "./config/grpc.config";
import { LoggerInterceptor } from "./middlewares/logger.middleware";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    grpcClientOptions
  );
  app.useGlobalInterceptors(new LoggerInterceptor());
  await app.listen();
}
bootstrap();
