# pap-webapps

## I. Quick start

- Requirement: Installed [Node](https://nodejs.org/en/download)

### 1. Set up

- Add environment file `.env` to root folder:

```bash
# .env

NODE_ENV=development # development | production

REACT_APP_API_BASE_URL=

```

- Install libraries and packages:

```bash
npm i -g patch-package

npm i
```

### 2. Run application:

- Development mode

```bash
npm run dev
```

- Production mode

```bash
# Build
npm run build

# Run
# install serve if it is not installed
serve -s build
```
