'use strict';
var expect = require('chai').expect
let mongodb = require('mongodb');
let mongoose = require('mongoose');

const URI = process.env.MONGO_URI;

module.exports = function (app) {

  mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

  let issueSchema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: { type: String, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    created_by: { type: String, required: true },
    assigned_to: String,
    open: {type: Boolean, required: true},
    status_text: String,
    project: String
  })

  let Issue = mongoose.model('Issue', issueSchema)

  app.route('/api/issues/:project')
  
    .get(function (req, res) {
      let project = req.params.project;
      let query = req.query;
      query['project'] = project
      Issue.find(query, (err, arrayOfIssues) => {
        if (err) {return console.log(err)}
        return res.json(arrayOfIssues)
      })
    })
    
    .post(function (req, res){
      let project = req.params.project;

      const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body

      if (!issue_title) {
        res.json({
          error: 'required field(s) missing'
        })
        return
      }

      if (!issue_text) {
        res.json({
          error: 'required field(s) missing'
        })
        return
      }

      if (!created_by) {
        res.json({
          error: 'required field(s) missing'
        })
        return
      }

      let newIssue = new Issue({
        issue_title,
        issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by,
        assigned_to: !assigned_to ? '' : assigned_to,
        open: true,
        status_text: !status_text ? '' : status_text,
        project
      })

      newIssue.save(function(err, savedIssue) {
        if (err) {return err}
        return res.json({
          assigned_to: savedIssue.assigned_to,
          status_text: savedIssue.status_text,
          open: savedIssue.open,
          _id: savedIssue._id,
          issue_title: savedIssue.issue_title,
          issue_text: savedIssue.issue_text,
          created_by: savedIssue.created_by,
          created_on: savedIssue.created_on,
          updated_on: savedIssue.updated_on
        })
      })
    })
    
    .put(function (req, res){
      let _id = req.body._id;

      if(!_id){
        return res.json({
          error: 'missing _id'
        })
      }

      if(!req.body) {
        return res.json({
          error: 'no update field(s) sent',
          _id: `${_id}`
        })
      }

      let updateObject = {}

      Object.keys(req.body).forEach((key) => {
        if(req.body[key] != ''){
          updateObject[key] = req.body[key]
        }
      })

      if(Object.keys(updateObject).length < 2){
        return res.json({error: 'no update field(s) sent', 
        _id})
      }

      updateObject['updated_on'] = new Date()

      if (updateObject.open == undefined) {
        updateObject.open = true
      }

      Issue.findByIdAndUpdate(
      _id,
      updateObject,
      {new: true},
      (error, updatedIssue) => {
       if(!error && updatedIssue){
          return res.json({result: 'successfully updated', 
          _id})
        }else if(!updatedIssue){
          return res.json({
            error: 'could not update', 
            _id
          })
        }
      }
        )
    
    })
    
    .delete(function (req, res){
      let _id = req.body._id;

      if(_id === undefined) {
        return res.json({
          error: 'missing _id'
        })
      }

      Issue.findByIdAndDelete({_id: req.body._id}, (err, removedIssue) => {
        if (err || removedIssue === null) {
          return res.json({error:'could not delete', _id})
        }

        return res.json({result:'successfully deleted', _id})
      })
    }); 
};
