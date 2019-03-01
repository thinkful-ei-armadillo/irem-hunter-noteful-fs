'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config');
const NotesService = require('../service/notes-service');
const FoldersService = require('../service/folders-service');
const xss = require('xss');

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

function sanitize(note) {
  return {
    id : note.id,
    name : xss(note.name),
    modified : xss(note.modified),
    folderId : note.folderId,
    content : xss(note.content)
  };
}

app.use((req,res,next)=> {
  const authToken = req.get('Authorization');
  if(!authToken || authToken.split(' ')[1] !== process.env.API_KEY){
    return res.status(401).send({error: 'Unauthorized'});
  }
  next();
});

router.route('/notes')
  .get((req, res) => {
    const db = req.app.get('db');

    return notes
      .getAllNotes(db)
      .then((data => {
        res.json(data.map(sanitize));
      }));
  })
  .post((req, res) => {
    const { id, name, modified, folderId, content } = req.body;

    const note = {
      id,
      name,
      modified,
      folderId,
      content
    };
    const db = req.app.get('db');

    notes.createNote(db, note).then(resjson => {
      res.status(200).json(resjson);
    });
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
