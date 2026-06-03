import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/server.js";

describe("POST /replace", () => {
  describe("basic behaviour", () => {
    it("returns transformed data and replacement count", async () => {
      const res = await request(app)
        .post("/replace")
        .send({ pet: "dog" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: { pet: "cat" }, replacementCount: 1 });
    });

    it("returns original data unchanged when there are no matches", async () => {
      const res = await request(app)
        .post("/replace")
        .send({ pet: "fish" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: { pet: "fish" }, replacementCount: 0 });
    });

    it("handles nested JSON", async () => {
      const res = await request(app)
        .post("/replace")
        .send({ outer: { inner: "dog" } });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: { outer: { inner: "cat" } }, replacementCount: 1 });
    });

    it("handles arrays", async () => {
      const res = await request(app)
        .post("/replace")
        .send(["dog", "fish", "dog"]);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: ["cat", "fish", "cat"], replacementCount: 2 });
    });

    it("handles an empty object", async () => {
      const res = await request(app)
        .post("/replace")
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: {}, replacementCount: 0 });
    });
  });

  describe("maxReplacements query param", () => {
    it("respects maxReplacements limit", async () => {
      const res = await request(app)
        .post("/replace?maxReplacements=1")
        .send({ a: "dog", b: "dog" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: { a: "cat", b: "dog" }, replacementCount: 1 });
    });

    it("makes no replacements when maxReplacements=0", async () => {
      const res = await request(app)
        .post("/replace?maxReplacements=0")
        .send({ pet: "dog" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: { pet: "dog" }, replacementCount: 0 });
    });

    it("replaces all when maxReplacements exceeds match count", async () => {
      const res = await request(app)
        .post("/replace?maxReplacements=100")
        .send({ a: "dog", b: "dog" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: { a: "cat", b: "cat" }, replacementCount: 2 });
    });
  });

  describe("error handling", () => {
    it("returns 400 for a negative maxReplacements", async () => {
      const res = await request(app)
        .post("/replace?maxReplacements=-1")
        .send({ pet: "dog" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for a non-integer maxReplacements", async () => {
      const res = await request(app)
        .post("/replace?maxReplacements=1.5")
        .send({ pet: "dog" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("returns 400 for a non-numeric maxReplacements", async () => {
      const res = await request(app)
        .post("/replace?maxReplacements=abc")
        .send({ pet: "dog" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });
});
