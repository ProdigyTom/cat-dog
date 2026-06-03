export interface ReplaceOptions {
  maxReplacements?: number;
}

export interface ReplaceResult {
  data: unknown;
  replacementCount: number;
}

export function replaceInJson(input: unknown, options: ReplaceOptions = {}): ReplaceResult {
  const limit = options.maxReplacements ?? Infinity;
  let replacementCount = 0;

  function walk(value: unknown): unknown {
    if (replacementCount >= limit) return value;

    if (typeof value === "string") {
      return replaceInString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => walk(item));
    }

    if (value !== null && typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        result[key] = walk(val);
      }
      return result;
    }

    return value;
  }

  function replaceInString(str: string): string {
    let result = "";
    let i = 0;
    while (i < str.length) {
      if (replacementCount >= limit) {
        result += str.slice(i);
        break;
      }
      if (str.startsWith("dog", i)) {
        result += "cat";
        replacementCount++;
        i += 3;
      } else {
        result += str[i];
        i++;
      }
    }
    return result;
  }

  const data = walk(input);
  return { data, replacementCount };
}
