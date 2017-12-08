import React from 'react';
import $ from 'jquery';
import {Tabs, Tab} from 'material-ui/Tabs';
import {grey900,indigo200,blue800,cyan800,teal500,tealA200,cyanA700} from 'material-ui/styles/colors.js';
// From https://github.com/oliviertassinari/react-swipeable-views
import SwipeableViews from 'react-swipeable-views';
//import Defaultimg from './../../images/default_profile.jpg';
import Logo from './../../images/QandA.jpg';
import IndividualQuestion from './individualquestion.js';
import {Card, CardActions, CardTitle, CardText,CardMedia,CardHeader} from 'material-ui/Card';
const ReactToastr = require('react-toastr');
const {ToastContainer,ToastMessage} = ReactToastr;
const ToastMessageFactory = React.createFactory(ToastMessage.animation);
import Question from './question.js';
import Editor from './texteditor.js';
import Postanswer from './postAnswer.js';
import './reactlandingpage.css';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },

  tabBtn:{
    fontFamily: 'Roboto',
    marginLeft:'3%'
  },

  swipe:{
    marginTop:'10%'
  }

};
var user = cookies.get('displayname');
class Questiontabs extends React.Component {

  constructor(props) {
      super(props);
      this.state = {
        slideIndex: 0,
        topratedquestions:'',
        latestquestions:'',
        unansweredquestions:'',
        topansweredquestions:'',
        token: null,
        logStatus:false,
        followCount:''
      };
    }
    /* topQuestions in componentWillMount*/
    componentWillMount(){
      var that=this;
      //let token = localStorage.getItem('token');
      let token= cookies.get('token');
      //that.welcomeMessageAlert();
      var name = 'topquestions';
         $.ajax({
           type:'GET',
           url:'/question/'+name,
           data:{},
           success:function(data){
             console.log(data);
              if(data != "" || data!="No Questions"){
                var  topratedQuestions = data.map((row,index)=> {
                     return <Question name="topquestions" question = {row.question} toaster={that.refs.toasterContainer} followCount={row.followcount} postedBy={row.postedBy} timestamp={row.time} answerCount={row.answercount} qid={row.questionid} picture={row.picture} key = {index}/>
                   });
                   that.setState({topratedquestions : topratedQuestions, token: token});
               }
               else{

               }
               },
           error:function(err){
             alert(err);
           }
         });

    }

    handleChange(value){
      this.setState({
        slideIndex: value
      });
    }
    /*getting topQuestions*/
        getTopQuestions(){
          var that=this;
          var name = 'topquestions';
             $.ajax({
               type:'GET',
               url:'/question/'+name,
               data:{},
               success:function(data){
                 if(data != ""){
                   console.log(data);
                 var  topratedQuestions = data.map((row,index)=> {
                   console.log(row.picture);
                   return <Question name="topquestions" question = {row.question} toaster={that.refs.toasterContainer} followCount={row.followcount} postedBy={row.postedBy} timestamp={row.time} answerCount={row.answercount} qid={row.questionid} picture={row.picture} key = {index}/>
                 });
                 that.setState({topratedquestions : topratedQuestions});
               }
               },
               error:function(err){
                 alert(err);
               }
             });
         }
         /*getting latestquestions*/
         getLatestQuestions(){
           var that=this;
           var name = 'latestquestions';
              $.ajax({
                type:'GET',
                url:'/question/'+name,
                data:{},
                 success:function(data){
                   if(data != ""){
                   var  latestQuestions = data.map((row,index)=> {
                  return <Question name="latestquestions" toaster={that.refs.toasterContainer} question = {row.question} followCount={row.followcount} postedBy={row.postedBy} timestamp={row.time} answerCount={row.answercount} qid={row.questionid} picture={row.picture}  key = {index}/>
                });
                that.setState({latestquestions : latestQuestions});
              }
              },
              error:function(err){
                alert(err);
              }
        });
          }

    checkForInfoYourQuestion() {
            this.props.toaster.error(
              'Post Question to view your Question',
            '', {
              timeOut: 3000,
              extendedTimeOut: 3000
                }
          );
          }

        /*  welcomeMessageAlert(){
            this.props.toaster.info(
              'Hi....Welcome to Quest.',
            '', {
              timeOut: 3000,
              extendedTimeOut: 3000
                }
          );
        }*/

