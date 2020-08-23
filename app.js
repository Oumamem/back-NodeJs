
const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');
var connection = require('./config');

var authenticateController=require('./controllers/authenticate-controller');
var registerController=require('./controllers/register-controller');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.get('/', function (req, res) {  
   res.sendFile( __dirname + "/" + "index.ejs" );  
})  
app.get('/quizz', function (req, res) {  
    let sql = "SELECT * FROM question";
    connection.query(sql, (err, rows) => {
        console.log("hello*******", rows)
        if(err) throw err;
        //res.send('hello world')
       
          
        res.render('quizz', {
            quests : rows
        }); 
    });
   // res.sendFile( __dirname + "/" + "quizz/quizz.ejs" );  
 }) 
 
app.get('/login.ejs', function (req, res) {  
   res.sendFile( __dirname + "/" + "login.ejs" );  
})  
async function queryAnswer(sql)
{
    try{
        let result = await new Promise((resolve, reject) => {
            connection.query(sql, async(err, rows) => {                
                if(err) reject(err);
                console.log("*****rows ", rows[0])
                resolve (rows[0].rep_c); 
                             
            });          
        })
        return (result)
    }
    catch(err)
    {
        console.log("err ", err)
    }
}
async function saveAnswer(sql)
{
    try{
        let result = await new Promise((resolve, reject) => {
            connection.query(sql, async(err, rows) => {                
                if(err) reject(err);
                resolve (rows[0].id); 
                             
            });          
        })
        return (result)
    }
    catch(err)
    {
        console.log("err ", err)
    }
}

 
app.post('/resultat',async (req, res) => {
    let reps = req.body.reps;
    var score =0;
    console.log("reps**********: ", reps)
   
    for (let i = 0; i < reps.length; i++) {
            let rep = reps[i]
            console.log("rep: ",rep)
            let id= rep.id;
            let answer = rep.value;
            let sql="Select rep_c from question where id ="+id;
            const correct_answer = await queryAnswer(sql)
            if(correct_answer==answer){
                score=score+3;
            }else{
                score=score-1;
            }         
    }
    
    console.log("score =",score) 
    let sql1 ="INSERT INTO user SET score ="+score+" reponses="+reps
    const save=await saveAnswer(sql1)

    console.log("score =",score) 
})
/* route to handle login and registration */
app.post('/api/register',registerController.register);
app.post('/api/authenticate',authenticateController.authenticate);
 
console.log(authenticateController);
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authenticateController.authenticate);

 
app.listen(3000);
