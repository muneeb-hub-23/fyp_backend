const express = require("express");
const app = express();
const mysql = require("./connector").con
const port = 8000;
const axios = require("axios")
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
var cors = require('cors');
app.use(cors());

function convertDateToDayForm(dateString) {
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6);

  const dateObj = new Date(`${year}-${month}-${day}`);
  const dayOfWeek = dateObj.toLocaleString('en-us', { weekday: 'long' });

  return dayOfWeek;
}
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
    console.error('hello Invalid input. Please provide a valid month and year.'+monthIndex);
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
let query3 = ("INSERT INTO `attendence`.`fine` (`admission_number`) VALUES ('"+props.admission_number+"');");

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
    mysql.query(query3,(err,results)=>{
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



app.post('/add-blocked-date',(req,res)=>{
const query = "INSERT INTO `attendence`.`offdates` (`date`, `comment`) VALUES ('"+req.body.date+"', '"+req.body.comment+"');"
mysql.query(query,(err,result)=>{
  if(err){
    console.log(err)
    res.send({error:true})
  }else{
    res.send({error:false})
  }
})
})
app.post('/delete-blocked-date',(req,res)=>{
  const query = "DELETE FROM `attendence`.`offdates` WHERE (`idoffdates` = '"+req.body.date+"');"
  mysql.query(query,(err,result)=>{
    if(err){
      console.log(err)
      res.send({error:true})
    }else{
      res.send({error:false})
    }
  })
})
app.post('/get-blocked-dates',async (req,res)=>{
  const data = await queryAsync("select * from attendence.offdates;")
  const resdates = []
  for(var i = 0; i<data.length; i++){
    resdates.push(data[i].date)
  }
  res.send({resdates,data})
})


app.post('/add-session',(req,res)=>{
  const {selectedYear,sdate,edate} = req.body
  const query = "INSERT INTO `attendence`.`sessiondates` (`session`, `startdate`, `enddate`) VALUES ('"+selectedYear+"', '"+sdate+"', '"+edate+"');"
  mysql.query(query,(err,result)=>{
    if(err){
      console.log(err)
      res.send({error:true})
    }else{
      res.send({error:false})
    }
  })
  })
  app.post('/delete-session',(req,res)=>{
    const query = "DELETE FROM `attendence`.`sessiondates` WHERE (`idsessiondates` = '"+req.body.sid+"');"
    mysql.query(query,(err,result)=>{
      if(err){
        console.log(err)
        res.send({error:true})
      }else{
        res.send({error:false})
      }
    })
  })
  app.post('/get-sessions',async (req,res)=>{
    const data = await queryAsync("select * from attendence.sessiondates;")
    res.send(data)
  })



app.post('/get-students-list', (req, res) => {
console.log(req.body)
  let qry = ("SELECT * FROM attendence.students Where (class = '"+req.body.class1+"' and section = '"+req.body.section1+"');");
  mysql.query(qry, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    res.send(JSON.stringify(results));
  });
});  
app.post('/get-users-list', (req, res) => {

  let qry = ("SELECT * FROM attendence.employees;");
  mysql.query(qry, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    res.send(JSON.stringify(results));
  });
}); 
app.post('/delete-user', (req, res) => {
  let user = req.body.username
  let qry = ("DELETE FROM `attendence`.`permissions` WHERE (`employee_number` = '"+user+"');")
  let qry2 = ("DELETE FROM `attendence`.`employees` WHERE (`employee_number` = '"+user+"');")
  mysql.query(qry2, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    mysql.query(qry, (error, results) => {
      if (error) {
        console.log(error);
        return;
      }
      res.send(JSON.stringify(results));
    });
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
          mysql.query("DELETE FROM `attendence`.`fine` WHERE (`admission_number` = '"+value+"');");
          res.json("ok");
          return

});  
console.log(qry);
});
app.post('/get-student-info', (req, res) => {

  let value = req.body.value.admission_number;
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

let qry = "UPDATE `attendence`.`students` SET `roll_no` = '"+value.roll_no+"', `student_full_name` = '"+value.student_full_name+"', `student_mobile_number` = '"+value.student_mobile_number+"', `father_full_name` = '"+value.father_full_name+"', `father_mobile_number` = '"+value.father_mobile_number+"', `joining_date` = '"+value.joining_date+"', `email` = '"+value.email+"', `cnic` = '"+value.cnic+"', `department` = '"+value.department+"', `class` = '"+value.class1+"', `section` = '"+value.section+"', `shift` = '"+value.shift+"' WHERE (`admission_number` = '"+value.admission_number+"');"
 mysql.query(qry, [value],(err,results)=>{
  if (err)
      console.log("eror modifying student");
  else
      res.send("all ok");
});  
});
app.post('/mark-attendance', async (req, res) => {
  res.send(JSON.stringify({value:true}))
  let date = getCurrentDate();
  let admission_number = req.body.admission_number
  let status = req.body.status
  let qry1 = "UPDATE `attendence`.`attendence` SET `d"+date+"` = '"+status+"' WHERE (`admission_number` = '"+admission_number+"');"
  let qry2 = "ALTER TABLE `attendence`.`attendence` ADD COLUMN `d"+date+"` VARCHAR(45) NULL DEFAULT 'p';"
  
  try {
    await queryAsync(qry1, 'Error marking attendance');
    console.log('Attendance marked successfully');
    return;
  } catch (error1) {
    console.error(error1);
    try {
      await queryAsync(qry2, 'Error adding new column');
      await queryAsync(qry1, 'Error marking attendance');
      console.log('Attendance marked successfully after adding a new column');
    } catch (error2) {
      console.error(error2);
    }
  }

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
    console.log(error);
  }
}
for(var b = 0; b<classSections.length; b++){
    try {
const result = await queryAsync("SELECT s.admission_number,"+date1+",COUNT(a."+date1+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[b].class+"' AND s.section = '"+classSections[b].section+"' AND a."+date1+" = 'p';");
present[b].push(result[0].count_of_present)
} catch (error) {
  console.log(error);
}
}
for(var b = 0; b<classSections.length; b++){
  try {
const result = await queryAsync("SELECT s.admission_number,"+date1+",COUNT(a."+date1+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[b].class+"' AND s.section = '"+classSections[b].section+"' AND a."+date1+" = 'a';");
present[b].push(result[0].count_of_present)
} catch (error) {
console.log(error);
}
}
for(var b = 0; b<classSections.length; b++){
  try {
const result = await queryAsync("SELECT s.admission_number,"+date1+",COUNT(a."+date1+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[b].class+"' AND s.section = '"+classSections[b].section+"' AND a."+date1+" = 'l';");
present[b].push(result[0].count_of_present)
} catch (error) {
console.log(error);
}
}
res.send(present)
});
app.post('/today-ict-strength', async (req,res)=>{
console.log(req.body)
    try {
      const result = await queryAsync("SELECT count(admission_number) as strength FROM attendence.students;");
      res.send(result[0])
      } catch (error) {
        console.log(error);
      }
  })
