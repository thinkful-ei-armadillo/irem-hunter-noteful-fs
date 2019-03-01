'use strict';

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('App', () => {
  let db;
  before('make knex instance',() =>{
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  
  before('clean the table', () => db('bookmarks').truncate());

  afterEach('delete bookmarks', ()=> db('bookmarks').truncate());

  context('Given there are data in the database', ()=>{

    beforeEach('insert data into table', () => {

      const testData= [
        {
          id: 1,
          title: 'First test data!',
          description: 'First insert this test data',
        }
      ];

      return db
        .into('table')
        .insert(testData);
    });

    it ('GET/ responds with 200 containing "Hello, world!"', () => {
      return supertest(app)
        .get('/')
        .expect(200, 'Hello, boilerplate!');
    });
  });
  
});