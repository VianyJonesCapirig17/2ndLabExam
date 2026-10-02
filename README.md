# CCE106 Practical Laboratory Examination

## Student Service Portal

### Student Information

Name: Viany Jones Capirig

Section:

Date: 2026-10-02

### Required Features

- [ ] Login
- [ ] Authentication state
- [ ] Secure token storage
- [ ] Protected navigation
- [ ] Dashboard
- [ ] Student API request
- [ ] Loading state
- [ ] Error state
- [ ] Empty state
- [ ] Search/filter
- [ ] Dynamic student details
- [ ] Profile
- [ ] Session restoration
- [ ] Logout

### JavaScript API

The project includes a Node.js/Express API in `backend/` with `POST /api/login`,
`GET /api/students`, `GET /api/students/:id`, and `GET /api/profile`. It reads records from
`backend/data/students.json`; the included five records are examples for local testing.
Replace them with authorized student records before assessment.

Run `npm run api:install` once, then `npm run api:setup` to configure the login email and
password. The setup command stores a bcrypt hash, not the plaintext password, in the ignored
`backend/.env` file. Start the API using `npm run api` and Expo using `npx expo start` in
separate terminals. Android and the PC should be on the same Wi-Fi. The default API URL is
in `constants/api.ts`; change it if your PC's LAN address changes.

### How to Run

```sh
npm install
npx expo start
```

Press `w` for web, or run `npm run web` directly.

The dashboard and student routes require a successful login. Manage student records through
`backend/data/students.json`; if that file is absent, the API returns an empty list.

Expo SecureStore is used on Android and iOS. See the [Expo SDK 54 SecureStore documentation](https://docs.expo.dev/versions/v54.0.0/sdk/securestore/).

Compiler and lint checks:

```sh
npx tsc --noEmit
npm run lint
```
