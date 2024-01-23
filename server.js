const express = require("express");
const app = express();
const mysql = require("./connector").con
const port = 80;
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
var cors = require('cors');
app.use(cors());
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');

  return year + month + day;
}
function convertDateFormat(inputDate) {
  const parts = inputDate.split('-');
  return parts[0] + parts[1] + parts[2];
}
function formatDateString(inputDate) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dateParts = inputDate.match(/^(\d{4})([a-zA-Z]+)(\d{2})$/);
  if (!dateParts) {
    console.error('Invalid date format. Please provide a valid input date.');
    return null;
  }

  const year = dateParts[1];
  const month = months.indexOf(dateParts[2]) + 1;
  const day = dateParts[3];

  if (month < 1 || month > 12) {
    console.error('Invalid month. Please provide a valid month in the date.');
    return null;
  }

  const formattedDate = `${year}${month.toString().padStart(2, '0')}${day}`;
  return formattedDate;
}
function reverseDateFormat(inputDate) {
  const year = inputDate.substring(0, 4);
  const month = inputDate.substring(4, 6);
  const day = inputDate.substring(6, 8);
  return day + month + year;
}
function getMonthNumber(month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthIndex = monthNames.indexOf(month);
  if (monthIndex === -1) {
    console.error('Invalid month name. Please provide a valid month.');
    return null;
  }

  // Adding 1 to make it one-based (January is 01)
  const monthNumber = (monthIndex + 1).toString().padStart(2, '0');

  return monthNumber;
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
function getDatesArray(month, year) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthIndex = monthNames.indexOf(month);
  if (monthIndex === -1 || year < 1) {
    console.error('Invalid input. Please provide a valid month and year.');
    return [];
  }

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const datesArray = Array.from({ length: daysInMonth }, (_, index) => (index + 1).toString().padStart(2, '0'));

  return datesArray;
}
app.post('/add-student', (req, res) => {
const props = req.body;

 let qry = "INSERT INTO `attendence`.`students` (`admission_number`, `roll_no`, `student_full_name`, `student_mobile_number`, `father_full_name`, `father_mobile_number`, `joining_date`, `email`, `cnic`, `department`, `class`, `section`, `shift`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);"
let query = ("INSERT INTO `attendence`.`attendence` (`admission_number`) VALUES ('"+props.admission_number+"');");

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
          mysql.query("DELETE FROM `attendence`.`attendence` WHERE (`admission_number` = '"+value+"');");
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
  

  let date = req.body[0].date
  date = convertDateFormat(date)
  date = 'd'+date
  let status = req.body[2]
  let admission_number = req.body[1].admission_number

let qry = "UPDATE `attendence`.`attendence` SET `"+date+"` = '"+status+"' WHERE (`admission_number` = '"+admission_number+"');"
let qry2 = "ALTER TABLE `attendence`.`attendence` ADD COLUMN `"+date+"` VARCHAR(45);"


 mysql.query(qry,(err,results)=>{
  if (err){
  mysql.query(qry2,(err,results)=>{
    if (err){
        console.log("eror marking attendance" + err);
    }
    else{
    mysql.query(qry,(err,results)=>{
          
        if (err){
            console.log("eror marking attendance" + err);
        }
        else
        {
          res.send("all ok")
        }
    })
  }
  }); 
}
else{
  res.send('all ok')
}
});
});
app.post('/view-attendance', async (req, res) => {

    let present = [[],[],[],[],[],[]];
    let date1 = convertDateFormat(req.body.date1);
    date1 = 'd'+date1
    const classSections = [
      { class: '1st-year', section: 'a' },
      { class: '1st-year', section: 'b' },
      { class: '2nd-year', section: 'a' },
      { class: '2nd-year', section: 'b' },
      { class: '3rd-year', section: 'a' },
      { class: '3rd-year', section: 'b' }
    ];
for(var b = 0; b<classSections.length; b++){
      try {
  const result = await queryAsync("select admission_number,class,section,count(admission_number) as strength from students where class = '"+classSections[b].class+"' and section='"+classSections[b].section+"';");
  present[b].push(result[0].strength)
  } catch (error) {
    console.log(`Error running query for ${classSection.class}-${classSection.section}:`, error);
  }
}
for(var b = 0; b<classSections.length; b++){
    try {
const result = await queryAsync("SELECT s.admission_number,"+date1+",COUNT(a."+date1+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[b].class+"' AND s.section = '"+classSections[b].section+"' AND a."+date1+" = 'p';");
present[b].push(result[0].count_of_present)
} catch (error) {
  console.log(`Error running query for ${classSection.class}-${classSection.section}:`, error);
}
}
for(var b = 0; b<classSections.length; b++){
  try {
const result = await queryAsync("SELECT s.admission_number,"+date1+",COUNT(a."+date1+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[b].class+"' AND s.section = '"+classSections[b].section+"' AND a."+date1+" = 'a';");
present[b].push(result[0].count_of_present)
} catch (error) {
console.log(`Error running query for ${classSection.class}-${classSection.section}:`, error);
}
}
for(var b = 0; b<classSections.length; b++){
  try {
const result = await queryAsync("SELECT s.admission_number,"+date1+",COUNT(a."+date1+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[b].class+"' AND s.section = '"+classSections[b].section+"' AND a."+date1+" = 'l';");
present[b].push(result[0].count_of_present)
} catch (error) {
console.log(`Error running query for ${classSection.class}-${classSection.section}:`, error);
}
}
res.send(present)
});
app.post('/today-ict-strength', async (req,res)=>{

    try {
      const result = await queryAsync("SELECT count(admission_number) as strength FROM attendence.students;");
      res.send(result[0])
      } catch (error) {
        console.log(error);
      }
  })
