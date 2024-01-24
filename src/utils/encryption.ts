import { AES, enc } from "crypto-ts";

class Encryption {
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  public encrypt(data: string) {
    return AES.encrypt(
      data.replace(/\s/g, "_"),
      this.ENCRYPTION_KEY
    ).toString();
  }

  public decrypt(data: string) {
    try {
      AES.decrypt(data, this.ENCRYPTION_KEY)
        .toString(enc.Utf8)
        .replace(/_/g, " ");
    } catch (err) {
      return data;
    }
  }
}

export default new Encryption();
