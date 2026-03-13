export class Color {
  public static getRandomColor = (): string => {
    // We cap the values at 200 to stay away from pure white (255, 255, 255)
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);

    // Convert to Hex and pad with a leading zero if necessary
    const toHex = (n: number) => n.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
