const express = require('express');
const cors = require('cors');
const userRoutes = require('./userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes); // register & login live here

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
