'use strict';
const express = require('express');
const foldersRouter = express.Router();
const folders = require('../service/folders-service');
const FoldersService = require('../service/folders-service');
const xss = require('xss');

function sanitize(folder) {
  return {
    id : folder.id,
    name : xss(folder.name)
  };
}

foldersRouter.route('/notes-by-folder/:id')
  .get((req, res) => {
    const db = req.app.get('db');

    return folders
      .getFoldersNotes(db, req.params.id)
      .then((data => {
        res.json(data.map(sanitize));
      }));
  });

foldersRouter.route('/folder')
  .get((req, res) => {
    const db = req.app.get('db');

    return folders
      .getAllFolders(db)
      .then((data => {
        res.json(data.map(sanitize));
      }));
  });

foldersRouter.route('/add-folder')
  .post((req, res) => {
    const { id, name } = req.body;

    const folder = {
      id,
      name
    };
    const db = req.app.get('db');

    folders.insertFolder(db, folder).then(resjson => {
      res.status(200).json(resjson);
    });
  });

foldersRouter.route('/folder/:id')
  .get((req, res) => {
    const db = req.app.get('db');

    return folders
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

    return folders.deleteFolder(db, req.params.id).then(resjson => {
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

    return folders.updateFolder(db,req.params.id, req.body).then(() => {
      res.status(204).end();
    });
  });

module.exports = foldersRouter;