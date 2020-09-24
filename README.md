# SafeMessenger

This project was generated using [Nx](https://nx.dev).

## Prerequisites

Install [Docker](https://www.docker.com/get-started), [NodeJS](https://nodejs.org/en/), [OpenSSL](https://www.openssl.org/).  

Install `node_modules` with command `npm i`

(Optional) Generate SSL certificate for localhost HTTPS connections 
```
openssl req 
    -x509 -sha256 -nodes 
    -newkey rsa:2048 -days 365 
    -out localhost.crt
    -keyout localhost.key 
```

Prepare application configuration `.env` file with the following fields:
* PostgreSQL configuration:
```
POSTGRES_USER=username     # Database user username
POSTGRES_PASSWORD=password # Database user password
POSTGRES_DB=messenger      # Default database name
PGDATA=/data               # Default docker volume directory
```
* Mail account for Nodemailer tool
```
EMAIL_HOSTNAME=emailhostname # e-mail account hostname
EMAIL_ID=emailusername       # e-mail username
EMAIL_PASS=emailpassword     # e-mail password
```
* Session Secret configuration
```
SESSION_SECRET=secretkey # Secret used to manage Redis sessions 
JWT_SECRET=secretjwtkey  # Secret used to encode JWT tokens
```
* Timezone
```
TZ=UTC # Application dates works only with UTC
```
* Admin credentials
```
ADMIN_LOGIN=adminlogin       # Administrator's login
ADMIN_PASSWORD=adminpassword # Administrator's password
```
* SSL Certificate location
```
HTTPS_CERT=localhost.crt # Local SSL certificate
HTTPS_KEY=localhost.key  # Local SSL private key
```

## Serve application

In three terminals run:
```
docker-compose up              # Serve PostgreSQL and Redis
npm run serve api              # Serve server application
npm run serve messenger-client # Serve client application
```

## Run tests
```
nx test
```
