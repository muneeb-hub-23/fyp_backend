const express = require("express");
const app = express();
const mysql = require("./connector").con
const port = 80;
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
var cors = require('cors');
app.use(cors());
function convertDateFormat(inputDate) {
  const parts = inputDate.split('-');
  return parts[0] + parts[1] + parts[2];
}
function reverseDateFormat(inputDate) {
  const year = inputDate.substring(0, 4);
  const month = inputDate.substring(4, 6);
  const day = inputDate.substring(6, 8);
  return day + month + year;
}
function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    mysql.query(sql, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}
function countOccurrences(array, value) {
  return Object.values(array).reduce((count, element) => count + (element === value ? 1 : 0), 0);
}
app.post('/add-student', (req, res) => {
  const props = req.body;

 let qry = "INSERT INTO `attendence`.`students` (`admission_number`, `roll_no`, `student_full_name`, `student_mobile_number`, `father_full_name`, `father_mobile_number`, `joining_date`, `email`, `cnic`, `department`, `class`, `section`, `shift`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);"
let query = ("ALTER TABLE `attendence`.`attendence` ADD COLUMN `r"+props.admission_number+"` VARCHAR(45) NULL;");

 mysql.query(qry, [props.admission_number,props.roll_no,props.student_full_name,props.student_mobile_number,props.father_full_name,props.father_mobile_number,props.joining_date,props.email,props.cnic,props.department,props.class,props.section,props.shift],(err,results)=>{
  if (err){
      res.send(err)
  }
  else{
    mysql.query(query,(err,results)=>{
      if(err){
        res.send(err)
      }
      else{
        console.log("record aded successfully")
      }
      
    })
    
  }
});  


});
app.post('/get-students-list', (req, res) => {


  let qry = ("SELECT * FROM attendence.students Where (class = '"+req.body.classn+"' and section = '"+req.body.section+"');");
  mysql.query(qry, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    res.send(results);
  });
});  
app.post('/delete-student', (req, res) => {

  const props = req.body.props;
  let value = req.body.value;
  let qry = "DELETE FROM `attendence`.`students` WHERE (`admission_number` = '"+value+"');";

 mysql.query(qry, [value],(err,results)=>{
  if (results)
          console.log("record deleted successfully");
          mysql.query("ALTER TABLE `attendence`.`attendence` DROP COLUMN `"+value+"`;");
          res.json("ok");
          return

});  
console.log(qry);
});
app.post('/get-student-info', (req, res) => {

  let value = req.body.value.admission_number;
  console.log(value)
  let qry = "SELECT * FROM attendence.students where (admission_number = '"+value+"');";

 mysql.query(qry, [value],(err,results)=>{
  if (err)
      console.log("eror fetching data");
  else
      res.send(results);
});  
});
app.post('/update-student', (req, res) => {

  let value = req.body;
let qry = "UPDATE `attendence`.`students` SET `roll_no` = '"+value.roll_no+"', `student_full_name` = '"+value.student_full_name+"', `student_mobile_number` = '"+value.student_mobile_number+"', `father_full_name` = '"+value.father_full_name+"', `father_mobile_number` = '"+value.father_mobile_number+"', `joining_date` = '"+value.joining_date+"', `email` = '"+value.email+"', `cnic` = '"+value.cnic+"', `department` = '"+value.department+"', `class` = '"+value.class+"', `section` = '"+value.section+"', `shift` = '"+value.shift+"' WHERE (`admission_number` = '"+value.admission_number+"');"
 mysql.query(qry, [value],(err,results)=>{
  if (err)
      console.log("eror modifying student");
  else
      res.send("all ok");
});  
});
app.post('/mark-attendance', (req, res) => {
  
  // Reverse the date from "yyyymmdd" to "ddmmyyyy"


  let date = req.body[0].date
  let status = req.body[2]
  let admission_number = req.body[1].admission_number

  let qry = "INSERT INTO `attendence`.`attendence` (`date`, `r"+admission_number+"`) VALUES (?,?);"
let qry2 = "UPDATE `attendence`.`attendence` SET `r"+admission_number+"` = '"+status+"' WHERE (`date` = '"+convertDateFormat(date)+"');" 

 mysql.query(qry, [convertDateFormat(date),status],(err,results)=>{
  if (err)
  mysql.query(qry2,(err,results)=>{
    if (err)
        console.log("eror marking attendance" + err);
    else
        res.send("all ok");
      
  }); 
  else
      res.send("all ok");
});  
});
app.post('/view-attendance', async (req, res) => {
  try {
    const responseArray = [];
    const date1 = req.body.date1;
    const classSections = [
      { class: '1st-year', section: 'a' },
      { class: '1st-year', section: 'b' },
      { class: '2nd-year', section: 'a' },
      { class: '2nd-year', section: 'b' },
      { class: '3rd-year', section: 'a' },
      { class: '3rd-year', section: 'b' }
    ];

    for (const { class: currentClass, section } of classSections) {
      try {
        const studentsResponse = await queryAsync(`SELECT admission_number, class, section FROM attendence.students WHERE class='${currentClass}' AND section='${section}'`);
        
        let totalStrength = 0;
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLeave = 0;
      
        if (studentsResponse.length > 0) {
          const admissionNumbers = studentsResponse.map(student => 'r' + student.admission_number).join(',');
      
          const attendanceResponse = await queryAsync(`SELECT ${admissionNumbers} FROM attendence.attendence WHERE date BETWEEN ${convertDateFormat(date1)} AND ${convertDateFormat(date1)}`);
      
          // Calculate total strength, total present, total absent, and total leave
          totalStrength = studentsResponse.length;
          totalPresent = countOccurrences(attendanceResponse[0], 'p');
          totalAbsent = countOccurrences(attendanceResponse[0], 'a');
          totalLeave = countOccurrences(attendanceResponse[0], 'l');
        }
      
        responseArray.push({
          class: currentClass,
          section,
          total_strength: totalStrength,
          total_present: totalPresent,
          total_absent: totalAbsent,
          total_leave: totalLeave
        });
      } catch (error) {
        console.error("Error:", error);
      
        // Set totals to zero in case of error
        responseArray.push({
          class: currentClass,
          section,
          total_strength: 0,
          total_present: 0,
          total_absent: 0,
          total_leave: 0
        });
      }
    }

    res.send(responseArray);
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






app.listen(port,function(){
  console.log("server is up");
});