# Volunteer Matching App 

# Frontend Setup

- React
- React Router DOM
- Axios (planned for API calls)
- Node.js + Express (backend – WIP)
- MySQL (database – separate setup)

## 🚀 Getting Started

### 1. Clone the Repo
### 2. Install dependencies
- npm install
- npm start

## Install Dependencies
```bash
npm install
```

## Jest tests -- in root
```bash
npm test
```

## istanbul/chutzpah tests -- in root
to run unit tests using istanbul/chutzpah, ensure the following dependencies have been added through powershell

```bash
npm install --save-dev mocha chai supertest
npm install --save-dev chai-http
npm install --save-dev nyc
```

then, run using the command
```bash
 npm run coverage:mocha
```

chutzpah is only meant to be used on
*notificationsRoutes.js* and *volunteerHistory.js*

all other test cases use jest
