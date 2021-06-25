const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }
    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM schedule;";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            // console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewRow(schedule_facultyName
        ,schedule_date
        ,schedule_batch
        ,schedule_end
        ,schedule_start) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO schedule (faculty_name, batch, date, start, end) VALUES (?,?,?,?,?);";

                connection.query(query, [schedule_facultyName
                    ,schedule_batch
                    ,schedule_date
                    ,schedule_start
                    ,schedule_end] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.insertId);
                })
            });
            return {
                id : insertId,
                schedule_facultyName : schedule_facultyName,
                schedule_date : schedule_date,
                schedule_batch : schedule_batch,
                schedule_end : schedule_end,
                schedule_start : schedule_start
            };
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;