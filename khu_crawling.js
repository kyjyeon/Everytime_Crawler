const puppeteer = require('puppeteer');
const request = require('request');
const mysql = require('mysql');
const util = require('util');
var emojiStrip = require('emoji-strip')

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  port     : ,
  database : 'bot'
})
const query = util.promisify(connection.query).bind(connection);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://ce.khu.ac.kr/index.php?hCode=UNIVERSITY_02_01_01');
  await page.screenshot({path: 'test.png'});
  var lecture = [];
  lecture =  await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('#conTD > td > div > table > tbody > tr > td:nth-child(2)'));
          return anchors.map(anchor => anchor.textContent);
  })
  
  lecture.push("디자인적사고")
  lecture.push("신호와시스템")

  

  for(var i=0; i<lecture.length; i++){
     console.log(lecture[i])
     await query('INSERT INTO lectures (lecturename) VALUES (?)',lecture[i])
  }
 
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const et_id = "";
  const et_pw = "";
  await page.goto('https://everytime.kr/login');
  await page.evaluate((id, pw) => {
    document.querySelector("input[name=userid]").value = id;
    document.querySelector("input[name=password]").value = pw;
  }, et_id, et_pw);
  await console.log("로그인 정보 삽입 완료")
  await page.click('#container > form > p.submit > input');
  await page.waitFor(1000);
 

  var lecary = [];
  const rows = await query('SELECT * FROM lectures');
  for(var i =0; i<rows.length; i++){
      lecary.push(rows[i].lecturename)
  }
  console.log(lecary)
  
  for(var i=0 ; i< lecary.length; i++){
    var templecture = lecary[i];
    console.log(lecture);
    await page.goto('https://everytime.kr/lecture');
    await page.evaluate((lec) => {
      document.querySelector("input[name=keyword]").value = lec;
    }, templecture);
    await page.click('#container > form > input.submit');
    await page.waitFor(1000);

    let tempclass = await page.evaluate((sel) => {
      return Array.from(document.getElementsByClassName(sel)).map(node => node.href);
    }, 'lecture');
    console.log(tempclass)

    for (var j = 0; j < tempclass.length; j++) {
        console.log(tempclass[j]);
        await page.goto(tempclass[j]);
        await page.waitFor(1000);
        await page.waitForSelector('#container > div.side.head > h2');
        const lecturename = await page.evaluate(() => {
          const anchors1 = Array.from(document.querySelectorAll('#container > div.side.head > h2'));
          return anchors1.map(anchor1 => anchor1.textContent);
        });
        await page.waitForSelector('#container > div.side.head > p:nth-child(3) > span');
        const proname = await page.evaluate(() => {
          const anchors2 = Array.from(document.querySelectorAll('#container > div.side.head > p:nth-child(3) > span'));
          return anchors2.map(anchor2 => anchor2.textContent);
        });
        await page.waitForSelector('#container > div.side.article > div.rating > div.rate > span > span.value');
        const avg_rate = await page.evaluate(() => {
          const anchors3 = Array.from(document.querySelectorAll('#container > div.side.article > div.rating > div.rate > span > span.value'));
          return anchors3.map(anchor3 => anchor3.textContent);
        });
        let review = [];
        if (await page.$('#container > div.side.article > div.articles > article > p.text') !== null){
          await page.waitForSelector('#container > div.side.article > div.articles > article > p.text');
            review =  await page.evaluate(() => {
            const anchors4 = Array.from(document.querySelectorAll('#container > div.side.article > div.articles > article > p.text'));
            return anchors4.map(anchor4 => anchor4.textContent);
          });
        }
        console.log(lecturename.join('\n'));
        console.log(proname.join('\n'));
        console.log(avg_rate.join('\n'));
        console.log(review); 
        review = review.toString()
        review = emojiStrip(review)

        await query('INSERT INTO reviews (lecturename,proname,avg_rate,review) VALUES (?,?,?,?)',[lecturename,proname,avg_rate,review])
      }
  }
  
  await browser.close();
  connection.end();
})();
