const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const serverless = require("serverless-http");
const dbConn  = require('../lib/db');
const axios = require("axios");
const router = express.Router();

const sql = `SELECT tnv_credtns.ref,
              sum(tnv_credtns.creds) as total
              FROM
              tnv.tnv_credtns
              WHERE
              tnv_credtns.time BETWEEN TIMESTAMP( CURDATE() ) AND  TIMESTAMP( DATE_ADD(CURDATE(), INTERVAL 1 DAY))
              AND tnv_credtns.ref in (
                'buy_creds_with_2c2p',
                'buy_creds_with_linepay',
                'buy_creds_with_paypal_standard',
                'buy_creds_with_scb',
                'buy_creds_with_tbank',
                'buy_creds_with_thaiepay',
                'buy_creds_with_thaiqrscb',
                'buy_creds_with_truemoney',
                'manual'
              )
              GROUP BY tnv_credtns.ref` ;

const API_KEY_AB = `keyvurKrsuEF7eBrs`;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function(req, res) {
      
  dbConn.query(sql,function(err,rows)     {

      if(err) {
        res.send(err);
    
      } else {
       
        try{
          let body = {
              "records": []
          };

          let records = [];

          rows.forEach(element => {
            const field = {
              "fields": {
                "ref": element.ref,
                "total": String(element.total)
              }
            };
            records.push(field);
            
          });

          body.records = records ;

          axios.post("https://api.airtable.com/v0/appya8Wd8zuZbxvd0/%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B8%81%E0%B8%B2%E0%B8%A3",body,{ headers: {"Authorization" : `Bearer ${API_KEY_AB}`, "Content-Type" : "application/json"} })
                  .then(data => res.json({"status" : "success"}))
                  .catch(err => res.json({"error" : err}));
        }
        catch(err){
            console.error("GG", err);
        }
     
      }
  });
});

app.use('/.netlify/functions/api', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
module.exports.handler = serverless(app);
