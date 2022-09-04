const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const authRoutes = require('./Routes/users');

const PORT = 5000;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.log('Connection Failed :', err);
  });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ping', (req, res) => {
  return res.send({
    error: false,
    message: 'Server is working',
  });
});

app.use('/users', authRoutes);

app.listen(PORT, () => {
  console.log('Server is running on PORT : ' + PORT);
});