app.post('/today-ict-present', async (req,res)=>{


    try {
      const query = "SELECT count(d"+getCurrentDate()+") as present FROM attendence.attendence where d"+getCurrentDate()+" = 'p';"
      mysql.query(query,(err,response)=>{
        if(err){
          console.log(err)
        }else{
          res.send(response[0])
        }
      })
      
      return
      } catch (error) {
        res.send('data not found')
    return
      }
})
app.post('/today-ict-absent', async (req,res)=>{
  var date = new Date()

  try {
    const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as absent FROM attendence.attendence where d"+getCurrentDate()+" = 'a';");
    res.send(result[0])
    return
    } catch (error) {
      res.send('data not found')
      return

    }
})
app.post('/today-ict-leave', async (req,res)=>{

  try {
  const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as leaves FROM attendence.attendence where d"+getCurrentDate()+" = 'l';");
  res.send(result[0])
  return
  } catch (error) {
    res.send('data not found')
    return

  }
})  
app.post('/today-ict-lates', async (req,res)=>{


  try {
    const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as lates FROM attendence.attendence where d"+getCurrentDate()+" = 'lt';");
    res.send(result[0])
    return
    } catch (error) {
      res.send('data not found')
      return
    }
})  
app.post('/dashboard-charts', async (req,res)=>{

  let month = req.body[0]
  let year = req.body[1]
  const responseArray = [];
  const classSections = [
    { class: '1st-year', section: 'a' },
    { class: '1st-year', section: 'b' },
    { class: '2nd-year', section: 'a' },
    { class: '2nd-year', section: 'b' },
    { class: '3rd-year', section: 'a' },
    { class: '3rd-year', section: 'b' }
  ];


for(var m=0; m<6; m++){
var strength=0;
var present=0;
var absent=0;
var leave=0;
var lates=0;

  try {
      const result = await queryAsync("select admission_number,class,section,count(admission_number) as strength from students where class = '"+classSections[m].class+"' and section='"+classSections[m].section+"';");
      strength=result[0].strength

      const result1 = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[m].class+"' AND s.section = '"+classSections[m].section+"' AND a.d"+getCurrentDate()+" = 'p';");
      present=result1[0].count_of_present

      const result2 = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[m].class+"' AND s.section = '"+classSections[m].section+"' AND a.d"+getCurrentDate()+" = 'a';");
      absent=result2[0].count_of_present

      const result3 = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[m].class+"' AND s.section = '"+classSections[m].section+"' AND a.d"+getCurrentDate()+" = 'l';");
      leave=result3[0].count_of_present

      const result4 = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[m].class+"' AND s.section = '"+classSections[m].section+"' AND a.d"+getCurrentDate()+" = 'lt';");
      lates=result4[0].count_of_present

      } catch (error) {
              console.log(error);
            }
