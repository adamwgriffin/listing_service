import request from "supertest";
import { buildApp } from "../../app";

const app = buildApp();

describe("healthcheckController", () => {
  describe("GET /ping", () => {
    it('should return status 200 and message "pong"', async () => {
      const response = await request(app.callback()).get("/ping");
      expect(response.status).toBe(200);
      expect(response.text).toEqual("pong");
    });
  });
});
