var request = require('request');
var template = require('./template.js');

exports.handleMessage=function(sender_psid, received_message) {
  var response; 
  var text = received_message.text;

  if(text === "처음으로"){
    template.greetingTemplate(function(result, res){
      if(result==true){
        response=res;
        callSendAPI(sender_psid, response)
      }
    });
  }else if(text === "감사합니다"){
    response={text: "미천한 재주입니다."};
    callSendAPI(sender_psid, response)
  }else{
    template.choiceLectProfTemplate(text, function(result, res){
      if(result==true){
        response=res;
        console.log("text2:",response)
        callSendAPI(sender_psid, response);
      }
    });
  }
}

exports.handlePostback =function(sender_psid, received_postback) {
  var response;

  // Get the payload for the postback
  var payload = received_postback.payload;
  var firstchoice = payload.substr(0,14);

  // Set the response based on the postback payload
  if(payload === 'Greeting'){
    console.log('Greeting');
	  template.greetingTemplate(function(result, res){
      if(result==true){
        console.log(res);
        response=res;
      }
    });
	  callSendAPI(sender_psid, response);
  }else if(firstchoice === 'CHOICE_BY_PROF'){
	  handlePostback_choiceByProf(sender_psid, received_postback);
  }else if(firstchoice === 'CHOICE_BY_LECT'){
	  handlePostback_choiceByLect(sender_psid, received_postback);
  }else if(firstchoice === 'CHOICE_BY_HELP'){
	  handlePostback_help(sender_psid, received_postback);
  }else if(payload.substr(0,8) === 'MoreRate'){
    template.moreRateTemplate(payload, function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }
}

const handlePostback_choiceByProf = function(sender_psid, received){
  var response;
  var payload = received.payload;
  var stat = payload.substr(14,6);

  if(stat === 'stat_0'){
	  template.getProfNameTemplate(function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }else if(stat === 'stat_2'){
    template.moreProfTemplate(payload,function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }else if(stat === 'stat_3'){
    template.rateTemplate(payload,function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }
}

const handlePostback_choiceByLect = function(sender_psid, received){
  var response;
  var payload = received.payload;
  var stat = payload.substr(14,6);

  if(stat === 'stat_0'){
    template.getLectNameTemplate(function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }else if(stat === 'stat_2'){
    template.moreLectTemplate(payload,function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }else if(stat === 'stat_3'){
    template.rateTemplate(payload,function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }
}

const handlePostback_help = function(sender_psid, received) {
  var response;
  var payload = received.payload;
  var stat = payload.substr(14,6);

  if(stat === 'stat_0'){
	  template.howToTemplate(function(result, res){
      if(result==true){
        console.log(res);
        response=res;
        callSendAPI(sender_psid, response);
      }
    });
  }
}

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response, cb=null) => {
  console.log('response:'+response);
  // Send the HTTP request to the Messenger Platform
  request({
    "url": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": {
	    recipient: {id: sender_psid},
	    message: response
    }
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
      console.log('res: ',response);
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}
