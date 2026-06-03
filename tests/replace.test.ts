import { describe, it, expect } from "vitest";
import { replaceInJson } from "../src/replace.js";

describe("replaceInJson", () => {
  describe("basic replacement", () => {
    it("replaces 'dog' in a top-level string value", () => {
      const { data, replacementCount } = replaceInJson({ pet: "dog" });
      expect(data).toEqual({ pet: "cat" });
      expect(replacementCount).toBe(1);
    });

    it("replaces 'dog' as a substring", () => {
      const { data, replacementCount } = replaceInJson({ value: "hotdog" });
      expect(data).toEqual({ value: "hotcat" });
      expect(replacementCount).toBe(1);
    });

    it("replaces multiple occurrences in one string", () => {
      const { data, replacementCount } = replaceInJson({ value: "dogdog" });
      expect(data).toEqual({ value: "catcat" });
      expect(replacementCount).toBe(2);
    });

    it("replaces across multiple keys", () => {
      const { data, replacementCount } = replaceInJson({ a: "dog", b: "dog" });
      expect(data).toEqual({ a: "cat", b: "cat" });
      expect(replacementCount).toBe(2);
    });

    it("returns zero replacements when no match", () => {
      const { data, replacementCount } = replaceInJson({ pet: "cat" });
      expect(data).toEqual({ pet: "cat" });
      expect(replacementCount).toBe(0);
    });

    it("is case-sensitive — does not replace 'Dog' or 'DOG'", () => {
      const { data, replacementCount } = replaceInJson({ a: "Dog", b: "DOG", c: "dog" });
      expect(data).toEqual({ a: "Dog", b: "DOG", c: "cat" });
      expect(replacementCount).toBe(1);
    });
  });

  describe("key handling", () => {
    it("does not replace 'dog' in keys", () => {
      const { data, replacementCount } = replaceInJson({ dog: "value" });
      expect(data).toEqual({ dog: "value" });
      expect(replacementCount).toBe(0);
    });

    it("does not replace 'dog' in keys but does in values", () => {
      const { data, replacementCount } = replaceInJson({ dogName: "dog" });
      expect(data).toEqual({ dogName: "cat" });
      expect(replacementCount).toBe(1);
    });
  });

  describe("nested structures", () => {
    it("replaces in nested objects", () => {
      const { data, replacementCount } = replaceInJson({ outer: { inner: "dog" } });
      expect(data).toEqual({ outer: { inner: "cat" } });
      expect(replacementCount).toBe(1);
    });

    it("replaces in arrays of strings", () => {
      const { data, replacementCount } = replaceInJson({ pets: ["dog", "fish", "dog"] });
      expect(data).toEqual({ pets: ["cat", "fish", "cat"] });
      expect(replacementCount).toBe(2);
    });

    it("replaces in arrays of objects", () => {
      const { data, replacementCount } = replaceInJson([{ name: "dog" }, { name: "fish" }]);
      expect(data).toEqual([{ name: "cat" }, { name: "fish" }]);
      expect(replacementCount).toBe(1);
    });

    it("handles deeply nested structures", () => {
      const input = { a: { b: { c: { d: "dog" } } } };
      const { data, replacementCount } = replaceInJson(input);
      expect(data).toEqual({ a: { b: { c: { d: "cat" } } } });
      expect(replacementCount).toBe(1);
    });
  });

  describe("non-string values", () => {
    it("leaves numbers unchanged", () => {
      const { data, replacementCount } = replaceInJson({ count: 42 });
      expect(data).toEqual({ count: 42 });
      expect(replacementCount).toBe(0);
    });

    it("leaves booleans unchanged", () => {
      const { data, replacementCount } = replaceInJson({ flag: true });
      expect(data).toEqual({ flag: true });
      expect(replacementCount).toBe(0);
    });

    it("leaves null values unchanged", () => {
      const { data, replacementCount } = replaceInJson({ value: null });
      expect(data).toEqual({ value: null });
      expect(replacementCount).toBe(0);
    });

    it("handles empty object", () => {
      const { data, replacementCount } = replaceInJson({});
      expect(data).toEqual({});
      expect(replacementCount).toBe(0);
    });

    it("handles empty array", () => {
      const { data, replacementCount } = replaceInJson([]);
      expect(data).toEqual([]);
      expect(replacementCount).toBe(0);
    });
  });

  describe("maxReplacements", () => {
    it("stops after maxReplacements is reached", () => {
      const { data, replacementCount } = replaceInJson(
        { a: "dog", b: "dog", c: "dog" },
        { maxReplacements: 2 }
      );
      expect(data).toEqual({ a: "cat", b: "cat", c: "dog" });
      expect(replacementCount).toBe(2);
    });

    it("stops mid-string when limit is reached", () => {
      const { data, replacementCount } = replaceInJson(
        { value: "dogdog" },
        { maxReplacements: 1 }
      );
      expect(data).toEqual({ value: "catdog" });
      expect(replacementCount).toBe(1);
    });

    it("makes no replacements when maxReplacements is 0", () => {
      const { data, replacementCount } = replaceInJson(
        { pet: "dog" },
        { maxReplacements: 0 }
      );
      expect(data).toEqual({ pet: "dog" });
      expect(replacementCount).toBe(0);
    });

    it("replaces all when maxReplacements is not set", () => {
      const input = { a: "dog", b: "dog", c: "dog" };
      const { data, replacementCount } = replaceInJson(input);
      expect(data).toEqual({ a: "cat", b: "cat", c: "cat" });
      expect(replacementCount).toBe(3);
    });

    it("handles maxReplacements larger than match count", () => {
      const { data, replacementCount } = replaceInJson(
        { pet: "dog" },
        { maxReplacements: 100 }
      );
      expect(data).toEqual({ pet: "cat" });
      expect(replacementCount).toBe(1);
    });
  });
});
