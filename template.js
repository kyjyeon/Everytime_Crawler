var db=require('./db.js');

var greetingText = "안녕하세요! 컴공/소융 강의평가 봇이에요. 아래에 버튼 3개를 눌러주세요.";  // 인사말
var greetingTitle = ["교수명으로 검색", "강의명으로 검색", "HELP"];


exports.greetingTemplate = function(cb){
  var text={
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": greetingText,
        "buttons":[
          {
            "type":"postback",
            "title":greetingTitle[0],
            "payload":"CHOICE_BY_PROFstat_0"
          },
          {
            "type":"postback",
            "title":greetingTitle[1],
            "payload":"CHOICE_BY_LECTstat_0"
          },
          {
            "type":"postback",
            "title":greetingTitle[2],
            "payload":"CHOICE_BY_HELPstat_0"
          }
        ]
      }
    }
  };
  cb(true, text);
}

//stat_0
exports.getProfNameTemplate = function(cb){
  var text={
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
	      "text": "교수명을 입력하세요.",
	      "buttons":[
          {
	         "type":"postback",
	         "title":"처음으로",
	         "payload":"Greeting"
	       }
	     ]
      }
    }
  };
  cb(true, text);
}

exports.getLectNameTemplate = function(cb){
  var text={
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": "강의명을 입력하세요.",
        "buttons":[
          {
           "type":"postback",
           "title":"처음으로",
           "payload":"Greeting"
         }
       ]
      }
    }
  };
  cb(true, text);
}

exports.choiceLectProfTemplate=function(message,cb) {
  var sqlquery = 'SELECT * FROM reviews WHERE lecturename Like ? OR proname Like ?';
  var par = ["%"+message+"%","%"+message+"%"];

  db.query(sqlquery,par, function(error,results){  
    console.log("!~~!~!~!~!~!~!~~!~!");
    console.log(results);
    console.log("메세지: ",message);
    if (error){
      res.render('error');
    }else{
      if(results.length==0){
        console.log("0개로 들어 왔어용");
        cb(true, {text: "검색 결과가 없습니다. 검색어를 다시 입력해주세요."});
      }else if(results.length<=2){
        console.log("2개로 들어 왔어용");
        LectProfList(results,0,results.length,false,'0',message, function(result, text){
          if(result==true){
            console.log(text);
            cb(true, text);
          }
        });
      }else if(results.length>2){
        console.log("3개로 들어 왔어용");
        LectProfList(results,0,2,true,'1',message, function(result, text){
          if(result==true){
            console.log("text1: ",text);
            cb(true, text);
          }
        });
      }
    }
  });
}

function LectProfList(results,start,length,ismore,morecount,message,cb){
  console.log("LectProfList 함수에 들어옴");
  if(length==1){
    console.log("첫 버튼 하나짜리 처리하는데 들어옴");
    var title=results[start].lecturename+"\n["+results[start].proname+"]";
    var payload='CHOICE_BY_PROFstat_3'+results[start].idreviews;
    var text={
          "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": "검색 결과입니다. 평가를 조회할 강의를 선택하세요.",
            "buttons":[
            {
              "type":"postback",
              "title":title,
              "payload":payload
            }
            ]
          }
        }
      };
    cb(true, text);
  }else if((length == 2)&&(!ismore)){
    console.log("2개짜리 처리하는데 들어옴");
    var title=[results[start].lecturename+"\n["+results[start].proname+"]", results[start+1].lecturename+"\n["+results[start+1].proname+"]"];
    var payload=['CHOICE_BY_PROFstat_3'+results[start].idreviews, 'CHOICE_BY_PROFstat_3'+results[start+1].idreviews];
    var text={
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": "검색 결과입니다. 평가를 조회할 강의를 선택하세요.",
          "buttons":[
          {
            "type":"postback",
            "title":title[0],
            "payload":title[0]
          },
          {
            "type":"postback",
            "title":title[1],
            "payload":payload[1]
          }
          ]
        }
      }
    };
    cb(true, text);
  }else if((length == 2)&&(ismore)){
    console.log("버튼 2개, 더보기까지 처리하는데 들어옴");
    var title=[results[start].lecturename+"\n["+results[start].proname+"]", results[start+1].lecturename+"\n["+results[start+1].proname+"]"];
    var payload=['CHOICE_BY_PROFstat_3'+results[start].idreviews, 'CHOICE_BY_PROFstat_3'+results[start+1].idreviews, 'CHOICE_BY_PROFstat_2'+message+'/'+morecount];
    var text={
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": "검색 결과입니다. 평가를 조회할 강의를 선택하세요. 원하는 강의가 없다면 [더보기]를 눌러주세요.",
          "buttons":[
          {
            "type":"postback",
            "title":title[0],
            "payload":payload[0]
          },
          {
            "type":"postback",
            "title":title[1],
            "payload":payload[1]
          },
          {
            "type":"postback",
            "title":"더보기",
            "payload":payload[2]
          }
          ]
        }
      }
    };
    cb(true, text);
  }
}

