export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPLICATION_URL: string;
      CASSANDRA_USERNAME: string;
      CASSANDRA_PASSWORD: string;
      SECRET:strings
    }
  }
}
