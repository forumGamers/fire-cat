import { Status } from "@grpc/grpc-js/build/src/constants";
import { RpcException } from "@nestjs/microservices";
import type user from "../interfaces";
import { Metadata } from "@grpc/grpc-js";

export default new (class Helper {
  public getUserFromMetadata(metadata: Metadata) {
    const user = metadata.get("user");
    if (!user || !user.length)
      throw new RpcException({
        code: Status.INTERNAL,
        message: "Internal Server Error",
      });

    return (user[0] as unknown) as user;
  }
})();
