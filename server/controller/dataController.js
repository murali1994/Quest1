let driver = require("../config/neo4j.js");
let session = driver.session();
let intentLexicon = require("../lexicon/intentLexicon.json");
let UserModel = require("../models/signup");
let sendAnswerNotificationMail = require("./sendMail");
let followQuestionNotificationMail = require("./followQuestionNotification.js");

module.exports = {
  addQuestion: function(req, res) {
    console.log("hii adddd");
    sw = require("stopword");
    var searchValue = req.body.searchValue;
    var title = req.body.title;
    var user = req.body.user;
    var time = req.body.time;
    const oldString = searchValue.split(" ");
    const keyword = sw.removeStopwords(oldString);
    console.log(keyword);
    let intents = [];
    for (let i = 0; i < oldString.length; i = i + 1) {
      let intent = [];
      for (let m = 0; m < intentLexicon.length; m = m + 1) {
        let splitIntent = intentLexicon[m].split(" ");
        if (splitIntent[0] === oldString[i]) {
          let intentPhraseLength = 1;
          for (
            let n = 1;
            n < splitIntent.length && i + 1 < oldString.length;
            n = n + 1
          ) {
            if (oldString[i + n] === splitIntent[n]) {
              intentPhraseLength = intentPhraseLength + 1;
            } else {
              break;
            }
          }
          if (intentPhraseLength === splitIntent.length) {
            intent = splitIntent;
          }
        }
      }
      if (intent.length !== 0) {
        i = i + intent.length - 1;
        intents.push(intent.join(" "));
        // if intent found skip this iteration
        continue;
      }
    }
    const params = {
      keywords: keyword,
      intent: intents
    };
    console.log(intents);
    let query = `unwind {intent} as ques_intent\
                                        match (:QuestionIntent{value:ques_intent})-[:same_as]->(baseintent:QuestionIntent) with distinct collect(baseintent.value) as intent\
                               MATCH (k:Keywords)<-[:Question_of]-(q:Question)-[:intent]->(i:QuestionIntent), (q)<-[:answer_of]-(a:Answer)-[:answered_by]->(u:User)\
                             where k.name in {keywords} and i.value in intent\
                             optional match (q)<-[:answer_of]-(a)<-[l:likes]-(:User)\
                                  optional match (q)<-[:answer_of]-(a)<-[d:dislikes]-(:User)  return a,u,count(l) as likes,count(d) as dislikes`;
    session.run(query, params).then(function(data) {
      var result;
      console.log(JSON.stringify(data));
      if (data.records == "") {
        let query = `merge (u:User{name:"${user}"})\
                                merge (q:Question{value:"${searchValue}"})\
                                on create set q.asked_at = "${time}"\
                                merge (u)<-[:posted_by]-(q) \
                                merge (m:Keywords{name:"${title}"})\
                                merge (n:Topic{name:"Keywords"})\
                                merge (m)-[r:keyword_of]->(n)\
                                merge (q)-[:Question_of]->(m)\
                                merge (qi:QuestionIntent{value:"${params.intent}"})\
                                merge (q)-[:intent]->(qi)\
                                return q`;
        session.run(query).then(function(result1) {
          res.send("Question posted");
        });
      }
    });
  },
  addAnswer: function(req, res) {
    var qid = req.params.questionid;
    var answer = req.body.answer;
    var user = req.body.user;
    var time = req.body.time;


    let query = `match (u:User{name:"${user}"}),(q:Question) where id(q)=${qid}\
                            merge(a:Answer{value:"${answer}",answered_at:"${time}"})\
                             merge (u)<-[:answered_by]-(a)-[:answer_of]->(q) return q,a`;
    session.run(query).then(function(data) {
      res.send(data);
      let query1 = `match (u:User)-[r:follows]->(n:Question) where id(n)=${qid} return u,n`;
      session.run(query1).then(function(data1) {
          if(data1 != " "){
            var result = data1.records.map((row, index) => {
              return {
                receiver: row._fields[0].properties.name,
                question: row._fields[1].properties.value,
                answered_by:user
              };
            });
            console.log("*----------------------------------------------------------------");
            followQuestionNotificationMail(result);
            console.log(result);
        }

      });
      let query2 = `match (u:User)<-[r:posted_by]-(q:Question) where id(q)=${qid} return u,q`;
      session.run(query2).then(function(data2) {
          if(data2 != " "){
            var result = data2.records.map((row, index) => {
              return {
                receiver: row._fields[0].properties.name,
                question: row._fields[1].properties.value,
                answered_by:user
              };
            });
            console.log("*----------------------------------------------------------------");
            sendAnswerNotificationMail(result);
            console.log(result);
        }
      });
    });
  },
  getQuestions: function(req, res) {
    if (req.params.name == "topquestions") {
      let query =
        "match (n:Question)<-[r:follows]-(:User)\
                                     with n,count(r) as follow_count,id(n) as qid optional match (n)-[:posted_by]->(u:User)\
                                     with n,follow_count,qid,u as postedBy optional match (n)<-[a:answer_of]-(:Answer)\
                                     return n,follow_count,qid,postedBy,count(a) as answer_count,n.asked_at as time order by follow_count desc";
      session.run(query).then(function(data) {
        var name;
        var count = 0;
        var total = data.records.length;
        var result1 =[];
        if (data.records == "") {
            res.send("No Questions");
        } else {
        var result = data.records.map((row, index) => {
          console.log("before:"+row._fields[3].properties.name);
          UserModel.findOne({'username':row._fields[3].properties.name},(function(err, profile) {
              count++;
              var pic;
              console.log("after:"+row._fields[3].properties.name);
              if (err) {
                console.log(err);
                  res.send(err);
              } else {
                  if(profile != null){
                    console.log("inn");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[1].low,
                      questionid: row._fields[2].low,
                      postedBy: row._fields[3].properties.name,
                      answercount: row._fields[4].low,
                      time: row._fields[5],
                      picture:profile.picture
                    });
                  }
                  else{
                    console.log("inn else");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[1].low,
                      questionid: row._fields[2].low,
                      postedBy: row._fields[3].properties.name,
                      answercount: row._fields[4].low,
                      time: row._fields[5],
                      picture:"profile.jpg"
                    });
                  }
                  if(count == total){
                    console.log('result send: ', result1);
                    res.send(result1);
                  }

          }
        })
      );

    });
    }
    });

    } else if (req.params.name == "latestquestions") {
      let query = `match (n:Question)-[:posted_by]->(u:User)\
                   with n,u as postedBy ,id(n) as qid optional match (n)<-[f:follows]-(:User)\
                   with n,count(f) as follow_count,qid,postedBy optional match (n)<-[a:answer_of]-(:Answer)\
                   return n,follow_count,qid,postedBy,count(a) as answer_count,n.asked_at as time order by time desc`;
      session.run(query).then(function(data) {
        var count = 0;
        var total = data.records.length;
        var result1 =[];
        if (data.records == "") {
            res.send("No Questions");
        } else {
        var result = data.records.map((row, index) => {
          console.log("followcount" + row._fields[1].low);
          UserModel.findOne({'username':row._fields[3].properties.name},(function(err, profile) {
              count++;
              var pic;
              console.log("after:"+row._fields[3].properties.name);
              if (err) {
                console.log(err);
                  res.send(err);
              } else {
                  if(profile != null){
                    console.log("inn");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[1].low,
                      questionid: row._fields[2].low,
                      postedBy: row._fields[3].properties.name,
                      answercount: row._fields[4].low,
                      time: row._fields[5],
                      picture:profile.picture
                    });
                  }
                  else{
                    console.log("inn else");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[1].low,
                      questionid: row._fields[2].low,
                      postedBy: row._fields[3].properties.name,
                      answercount: row._fields[4].low,
                      time: row._fields[5],
                      picture:"profile.jpg"
                    });
                  }
                  if(count == total){
                    console.log('result send: ', result1);
                    res.send(result1);
                  }
                  // return profile;
          }
        })
      );
        });
      }
      });
    } else if (req.params.name == "userquestions") {
      var user = req.query.user;
      let query = `match (n:Question)-[:posted_by]->(u:User{name:"${user}"})\
                   with n,u as postedBy ,id(n) as qid optional match (n)<-[f:follows]-(u:User)\
                   with n,count(f) as follow_count,qid,postedBy optional match (n)<-[a:answer_of]-(:Answer)\
                   return n,follow_count,qid,postedBy,count(a) as answer_count,n.asked_at as time order by time desc`;
      session.run(query).then(function(data) {
        var count = 0;
        var total = data.records.length;
        var result1 =[];
        if (data.records == "") {
          session.run(query).then(function(result1) {
            res.send("No Questions");
          });
        } else {
          var result = data.records.map((row, index) => {
            UserModel.findOne({'username':row._fields[3].properties.name},(function(err, profile) {
                count++;
                var pic;
                console.log("after:"+row._fields[3].properties.name);
                if (err) {
                  console.log(err);
                    res.send(err);
                } else {
                    if(profile != null){
                      console.log("inn userquestions");
                      result1.push({
                        question: row._fields[0].properties.value,
                        followcount: row._fields[1].low,
                        questionid: row._fields[2].low,
                        postedBy: row._fields[3].properties.name,
                        answercount: row._fields[4].low,
                        time: row._fields[5],
                        picture:profile.picture
                      });
                    }
                    else{
                      console.log("inn else userquestions");
                      result1.push({
                        question: row._fields[0].properties.value,
                        followcount: row._fields[1].low,
                        questionid: row._fields[2].low,
                        postedBy: row._fields[3].properties.name,
                        answercount: row._fields[4].low,
                        time: row._fields[5],
                        picture:"profile.jpg"
                      });
                    }
                    if(count == total){
                      console.log('result send: ', result1);
                      res.send(result1);
                    }
                    // return profile;
            }
          })
        );
          });
        }
      });
    } else if (req.params.name == "topAnswered") {
      let query = `match (q:Question)<-[c:answer_of]-(a:Answer)<-[r:likes]-(:User)\
                   with q,count(r) as likes,count(c) as answer_count,id(q) as qid optional match (q)-[:posted_by]->(u:User)\
                   with q,likes,answer_count,qid,u as postedBy optional match (q)<-[f:follows]-(:User)\
                   return q,likes,answer_count,qid,postedBy,count(f) as follow_count,q.asked_at as time order by likes desc`;
      session.run(query).then(function(data) {
        var count = 0;
        var total = data.records.length;
        var result1 =[];
        if (data.records == "") {
            res.send("No Questions");
        } else {
        var result = data.records.map((row, index) => {
          UserModel.findOne({'username':row._fields[4].properties.name},(function(err, profile) {
              count++;
              var pic;
              if (err) {
                console.log(err);
                  res.send(err);
              } else {
                  if(profile != null){
                    console.log("inn");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[5].low,
                      questionid: row._fields[3].low,
                      postedBy: row._fields[4].properties.name,
                      answercount: row._fields[2].low,
                      time: row._fields[6],
                      picture:profile.picture
                    });
                  }
                  else{
                    console.log("inn else");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[5].low,
                      questionid: row._fields[3].low,
                      postedBy: row._fields[4].properties.name,
                      answercount: row._fields[2].low,
                      time: row._fields[6],
                      picture:"profile.jpg"
                    });
                  }
                  if(count == total){
                    console.log('result send: ', result1);
                    res.send(result1);
                  }
                  // return profile;
          }
        })
      );
        });
      }
      });
    } else {
      let query = `MATCH (n:Question) WHERE NOT (n)<-[:answer_of]-(:Answer)\
                   with n,id(n) as qid optional match (n)-[:posted_by]->(u:User)\
                   with n,qid,u as postedBy optional match (n)<-[a:follows]-(:User)\
                   return n,qid,postedBy,count(a) as follow_count,n.asked_at as time`;
      session.run(query).then(function(data) {
        var result = data.records.map((row, index) => {
          var count = 0;
          var total = data.records.length;
          var result1 =[];
          if (data.records == "") {
              res.send("No Questions");
          } else {
          UserModel.findOne({'username':row._fields[2].properties.name},(function(err, profile) {
              count++;
              if (err) {
                console.log(err);
                  res.send(err);
              } else {
                  if(profile != null){
                    console.log("inn inside unanswered");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[3].low,
                      questionid: row._fields[1].low,
                      postedBy: row._fields[2].properties.name,
                      time: row._fields[4],
                      picture:profile.picture
                    });
                  }
                  else{
                    console.log("inn else unanswered");
                    result1.push({
                      question: row._fields[0].properties.value,
                      followcount: row._fields[3].low,
                      questionid: row._fields[1].low,
                      postedBy: row._fields[2].properties.name,
                      time: row._fields[4],
                      picture:"profile.jpg"
                    });
                  }
                  if(count == total){
                    console.log('result send unansered: ', result1);
                    res.send(result1);
                  }
                  // return profile;
          }
        })
      );
      }
      });
    });
    }
  },
  getSearch: function(req, res) {
    sw = require("stopword");
    var searchValue = req.body.searchValue;
    const oldString = searchValue.split(" ");
    const keyword = sw.removeStopwords(oldString);
    let intents = [];

    for (let i = 0; i < oldString.length; i = i + 1) {
      let intent = [];
      for (let m = 0; m < intentLexicon.length; m = m + 1) {
        let splitIntent = intentLexicon[m].split(" ");
        if (splitIntent[0] === oldString[i]) {
          let intentPhraseLength = 1;
          for (
            let n = 1;
            n < splitIntent.length && i + 1 < oldString.length;
            n = n + 1
          ) {
            if (oldString[i + n] === splitIntent[n]) {
              intentPhraseLength = intentPhraseLength + 1;
            } else {
              break;
            }
          }
          if (intentPhraseLength === splitIntent.length) {
            intent = splitIntent;
          }
        }
      }
      if (intent.length !== 0) {
        i = i + intent.length - 1;
        intents.push(intent.join(" "));
        // if intent found skip this iteration
        continue;
      }
    }
    const params = {
      keywords: keyword,
      intent: intents
    };
    console.log(intents);
    let query = `unwind ${JSON.stringify(params.intent)} as ques_intent\
                                    match (:QuestionIntent{value:ques_intent})-[:same_as]->(baseintent:QuestionIntent) with distinct collect(baseintent.value) as intent\
                                    MATCH (k:Keywords)<-[:Question_of]-(q:Question)-[:intent]->(i:QuestionIntent) where k.name in {keywords} and i.value in intent\
                                    optional match(q)<-[:answer_of]-(a:Answer)-[:answered_by]->(u:User)\
                                    optional match (q)<-[:answer_of]-(a)<-[l:likes]-(:User)\
                                    optional match (q)<-[:answer_of]-(a)<-[d:dislikes]-(:User)  return a,u,count(l) as likes,count(d) as dislikes,a.answered_at as time,id(a) as aid,id(q) as qid,q`;
    session.run(query, params).then(function(data) {
      var ans;
      var count = 0;
      var total = data.records.length;
      var result1 =[];
      console.log("data:"+JSON.stringify(data));
      console.log("hmmmm,",data.records);
      if (data.records == "") {
        console.log("no answer");
        res.send("No answers!!!!!");
      } else {
        data.records.map((row, index) => {
          ans = row._fields[0];
          if( ans == null){
            console.log("answer is null");
            res.send({
                questionId: row._fields[6].low,
                status:"No answers"
              });
          }
            else{
              UserModel.findOne({'username':row._fields[1].properties.name},(function(err, profile) {
                  count++;
                  console.log("count:"+count);
                  console.log("total"+total)
                  if (err) {
                    console.log(err);
                      res.send(err);
                  } else {
                      if(profile != null){
                        console.log("inn inside unanswered:"+profile.picture);
                        result1.push({
                          status:"Having Answer",
                          answer: row._fields[0].properties.value,
                          answered_by: row._fields[1].properties.name,
                          likes: row._fields[2].low,
                          dislikes: row._fields[3].low,
                          time: row._fields[4],
                          answerId: row._fields[5].low,
                          questionId: row._fields[6].low,
                          question:row._fields[7].properties.value,
                          picture:profile.picture
                        });
                      }
                      else{
                        console.log("inn else search"+row._fields[0].properties.value);
                        result1.push({
                          status:"Having Answer",
                          answer: row._fields[0].properties.value,
                          answered_by: row._fields[1].properties.name,
                          likes: row._fields[2].low,
                          dislikes: row._fields[3].low,
                          time: row._fields[4],
                          answerId: row._fields[5].low,
                          questionId: row._fields[6].low,
                          question:row._fields[7].properties.value,
                          picture:"profile.jpg"
                        });
                      }
                      if(count == total){
                        console.log('result send search: ', result1);
                        res.send(result1);
                      }
              }
            })
          );
          }
        });
      }
    });
  },
  getAnswer: function(req, res) {
    var qid = req.params.questionid;
    console.log(qid);
    let query = `match (a:Answer)-[:answer_of]->(n:Question) where id(n)=${qid}\
                              with a,id(a) as aid  match (a)-[:answered_by]->(u:User)\
                              with a,u,aid optional match(a)<-[l:likes]-(:User)\
                              with a,u,aid,count(l) as likes optional  match(a)<-[d:dislikes]-(:User)\
                              return a,u,likes,count(d) as dislikes,aid,a.answered_at as time order by likes desc`;

    session.run(query).then(function(data) {
      var result;
      var count = 0;
      var total = data.records.length;
      var result1 =[];
      if (data.records == "") {
        console.log("no answer");
        res.send("No answers!!!!!");

      } else {
        data.records.map((row, index) => {
          UserModel.findOne({'username':row._fields[1].properties.name},(function(err, profile) {
              count++;
              if (err) {
                console.log(err);
                  res.send(err);
              } else {
                  if(profile != null){
                    console.log("inn inside unanswered:"+profile.picture);
                    result1.push({
                      answer: row._fields[0].properties.value,
                      answered_by: row._fields[1].properties.name,
                      likes: row._fields[2].low,
                      dislikes: row._fields[3].low,
                      answerId: row._fields[4].low,
                      time: row._fields[5],
                      picture:profile.picture
                    });
                  }
                  else{
                    console.log("inn else unanswered");
                    result1.push({
                      answer: row._fields[0].properties.value,
                      answered_by: row._fields[1].properties.name,
                      likes: row._fields[2].low,
                      dislikes: row._fields[3].low,
                      answerId: row._fields[4].low,
                      time: row._fields[5],
                      picture:"profile.jpg"
                    });
                  }
                  if(count == total){
                    console.log('result send unansered: ', result1);
                    res.send(result1);
                  }
          }
        })
      );
        });
      }
    });
  },
  addFollow: function(req, res) {
    console.log(req.params.questionid);
    var qid = req.params.questionid;
    var user = req.body.user;

    let query = `match (u:User {name:"${user}"}),(q:Question)\
                           where not (q)<-[:follows]-(u) and id(q)=${qid}\
                           merge(q)<-[:follows]-(u) return q,u`;

    session.run(query).then(function(data) {
      console.log(JSON.stringify(data));
      var result = data.records.map((row, index) => {
        return { answer: row._fields[0].properties.value };
      });
      console.log(result);
      res.send(result);
    });
  },
  unFollow: function(req, res) {
    var qid = req.params.questionid;
    var user = req.body.user;
    let query = `match (u:User{name:"${user}"}),(q:Question) where id(q)=${qid}\
                            match (u)-[r:follows]->(q)\
                             delete r`;
    session.run(query).then(function(data) {
      console.log(JSON.stringify(data));
      var result = data.records.map((row, index) => {
        return { answer: row._fields[0].properties.value };
      });
      console.log(result);
      res.send(result);
    });
  },
  checkFollowStatus: function(req, res) {
    var user = req.query.user;
    let query = `match (u:User {name:"${user}"}),(q:Question)\
                               where (q)<-[:follows]-(u) \
                               return id(q) as qid`;
    session.run(query).then(function(data) {
      var result = data.records.map((row, index) => {
        return { qid: row._fields[0].low };
      });
      res.send(result);
    });
  },
  answerLikes: function(req, res) {
    var aid = req.params.answerid;
    var user = req.body.user;
    let query = `match (u:User{name:"${user}"}),(a:Answer)\
                          where not  (u)-[:likes]->(a) and id(a)=${aid}\
                           with u as u , a as a optional match (u)-[r:dislikes]->(a) delete r\
                           merge (u)-[:likes]->(a) return a;`;

    session.run(query).then(function(data) {
      console.log(JSON.stringify(data));
      var result = data.records.map((row, index) => {
        return { answer: row._fields[0].properties.value };
      });
      console.log(result);
      res.send(result);
    });
  },
  answerDislikes: function(req, res) {
    var aid = req.params.answerid;
    var user = req.body.user;
    let query = `match (u:User{name:"${user}"}),(a:Answer)\
                          where not  (u)-[:dislikes]->(a) and id(a)=${aid}\
                           with u as u , a as a optional match (u)-[r:likes]->(a) delete r\
                           merge (u)-[:dislikes]->(a) return a;`;

    session.run(query).then(function(data) {
      console.log(JSON.stringify(data));
      var result = data.records.map((row, index) => {
        return { answer: row._fields[0].properties.value };
      });
      console.log(result);
      res.send(result);
    });
  }
};
