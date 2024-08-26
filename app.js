// // External variables
// const express = require("express");
// const mongoose = require('mongoose');
// const bodyParser=require("body-parser");
// const app = express();
// const port = process.env.PORT || "8000";
// const user = require('./Models/User');
// const cors=require("cors")
// const cookieParser = require("cookie-parser");
// const sessions = require('express-session');
// const courseRouter=require("./routes/course")
// const userRouter=require("./routes/addUsers")
// const instructorRouter=require("./routes/instructor")
// const commonRouter=require("./routes/commonRoutes");
// const TraineeRout = require("./routes/Trainee");
// const adminRoute=require("./routes/admin");
// // #Importing the userController
// const oneDay = 1000 * 60 * 60 * 24;
// app.use(cookieParser());
// app.use(sessions({
//     secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
//     saveUninitialized:true,
//     cookie: { maxAge: oneDay },
//     resave: false 
// }));
// app.set('view engine', 'ejs')
// app.use(cors())
// app.use(bodyParser.urlencoded({extended:false}))
// app.use(bodyParser.json())
// app.use("/course",courseRouter)
// app.use("/user",userRouter)
// app.use("/instructor",instructorRouter)
// app.use("/",commonRouter)
// app.use("/trainee",TraineeRout)
// app.use("/admin",adminRoute)
// // configurations
// // Mongo DB
// mongoose.connect(MongoURI)
// .then(()=>{
//   console.log("MongoDB is now connected!")
// // Starting server
//  app.listen(port, () => {
//     console.log(`Listening to requests on http://localhost:${port}`);
//   })
// })
// .catch(err => console.log(err));
const schedule = require('node-schedule');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const accounts=[
    "https://x.com/Mr_Derivatives",
"https://twitter.com/warrior_0719",
"https://twitter.com/ChartingProdigy" ,
"https://twitter.com/allstarcharts",
"https://twitter.com/yuriymatso",
"https://twitter.com/TriggerTrades",
"https://twitter.com/AdamMancini4 ",
"https://twitter.com/CordovaTrades ",
"https://twitter.com/Barchart",
"https://twitter.com/RoyLMa ttox"

]
const interval=process.env.INTERVAL || 2 // in minutes
const symbol=process.env.SYMBOL || "$TSLA"
let mentionCount=0
async function autoScroll(page) {
    return await page.evaluate(async () => {
         return new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100; // distance to scroll each time
            let tweets=[];
            let timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                let temp=Array.from(document.querySelectorAll('div[lang]')).map((element)=>element.innerText);
                console.log(temp);
                
                for(let i=0;i<temp.length;i++){
                    if(!tweets.includes(temp[i])){
                        tweets.push(temp[i]);
                    }
                }
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve(tweets);
                }
            }, 500);
        });
    });
}
async function findInAccount(url, symbol) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        let tweets = [];
        
        await page.waitForSelector('div[lang]');
        let temp=await autoScroll(page);
        console.log(temp);
        for(let i=0;i<temp.length;i++){
            if(temp[i].includes(symbol)){
                mentionCount++;
            }
        }
    
       
       
       
        await browser.close();

    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
    }
}

async function findAllAccounts(accounts, symbol) {
    mentionCount = 0;
    for (let url of accounts) {
        await findInAccount(url, symbol);
    }

    console.log(`"${symbol}" was mentioned "${mentionCount}" times in the last "${interval}" minutes.`);
}

function intervalFind() {
    console.log(`Starting the finder... Scraping every ${interval} minutes.`);

    schedule.scheduleJob(`*/${interval} * * * *`, function () {
        console.log(`Scraping session at ${new Date().toLocaleTimeString()}`);
        findAllAccounts(accounts, symbol);
    });
}

intervalFind();
// findInAccount(accounts[0], symbol); 