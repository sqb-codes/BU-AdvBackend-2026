const test = require("node:test");
const assert = require("node:assert/strict");
const { validateUserInput } = require("../src/utils/user-input");
const ApiError = require("../src/utils/api-error");

test("validates and normalizes registration input without accepting a role", () => {
    assert.deepEqual(
        validateUserInput({ name: "  Ada Lovelace ", email: "ADA@example.com", password: "correct-horse" }),
        { name: "Ada Lovelace", email: "ada@example.com", password: "correct-horse" },
    );
});

test("rejects role assignment during public registration", () => {
    assert.throws(
        () => validateUserInput({
            name: "Ada Lovelace",
            email: "ada@example.com",
            password: "correct-horse",
            role: "admin",
        }),
        (error) => error instanceof ApiError && error.statusCode === 400 && error.code === "INVALID_FIELD",
    );
});

test("allows admins to set a supported role and status", () => {
    assert.deepEqual(
        validateUserInput({ role: "admin", isActive: false }, { allowRole: true, allowIsActive: true, partial: true }),
        { role: "admin", isActive: false },
    );
});

test("rejects passwords that exceed bcrypt's input byte limit", () => {
    assert.throws(
        () => validateUserInput({ name: "Ada", email: "ada@example.com", password: "a".repeat(73) }),
        (error) => error instanceof ApiError && error.code === "INVALID_PASSWORD",
    );
});

test("rejects empty partial updates", () => {
    assert.throws(
        () => validateUserInput({}, { partial: true }),
        (error) => error instanceof ApiError && error.code === "EMPTY_UPDATE",
    );
});