//stat_2
exports.moreProfTemplate = function(payload,cb){
  var ms=payload.substr(20).split('/');
  var message=ms[0]; //to Number  
  console.log("ms1: ",ms[1])
  var more=parseInt(ms[1]);
  console.log("more: ",more)

  var sqlquery='SELECT * FROM reviews WHERE lecturename Like ? OR proname Like ?';
  var par=['%'+message+'%','%'+message+'%'];
  db.query(sqlquery, par, function(error,results){
    if (error){
        console.log(error);
        res.render('error');
    }
    if((results.length-2*(more+1))<=0){
      LectProfList(results,2*more,results.length-2*more,false,'0',message, function(result, text){
       if(result==true){
        cb(true, text);
       }
      });
    }else{
      LectProfList(results,2*more,2,true,(more+1).toString(),message, function(result, text){
       if(result==true){
        cb(true, text);
       }
      });
    }
  });
}

exports.moreLectTemplate= function(payload,cb){
  var ms=payload.substr(20).split('/');
  var more=1*(ms[0]);
  var message=ms[1];

  var sqlquery='SELECT * FROM reviews WHERE lecturename Like ? OR proname Like ?';
  var par=['%'+message+'%','%'+message+'%'];
  db.query(sqlquery, par, function(error,results){
    if (error){
        console.log(error);
        res.render('error');
    }
    if((results.length-2*(more+1))<=0){
      LectProfList(results,2*more,results.length-2*n,false,'0',message, function(result, text){
       if(result==true){
        cb(true, text);
       }
      });
    }else{
      LectProfList(results,2*more,2,true,""+(more+1),message, function(result, text){
       if(result==true){
        cb(true, text);
       }
      });
    }
  });
}

//stat_3
exports.rateTemplate= function(payload,cb){
  var id = payload.substr(20);

  var sqlquery='SELECT * FROM reviews WHERE idreviews = ?';
  var par=[id];
  db.query(sqlquery, par, function(error,results){
    if (error){
        console.log(error);
        res.render('error');
    }

    var proname=results[0].proname;
    var lecname=results[0].lecturename;
    var reviews=results[0].review.split('.');
    var review=reviews[0];
    var rate=results[0].avg_rate;
    var botsay=[];
    var randNum=0;
    if(rate != 0){
      randNum=Math.floor((Math.random() * (3-0+1))+0);
    }

    if(rate==0){
      botsay=["신설 강좌거나 아직 강의평이 없어요!"];
    }else if((rate>1)&&(rate<2.5)){
      botsay=["음.. 말을 아낄게요.", "다시 생각해보시는게..","이전 단계로 돌아갈까요?","으응?"];
    }else if((rate>=2.5)&&(rate<4.0)){
      botsay=["무난무난","그럭저럭한 것 같아요.","안 들어서 나쁠거 없어요.","평범한 수업이네요"];
    }else{
      botsay=["무조건 들어요!","갓갓 교수님의 갓갓 수업","안 들으면 후회해요ㅠㅠ", "수강신청 1순위!"];
    }

    var payload1='MoreRate'+id;
    var text={
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": proname+" 교수님의 강의 ["+lecname+"]의 강의평입니다.\n  **평균 평점: "+rate+"\n  **봇의 한줄평: "+botsay[randNum]+"\n  **학우의 한줄평: "+review,
        "buttons":[
          {
            "type":"postback",
            "title":"자세한 강의평 보기",
            "payload":payload1
          }
        ]
      }
    }
  };
  cb(true, text);
  });
}

exports.moreRateTemplate = function(payload,cb){
  var id = payload.substr(8);
  
  var sqlquery='SELECT * FROM reviews WHERE idreviews = ?';
  var par=[id];
  db.query(sqlquery, par, function(error,results){
    if (error){
        console.log(error);
        res.render('error');
    }
    
    var reviews=results[0].review;
    console.log("전체리뷰:",reviews)
    cb(true,{text:reviews});
  });
}


//payload === 'HELP'
exports.howToTemplate = function(cb){
  var helptext="안녕하세요. 경희대학교 컴공/소융 강의평가봇입니다. \n\n 1. [교수명으로 검색], [강의명으로 검색] 중 하나를 선택한다. \n 2. 찾고자하는 강의의 교수명/강의명을 입력한다. \n 3. 입력하신 정보에 일치하는 강의/교수 목록 버튼 중 하나를 선택한다. \n 4. 강의/교수 버튼을 선택하면 해당 강의의 강의평가가 제공된다. \n 4-1. 더보기 버튼을 선택하면 해당 조건의 강의를 더 볼 수 있다. \n 5. [자세한 평보기] 버튼을 눌러 학우들의 생생한 강의평가를 자세히 본다. \n\n *언제든지 \"처음으로\"를 입력하면 첫 화면으로 돌아갑니다. \n\n 그럼 아래 버튼을 눌러 강의평가를 조회해보세요.\n\n\n 이 봇은 2019년 1학기 오픈소스 SW 프로그래밍 수업 프로젝트로 제작되었습니다. 강의 평가 내용은 '에브리타임'에서 크롤링해왔습니다. \n 김예미, 최원준, 최재은 제작. \n 후원) [농협] 625010-51-030649 김예미. \n 감사합니다. ";
  var text={
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": helptext,
        "buttons":[
          {
           "type":"postback",
           "title":"처음으로",
           "payload":"Greeting"
         }
       ]
      }
    }
  };
  cb(true,text);
}
