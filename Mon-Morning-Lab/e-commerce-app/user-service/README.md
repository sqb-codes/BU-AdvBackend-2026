# User service

Express/Mongoose user service with versioned REST endpoints, JWT bearer authentication, role-based access control, and centralized JSON error responses.

## Configuration

Set the following variables in the service environment. `MONGODB_URI` can be used instead of the legacy `MONGODB_DATABASE`, `MONGODB_USERNAME`, and `MONGODB_PASSWORD` settings. When using the provided Compose MongoDB service, use its network hostname (`mongo`) and configure matching database credentials.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | HTTP port; defaults to `3000`. |
| `MONGODB_URI` | One database option required | MongoDB connection string. |
| `MONGODB_DATABASE` | One database option required | Database name when using the legacy connection settings. |
| `MONGODB_USERNAME` | One database option required | MongoDB username when using the legacy connection settings. |
| `MONGODB_PASSWORD` | One database option required | MongoDB password when using the legacy connection settings. |
| `MONGODB_HOST` | No | MongoDB hostname for legacy settings; defaults to `mongo`. |
| `JWT_SECRET` | Yes | Secret of at least 32 bytes used to sign access tokens. |
| `JWT_EXPIRES_IN` | No | Token lifetime such as `15m`, `1h`, or `7d`; defaults to `1h`. |
| `BOOTSTRAP_ADMIN_EMAIL` | No | Creates an initial administrator if both bootstrap credentials are configured. |
| `BOOTSTRAP_ADMIN_PASSWORD` | No | Initial admin password; must be 12-72 bytes. |
| `BOOTSTRAP_ADMIN_NAME` | No | Initial admin display name; defaults to `Administrator`. |

Copy `.env.example` to `.env` for local development, replace all placeholder values, and ensure the database URI credentials match the MongoDB deployment. Production deployments should inject configuration through their environment or secret manager. The bootstrap variables may be removed after the administrator account has been created.

Start the service from this directory with `npm run dev` or `npm run prod`. Startup fails explicitly if database/JWT configuration is invalid or MongoDB cannot be reached.

## API

All responses use JSON. Successful responses have a `success: true` field; errors include `success: false` and an `error` object. Send access tokens using `Authorization: Bearer <token>`.

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/health` | Public |
| `POST` | `/api/v1/auth/register` | Public; always creates a `user` role |
| `POST` | `/api/v1/auth/login` | Public |
| `GET` | `/api/v1/auth/me` | Authenticated |
| `POST` | `/api/v1/users` | Admin |
| `GET` | `/api/v1/users?page=1&limit=20` | Admin |
| `GET` | `/api/v1/users/:id` | User record owner or admin |
| `PATCH` | `/api/v1/users/:id` | User record owner or admin; only admins can change `role` or `isActive` |
| `DELETE` | `/api/v1/users/:id` | Admin |

User passwords are hashed before storage and excluded from API responses. Public registration cannot assign roles.
