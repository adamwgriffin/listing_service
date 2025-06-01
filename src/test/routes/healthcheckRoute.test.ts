import request from "supertest";
import app from "../../app";
import * as database from "../../database";

describe("healthcheckController", () => {
  describe("GET /health", () => {
    describe("when the service is healthy", () => {
      it("should return status 200", async () => {
        const res = await request(app.callback()).get("/health");
        expect(res.status).toBe(200);
      });
    });

    describe("when the service is not healthy", () => {
      beforeAll(() => {
        jest.spyOn(database, "databaseIsConnected").mockReturnValue(false);
      });

      afterAll(() => {
        jest.restoreAllMocks();
      });

      it("should return status 503", async () => {
        const res = await request(app.callback()).get("/health");
        expect(res.status).toBe(503);
      });
    });
  });
});
