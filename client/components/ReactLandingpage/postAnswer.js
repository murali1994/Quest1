import React  from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Divider from 'material-ui/Divider';
import './reactlandingpage.css';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
const styles = {
  submitbtn:{
    width:'50%',
    fontFamily: 'Roboto',
    marginLeft:'25%'
  }
};

var user = cookies.get('displayname');
var token = cookies.get('token');
export default class Postanswer extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        newAnswer:'',
        openEditor: false,
        logStatus:false,
        token:null,
        btnStatus:false
      };

    }

    componentWillMount(){
      this.setState({token:token});
      if(token != null){
        this.setState({btnStatus:true});
      }
    }

    answerChange(e){
      this.setState({newAnswer:e.target.value});
    }

    openDialog(){
      var that =this;
      that.setState({openEditor:true});
    }

    checkForPostAnswerAlert(){
          this.props.toaster.info(
            'Signin/SignUp to continue',
          '', {
            timeOut: 3000,
            extendedTimeOut: 3000
              }
        );
    }

    checkForFillPostAnswerAlert(){
          this.props.toaster.info(
            'Fillout some Answer',
          '', {
            timeOut: 3000,
            extendedTimeOut: 3000
              }
        );
    }

    checkForPostAnswerSuccessAlert(){
          this.props.toaster.info(
            'Posted successfully',
          '', {
            timeOut: 3000,
            extendedTimeOut: 3000
              }
        );
    }

    postAnswer(){
      var that =this;
      if(that.state.newAnswer == '' ){
        that.checkForFillPostAnswerAlert()
      }
      else{
        var qid = that.props.qid;
        $.ajax({
          type:'POST',
          url:'/answer/'+qid,
          data:{user:cookies.get('emailId'),answer:that.state.newAnswer,time:new Date()},
          success:function(data){
              that.checkForPostAnswerSuccessAlert()
              that.props.handleClose();
          },
          error:function(err){
              console.log(err);
          }
          })
      }
  }


    render(){
      return(
          <div>
            <div className="text">
              <div className="form-group">
                <label for="exampleTextarea" style={{color:'white'}}>Answer</label>
                <textarea className="form-control" id="exampleTextarea" placeholder="Write your answer here..." rows="6" onChange={this.answerChange.bind(this)}></textarea>
              </div>
              {this.state.token ? <RaisedButton  primary={true} style={styles.submitbtn} disabled={this.state.buttonStatus} onClick={this.postAnswer.bind(this)}>Post your answer</RaisedButton> :  <center><b>Signin/Signup to continue</b></center> }
          </div></div>
      )};
    }
