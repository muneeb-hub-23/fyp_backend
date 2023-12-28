const express = require("express");
const app = express();
const mysql = require("./connector").con
const http = require("http");
const host = 'localhost';
const port = 80;
const bodyparser = require("body-parser");
// app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
var cors = require('cors');
app.use(cors());

app.post('/add-student', (req, res) => {
  const props = req.body.props;

 let qry = "INSERT INTO `attendence`.`students` (`admissionnumber`, `rollno`, `studentname`, `joiningdate`, `email`, `cnic`, `department`, `studentclass`, `section`, `shift`, `studentmobilenumber`, `fathername`, `fathernumber`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);"
 mysql.query(qry, [props.admissionNumber,props.rollno,props.studentname,props.joiningDate,props.email,props.cnic,props.department,props.studentclass,props.section,props.shift,props.studentmobilenumber,props.fathername,props.section],(err,results)=>{
  if (err)
      console.log("eror adding students");
      // console.log(err);
  else
      console.log("record aded successfully");
});  

});

app.post('/userlogined', (req, res) => {

  
  const apiKey = req.body.apiKey;

  if (apiKey === 'a') {
    const currentTime = new Date().toLocaleTimeString();
     res.json({ time: currentTime });
    
  } else {

    res.status(401).json({ error: 'Invalid API key' });
  }
});

app.listen(port,function(){
  console.log("server is up");
});