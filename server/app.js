const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { request, response } = require('express');

dotenv.config();

const dbService = require('./dbService')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

app.post('/insert', (request,response) => {
    
    const schedule_facultyName = request.body.schedule_facultyName;
    const schedule_date= request.body.schedule_date;
    const schedule_batch= request.body.schedule_batch;
    const schedule_end= request.body.schedule_end;
    const schedule_start= request.body.schedule_start;
    const db = dbService.getDbServiceInstance();
    
    const result = db.insertNewRow(
        schedule_facultyName
        ,schedule_date
        ,schedule_batch
        ,schedule_end
        ,schedule_start);

    result
    .then(data => response.json({ data: data}))
    .catch(err => console.log(err));
});

app.get('/getAll', (request,response) => {
    const db = dbService.getDbServiceInstance();
    
    const result = db.getAllData();
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

app.get('/search/:details', (request, response) => {
    let obj = JSON.parse(request.params.details);
    
    const db = dbService.getDbServiceInstance();

    const result = db.searchByMonthYear(obj.month, obj.year);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

app.delete('/delete/:id', (request, response) => {
    const id = request.params.id;
    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

app.listen(process.env.PORT, () => console.log('App is running'));