# Ether Auth

![License](https://img.shields.io/github/license/Eric-fgm/ether-auth)
![Version](https://img.shields.io/npm/v/ether-auth)
![Build Status](https://img.shields.io/github/actions/workflow/status/your-repo/ether-auth/build.yml)

A lightweight and secure authentication library for Node.js applications, providing JWT-based authentication, password hashing, and session management.

## Features

- 🔒 Secure password hashing (bcrypt)
- 🔑 JWT or Session based authentication
- 🔄 Refresh token support
- 🛡️ Middleware integration for Express and Hono
- 📌 Easy customization

## Installation

```sh
npm install ether-auth
```

## Usage

### Importing the Library

```javascript
import express from "express";
import { expressAuth } from "@ether-auth/express";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(
  "/auth",
  expressAuth({
    providers: [...],
    adapter: ...,
    session: {
      secret: proccess.env.SECRET,
    },
  }).middleware
)
```

### Protect Routes

```javascript
const { getSession } = expressAuth(...)

app.get("/dashboard", async (req, res) => {
  const session = await getSession(req, res);
  console.log(session?.user);
  //...
});
```

## Configuration

You can customize the authentication settings via environment variables:

```env
JWT_SECRET=your_secret_key
TOKEN_EXPIRATION=1h
BCRYPT_SALT_ROUNDS=10
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
