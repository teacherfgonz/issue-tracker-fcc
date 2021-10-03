const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = ''
let id2 = ''

suite('Functional Tests', function() {
    test('Create an issue with every field', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'Text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'Text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          assert.equal(res.body.assigned_to, 'Chai and Mocha'),
          assert.equal(res.body.status_text, 'In QA')
          id1 = res.body._id
          done()
        })
    })
    test('Create an issue with only required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title 2',
          issue_text: 'Text 2',
          created_by: 'Functional Test - Only required fields',
          assigned_to: '',
          status_text: ''
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Title 2')
          assert.equal(res.body.issue_text, 'Text 2')
          assert.equal(res.body.created_by, 'Functional Test - Only required fields')
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          id2 = res.body._id
          done()
        })
    })
    test('Create an issue with 1 missing required field', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: '3',
          issue_text: 'Missing',
          created_by: '',
          assigned_to: '',
          status_text: ''
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.deepEqual(res.body, {error: 'required field(s) missing'})
          done()
        })
    })
    test('View issues on a project', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "_id");
          done();
        })
    })
    test('View issues on a project with one filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({ created_by: "Functional Test - Only required " })
        .end(function (err, res) {
          res.body.forEach(issueResult => {
            assert.equal(issueResult.createdBy, 'Functional Test - Only required')
          })
          done()
        })
    })
    test('View issues on a project with multiple filters', function (done) {
      chai
        .request(server)
        .get('/api/issues/test')
        .query({
          open: true,
          created_by: "Functional Test - Every field filled in"
        })
        .end(function (err, res) {
          res.body.forEach(issueResult => {
            assert.equal(issueResult.open, true)
            assert.equal(issueResult.created_by, 'Functional Test - Every field filled in')
          })
          done()
        })
    })
    test('Update one field on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: id1,
          issue_text: 'new text'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.deepEqual(res.body, {
            result: 'successfully updated',
            _id: id1
          })
          done()
        })
    })
    test('Update multiple fields on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: id1,
          issue_text: 'new text',
          issue_title: 'new title',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.deepEqual(res.body, {
            result: 'successfully updated',
            _id: id1
          })
          done()
        })
    })
    test('Update an issue with missing _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          id: '',
          issue_text: 'new text',
          issue_title: 'new title',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.deepEqual(res.body, {
            error: 'missing _id'
          })
          done()
        })
    })
    test('Update an issue with no fields to update', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: id1,
          issue_title: '',
          issue_text: '',
          created_by: '',
          assigned_to: '',
          status_text: '',
          open: undefined
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.deepEqual(res.body, {
            error: 'no update field(s) sent',
            _id: `${id1}`
          })
          done()
        })
    })
    test('Update an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: '12354312',
          issue_title: 'updated title',
          issue_text: 'updated text',
          created_by: 'new created by',
          assigned_tp: 'new assigned to',
          status_text: 'new status text',
          open: undefined
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.deepEqual(res.body, {
            error: 'could not update',
            _id: res.body._id
          })
          done()
        })
    }) 
    test('Delete an issue', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id: id2
        })
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            result: 'successfully deleted',
            _id: id2
          })
          done()
        })
    })
    test('Delete an issue with an invalid id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id: '12354312'
        })
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            error: 'could not delete',
            _id: '12354312'
          })
          done()
        })
    })
    test('Delete an issue with missing id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.deepEqual(res.body, {
            error: 'missing _id'
          })
          done()
        })
    }) 
});
