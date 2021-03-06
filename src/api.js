const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const router = express.Router();
const dbConn  = require('../lib/db');

const axios = require("axios");

// const mysql = require('mysql');

// const connection = mysql.createConnection({
// 	host:'103.27.203.110',
// 	user:'nvNotifyService_1623050429',
// 	password:'vJ2r17xXFSimNjnCwfnbpqkK80P07oAvFDSQC1clAFE0y2MvSUNWa',
// 	database:'nvNotifyService_1623050429',
// });

// connection.connect(function(error){
// 	if(!!error) {
// 		console.log(error);
// 	} else {
// 		console.log('Connected..!');
// 	}
// });

// const sqltest = `SELECT * FROM wp_users`;


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


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function(req, res) {
  try{
      
    dbConn.query(sql,function(err,rows)     {

      if(err) {
        res.send(err);
    
      } else {
       
        
          let body = {
              "records": []
          };

          let records = [];

          rows.forEach(element => {
            const field = {
              "fields": {
                "ref": element.ref,
                "total": parseFloat(element.total)
              }
            };
            records.push(field);
          });

          body.records = records ;

          // res.send(body);
          // res.send(rows);

          axios.post("https://api.airtable.com/v0/appya8Wd8zuZbxvd0/%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B8%81%E0%B8%B2%E0%B8%A3",body,{ headers: {"Authorization" : `Bearer ${process.env.API_KEY_AB}`, "Content-Type" : "application/json"} })
                  .then(data => res.json({"status" : "success"}))
                  .catch(err => res.json({"error" : err})); 
     
      }
  });

  }
  catch(err){
      console.error("GG", err);
      res.json({"error" : err});
  }
});

app.use('/', router);

app.set('port', process.env.PORT || 8080);

app.listen(app.get('port'));