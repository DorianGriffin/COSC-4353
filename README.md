# Volunteer Matching App 

### Backend:
- Node.js + Express
- Jest + Supertest 
- Mocha + Chai
- No database for now – backend uses hardcoded data only

## Install Dependencies
```bash
npm install
```

## Jest tests -- in root
```bash
npm test
```

<<<<<<< HEAD
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

=======
>>>>>>> 11141db268087f3ba14c21b4c99067f18935ae89
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
