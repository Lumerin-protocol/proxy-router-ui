import { expect, test, describe } from "vitest";
import { formatUnits, type RoundingOpts } from "./formatUnits";

// biome-ignore-all lint/complexity/noForEach: convenience for table testing

const token = {
  decimals: 8,
  symbol: "LMR",
  name: "Lumerin",
};

describe("should use correct suffix for numbers that do not need rounding", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 3,
  };
  (
    [
      // // suffixes without rounding
      [1n * 10n ** dec, "1"],
      [10n * 10n ** dec, "10"],
      [100n * 10n ** dec, "100"],
      [1000n * 10n ** dec, "1K"],
      [10000n * 10n ** dec, "10K"],
      [100000n * 10n ** dec, "100K"],
      [1000000n * 10n ** dec, "1M"],
      [10000000n * 10n ** dec, "10M"],
      [100000000n * 10n ** dec, "100M"],
      [1000000000n * 10n ** dec, "1B"],
      [10000000000n * 10n ** dec, "10B"],
      [100000000000n * 10n ** dec, "100B"],
      [1000000000000n * 10n ** dec, "1T"],
      [10000000000000n * 10n ** dec, "10T"],
      [100000000000000n * 10n ** dec, "100T"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should consider maxChars when using suffixes", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 5,
  };
  (
    [
      // // suffixes without rounding
      [1n * 10n ** dec, "1"],
      [10n * 10n ** dec, "10"],
      [100n * 10n ** dec, "100"],
      [1000n * 10n ** dec, "1000"],
      [10000n * 10n ** dec, "10000"],
      [100000n * 10n ** dec, "100K"],
      [1000000n * 10n ** dec, "1M"],
      [10000000n * 10n ** dec, "10M"],
      [100000000n * 10n ** dec, "100M"],
      [1000000000n * 10n ** dec, "1B"],
      [10000000000n * 10n ** dec, "10B"],
      [100000000000n * 10n ** dec, "100B"],
      [1000000000000n * 10n ** dec, "1T"],
      [10000000000000n * 10n ** dec, "10T"],
      [100000000000000n * 10n ** dec, "100T"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should use scientific notation suffix for very big numbers", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 3,
  };
  // very big numbers as exponents
  (
    [
      [1000n * 10n ** (dec + 12n), "1e+15"],
      [1001n * 10n ** (dec + 12n), "1e+15"],
      [1011n * 10n ** (dec + 12n), "1.01e+15"],
      [1111n * 10n ** (dec + 12n), "1.11e+15"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should use scientific notation suffix for very big numbers when maxChars is 5", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 5,
  };
  // very big numbers as exponents
  (
    [
      [1000n * 10n ** (dec + 12n), "1e+15"],
      [1001n * 10n ** (dec + 12n), "1.001e+15"],
      [1011n * 10n ** (dec + 12n), "1.011e+15"],
      [1111n * 10n ** (dec + 12n), "1.111e+15"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should round numbers when using suffixes", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 3,
  };
  (
    [
      [11111n * 10n ** dec, "11.1K"],
      [11200n * 10n ** dec, "11.2K"],
      [11299n * 10n ** dec, "11.2K"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should round numbers when using suffixes considering maxChars", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 5,
  };
  (
    [
      [11111n * 10n ** dec, "11111"],
      [11200n * 10n ** dec, "11200"],
      [11299n * 10n ** dec, "11299"],
      [111299n * 10n ** dec, "111.29K"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should round numbers without suffixes", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 3,
  };
  (
    [
      [1100n * 10n ** (dec - 3n), "1.1"],
      [1110n * 10n ** (dec - 3n), "1.11"],
      [1111n * 10n ** (dec - 3n), "1.11"],
      [1111111n * 10n ** (dec - 6n), "1.11"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should round numbers without suffixes considering maxChars", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 5,
  };
  (
    [
      [1100n * 10n ** (dec - 3n), "1.1"],
      [1110n * 10n ** (dec - 3n), "1.11"],
      [1111n * 10n ** (dec - 3n), "1.111"],
      [111111100n, "1.1111"],
      [111111111n, "1.1111"],
      [11111111n, "0.1111"],
      [1111111n, "0.0111"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });

  test("should round eth value", () => {
    expect(formatUnits(230088357184397000n, 18, { maxChars: 5 }).full).toBe("0.23");
  });
});

describe("should format numbers less than 1", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 3,
  };
  (
    [
      [100n * 10n ** (dec - 3n), "0.1"],
      [10n * 10n ** (dec - 3n), "0.01"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should use scientific notation when number does not fit in 3 chars", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 3,
  };
  (
    [
      [10n * 10n ** (dec - 3n), "0.01"],
      [1n * 10n ** (dec - 3n), "1e-3"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should use scientific notation when number does not fit in 5 chars", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 5,
  };
  (
    [
      [1n * 10n ** (dec - 4n), "0.0001"],
      [1n * 10n ** (dec - 5n), "1e-5"],
    ] as [bigint, string][]
  ).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});

describe("should handle corner cases", () => {
  const dec = BigInt(token.decimals);
  const opts: RoundingOpts = {
    maxChars: 5,
  };
  ([[0n, "0"]] as [bigint, string][]).forEach(([input, expected]) => {
    test(`${input} -> ${expected}`, () => {
      expect(formatUnits(input, token.decimals, opts).full).toBe(expected);
    });
  });
});
