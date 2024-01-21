import { Module } from "@nestjs/common";
import { config } from "dotenv";
import { UserModule } from "./modules/user/user.module";
import { CassandraModule } from "@mich4l/nestjs-cassandra";
import { join } from "path";

config();

@Module({
  imports: [
    CassandraModule.forRoot({
      keyspace: "user_service",
      credentials: {
        username: process.env.CASSANDRA_USERNAME,
        password: process.env.CASSANDRA_PASSWORD,
      },
      cloud: {
        secureConnectBundle: join(
          __dirname,
          "../connection/secure-connect-forum-gamers-testing.zip"
        ),
      },
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