   checkForErrorYourQuestion() {
        this.props.toaster.error(
          'Signin/SignUp to view Questions posted by you',
        '', {
          timeOut: 3000,
          extendedTimeOut: 3000
            }
      );
      }



/*getting userquestions*/
          getUserQuestions(){
            var that=this;
            var name = 'userquestions';
               $.ajax({
                 type:'GET',
                 url:'/question/'+name,
                 data:{user:cookies.get('emailId')},
                  success:function(data){
                    console.log("data:",data);
                    var userQuestions;
                    if(userQuestions == 'No Question'){
            if(that.state.token){
                that.checkForInfoYourQuestion();
            }
            else{
              that.checkForErrorYourQuestion();
            }
          }
          else {
                  console.log("hjkkjlklk");
                  userQuestions = data.map((row,index)=> {
                   return <Question name="userquestions" question = {row.question}  toaster={that.refs.toasterContainer} picture={row.picture} followCount={row.followcount} postedBy={row.postedBy} timestamp={row.time} answerCount={row.answercount} qid={row.questionid}  key = {index}/>
                 });
               }
                 that.setState({userquestions : userQuestions});
               },
               error:function(err){
                 that.checkForErrorYourQuestion();
               }
         });
           }
/*getting topansweredQuestions*/
          getTopAnsweredQuestions(){
            var that=this;
            var name = 'topAnswered';
               $.ajax({
                 type:'GET',
                 url:'/question/'+name,
                 data:{},
                  success:function(data){
                    if(data != ""){
                    var  topansweredQuestions = data.map((row,index)=> {
                   return <Question name="topAnswered" question = {row.question} toaster={that.refs.toasterContainer} picture={row.picture} followCount={row.followcount} postedBy={row.postedBy}  answerCount={row.answercount} qid={row.questionid} timestamp={row.time}  key = {index}/>
                 });
                 that.setState({topansweredquestions : topansweredQuestions});
               }
               },
               error:function(err){
                 alert(err);
               }
         });
          }
/*getting unansweredQuestions*/
         getUnAnsweredQuestions(){
           var that=this;
           var name = 'unanswered';
              $.ajax({
                type:'GET',
                url:'/question/'+name,
                data:{},
                 success:function(data){
                   console.log("unanswered");
                  if(data != ""){
                   var  unansweredQuestions = data.map((row,index)=> {
                     return <Question   name="unanswered" question = {row.question} toaster={that.refs.toasterContainer} picture={row.picture} followCount={row.followcount} postedBy={row.postedBy} timestamp={row.time} qid={row.questionid} key = {index}/>
                });
                that.setState({unansweredquestions : unansweredQuestions});
              }
              },
              error:function(err){
                alert(err);
              }
        });
         }
         /*checkForToast*/
        checkForToast(){
          this.refs.toasterContainer.success(
              'DisLiked successfully',
            '', {
              timeOut: 3000,
              extendedTimeOut: 3000
            });
        }

render(){
  return(

  <div className="row ">
    <ToastContainer ref="toasterContainer"
      toastMessageFactory={ToastMessageFactory}
      className='toast-top-center'/>
    <div >
       <Tabs
          onChange={this.handleChange.bind(this)}
          value={this.state.slideIndex}
          style={{marginTop:'-3%',
          marginLeft:'0%',
          width:'100%',
          fontFamily: 'Roboto',
          paddingTop: '5%',
          backgroundColor:'white',
          fontFamily:'initial',
          position:'fixed',
          zIndex:'1'
        }}
        >

          <Tab style={styles.tabBtn}  icon={<i className="material-icons md-56">grade</i>} label="Top Questions" value={0} onActive={this.getTopQuestions.bind(this)} />
          <Tab style={styles.tabBtn} icon={<i className="material-icons md-56">trending_up</i>} label="Latest" value={1} onActive={this.getLatestQuestions.bind(this)}/>
          <Tab style={styles.tabBtn} icon={<i className="material-icons md-56">new_releases</i>} label="Unanswered" value={2} onActive={this.getUnAnsweredQuestions.bind(this)}/>
          {this.state.token && <Tab style={styles.tabBtn} icon={<i className="material-icons">visibility</i>}label="My Questions" value={3} onActive={this.getUserQuestions.bind(this)}/>}
          {/*}<Tab style={styles.tabBtn} label="Ask questions" value={5} />*/}
          </Tabs>


        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange.bind(this)}
          style={{width: '100%',height: '100%',textAlign: 'center',marginTop:'8%',fontFamily: 'Roboto',backgroundColor:'white'}}
        >
          <div style={styles.slide}>
            {this.state.topratedquestions}
          </div>
          <div style={styles.slide}>
            {this.state.latestquestions}
          </div>
          <div style={styles.slide}>
            {this.state.unansweredquestions}
          </div>
          { this.state.token ? <div style={styles.slide}>
             {this.state.userquestions}
           </div> : ''}
        </SwipeableViews>

  </div>
  </div>
)};
};
export default Questiontabs;
