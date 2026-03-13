export class UUID {

  public static generateUUID(): string {
    return crypto.randomUUID();
  }
}
