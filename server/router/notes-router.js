'use strict';
const express = require('express');
const notesRouter = express.Router();
const notes = require('../service/notes-service');
const NotesService = require('../service/notes-service');
const xss = require('xss');

function sanitize(note) {
  return {
    id : note.id,
    name : xss(note.name),
    modified : xss(note.modified),
    folderId : note.folderid,
    content : xss(note.content)
  };
}

notesRouter.route('/noteful')
  .get((req, res) => {
    const db = req.app.get('db');

    return notes
      .getAllNotes(db)
      .then((data => {
        res.json(data.map(sanitize));
      }));
  });

notesRouter.route('/add-note')
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

    notes.insertNote(db, note).then(resjson => {
      res.status(200).json(resjson);
    });
  });

notesRouter.route('/note/:id')
  .get((req, res) => {
    const db = req.app.get('db');

    return notes
      .getById(db,req.params.id)
      .then(resjson=> {
        if (resjson.length > 0) {
          res.json(resjson.map(sanitize));
        }
        else{
          res.status(404).end();
        }
      });
  })
  .delete((req, res) => {
    const db = req.app.get('db');

    return notes.deleteNote(db, req.params.id).then(resjson => {
      if (resjson === 1) {
        res.status(204).end();
      } else {
        res.status(404).end();
      }
    });
  })
  .patch((req, res) =>{
    const db = req.app.get('db');

    if (Object.keys(req.body).length === 0) {
      return res.status(400).end();
    }

    return notes.updateNote(db,req.params.id, req.body).then(() => {
      res.status(204).end();
    });
  });

module.exports = notesRouter;