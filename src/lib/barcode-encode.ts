const CHAR_MAP: Record<string, string> = {
  "0": "A", "1": "B", "2": "C", "3": "D", "4": "E",
  "5": "F", "6": "G", "7": "H", "8": "I", "9": "J",
};

export function encodePrice(price: number): string {
  const str = String(Math.round(price));
  let result = "";
  let i = 0;

  while (i < str.length) {
    const char = CHAR_MAP[str[i]];
    let count = 1;

    while (i + count < str.length && str[i + count] === str[i]) {
      count++;
    }

    if (count >= 3) {
      result += char + String(count);
      i += count;
    } else {
      for (let j = 0; j < count; j++) {
        result += char;
      }
      i += count;
    }
  }

  return result;
}

export function decodePrice(encoded: string): string {
  const REVERSE_MAP: Record<string, string> = {
    A: "0", B: "1", C: "2", D: "3", E: "4",
    F: "5", G: "6", H: "7", I: "8", J: "9",
  };

  let result = "";
  let i = 0;
  while (i < encoded.length) {
    const ch = encoded[i];
    if (REVERSE_MAP[ch]) {
      result += REVERSE_MAP[ch];
      i++;
    } else if (/[0-9]/.test(ch)) {
      // Read multi-digit count
      let countStr = "";
      while (i < encoded.length && /[0-9]/.test(encoded[i])) {
        countStr += encoded[i];
        i++;
      }
      const count = parseInt(countStr);
      const lastChar = result[result.length - 1];
      if (lastChar) {
        for (let j = 1; j < count; j++) {
          result += lastChar;
        }
      }
    } else {
      i++;
    }
  }
  return result;
}
