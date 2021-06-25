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

});

app.get('/getAll', (request,response) => {
    console.log('test');
    
})


app.listen(process.env.PORT, () => console.log('App is running'));