responseArray.push([strength,present,absent,leave,lates])
  }

res.send(responseArray)
})
app.post('/dashboard-chart-expanded', async (req,res)=>{
  
  const responseArray = [];
  const class1 = req.body.classn
  const section = req.body.section
  for(var m=0; m<1; m++){
    var strength=0;
    var present=0;
    var absent=0;
    var leave=0;
    var lates=0;
    
      try {
        const result = await queryAsync("select admission_number,class,section,count(admission_number) as strength from students where class = '"+class1+"' and section='"+section+"';");
        strength=result[0].strength
        } catch (error) {
          console.log(error);
        }
    

        try {
          const result = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+class1+"' AND s.section = '"+section+"' AND a.d"+getCurrentDate()+" = 'p';");
          present=result[0].count_of_present
          } catch (error) {
            console.log(error);
          }
          try {
            const result = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+class1+"' AND s.section = '"+section+"' AND a.d"+getCurrentDate()+" = 'a';");
            absent=result[0].count_of_present
            } catch (error) {
              console.log(error);
            }
            try {
              const result = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+class1+"' AND s.section = '"+section+"' AND a.d"+getCurrentDate()+" = 'l';");
              leave=result[0].count_of_present
              } catch (error) {
                console.log(error);
              }
              try {
                const result = await queryAsync("SELECT s.admission_number,d"+getCurrentDate()+",COUNT(a.d"+getCurrentDate()+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+class1+"' AND s.section = '"+section+"' AND a.d"+getCurrentDate()+" = 'lt';");
                lates=result[0].count_of_present
                } catch (error) {
                  console.log(error);
                }
    responseArray.push(strength,present,absent,leave,lates)
      }
    
    res.send(responseArray)
});
app.post('/student-is-listing', async (req,res)=>{
  const class1 = req.body.class1
  const section = req.body.section1
  console.log(class1,section)
  const query = "SELECT s.admission_number,s.roll_no,s.student_full_name,(d"+getCurrentDate()+") As status1 FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+class1+"' AND s.section = '"+section+"'"
  try {
    const result = await queryAsync(query);
    res.send(result)
    } catch (error) {
      console.log(error);
      return
    }
});
function countConsecutiveAs(arr) {
  let result = [];
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    
    if (arr[i] === 'a' & count<6) {
      count++;
    } else {
      if (count > 0) {
        result.push(count);
      }
      count = 0;
    }
  }

  // If 'a' is at the end of the array
  if (count > 0) {
    result.push(count);
  }

  return result;
}
app.post('/fines', async (req, res) => {
  try {
    const { sdate, ldate, admission_number } = req.body;

    const data = await queryAsync(`SELECT * FROM attendence.attendence WHERE admission_number = ${admission_number}`);

    const datess = [];
    const dayss = [];
    const attendance = [];

    for (let x = sdate; x <= ldate; x++) {
      const dayName = convertDateToDayForm(x.toString());

      if (dayName !== 'Saturday' && dayName !== 'Sunday') {
        datess.push(x);
        dayss.push(dayName);

        const dxdx = 'd' + x.toString();
        attendance.push(data[0][dxdx] || null);
      }
    }

    let regurala = 0;
    let speciala = 0;
    let fine = 0;
    let absentcount = 0;
    const regfine = 50;
    const spefine = 100;
    const specialfine = 150;

    for (let x = 0; x < datess.length; x++) {
      const currentAttendance = attendance[x];
      const currentDay = dayss[x];

      if (currentAttendance === 'a' && (currentDay === 'Monday' || currentDay === 'Friday')) {
        fine += spefine;
        absentcount++;
        speciala++;
      } else if (currentAttendance === 'a' && (currentDay === 'Tuesday' || currentDay === 'Wednesday' || currentDay === 'Thursday')) {
        fine += regfine;
        absentcount++;
        regurala++;
      }
    }

    const consectivedays = countConsecutiveAs(attendance);

    for (let x = 0; x < consectivedays.length; x++) {
      if (consectivedays[x] === 5) {
        fine += specialfine;
      }
    }

    res.json({ regurala, speciala, fine });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/allfines', async (req, res) => {
  try {
    var dbi = [];
    let students = req.body.students;
    let sdate = req.body.sdate;
    let ldate = req.body.ldate;
    const apiUrl = 'http://localhost:80/fines';

    for (var i = 0; i < students.length; i++) {
      let postData = {
        admission_number: students[i].admission_number,
        sdate: sdate,
        ldate: ldate,
      };

      try {
        const response = await axios.post(apiUrl, postData, {
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
          },
        });

        // Handle the successful response
        dbi.push(response.data);
        if (i+1 === students.length){
        res.send(dbi);
        }
      } catch (error) {
        // Handle errors
        console.error('Error:', error.message);
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.post('/detailedfines', async (req,res) => {
function getYesterdayIfToday(dateStr) {
    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Month is zero-based, so add 1
    const day = today.getDate();

    // Convert today's date to string format YYYYMMDD
    const todayStr = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

    // Compare the input date with today's date
    if (dateStr === todayStr) {
        // If input date is today, decrement it by one day to get yesterday's date
        const inputDate = new Date(year, month - 1, day);
        inputDate.setDate(inputDate.getDate() - 1);

        // Format yesterday's date as YYYYMMDD
        const yearYesterday = inputDate.getFullYear();
        const monthYesterday = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        const dayYesterday = inputDate.getDate().toString().padStart(2, '0');
        return `${yearYesterday}${monthYesterday}${dayYesterday}`;
    } else {
        // If input date is not today, return it as is
        return dateStr;
    }
}
var responseArray = []
let {admission_number,sdate,ldate} = req.body
ldate = getYesterdayIfToday(ldate.toString());

  async function generateDateRange(startDate, endDate) {
    let matcher = await queryAsync('select * from attendence.attendence')
    let matcher1 = matcher[0]
    console.log(matcher1)
    let dateArray = '';
    const start = new Date(startDate.substring(0, 4), parseInt(startDate.substring(4, 6)) - 1, startDate.substring(6, 8));
    const end = new Date(endDate.substring(0, 4), parseInt(endDate.substring(4, 6)) - 1, endDate.substring(6, 8));

    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {

      let mydate = ('d'+date.getFullYear() + '' + ('0' + (date.getMonth() + 1)).slice(-2) + '' + ('0' + date.getDate()).slice(-2))+',';
      let test = matcher1[mydate.slice(0, -1)]
      if(typeof test === 'undefined'){
       console.log('undefined')
      }else{
        dateArray= dateArray+mydate
      }
    }

    return dateArray.slice(0, -1) ;
}

function generateDateRangea(startDate, endDate) {
  let dateArray = [];
  const start = new Date(startDate.substring(0, 4), parseInt(startDate.substring(4, 6)) - 1, startDate.substring(6, 8));
  const end = new Date(endDate.substring(0, 4), parseInt(endDate.substring(4, 6)) - 1, endDate.substring(6, 8));

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      dateArray.push('d'+date.getFullYear() + '' + ('0' + (date.getMonth() + 1)).slice(-2) + '' + ('0' + date.getDate()).slice(-2));
  }

  return dateArray;
}
function getDayNames(dateArray) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dateArray.map(dateStr => {
      const date = new Date(dateStr.substring(1, 5), parseInt(dateStr.substring(5, 7)) - 1, dateStr.substring(7, 9));
      return dayNames[date.getDay()];
  });
}
function formatDate(dateStr) {
  const year = dateStr.substring(1, 5);
  const month = dateStr.substring(5, 7);
  const day = dateStr.substring(7, 9);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(month) - 1];

  return `${day}-${monthName}-${year}`;
}
let master = await generateDateRange(sdate.toString(),ldate.toString())
let query = "SELECT "+master+" FROM attendence.attendence where admission_number = "+admission_number+";"
const data = await queryAsync(query)
const datesArray = generateDateRangea(sdate.toString(),ldate.toString())
const dayNames = getDayNames(generateDateRangea(sdate.toString(),ldate.toString()))
var consectiveFine = 0
for(var cnt = 0; cnt<datesArray.length; cnt++){
let abc = data[0]
let dil = datesArray[cnt]
let fine = 0;
if(abc[dil] === 'a' & dayNames[cnt] === 'Monday' | abc[dil] === 'a' & dayNames[cnt] === 'Friday'){
  fine+=100
}else if(abc[dil] === 'a' & dayNames[cnt] === 'Tuesday' | abc[dil] === 'a' & dayNames[cnt] === 'Wednesday' | abc[dil] === 'a' & dayNames[cnt] === 'Thursday'){
  fine+=50
}
if(abc[dil] === 'a' & dayNames[cnt] === 'Monday' | abc[dil] === 'a' & dayNames[cnt] === 'Friday'){

  responseArray.push({date:formatDate(datesArray[cnt]),day:dayNames[cnt],status:'Special Absent',fine:fine})

}else if(abc[dil] === 'a' & dayNames[cnt] === 'Tuesday' | abc[dil] === 'a' & dayNames[cnt] === 'Wednesday' | abc[dil] === 'a' & dayNames[cnt] === 'Thursday'){

responseArray.push({date:formatDate(datesArray[cnt]),day:dayNames[cnt],status:'Regular Absent',fine:fine})

}else if(dayNames[cnt] === 'Saturday' | dayNames[cnt] === 'Sunday'){
console.log('holiday no listing')
}
else if(abc[dil] === 'p'){
  responseArray.push({date:formatDate(datesArray[cnt]),day:dayNames[cnt],status:"Present",fine:fine})
}
else if(abc[dil] === 'l'){
  responseArray.push({date:formatDate(datesArray[cnt]),day:dayNames[cnt],status:"Leave",fine:fine})
}
else if(abc[dil] === 'lt'){
  responseArray.push({date:formatDate(datesArray[cnt]),day:dayNames[cnt],status:"Late",fine:fine})
}
if(abc[dil] === 'a' & consectiveFine < 5){
  consectiveFine++
  if(consectiveFine === 5){
    consectiveFine = 0
    responseArray.push({date:formatDate(datesArray[cnt]),day:dayNames[cnt],status:"Consective 5 Absent",fine:150})
  
  }
}

  



}

res.send(responseArray)

})


app.post('/get-classes', async (req,res) => {
let query = "Select classes from attendence.classes";
const response = await queryAsync(query)
res.send(response)})
app.post('/get-sections',async (req,res) => {
  let query = "Select sections from attendence.sections";
  const response = await queryAsync(query)
res.send(response)})
app.post('/get-departments',async (req,res) => {
  let query = "Select department from attendence.departments";
  const response = await queryAsync(query)
res.send(response)})
app.post('/get-shifts',async (req,res) => {
  let query = "Select shifts from attendence.shifts";
  const response = await queryAsync(query)
res.send(response)})

  app.post('/add-new-class',async (req,res) => {
    console.log(req.body)
    const query = "INSERT INTO `attendence`.`classes` (`classes`) VALUES ('"+req.body.newclass+"');"
    const result = await queryAsync(query)
    res.send(result)
  })

  app.post('/delete-that-class',async (req,res) => {

    const query = "DELETE FROM `attendence`.`classes` WHERE (`classes` = '"+req.body.deleteclass+"');"
    const result = await queryAsync(query)
    res.send(result)

  })

  app.post('/add-new-section',async (req,res) => {
    const query = "INSERT INTO `attendence`.`sections` (`sections`) VALUES ('"+req.body.newsection+"');"
    const result = await queryAsync(query)
    res.send(result)
  })

  app.post('/delete-that-section',async (req,res) => {

    const query = "DELETE FROM `attendence`.`sections` WHERE (`sections` = '"+req.body.deletesection+"');"
    const result = await queryAsync(query)
    res.send(result)

  })

  app.post('/add-new-department',async (req,res) => {
    const query = "INSERT INTO `attendence`.`departments` (`department`) VALUES ('"+req.body.newdepartment+"');"
    const result = await queryAsync(query)
    res.send(result)
  })

  app.post('/delete-that-department',async (req,res) => {

    const query = "DELETE FROM `attendence`.`departments` WHERE (`department` = '"+req.body.deletedepartment+"');"
    const result = await queryAsync(query)
    res.send(result)

  })

  app.post('/add-new-shift',async (req,res) => {
    const query = "INSERT INTO `attendence`.`shifts` (`shifts`) VALUES ('"+req.body.newshift+"');"
    const result = await queryAsync(query)
    res.send(result)
  })

  app.post('/delete-that-shift',async (req,res) => {
    const query = "DELETE FROM `attendence`.`shifts` WHERE (`shifts` = '"+req.body.deleteshift+"');"
    const result = await queryAsync(query)
    res.send(result)
  })

app.post('/add-user', async (req,res)=>{
  let userdata = req.body.userdata
  let permissions = req.body.permissionsarray

  mysql.query('select * from attendence.employees where employee_number = '+userdata.employee_number+';', (error, result) => {
    if (result.length === 0){

      queryAsync("INSERT INTO `attendence`.`employees` (`employee_number`, `employee_full_name`, `employee_mobile_number`, `father_full_name`, `father_mobile_number`, `joining_date`, `email`, `cnic`, `password`) VALUES ('"+userdata.employee_number+"', '"+userdata.employee_full_name+"', '"+userdata.employee_mobile_number+"', '"+userdata.father_full_name+"', '"+userdata.father_mobile_number+"', '"+userdata.joining_date+"', '"+userdata.email+"', '"+userdata.cnic+"', '"+userdata.password+"');")
      
      for(var i = 0; i<permissions.length; i++){
        queryAsync("INSERT INTO `attendence`.`permissions` (`employee_number`, `permission`) VALUES ('"+userdata.employee_number+"', '"+permissions[i]+"');")
      }
      res.send({response:'all ok'})
    }else{
      res.send({error:'dublicate entry'})

    }

  });

})

app.post('/modify-user', async (req,res)=>{
  let employee = req.body.employee
  let permissions = req.body.upstate

console.log(employee,permissions)
let qry1 = "UPDATE `attendence`.`employees` SET `employee_full_name` = '"+employee.employee_full_name+"', `employee_mobile_number` = '"+employee.employee_mobile_number+"', `father_full_name` = '"+employee.father_full_name+"', `father_mobile_number` = '"+employee.father_mobile_number+"', `joining_date` = '"+employee.joining_date+"', `email` = '"+employee.email+"', `cnic` = '"+employee.cnic+"', `password` = '"+employee.password+"' WHERE (`employee_number` = '"+employee.employee_number+"');"
let qry2 = "DELETE FROM attendence.permissions where employee_number = '"+employee.employee_number+"';" 

mysql.query(qry1, (error, result) => {
    if (error){
      res.send({error:true})
    }else{
          mysql.query(qry2, (error, result) => {
            if (error){
              res.send({error:true})
            }else{

              for(var i=0; i<permissions.length; i++){
                    let qry3 = "INSERT INTO `attendence`.`permissions` (`employee_number`, `permission`) VALUES ('"+employee.employee_number+"', '"+permissions[i]+"');"
                    mysql.query(qry3, (error, result) => {
                      if (error){
                        res.send({error:true})
                      }});
              }
              res.send({error:false})
          }});

    }});

})

app.post('/match-user',async (req,res)=>{
  let data =await queryAsync("SELECT employee_number,password FROM attendence.employees where employee_number='"+req.body.userName+"';")
  if(data.length === 0){
  res.send({username:'f33af23235456fgg433ggwg43662436;;K;$#$$3gGgg43$%#$%geGrt$#%5gfd$%v65654',password:'36;;K;$#$$3gGgg43$gwg43662436;;K;$#$$3gGgg43$%%#$%geGrt$#%5gfd$%v65654'})
  }else{
  res.send(data[0])
  }
})

app.post('/get-permissions',async (req,res)=>{
  var data = []
  var responsearray = []
  try{
    data = await queryAsync('SELECT * FROM attendence.permissions where employee_number = '+req.body.usern+';')
    for(var i =1; i<data.length; i++){
      responsearray.push(data[i].permission)
    }
  }catch(err){
    console.log(err)
  }
  res.send(responsearray)
})

app.post('/assign-classes',async (req,res)=>{
  const data = req.body.selectedValue
  const qry = "INSERT INTO `attendence`.`classpermissions` (`employee_number`, `class`, `section`) VALUES ('"+data.employee_number+"', '"+data.classn+"', '"+data.section+"');"
  mysql.query(qry, (error, result) => {
    if (error){
      res.send({error:true})
    }else{
      res.send({error:false})
    }
  });

})
app.post('/get-assigned-classes',async (req,res)=>{
  const qry = "SELECT s.employee_number,employee_full_name,a.class,a.section,a.idclasspermissions FROM employees s JOIN classpermissions a ON s.employee_number = a.employee_number;"
  mysql.query(qry, (error, result) => {
    if (error){
      res.send({error:true})
    }else{
      res.send(result)
    }
  });
})


app.post('/delete-class-permission',async (req,res)=>{
  const qry = "DELETE FROM `attendence`.`classpermissions` WHERE (`idclasspermissions` = '"+req.body.data+"');"
  mysql.query(qry, (error, result) => {
    if (error){
      res.send({error:true})
    }else{
      res.send(result)
    }
  });
})

app.post('/get-special-classes',(req,res)=>{
const qry = "SELECT * FROM attendence.classpermissions where employee_number = '"+req.body.number+"';"
  mysql.query(qry, (error, result) => {
    if (error){
      res.send({error:true})
    }else{
      res.send(result)
    }
  });
})
app.post('/get-special-sections',(req,res)=>{
  const qry = "SELECT * FROM attendence.classpermissions where employee_number = '"+req.body.number+"';"
    mysql.query(qry, (error, result) => {
      if (error){
        res.send({error:true})
      }else{
        res.send(result)
      }
    });
  })



  app.post('/view-attendance-page',(req,res)=>{
    console.log(req.body)
    const qry = ""
      // mysql.query(qry, (error, result) => {
      //   if (error){
      //     res.send({error:true})
      //   }else{
      //     res.send(result)
      //   }
      // });
    })


// app.post('/convertmonthandyeartoprogress', async (req,res)=>{

//   let month = req.body[0]
//   let year = req.body[1]
//   const monthNumber = getMonthNumber(month);
//   const dates = getDatesArray(month, year)
//   const responseArray = [[],[],[],[],[],[]];
//   const firstDate = formatDateString(year+month+dates[0])
//   const lastDate = formatDateString(year+month+dates.slice(-1))
//   const firstdatealter = dates[0]
//   const lastdatealter = dates.slice(-1)
//   const lastDate1 = lastdatealter+1;
//   const classSections = [
//     { class: '1st-year', section: 'a' },
//     { class: '1st-year', section: 'b' },
//     { class: '2nd-year', section: 'a' },
//     { class: '2nd-year', section: 'b' },
//     { class: '3rd-year', section: 'a' },
//     { class: '3rd-year', section: 'b' }
//   ];

// for(var x = firstdatealter; x<=lastdatealter; x++){
// var xa = x

// for(var m=0; m<6; m++){
// var strength=0;
// var present=0;

//   try {
//     const result = await queryAsync("select admission_number,class,section,count(admission_number) as strength from students where class = '"+classSections[m].class+"' and section='"+classSections[m].section+"';");
//     strength=result[0].strength
//     } catch (error) {
//       console.log(error);
//     }
//     try {
//       const result = await queryAsync("SELECT s.admission_number,d"+year+getMonthNumber(month)+dates[x-1]+",COUNT(a.d"+year+getMonthNumber(month)+dates[x-1]+") AS count_of_present FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+classSections[m].class+"' AND s.section = '"+classSections[m].section+"' AND a.d"+year+getMonthNumber(month)+dates[x-1]+" = 'p';");
//       present=result[0].count_of_present
  

//       } catch (error) {
//         console.log(error);
//       }
   


// var final = (present*100)/strength
// responseArray[m].push(final)

//   }
// }





// res.send(responseArray)

// });


app.listen(port,function(){
  console.log("server is up");
})