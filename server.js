import express from 'express';
import bodyParser from 'body-parser';
import { umsLogin } from './loginScrapper.js';

const app = express();
app.use(bodyParser.json());

// define the first route
app.post('/login', async (req, res) => {
  const result = await umsLogin(req.body);
  res.json(result);
});

// start the server listening for requests
app.listen(3000, () => console.log("Server is running..."));