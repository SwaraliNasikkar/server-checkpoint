# Checkpoint: Server-Side Validation Demo

A Node.js web app that shows why input must be validated on the server. It has a registration form with browser-side checks switched off, so every submission is checked by the server before anything is saved.

**Live demo:** https://server-checkpoint.onrender.com



## Features

- Server-side validation of every field, with a clear error message under each invalid one
- Correct HTTP status codes: 201 on success, 400 on invalid input, 409 on a duplicate email, 404 and 405 for bad routes or methods
- Live rules checklist, password strength meter and Show/Hide password button
- Users page with search, stats and delete
- JSON API that uses the same validation
- Passwords hashed with scrypt, HTML output escaped against XSS, and a 10 KB request body limit
- 15 automated tests

## Getting started

You need [Node.js](https://nodejs.org) v18 or higher.

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm start
```

Open http://localhost:3000.

If `npm` is blocked in PowerShell, run `node server.js` instead.

## Run the tests

```bash
npm test
```

You can also run `node --test`.

## Project structure

```
├── server.js        HTTP server, body parsing, static files, error pages
├── routes.js        Routing table: "METHOD /path" -> handler
├── validators.js    Validation rules for every field
├── store.js         In-memory store with hashed passwords
├── views.js         HTML rendering with escaping
├── test.js          Automated tests
├── package.json
└── public/
    └── style.css
```

## Routes

| Method | Path | Description |
|---|---|---|
| GET | `/` | Registration form |
| POST | `/register` | Validate and create an account (201, 400 or 409) |
| GET | `/users` | List users; supports `?q=` search |
| POST | `/users/delete` | Delete a user, then redirect |
| POST | `/api/register` | Same validation, JSON response |
| GET | `/api/users` | Users as JSON |

## Validation rules

| Field | Rule |
|---|---|
| Name | 2–50 characters; letters, spaces and `. ' -` only |
| Email | Valid format, max 100 characters, unique |
| Age | Whole number from 18 to 120 |
| Mobile | 10 digits, starting with 6, 7, 8 or 9 |
| Password | At least 8 characters with an uppercase letter, a lowercase letter and a digit |
| Confirm password | Must match the password |

## Test it yourself

| Input | Expected result |
|---|---|
| Valid details | Success page (201) |
| Empty form | An error under every field (400) |
| Email `abc` | "Enter a valid email" |
| Age `17` | "Age must be between 18 and 120" |
| Mobile `5876543210` | "Must start with 6, 7, 8 or 9" |
| Password `password` | Needs an uppercase letter and a digit |
| Same email twice | "Already registered" (409) |
| Name `<script>alert(1)</script>` | Rejected, never rendered as HTML |

Bypass the browser entirely:

```bash
curl -i -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

This returns `400` with an error for each field.


## Notes

- Data is stored in memory, so it resets whenever the server restarts.
- The page fonts load from Google Fonts. Without internet the app falls back to system fonts.


