# User Service

The User Service is an Express and MongoDB REST API for account registration, authentication, and user management. It is structured using MVC-style layers so the model, business logic, routes, and middleware can be extended independently as the application grows into more services.

## Features

- Register and authenticate users with email and password.
- Hash passwords with bcrypt; never include password hashes in API responses.
- Authenticate protected routes with signed, expiring JWT bearer tokens.
- Apply role-based access control: regular users can manage their own profiles, while administrators can manage all users.
- Validate request bodies and query parameters and return consistent JSON errors.
- Invalidate existing access tokens when the account password changes.

New registrations always receive the `user` role. To create the first administrator, register an account and promote it out of band using a trusted MongoDB administrative connection (see [First administrator](#first-administrator)).

## Configuration

From this directory, copy the example environment file and set a private JWT secret:

```sh
cp .env.example .env
```

Configure these environment variables in `.env`:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `JWT_SECRET` | JWT signing secret; must be at least 32 characters | Required |
| `JWT_EXPIRES_IN` | JWT lifetime, such as `1h` or `30m` | `1h` |
| `MONGODB_URI` | Complete MongoDB connection URI | Uses the settings below |
| `MONGODB_HOST` | MongoDB host when `MONGODB_URI` is not set | `localhost` |
| `MONGODB_PORT` | MongoDB port when `MONGODB_URI` is not set | `27017` |
| `MONGODB_DATABASE_NAME` | Database name when `MONGODB_URI` is not set | `user_service` |
| `MONGODB_USERNAME` / `MONGODB_PASSWORD` | Optional MongoDB credentials; set both or neither | Not set |
| `MONGODB_AUTH_SOURCE` | Authentication database when using username/password | `admin` |

Do not commit `.env` or production secrets to source control.

## Run locally

Start MongoDB separately, then run the service:

```sh
cd user-service
npm ci
npm run dev
```

For a production-style local process:

```sh
npm start
```

The service listens on `http://localhost:3000` by default. Verify readiness with:

```sh
curl http://localhost:3000/health
```

Run the service tests with:

```sh
npm test
```

## Run with Docker Compose

Run these commands from the `e-commerce-project` directory. The Compose configuration includes MongoDB with the development credentials `root` / `root`; provide the MongoDB URI and a private JWT secret when starting the user service:

```sh
docker compose -f docker-compose.yaml run --rm --service-ports \
  -e MONGODB_URI='mongodb://root:root@mongo:27017/user_service?authSource=admin' \
  -e JWT_SECRET='replace-with-a-private-secret-of-at-least-32-characters' \
  user-service
```

The API is available at `http://localhost:4545` with the included port mapping. In a separate terminal, inspect the service output:

```sh
docker compose -f docker-compose.yaml logs -f user-service
```

For the development overlay, which bind-mounts the source and installs locked dependencies in its container before starting:

```sh
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml run --rm --service-ports \
  -e MONGODB_URI='mongodb://root:root@mongo:27017/user_service?authSource=admin' \
  -e JWT_SECRET='replace-with-a-private-secret-of-at-least-32-characters' \
  user-service
```

To rebuild and refresh an existing development container's anonymous dependency volume:

```sh
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d \
  --build --force-recreate --renew-anon-volumes user-service
```

## First administrator

Register a regular user using `POST /api/auth/register`, then promote that account through a trusted MongoDB administrative connection:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

Log in again after the promotion. The service checks the current account role in MongoDB for every authenticated request, so role changes take effect immediately.

## API reference

Base URL for local development: `http://localhost:3000`  
Base URL for the supplied Docker Compose port mapping: `http://localhost:4545`

Send JSON requests with `Content-Type: application/json`. For protected endpoints, set the Postman Authorization type to **Bearer Token** and use the `accessToken` returned by register or login.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Service and MongoDB readiness |
| `POST` | `/api/auth/register` | Public | Register a regular user |
| `POST` | `/api/auth/login` | Public | Verify credentials and issue an access token |
| `GET` | `/api/users/me` | Authenticated | Get the current user's profile |
| `PATCH` | `/api/users/me` | Authenticated | Update own name/email or change password |
| `DELETE` | `/api/users/me` | Authenticated | Delete own account |
| `POST` | `/api/users` | Admin | Create a user, optionally setting its role |
| `GET` | `/api/users` | Admin | List users with pagination and optional filters |
| `GET` | `/api/users/:userId` | Self or admin | Get a user's profile |
| `PATCH` | `/api/users/:userId` | Admin | Update a user's name, email, password, or role |
| `DELETE` | `/api/users/:userId` | Admin | Delete a user |

### Register

`POST /api/auth/register`

```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "CorrectHorseBattery1!"
}
```

Registration does not accept a `role` field. A successful response includes `data.user` and `data.accessToken`.

### Login

`POST /api/auth/login`

```json
{
  "email": "ravi@example.com",
  "password": "CorrectHorseBattery1!"
}
```

Example success response:

```json
{
  "data": {
    "user": {
      "_id": "66b8f1d1e0aa12c1f2e34567",
      "name": "Ravi Kumar",
      "email": "ravi@example.com",
      "role": "user"
    },
    "accessToken": "<JWT>",
    "tokenType": "Bearer"
  }
}
```

### Get current profile

`GET /api/users/me` — authenticated

### Update current profile

`PATCH /api/users/me` — authenticated

Update name and/or email:

```json
{
  "name": "Ravi K.",
  "email": "ravi.k@example.com"
}
```

To change a password, provide both values. The response contains a replacement token; the old token is invalidated:

```json
{
  "currentPassword": "CorrectHorseBattery1!",
  "newPassword": "AnotherSecurePassword2!"
}
```

### Delete current account

`DELETE /api/users/me` — authenticated; returns `204 No Content`.

### Create a user

`POST /api/users` — admin

```json
{
  "name": "Sam Admin",
  "email": "sam@example.com",
  "password": "AdminPassword1!",
  "role": "admin"
}
```

The `role` is optional and must be either `user` or `admin`.

### List users

`GET /api/users?page=1&limit=20&role=user&search=ravi` — admin

All query parameters are optional. `limit` defaults to `20` and cannot exceed `100`. `role` can be `user` or `admin`; `search` matches a name or email address.

### Get a user

`GET /api/users/66b8f1d1e0aa12c1f2e34567` — the user themselves or an admin.

### Update a user

`PATCH /api/users/66b8f1d1e0aa12c1f2e34567` — admin

Only include the fields to change:

```json
{
  "name": "Sam Administrator",
  "role": "admin"
}
```

### Delete a user

`DELETE /api/users/66b8f1d1e0aa12c1f2e34567` — admin; returns `204 No Content`.

## Responses and errors

Successful reads and writes return JSON under `data`. The user-list endpoint also returns `pagination` metadata. Delete requests return `204 No Content`.

Errors use this format:

```json
{
  "error": {
    "message": "A human-readable error message."
  }
}
```

Common statuses include `400` for invalid input, `401` for missing or invalid authentication, `403` for insufficient permissions, `404` when a route or user is not found, and `409` when an email address is already in use.