app.post('/today-ict-present', async (req,res)=>{


    try {
      const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as present FROM attendence.attendence where d"+getCurrentDate()+" = 'p';");
      res.send(result[0])
      } catch (error) {
        console.log(error);
      }
})
app.post('/today-ict-absent', async (req,res)=>{
  var date = new Date()

  try {
    const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as absent FROM attendence.attendence where d"+getCurrentDate()+" = 'a';");
    res.send(result[0])
    } catch (error) {
      console.log(error);
    }
})
app.post('/today-ict-leave', async (req,res)=>{


  try {
    const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as leaves FROM attendence.attendence where d"+getCurrentDate()+" = 'l';");
    res.send(result[0])
    } catch (error) {
      console.log(error);
    }
})  






app.post('/convertmonthandyeartoprogress', async (req,res)=>{

  let month = req.body[0]
  let year = req.body[1]
  const monthNumber = getMonthNumber(month);
  const dates = getDatesArray(month, year)
  const responseArray = [[],[],[],[],[],[]];
  const firstDate = formatDateString(year+month+dates[0])
  const lastDate = formatDateString(year+month+dates.slice(-1))
  const firstdatealter = dates[0]
  const lastdatealter = dates.slice(-1)
  const lastDate1 = lastdatealter+1;
  const classSections = [
    { class: '1st-year', section: 'a' },
    { class: '1st-year', section: 'b' },
    { class: '2nd-year', section: 'a' },
    { class: '2nd-year', section: 'b' },
    { class: '3rd-year', section: 'a' },
    { class: '3rd-year', section: 'b' }
  ];

for(var x = firstdatealter; x<=lastdatealter; x++){
var xa = x

for(var m=0; m<6; m++){
var strength=0;
var present=0;

  try {
    const result = await queryAsync("select admission_number,class,section,count(admission_number) as strength from students where class = '"+classSections[m].class+"' and section='"+classSections[m].section+"';");
    strength=result[0].strength
    } catch (error) {
      console.log(error);
    }
    try {
      const result = await queryAsync("SELECT s.admission_number,d"+year+getMonthNumber(month)+dates[x-1]+",COUNT(a.d"+year+getMonthNumber(month)+dates[x-1]+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[m].class+"' AND s.section = '"+classSections[m].section+"' AND a.d"+year+getMonthNumber(month)+dates[x-1]+" = 'p';");
      present=result[0].count_of_present
  

      } catch (error) {
        console.log(error);
      }
   


var final = (present*100)/strength
responseArray[m].push(final)

  }
}





res.send(responseArray)

});
app.listen(port,function(){
  console.log("server is up");
})