import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { ClientsModule } from "@nestjs/microservices";
import { USER_PACKAGE } from "src/constants/proto.constant";
import { grpcClientOptions } from "src/config/grpc.config";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    ClientsModule.register([
      {
        name: USER_PACKAGE,
        ...grpcClientOptions,
      },
    ]),
  ],
})
export class UserModule {}
