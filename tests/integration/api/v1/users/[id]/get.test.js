import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[id]", () => {
  describe("Anonymous user", () => {
    test("With existing id", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UsuarioExistente",
        email: "usuario.existente@gmail.com",
        password: "senha123",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.id}`,
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UsuarioExistente",
        features: ["read:activation_token"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated 'username' between two users", async () => {
      const user1 = await orchestrator.createUser({
        username: "JoaoSilva",
        email: "joao.silva1@gmail.com",
        password: "senha123",
      });

      const user2 = await orchestrator.createUser({
        username: "JoaoSilva",
        email: "joao.silva2@gmail.com",
        password: "senha123",
      });

      const response1 = await fetch(
        `http://localhost:3000/api/v1/users/${user1.id}`,
      );
      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${user2.id}`,
      );

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const response1Body = await response1.json();
      const response2Body = await response2.json();

      expect(response1Body.username).toBe("JoaoSilva");
      expect(response2Body.username).toBe("JoaoSilva");
      expect(response1Body.id).not.toBe(response2Body.id);
    });

    test("With nonexistent id", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/1e1d1c1b-1a19-4817-9615-141312111009",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O id informado não foi encontrado no sistema.",
        action: "Verifique se o id está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With malformed id", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/NaoEhUmUUID",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O id informado não foi encontrado no sistema.",
        action: "Verifique se o id está digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
