const test = require("node:test");
const assert = require("node:assert/strict");
const createApp = require("../src/app");

test("serves health checks and JSON not-found errors", async (context) => {
    const server = createApp().listen(0);
    context.after(() => new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    }));
    await new Promise((resolve) => server.once("listening", resolve));

    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { success: true, data: { service: "user-service" } });

    const missing = await fetch(`${baseUrl}/not-a-route`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), {
        success: false,
        error: { code: "ROUTE_NOT_FOUND", message: "Route not found: GET /not-a-route" },
    });
});

test("protects user routes from unauthenticated requests", async (context) => {
    const server = createApp().listen(0);
    context.after(() => new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    }));
    await new Promise((resolve) => server.once("listening", resolve));

    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/users`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
        success: false,
        error: { code: "AUTHENTICATION_REQUIRED", message: "A bearer token is required" },
    });
});
