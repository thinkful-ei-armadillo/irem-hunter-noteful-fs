'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config');
const notesRouter = require('../router/notes-router');
const foldersRouter = require('../router/folders-router');

const app = express();
const router = express.Router();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption, {
  skip: () => process.env.NODE_ENV === 'test'
}));

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use('/api',notesRouter);
app.use('/api',foldersRouter);

app.use((req,res,next)=> {
  const authToken = req.get('Authorization');
  if(!authToken || authToken.split(' ')[1] !== process.env.API_KEY){
    return res.status(401).send({error: 'Unauthorized'});
  }
  next();
});

app.use(function ErrorHandler(error, req, res, next) {
  let response;
  if(NODE_ENV === 'production'){
    response = { error: { message: 'server error' } };
  }
  else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response)

    .catch(next);
});

module.exports = app;
