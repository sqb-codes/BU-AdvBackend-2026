const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
process.env.JWT_SECRET = "test-only-secret-with-more-than-32-characters";
const app = require("../app");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health endpoint reports database readiness", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const payload = await response.json();

  assert.ok([200, 503].includes(response.status));
  assert.ok(["connected", "disconnected"].includes(payload.database));
});

test("registration rejects role escalation and invalid data", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "correct-horse-battery",
      role: "admin",
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.match(payload.error.message, /Unsupported field/);
});

test("user routes require a bearer token", async () => {
  const response = await fetch(`${baseUrl}/api/users/me`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.message, "Authentication is required.");
});

test("user routes reject malformed bearer tokens", async () => {
  const response = await fetch(`${baseUrl}/api/users/me`, {
    headers: { authorization: "Bearer not-a-valid-token" },
  });
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.message, "Access token is invalid or expired.");
});

test("invalid JSON returns a client error", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: '{"name":',
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error.message, "Request body contains invalid JSON.");
});

test("unknown routes return the standard not-found response", async () => {
  const response = await fetch(`${baseUrl}/missing`);
  const payload = await response.json();

  assert.equal(response.status, 404);
  assert.equal(payload.error.message, "Route not found.");
});
