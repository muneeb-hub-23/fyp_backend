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
function formatDatex(dateString) {
  const year = dateString.substring(1, 5);
  const month = dateString.substring(5, 7);
  const day = dateString.substring(7, 9);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(month, 10) - 1];

  return `${day}-${monthName}-${year}`;
}
function groupDatesIntoWeeks(dates) {
// Convert dates to JavaScript Date objects
const dateObjects = dates.map(dateString => new Date(dateString));

const weeks = [];
let currentWeek = [];
let weekStartIndex = 0;

for (let i = 0; i < dateObjects.length; i++) {
    const currentDate = dateObjects[i];
    const currentDay = currentDate.getDay();

    // Skip weekends
    if (currentDay === 0 || currentDay === 6) {
        continue;
    }

    // If it's a new week, add the previous week to the weeks array
    if (currentDay === 1 || i === 0) {
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }
        currentWeek = [];
        weekStartIndex = i;
    }

    // Add the index of the date to the current week
    currentWeek.push(i);
}

// Add the last week if it's not empty
if (currentWeek.length > 0) {
    weeks.push(currentWeek);
}

return weeks;
}
function groupDatesIntoMonths(dates) {
// Convert dates to JavaScript Date objects
const dateObjects = dates.map(dateString => new Date(dateString));

const months = [];
let currentMonth = [];
let monthStartIndex = 0;

for (let i = 0; i < dateObjects.length; i++) {
    const currentDate = dateObjects[i];
    const currentMonthValue = currentDate.getMonth();

    // If it's a new month, add the previous month to the months array
    if (currentMonthValue !== dateObjects[monthStartIndex].getMonth() || i === 0) {
        if (currentMonth.length > 0) {
            months.push(currentMonth);
        }
        currentMonth = [];
        monthStartIndex = i;
    }

    // Add the index of the date to the current month
    currentMonth.push(i);
}

// Add the last month if it's not empty
if (currentMonth.length > 0) {
    months.push(currentMonth);
}

return months;
}
function groupDatesIntoYears(dates) {
// Convert dates to JavaScript Date objects
const dateObjects = dates.map(dateString => new Date(dateString));

const years = [];
let currentYear = [];
let yearStartIndex = 0;

for (let i = 0; i < dateObjects.length; i++) {
    const currentDate = dateObjects[i];
    const currentYearValue = currentDate.getFullYear();

    // If it's a new year, add the previous year to the years array
    if (currentYearValue !== dateObjects[yearStartIndex].getFullYear() || i === 0) {
        if (currentYear.length > 0) {
            years.push(currentYear);
        }
        currentYear = [];
        yearStartIndex = i;
    }

    // Add the index of the date to the current year
    currentYear.push(i);
}

// Add the last year if it's not empty
if (currentYear.length > 0) {
    years.push(currentYear);
}

return years;
}
function convertDate(dateString) {
  return dateString.replace(/-/g, '');
}
function convertDatex(dateString) {
  // Extract the year, month, and day from the input date string
  const year = dateString.slice(1, 5);
  const month = dateString.slice(5, 7);
  const day = dateString.slice(7);

  // Concatenate the parts with dashes to get the desired format
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}
function getDayOfWeek(dateString) {
  // Extract the numeric part of the date string (e.g., "20240321" from "d20240321")
  const numericDate = dateString.substring(1); // Remove the leading 'd'

  // Parse the numeric date string into a Date object
  const dateObj = new Date(numericDate.slice(0, 4), numericDate.slice(4, 6) - 1, numericDate.slice(6));

  // Array of weekday names
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get the day of the week (0 for Sunday, 1 for Monday, etc.)
  const dayIndex = dateObj.getDay();

  // Return the corresponding day name from the array
  return daysOfWeek[dayIndex];
}
function getDatesInRange(startDateStr, endDateStr) {
  const dates = [];
  const startDate = new Date(startDateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
  const endDate = new Date(endDateStr.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}${month}${day}`);
  }

  return dates;
}
function countVariables(obj) {
  return Object.keys(obj).length;
}
async function countConsecutiveAs(arr,dayss) {
  let result = [];
  let count = 0;

  for (let i = 0; i < arr.length; i++) {
    
    if (arr[i] === 'a' & count<5) {
      count++;
    }else if(arr[i] === 'p' | arr[i] === 'l' | arr[i] === 'lt'){
      count = 0
    }

    if (count === 5 & dayss[i] === 'Friday'){
      result.push(count)
      count = 0
    }

    }
    return result
}
function getDayName(inputDate) {
  // Extract year, month, and day from the inputDate string
  const year = inputDate.slice(1, 5);
  const month = inputDate.slice(5, 7) - 1; // Month is zero-based in JavaScript Date object
  const day = inputDate.slice(7, 9);

  // Create a new Date object with the extracted year, month, and day
  const dateObj = new Date(year, month, day);

  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayIndex = dateObj.getDay();

  // Define an array of day names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Return the day name corresponding to the dayIndex
  return dayNames[dayIndex];
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
async function generateDateRange(startDate, endDate) {
  let matcher = await queryAsync('select * from attendence.attendence')
  let matcher1 = matcher[0]
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
function convertDateFormatzx(dateString) {
  // Split the input date string by '-'
  const parts = dateString.split('-');
  
  // Reconstruct the date in 'yyyymmdd' format
  const formattedDate = `${parts[0]}${parts[1].padStart(2, '0')}${parts[2].padStart(2, '0')}`;
  
  return formattedDate;
}
const givemonth = (e) => {
  switch(e){
    case ('01'):
    return('January')

    case ('02'):
    return('February')

    case ('03'):
    return('March')

    case ('04'):
    return('April')

    case ('05'):
    return('May')

    case ('06'):
    return('June')

    case ('07'):
    return('July')

    case ('08'):
    return('August')

    case ('09'):
    return('September')

    case ('10'):
    return('October')

    case ('11'):
    return('November')

    case ('12'):
    return('December')

    default:
    break;
  }
}
function countOccurrenceszx(obj, valueToCount) {
  let count = 0;

  // Iterate over the object keys and check if the value matches the one to count
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] === valueToCount) {
      count++;
    }
  }

  return count;
}


app.post('/add-student', async (req, res) => {
const props = req.body;

const query0 = await queryAsync("select * from attendence.students where admission_number ='"+props.admission_number+"';")
const query1 = await queryAsync("select * from attendence.students where admission_number ='"+props.roll_no+"';")
const query2 = await queryAsync("select * from attendence.students where admission_number ='"+props.cnic+"';")
let qry = "INSERT INTO `attendence`.`students` (`admission_number`, `roll_no`, `student_full_name`, `student_mobile_number`, `father_full_name`, `father_mobile_number`, `joining_date`, `email`, `cnic`, `department`, `class`, `section`, `shift`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);"
let query = ("INSERT INTO `attendence`.`attendence` (`admission_number`) VALUES ('"+props.admission_number+"');");
let query3 = ("INSERT INTO `attendence`.`fine` (`admission_number`) VALUES ('"+props.admission_number+"');");

if(query0.length === 0 & query1.length === 0 & query2.length === 0){
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

    mysql.query(query3,(err,results)=>{
      if(err){
        res.send(err)
      }
      else{
        res.send({error:false})
      }
      
    })


  }
  
})
    
  }
});  


}else{

  if(query0.length >= 1){
  res.send({error:true,msg:'Duplicate Admission Number'})
  } else if(query1.length >= 1){
  res.send({error:true,msg:'Duplicate Roll Number'})
  } else if(query2.length >= 1){
  res.send({error:true,msg:'Duplicate CNIC'})
  }
}

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
app.post('/get-total-days',async (req,res)=>{

  const sdate = convertDate(req.body.sdate)
  const ldate = convertDate(req.body.ldate)
  const stuadn = req.body.stuadn
  const darray = getDatesInRange(sdate,ldate)
  const data = await queryAsync("select * from attendence.attendence;")
  const data1 = data[0]

  var rightarray1 = []
  var rightarray = 'admission_number,'
  for(var i=0; i<darray.length; i++){
    tester = darray[i]
    if(data1['d'+tester] === undefined){
      
    }
    else{
      rightarray+=('d'+tester+',')
      rightarray1.push('d'+tester)
    }
  }
  rightarray = rightarray.slice(0,-1)
  const updateddata =await queryAsync("select "+rightarray+" from attendence.attendence where admission_number = '"+stuadn+"';")
  var attendancearray = []
  for(var i=0; i<rightarray1.length; i++){
    let hel = updateddata[0]
    let pel = rightarray1[i]
    attendancearray.push(hel[pel])
  }
  const totalp = countOccurrences(attendancearray, 'p');
  const totala = countOccurrences(attendancearray, 'a');
  const totall = countOccurrences(attendancearray, 'l');
  const totallt = countOccurrences(attendancearray, 'lt');
  var firstwarning='Expecting';
  var secondwarning='Expecting';
  var thirdwarning='Expecting';
  var x = 0;
  async function formatDateabc(inputDate) {
    // Extract year, month, and day from the input string
    const year = inputDate.slice(0, 4);
    const month = inputDate.slice(4, 6);
    const day = inputDate.slice(6, 8);
  
    // Create an array of month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
  
    // Get the month name based on the month value (subtract 1 since months are zero-indexed)
    const formattedMonth = monthNames[parseInt(month, 10) - 1];
  
    // Construct the final formatted date
    const formattedDate = `${day}-${formattedMonth}-${year}`;
    return formattedDate.toString();
  }
  for(var i=0; i<rightarray1.length; i++){

    if(attendancearray[i]==='a'){
      x++
      if(x===10){
        firstwarning = rightarray1[i].slice(1)
        const dsfj = await formatDateabc(firstwarning)
        firstwarning = dsfj
      }else if(x===20){
        secondwarning = rightarray1[i].slice(1)
        const dsfj = await formatDateabc(secondwarning)
        secondwarning = dsfj
      }else if(x===30){
        thirdwarning = rightarray1[i].slice(1)
        const dsfj = await formatDateabc(thirdwarning)
        thirdwarning = dsfj
      }

    }


  }
  const counter = rightarray1.length
  
  res.send({totaldays:counter,totalp,totala,totall,totallt,firstwarning,secondwarning,thirdwarning})
})
app.post('/get-students-list', (req, res) => {
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
  let date = req.body.date;
  let admission_number = req.body.admission_number
  let status = req.body.status
  let qry1 = "UPDATE `attendence`.`attendence` SET `d"+date+"` = '"+status+"' WHERE (`admission_number` = '"+admission_number+"');"
  let qry2 = "ALTER TABLE `attendence`.`attendence` ADD COLUMN `d"+date+"` VARCHAR(45) NULL DEFAULT 'p';"
  
  try {
    await queryAsync(qry1, 'Error marking attendance');
    res.send('Attendance marked successfully');
    return;
  } catch (error1) {
    console.error(error1);
    try {
      await queryAsync(qry2, 'Error adding new column');
      await queryAsync(qry1, 'Error marking attendance');
      res.send('Attendance marked successfully after adding a new column');
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
    try {
      const result = await queryAsync("SELECT count(admission_number) as strength FROM attendence.students where shift = '"+req.body.shift+"';");
      res.send(result[0])
      } catch (error) {
        console.log(error);
      }
})
app.post('/today-ict-present', async (req,res)=>{


    try {
      const query = "SELECT count(d"+getCurrentDate()+") as present,shift FROM attendence.attendence left join attendence.students on attendence.attendence.admission_number=attendence.students.admission_number where d"+getCurrentDate()+" = 'p' and shift = '"+req.body.shift+"';"
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
    const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as absent,shift FROM attendence.attendence left join attendence.students on attendence.attendence.admission_number=attendence.students.admission_number where d"+getCurrentDate()+" = 'a' and shift = '"+req.body.shift+"';")
    res.send(result[0])
    return
    } catch (error) {
      res.send('data not found')
      return

    }
})
app.post('/today-ict-leave', async (req,res)=>{

  try {
  const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as leaves,shift FROM attendence.attendence left join attendence.students on attendence.attendence.admission_number=attendence.students.admission_number where d"+getCurrentDate()+" = 'l' and shift = '"+req.body.shift+"';");
  res.send(result[0])
  return
  } catch (error) {
    res.send('data not found')
    return

  }
})  
app.post('/today-ict-lates', async (req,res)=>{


  try {
    const result = await queryAsync("SELECT count(d"+getCurrentDate()+") as lates,shift FROM attendence.attendence left join attendence.students on attendence.attendence.admission_number=attendence.students.admission_number where d"+getCurrentDate()+" = 'lt' and shift = '"+req.body.shift+"';");
    res.send(result[0])
    return
    } catch (error) {
      res.send('data not found')
      return
    }
})  
app.post('/dashboard-charts', async (req,res)=>{


  const responseArray = [];
  const classSections = req.body.classsections


for(var m=0; m<classSections.length; m++){
var strength=0;
var present=0;
var absent=0;
var leave=0;
var lates=0;

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
  const query = "SELECT s.admission_number,s.roll_no,s.student_full_name,(d"+getCurrentDate()+") As status1 FROM students s JOIN attendence a ON s.admission_number = a.admission_number where s.class = '"+class1+"' AND s.section = '"+section+"'"
  try {
    const result = await queryAsync(query);
    res.send(result)
    } catch (error) {
      console.log(error);
      return
    }
});
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

    const consectivedays =await countConsecutiveAs(attendance,dayss);

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
    const apiUrl = 'http://localhost:8000/fines';

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
app.post('/classfines', async (req, res) => {
console.log(req.body)
  // try {
  //   var dbi = [];
  //   let students = req.body.students;
  //   let sdate = req.body.sdate;
  //   let ldate = req.body.ldate;
  //   const apiUrl = 'http://localhost:8000/allfines';

  //   for (var i = 0; i < students.length; i++) {
  //     let postData = {
  //       admission_number: students[i].admission_number,
  //       sdate: sdate,
  //       ldate: ldate,
  //     };

  //     try {
  //       const response = await axios.post(apiUrl, postData, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           // Add any additional headers if needed
  //         },
  //       });

  //       // Handle the successful response
  //       dbi.push(response.data);
  //       if (i+1 === students.length){
  //       res.send(dbi);
  //       }
  //     } catch (error) {
  //       // Handle errors
  //       console.error('Error:', error.message);
  //     }
  //   }
  // } catch (err) {
  //   console.log(err);
  // }
});
app.post('/detailedfines', async (req,res) => {

var responseArray = []
let {admission_number,sdate,ldate} = req.body
ldate = getYesterdayIfToday(ldate.toString());
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
// console.log('holiday no listing')
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

const dday = getDayName(datesArray[cnt])

if(abc[dil] === 'a' & consectiveFine < 5){
  consectiveFine++
}else if(abc[dil] === 'p' | abc[dil] === 'l' | abc[dil] === 'lt'){
  consectiveFine = 0
}

if(consectiveFine === 5 & dday === 'Friday'){
  consectiveFine = 0
  responseArray.push({date:formatDate(datesArray[cnt]),day:dayNames[cnt],status:"Consective 5 Absent",fine:150})

}

}

res.send(responseArray)

})
app.post('/get-classes', async (req,res) => {
let query = "Select classes from attendence.classes";
const response = await queryAsync(query)
res.send(response)
})
app.post('/get-sections',async (req,res) => {
  let query = "Select sections from attendence.sections";
  const response = await queryAsync(query)
res.send(response)
})
app.post('/get-departments',async (req,res) => {
  let query = "Select department from attendence.departments";
  const response = await queryAsync(query)
res.send(response)
})
app.post('/get-shifts',async (req,res) => {
  let query = "Select shifts from attendence.shifts";
  const response = await queryAsync(query)
res.send(response)
})
app.post('/add-new-class',async (req,res) => {

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

      queryAsync("INSERT INTO `attendence`.`employees` (`employee_number`, `employee_full_name`, `employee_mobile_number`, `father_full_name`, `father_mobile_number`, `joining_date`, `email`, `cnic`, `password`,`emp_token`) VALUES ('"+userdata.employee_number+"', '"+userdata.employee_full_name+"', '"+userdata.employee_mobile_number+"', '"+userdata.father_full_name+"', '"+userdata.father_mobile_number+"', '"+userdata.joining_date+"', '"+userdata.email+"', '"+userdata.cnic+"', '"+userdata.password+"','"+userdata.emp_token+"');")
      
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
  let data =await queryAsync("SELECT employee_number,emp_token,employee_full_name FROM attendence.employees where emp_token='"+req.body.userName+"';")
  if(data.length === 0){
  res.send({username:'f33af23235456fgg433ggwg43662436;;K;$#$$3gGgg43$%#$%geGrt$#%5gfd$%v65654',emp_token:'36;;K;$#$$3gGgg43$gwg43662436;;K;$#$$3gGgg43$%%#$%geGrt$#%5gfd$%v65654'})
  }else{
  res.send(data[0])
  }
})
app.post('/get-permissions',async (req,res)=>{
  var data = []
  var responsearray = []
  try{
    const replace = await queryAsync("SELECT * FROM attendence.employees where emp_token = '"+req.body.usern+"';")
    data = await queryAsync('SELECT * FROM attendence.permissions where employee_number = '+replace[0].employee_number+';')
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
app.post('/get-special-classes', async (req,res)=>{
const matcher = await queryAsync("Select * from attendence.employees where emp_token = '"+req.body.number+"';")

const qry = "SELECT * FROM attendence.classpermissions where employee_number = '"+matcher[0].employee_number+"';"
  mysql.query(qry, (error, result) => {
    if (error){
      res.send({error:true})
    }else{

      res.send(result)
    }
  });
})
app.post('/get-special-sections', async (req,res)=>{
  const matcher = await queryAsync("Select * from attendence.employees where emp_token = '"+req.body.number+"';")
  const qry = "SELECT * FROM attendence.classpermissions where employee_number = '"+matcher[0].employee_number+"';"
    mysql.query(qry, (error, result) => {
      if (error){
        res.send({error:true})
      }else{
        res.send(result)
      }
    });
})
app.post('/department-report', async (req,res)=>{

const {crietaria,duration,dates,shift} = req.body
const qry = "SELECT * FROM attendence.attendence left join attendence.students on attendence.attendence.admission_number = attendence.students.admission_number where shift = '"+shift+"';"
const match = await queryAsync(qry)
var newqry = "attendence.admission_number,"
var newqryarray = []
var perdateans = []
var labels = []
var presentd = []
var absentd = []
var leaved = []
var lated = []

for(var i=0; i<dates.length; i++){
  const mc = match[0]
  const tc = dates[i]
  if(mc[tc] === undefined){

  }else{
  newqry = newqry +tc+ ","
  newqryarray.push(tc)
  labels.push(formatDatex(tc))
  }
}
newqry = newqry.slice(0,-1)
newqry = "Select "+newqry+",shift FROM attendence.attendence left join attendence.students on attendence.attendence.admission_number = attendence.students.admission_number where shift = '"+shift+"';"
const result =await queryAsync(newqry)
var countpresentindate = 0
var countabsentindate = 0
var countleaveindate = 0
var countlateindate = 0
var countpresentindate1 = 0
var countabsentindate1 = 0
var countleaveindate1 = 0
var countlateindate1 = 0
for(var t=0; t<newqryarray.length; t++){

  for(var i=0; i<result.length; i++){
    const ree = result[i]
    const eee = newqryarray[t]

    if(ree[eee]==='p'){
        countpresentindate++
        countpresentindate1++
    }else if(ree[eee]==='a'){
        countabsentindate++
        countabsentindate1++
    }else if(ree[eee]==='l'){
        countleaveindate++
        countleaveindate1++
    }else if(ree[eee]==='lt'){
        countlateindate++
        countlateindate1++
    }
  }
  perdateans.push({countpresentindate,countabsentindate,countleaveindate,countlateindate})
    countpresentindate = 0
    countabsentindate = 0
    countleaveindate = 0
    countlateindate = 0
}
const total = countpresentindate1+countabsentindate1+countleaveindate1+countlateindate1

for(var i=0; i<perdateans.length; i++){

  const total = perdateans[i].countpresentindate+perdateans[i].countabsentindate+perdateans[i].countleaveindate+perdateans[i].countlateindate
  presentd.push(perdateans[i].countpresentindate)
  absentd.push(perdateans[i].countabsentindate)
  leaved.push(perdateans[i].countleaveindate)
  lated.push(perdateans[i].countlateindate)




}

if(crietaria==='daily'){


  res.send({
    perdateans,
    tstr:result.length,
    tp:Math.round((countpresentindate1*100)/total),
    ta:Math.round((countabsentindate1*100)/total),
    tl:Math.round((countleaveindate1*100)/total),
    tlt:Math.round((countlateindate1*100)/total),
    labels,
    presentd,
    absentd,
    leaved,
    lated
  })
}else if(crietaria==='weekly'){
  const upnp = await groupDatesIntoWeeks(labels)
  var ulabels = []
  var upresentd = []
  var uabsentd = []
  var uleaved = []
  var ulated = []
 
  for(var i=0; i<upnp.length; i++){
    ulabels.push("Week "+(i+1).toString())
    var alpha = upnp[i]
    var p=0
    var a=0
    var l=0
    var lt=0
  
    for(var k=0; k<alpha.length; k++){
      var test = alpha[k]
      p = p+presentd[test]
      a = a+absentd[test]
      l = l+leaved[test]
      lt = lt+lated[test]   
    }

    var delta = result.length*alpha.length
    upresentd.push(Math.round((p*100)/delta))
    uabsentd.push(Math.round((a*100)/delta))
    uleaved.push(Math.round((l*100)/delta))
    ulated.push(Math.round((lt*100)/delta))
  }

  res.send({
   
    tstr:result.length,
    tp:Math.round((countpresentindate1*100)/total),
    ta:Math.round((countabsentindate1*100)/total),
    tl:Math.round((countleaveindate1*100)/total),
    tlt:Math.round((countlateindate1*100)/total),
    labels:ulabels,
    presentd:upresentd,
    absentd:uabsentd,
    leaved:uleaved,
    lated:ulated
  })

}else if(crietaria==='monthly'){

  const upnp = await groupDatesIntoMonths(labels)
  const zara = []
  for(var i=0; i<dates.length; i++){
   var n = convertDatex(dates[i])
   var x =n.slice(5,7)
   const eel = givemonth(x)
   var tnt = (zara[zara.length-1])
   if(tnt === undefined){
     zara.push(eel)
   }else if(zara[zara.length-1] != eel){
     zara.push(eel)
   }
  }
  var ulabels = []
  var upresentd = []
  var uabsentd = []
  var uleaved = []
  var ulated = []

  for(var i=0; i<upnp.length; i++){
    ulabels.push(zara[i])
    var alpha = upnp[i]
    var p=0
    var a=0
    var l=0
    var lt=0
  
    for(var nn=0; nn<alpha.length; nn++){
      var test = alpha[nn]
      p = p+presentd[test]
      a = a+absentd[test]
      l = l+leaved[test]
      lt = lt+lated[test]
    }
    var delta = result.length*alpha.length
    upresentd.push(Math.round((p*100)/delta))
    uabsentd.push(Math.round((a*100)/delta))
    uleaved.push(Math.round((l*100)/delta))
    ulated.push(Math.round((lt*100)/delta))
  }

  res.send({
   
    tstr:result.length,
    tp:Math.round((countpresentindate1*100)/total),
    ta:Math.round((countabsentindate1*100)/total),
    tl:Math.round((countleaveindate1*100)/total),
    tlt:Math.round((countlateindate1*100)/total),
    labels:ulabels,
    presentd:upresentd,
    absentd:uabsentd,
    leaved:uleaved,
    lated:ulated
  })

}else if(crietaria==='yearly'){

  const upnp = await groupDatesIntoYears(labels)
  var ulabels = []
  var upresentd = []
  var uabsentd = []
  var uleaved = []
  var ulated = []
  for(var i=0; i<upnp.length; i++){

    var alpha = upnp[i]
    var ps2 = alpha[i]
    if (ulabels[ulabels.length-1]!==dates[ps2].slice(1,5)){
      ulabels.push(dates[ps2].slice(1,5))
    }
    
    var p=0
    var a=0
    var l=0
    var lt=0
    for(var nn=0; nn<alpha.length; nn++){
      var test = alpha[nn]
      p = p+presentd[test]
      a = a+absentd[test]
      l = l+leaved[test]
      lt = lt+lated[test]
    }
    var delta = result.length*alpha.length
    upresentd.push(Math.round((p*100)/delta))
    uabsentd.push(Math.round((a*100)/delta))
    uleaved.push(Math.round((l*100)/delta))
    ulated.push(Math.round((lt*100)/delta))
  }
  res.send({
   
    tstr:result.length,
    tp:Math.round((countpresentindate1*100)/total),
    ta:Math.round((countabsentindate1*100)/total),
    tl:Math.round((countleaveindate1*100)/total),
    tlt:Math.round((countlateindate1*100)/total),
    labels:ulabels,
    presentd:upresentd,
    absentd:uabsentd,
    leaved:uleaved,
    lated:ulated
  })
}



})
app.post('/class-report', async (req,res)=>{
  const {crietaria,duration,dates,classn,section} = req.body

  const qry = "SELECT * FROM students JOIN attendence ON students.admission_number = attendence.admission_number where class = '"+classn+"' and section = '"+section+"';"
  const match = await queryAsync(qry)
  var newqry = "attendence.admission_number,"
  var newqryarray = []
  var perdateans = []
  var labels = []
  var presentd = []
  var absentd = []
  var leaved = []
  var lated = []
  
  for(var i=0; i<dates.length; i++){

    const mc = match[0]
    const tc = dates[i]
    if(mc[tc] === undefined){
  
    }else{

    newqry = newqry +'attendence.'+tc+ ","
    newqryarray.push(tc)
    labels.push(formatDatex(tc))
    }
  }
  newqry = newqry.slice(0,-1)
  newqry = "SELECT "+newqry+" FROM students JOIN attendence ON students.admission_number = attendence.admission_number WHERE students.class = '"+classn+"' and students.section = '"+section+"';"
  const result =await queryAsync(newqry)
  var countpresentindate = 0
  var countabsentindate = 0
  var countleaveindate = 0
  var countlateindate = 0
  var countpresentindate1 = 0
  var countabsentindate1 = 0
  var countleaveindate1 = 0
  var countlateindate1 = 0
  for(var t=0; t<newqryarray.length; t++){
  
    for(var i=0; i<result.length; i++){
      const ree = result[i]
      const eee = newqryarray[t]
  
      if(ree[eee]==='p'){
          countpresentindate++
          countpresentindate1++
      }else if(ree[eee]==='a'){
          countabsentindate++
          countabsentindate1++
      }else if(ree[eee]==='l'){
          countleaveindate++
          countleaveindate1++
      }else if(ree[eee]==='lt'){
          countlateindate++
          countlateindate1++
      }
    }
    perdateans.push({countpresentindate,countabsentindate,countleaveindate,countlateindate})
      countpresentindate = 0
      countabsentindate = 0
      countleaveindate = 0
      countlateindate = 0
  }
  const total = countpresentindate1+countabsentindate1+countleaveindate1+countlateindate1
  for(var i=0; i<perdateans.length; i++){
  
    const total = perdateans[i].countpresentindate+perdateans[i].countabsentindate+perdateans[i].countleaveindate+perdateans[i].countlateindate
    presentd.push(perdateans[i].countpresentindate)
    absentd.push(perdateans[i].countabsentindate)
    leaved.push(perdateans[i].countleaveindate)
    lated.push(perdateans[i].countlateindate)

  }
  if(crietaria==='daily'){
  
    res.send({
      perdateans,
      tstr:result.length,
      tp:Math.round((countpresentindate1*100)/total),
      ta:Math.round((countabsentindate1*100)/total),
      tl:Math.round((countleaveindate1*100)/total),
      tlt:Math.round((countlateindate1*100)/total),
      labels,
      presentd,
      absentd,
      leaved,
      lated
    })
  }else if(crietaria==='weekly'){
    const upnp = await groupDatesIntoWeeks(labels)
    var ulabels = []
    var upresentd = []
    var uabsentd = []
    var uleaved = []
    var ulated = []

    for(var i=0; i<upnp.length; i++){
      ulabels.push("Week "+(i+1).toString())
      var alpha = upnp[i]

      var pb=0
      var ab=0
      var lb=0
      var ltb=0
      var tttrt = 0
      
      for(var l=0; l<alpha.length; l++){
        tttrt = alpha.length*result.length
        var test = alpha[l]
        pb = (pb+presentd[test])
        ab = (ab+absentd[test])
        lb = (lb+leaved[test])
        ltb = (ltb+lated[test])

      }

      upresentd.push(Math.round((pb*100)/tttrt))
      uabsentd.push(Math.round((ab*100)/tttrt))
      uleaved.push(Math.round((lb*100)/tttrt))
      ulated.push(Math.round((ltb*100)/tttrt))
      
    }

    res.send({
     
      tstr:result.length,
      tp:Math.round((countpresentindate1*100)/total),
      ta:Math.round((countabsentindate1*100)/total),
      tl:Math.round((countleaveindate1*100)/total),
      tlt:Math.round((countlateindate1*100)/total),
      labels:ulabels,
      presentd:upresentd,
      absentd:uabsentd,
      leaved:uleaved,
      lated:ulated
    })
  
  }else if(crietaria==='monthly'){
  
    const upnp = await groupDatesIntoMonths(labels)

    const zara = []
   for(var i=0; i<dates.length; i++){
    var n = convertDatex(dates[i])
    var x =n.slice(5,7)
    const eel = givemonth(x)
    var tnt = (zara[zara.length-1])
    if(tnt === undefined){
      zara.push(eel)
    }else if(zara[zara.length-1] != eel){
      zara.push(eel)
    }
   }
 
   console.log(zara)
    var ulabels = []
    var upresentd = []
    var uabsentd = []
    var uleaved = []
    var ulated = []
    for(var i=0; i<upnp.length; i++){
  
      ulabels.push(zara[i])
  
      var alpha = upnp[i]
      var pc=0
      var ac=0
      var lc=0
      var ltc=0
      var tttrt = 0
      for(var nn=0; nn<alpha.length; nn++){
  
        var test = alpha[nn]
        tttrt = alpha.length*result.length
        pc = pc+presentd[test]
        ac = ac+absentd[test]
        lc = lc+leaved[test]
        ltc = ltc+lated[test]
  
      }
      upresentd.push(Math.round((pc*100)/tttrt))
      uabsentd.push(Math.round((ac*100)/tttrt))
      uleaved.push(Math.round((lc*100)/tttrt))
      ulated.push(Math.round((ltc*100)/tttrt))
    }
    res.send({
      tstr:result.length,
      tp:Math.round((countpresentindate1*100)/total),
      ta:Math.round((countabsentindate1*100)/total),
      tl:Math.round((countleaveindate1*100)/total),
      tlt:Math.round((countlateindate1*100)/total),
      labels:ulabels,
      presentd:upresentd,
      absentd:uabsentd,
      leaved:uleaved,
      lated:ulated
    })
  
  }else if(crietaria==='yearly'){
  
    const upnp = await groupDatesIntoYears(labels)
    var ulabels = []
    var upresentd = []
    var uabsentd = []
    var uleaved = []
    var ulated = []
    for(var i=0; i<upnp.length; i++){
      var alpha = upnp[i]
      var ps2 = alpha[i]
      if (ulabels[ulabels.length-1]!==dates[ps2].slice(1,5)){
        ulabels.push(dates[ps2].slice(1,5))
      }
 
      var pd=0
      var ad=0
      var ld=0
      var ltd=0
      var tttrt = 0
      for(var nn=0; nn<alpha.length; nn++){
        tttrt = alpha.length*result.length
        var test = alpha[nn]
        pd = pd+presentd[test]
        ad = ad+absentd[test]
        ld = ld+leaved[test]
        ltd = ltd+lated[test]
      }
      upresentd.push(Math.round((pd*100)/tttrt))
      uabsentd.push(Math.round((ad*100)/tttrt))
      uleaved.push(Math.round((ld*100)/tttrt))
      ulated.push(Math.round((ltd*100)/tttrt))
    }
    res.send({
     
      tstr:result.length,
      tp:Math.round((countpresentindate1*100)/total),
      ta:Math.round((countabsentindate1*100)/total),
      tl:Math.round((countleaveindate1*100)/total),
      tlt:Math.round((countlateindate1*100)/total),
      labels:ulabels,
      presentd:upresentd,
      absentd:uabsentd,
      leaved:uleaved,
      lated:ulated
    })
  }
  
  
  
})
app.post('/student-report', async (req,res)=>{

const {admission_number,dates,crietaria} = req.body

const qry = "SELECT * FROM students JOIN attendence ON students.admission_number = attendence.admission_number where attendence.admission_number = '"+admission_number+"';"
const match = await queryAsync(qry)
var newqry = "attendence.admission_number,"
  var newqryarray = []
  var perdateans = []
  var labels = []
  var presentd = []
  var absentd = []
  var leaved = []
  var lated = []
  var totaldays = 0
  for(var i=0; i<dates.length; i++){

    const mc = match[0]
    const tc = dates[i]
    if(mc[tc] === undefined){
  
    }else{
    totaldays++
    newqry = newqry +'attendence.'+tc+ ","
    newqryarray.push(tc)
    labels.push(formatDatex(tc))
    }
  }
  newqry = newqry.slice(0,-1)
  newqry = "SELECT "+newqry+" FROM students JOIN attendence ON students.admission_number = attendence.admission_number where attendence.admission_number = '"+admission_number+"';"
  const result =await queryAsync(newqry)
  var countpresentindate = 0
  var countabsentindate = 0
  var countleaveindate = 0
  var countlateindate = 0
  var countpresentindate1 = 0
  var countabsentindate1 = 0
  var countleaveindate1 = 0
  var countlateindate1 = 0
  for(var t=0; t<newqryarray.length; t++){
  
    for(var i=0; i<result.length; i++){
      const ree = result[i]
      const eee = newqryarray[t]
  
      if(ree[eee]==='p'){
          countpresentindate++
          countpresentindate1++
      }else if(ree[eee]==='a'){
          countabsentindate++
          countabsentindate1++
      }else if(ree[eee]==='l'){
          countleaveindate++
          countleaveindate1++
      }else if(ree[eee]==='lt'){
          countlateindate++
          countlateindate1++
      }
    }
    perdateans.push({countpresentindate,countabsentindate,countleaveindate,countlateindate})
      countpresentindate = 0
      countabsentindate = 0
      countleaveindate = 0
      countlateindate = 0
  }
  const total = countpresentindate1+countabsentindate1+countleaveindate1+countlateindate1
  
  for(var i=0; i<perdateans.length; i++){
    const total = perdateans[i].countpresentindate+perdateans[i].countabsentindate+perdateans[i].countleaveindate+perdateans[i].countlateindate
    presentd.push(perdateans[i].countpresentindate)
    absentd.push(perdateans[i].countabsentindate)
    leaved.push(perdateans[i].countleaveindate)
    lated.push(perdateans[i].countlateindate)
  }
  
  if(crietaria==='daily'){
  
    res.send({
      pushup:[],
      perdateans,
      tstr:totaldays,
      tp:Math.round((countpresentindate1*100)/total),
      ta:Math.round((countabsentindate1*100)/total),
      tl:Math.round((countleaveindate1*100)/total),
      tlt:Math.round((countlateindate1*100)/total),
      tp1:countpresentindate1,
      ta1:countabsentindate1,
      tl1:countleaveindate1,
      tlt1:countlateindate1,
      labels,
      presentd,
      absentd,
      leaved,
      lated
    })
  }else if(crietaria==='weekly'){
    var pushup = []
    var fillpush = {}
    const upnp = await groupDatesIntoWeeks(labels)
    var ulabels = []
    var upresentd = []
    var uabsentd = []
    var uleaved = []
    var ulated = []
    for(var i=0; i<upnp.length; i++){
      fillpush = {week:'',monday:'',tuesday:'',wednesday:'',thursday:'',friday:'',days:0,present:0,absent:0,leave:0,late:0}
      ulabels.push("Week "+(i+1).toString())
      fillpush.week = "Week "+(i+1).toString()
      var alpha = upnp[i]
      var pa=0
      var aa=0
      var la=0
      var lta=0

      for(var l=0; l<alpha.length; l++){
        var test = alpha[l]
        var dayx = getDayOfWeek(dates[test])
        if(dayx === 'Monday'){

          if(presentd[test]===1){
            fillpush.monday = 'P'
          }else if(absentd[test] === 1){
            fillpush.monday = 'A'
          }else if(leaved[test]===1){
            fillpush.monday = 'L'
          }else if(lated[test]===1){
            fillpush.monday = 'LT'
          }

        }else if(dayx === 'Tuesday'){
          if(presentd[test]===1){
            fillpush.tuesday = 'P'
          }else if(absentd[test] === 1){
            fillpush.tuesday = 'A'
          }else if(leaved[test]===1){
            fillpush.tuesday = 'L'
          }else if(lated[test]===1){
            fillpush.tuesday = 'LT'
          }
        }else if(dayx === 'Wednesday'){
          if(presentd[test]===1){
            fillpush.wednesday = 'P'
          }else if(absentd[test] === 1){
            fillpush.wednesday = 'A'
          }else if(leaved[test]===1){
            fillpush.wednesday = 'L'
          }else if(lated[test]===1){
            fillpush.wednesday = 'LT'
          }
        }else if(dayx === 'Thursday'){
          if(presentd[test]===1){
            fillpush.thursday = 'P'
          }else if(absentd[test] === 1){
            fillpush.thursday = 'A'
          }else if(leaved[test]===1){
            fillpush.thursday = 'L'
          }else if(lated[test]===1){
            fillpush.thursday = 'LT'
          }
        }else if(dayx === 'Friday'){
          if(presentd[test]===1){
            fillpush.friday = 'P'
          }else if(absentd[test] === 1){
            fillpush.friday = 'A'
          }else if(leaved[test]===1){
            fillpush.friday = 'L'
          }else if(lated[test]===1){
            fillpush.friday = 'LT'
          }
        }
        pa = pa+presentd[test]
        aa = aa+absentd[test]
        la = la+leaved[test]
        lta = lta+lated[test]
        fillpush.days = 5
        fillpush.present = countOccurrenceszx(fillpush,'P')
        fillpush.absent = countOccurrenceszx(fillpush,'A')
        fillpush.leave = countOccurrenceszx(fillpush,'L')
        fillpush.late = countOccurrenceszx(fillpush,'LT')

      }
      pushup.push(fillpush)
      upresentd.push(pa)
      uabsentd.push(aa)
      uleaved.push(la)
      ulated.push(lta)
  
    }

    res.send({
      pushup,
      tstr:total,
      tp:(Math.round((countpresentindate1*100)/total)),
      ta:(Math.round((countabsentindate1*100)/total)),
      tl:(Math.round((countleaveindate1*100)/total)),
      tlt:(Math.round((countlateindate1*100)/total)),
      labels:ulabels,
      presentd:upresentd,
      absentd:uabsentd,
      leaved:uleaved,
      lated:ulated
    })
  
  }else if(crietaria==='monthly'){
  
    const upnp = await groupDatesIntoMonths(labels)
    const zara = []
    for(var i=0; i<dates.length; i++){
     var n = convertDatex(dates[i])
     var x =n.slice(5,7)
     const eel = givemonth(x)
     var tnt = (zara[zara.length-1])
     if(tnt === undefined){
       zara.push(eel)
     }else if(zara[zara.length-1] != eel){
       zara.push(eel)
     }
    }
    var ulabels = []
    var upresentd = []
    var uabsentd = []
    var uleaved = []
    var ulated = []
    for(var i=0; i<upnp.length; i++){
  
      ulabels.push(zara[i])
  
      var alpha = upnp[i]
      
      var pb=0
      var ab=0
      var lb=0
      var ltb=0
   
      
      for(var nn=0; nn<alpha.length; nn++){
  
        var test = alpha[nn]
   
        pb = pb+presentd[test]
        ab = ab+absentd[test]
        lb = lb+leaved[test]
        ltb = ltb+lated[test]
  
      }
  
      upresentd.push(pb)
      uabsentd.push(ab)
      uleaved.push(lb)
      ulated.push(ltb)
    }
  
    res.send({
      pushup:[],
      tstr:totaldays,
      tp:Math.round((countpresentindate1*100)/total),
      ta:Math.round((countabsentindate1*100)/total),
      tl:Math.round((countleaveindate1*100)/total),
      tlt:Math.round((countlateindate1*100)/total),
      labels:ulabels,
      presentd:upresentd,
      absentd:uabsentd,
      leaved:uleaved,
      lated:ulated
    })
  
  }else if(crietaria==='yearly'){
  
    const upnp = await groupDatesIntoYears(labels)
    var ulabels = []
    var upresentd = []
    var uabsentd = []
    var uleaved = []
    var ulated = []
    for(var i=0; i<upnp.length; i++){

      var alpha = upnp[i]
      var ps2 = alpha[i]
      if (ulabels[ulabels.length-1]!==dates[ps2].slice(1,5)){
        ulabels.push(dates[ps2].slice(1,5))
      }
      var pc=0
      var ac=0
      var lc=0
      var ltc=0
      for(var nn=0; nn<alpha.length; nn++){
        var test = alpha[nn]
        pc = pc+presentd[test]
        ac = ac+absentd[test]
        lc = lc+leaved[test]
        ltc = ltc+lated[test]
      }
      upresentd.push(pc)
      uabsentd.push(ac)
      uleaved.push(lc)
      ulated.push(ltc)
    }
    res.send({
      pushup:[],
      tstr:totaldays,
      tp:Math.round((countpresentindate1*100)/total),
      ta:Math.round((countabsentindate1*100)/total),
      tl:Math.round((countleaveindate1*100)/total),
      tlt:Math.round((countlateindate1*100)/total),
      labels:ulabels,
      presentd:upresentd,
      absentd:uabsentd,
      leaved:uleaved,
      lated:ulated
    })
  }


})
app.post('/get-warning-letters',async (req,res)=>{
  const {classn,section,session} = req.body
  const dates = await queryAsync("select * from attendence.sessiondates where session = '"+session+"';")
  const dates1 = dates[0]
  var sdate = await convertDateFormatzx(dates1.startdate)
  var ldate = await convertDateFormatzx(dates1.enddate)
  sdate = convertDate(sdate)
  ldate = convertDate(ldate)
  const students = await queryAsync("select * from attendence.students where class = '"+classn+"' and section = '"+section+"';")
  var warningletters = []
  const darray = getDatesInRange(sdate,ldate)
  const data = await queryAsync("select * from attendence.attendence;")
  const data1 = data[0]
  
  const warnings = await queryAsync("SELECT * FROM attendence.warningletters;")

  for(var iii=0; iii<students.length; iii++){

    const stuadn = students[iii].admission_number;
    var rightarray1 = []
    var rightarray = 'admission_number,'
    for(var i=0; i<darray.length; i++){
      tester = darray[i]
      if(data1['d'+tester] === undefined){
        
      }
      else{
        rightarray+=('d'+tester+',')
        rightarray1.push('d'+tester)
      }
    }
    rightarray = rightarray.slice(0,-1)
    const updateddata =await queryAsync("select "+rightarray+" from attendence.attendence where admission_number = '"+stuadn+"';")
    var attendancearray = []
    for(var i=0; i<rightarray1.length; i++){
      let hel = updateddata[0]
      let pel = rightarray1[i]
      attendancearray.push(hel[pel])
    }
    const total = countOccurrences(attendancearray, 'a');
    var checked = 'pending'
    if(total>9){

      var datapush = {name:students[iii].student_full_name,admission_number:students[iii].admission_number,roll_no:students[iii].roll_no,absent_count:total,warningtype:'First',warning_status:checked}
      for(var t=0; t<warnings.length; t++){
        if(warnings[t].roll_no === datapush.roll_no & warnings[t].warning_type === datapush.warningtype){
          checked = 'dispatched'
        }
      }
      warningletters.push(datapush)
    }
    if(total>19){
      var datapush = {name:students[iii].student_full_name,admission_number:students[iii].admission_number,roll_no:students[iii].roll_no,absent_count:total,warningtype:'Second',warning_status:checked}
      for(var t=0; t<warnings.length; t++){
        if(warnings[t].roll_no === datapush.roll_no & warnings[t].warning_type === datapush.warningtype){
          checked = 'dispatched'
        }
      }
      warningletters.push(datapush)
    }
    if(total>29){
      var datapush = {name:students[iii].student_full_name,admission_number:students[iii].admission_number,roll_no:students[iii].roll_no,absent_count:total,warningtype:'Third',warning_status:checked}
      for(var t=0; t<warnings.length; t++){
        if(warnings[t].roll_no === datapush.roll_no & warnings[t].warning_type === datapush.warningtype){
          checked = 'dispatched'
        }
      }
      warningletters.push(datapush)
    }

  }

  res.send(warningletters)
})
app.post('/get-student-attendance',async (req,res)=>{
console.log(req.body)
})

app.post('/warning-letters', async (req,res)=>{
  const {classn,section,sessiont} = req.body
  const qry1 = ""
  console.log(req.body)

  res.send({classn,section,sessiont})

})
app.post('/promote-students', async (req,res)=>{
console.log(req.body)

res.send(req.body)
})
function getCurrentTime() {
  const currentDate = new Date();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();

  // Add leading zeros if needed
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  // Return the formatted time string
  return `${hours}:${minutes}:${seconds}`;
}
function getCurrentDatetx() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Format the date with the day, month name, and year
  const formattedDate = `${day}-${monthNames[monthIndex]}-${year}`;

  return formattedDate;
}

app.post('/write-logs', async (req,res)=>{
const time = getCurrentTime()
const date = getCurrentDatetx()
const {token,username,activity,path} = req.body
const query = "INSERT INTO `attendence`.`logs` (`token`, `username`, `time`, `date`, `activity`,`path`) VALUES ('"+token+"', '"+username+"', '"+time+"', '"+date+"', '"+activity+"', '"+path+"');"
const result = await queryAsync(query)
res.send(result)

})
app.post('/read-logs', async (req,res)=>{
const query = "SELECT * FROM attendence.logs;"
const result = await queryAsync(query)
res.send(result)

})

app.listen(port,function(){
  console.log("server is up");
})