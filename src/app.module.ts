import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { config } from "dotenv";
import { USER_PACKAGE } from "./constants/proto.constant";
import { grpcClientOptions } from "./config/grpc.config";

config();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_PACKAGE,
        ...grpcClientOptions,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
