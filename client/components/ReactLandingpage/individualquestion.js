import React from 'react';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import {Row,Col} from 'react-flexbox-grid';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import RaisedButton from 'material-ui/RaisedButton';
import {Card, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Moment from 'react-moment';
import Badge from 'material-ui/Badge';
import './reactlandingpage.css';
import Cookies from 'universal-cookie';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import {grey900,indigo900,tealA700,blue300,cyan500,grey50,redA700,lightGreen900,deepOrange300,purple500} from 'material-ui/styles/colors.js';
const ReactToastr = require('react-toastr');
const {ToastContainer} = ReactToastr;
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);


const cookies = new Cookies();
var token = cookies.get('token');
const styles = {
  card:{
    margin:'2%',
    textAlign:'justify',
    padding:'2%',
    fontFamily: 'Roboto',
    borderColor:'black'
  },
  cardtext:{
    fontFamily: 'Roboto',
    fontSize:'120%',
    textAlign:'justify',
  },
  cardtext1:{
    fontFamily: 'Roboto',
    fontSize:'110%',
    color:'grey',
    overflow: 'visible'
  },
  col1:{
    textAlign: 'center',
    whiteSpace:'inherit',
    fontFamily: 'Roboto !important',
    fontSize:'120%',
    color:'grey',
    overflow: 'visible'
  },
  col2:{
    textAlign: 'center',
    whiteSpace:'inherit',
    fontFamily: 'Roboto',
    fontSize:'120%',
    color:'grey',
    overflow: 'visible',
  },
  col3:{
    fontFamily: 'Roboto',
    fontSize:'110%',
    color:'grey',
    overflow: 'visible'
  },
  col4:{
      overflow: 'visible',
      paddingTop:'3%',
      width:'100%'
  },
  paper:{
    width:'80%',
    marginLeft:'10%',
    marginTop:'2%',
    marginBottom:'2%',
    marginRight:'10%',
    overflow:'visible',
    overflowWrap:'break-word',
    backgroundColor:'f2f2f2'
  }
}
class IndividualQuestion extends React.Component {
  constructor(props) {
      super(props);
      this.state={
        like:this.props.likes,
        dislike:this.props.dislikes,
        time:new Date().toString(),
        disable:false,
        token:null,
        btnStatus:false,
        firstletter:'',
        answered_by:'',
        picture: this.props.picture,
        profileImg:true
      }
    };

    componentWillMount(){
      this.setState({token:token});
      if(token != null){
        this.setState({btnStatus:true});
      }

      if(this.props.picture != undefined) {
        this.setState({picture:this.props.picture});
      }

      if(this.props.picture == "profile.jpg"){
        this.setState({profileImg:false})
      }
    {/*}  var that = this;
      var qid = that.props.location.state.qid;
      console.log(qid);
      $.ajax({
      url:'/answer/'+qid,
      type:'GET',
      data:{},
      success:function(answers){
        console.log("answers:",answers);
      },
      error:function(err){
        console.log("error");
      }
    });*/}
      /*to get firstletter of user name*/
      var avatar = this.props.answered_by;
      var image = avatar.substring(0,1);
      this.setState({firstletter:image});
    }

    checkForLikeSuccessAlert() {
      this.props.toaster.success(
          'Liked successfully',
        '', {
          timeOut: 3000,
          extendedTimeOut: 3000
            }
      );
      }
      checkForLikeFailedAlert() {
          this.props.toaster.error(
            'Error while liking..!',
          '', {
            timeOut: 3000,
            extendedTimeOut: 3000
              }
        );
        }
like(){
  var that = this;
  var up=that.props.likes+1;
  var aid = this.props.answerid;
  that.setState({like:up,disable:true});
   $.ajax({
             url:'/answerLikes/'+aid,
             data:{user:cookies.get('emailId')},
             type:'POST',
             success:function(data)
             {
               that.checkForLikeSuccessAlert();
             },
             error:function(err)
             {
              that.checkForLikeFailedAlert();
             }


   });

}
checkForDisLikeSuccessAlert() {
    this.props.toaster.error(
      'DisLiked successfully',
    '', {
      timeOut: 3000,
      extendedTimeOut: 3000
        }
  );
}checkForDisLikeErrorAlert() {
      this.props.toaster.error(
        'Error while DisLiking ',
      '', {
        timeOut: 3000,
        extendedTimeOut: 3000
          }
    );
    }
dislike(){
  var that = this;
  var down=that.props.dislike+1;
  that.setState({dislike:down,disable:true});
  var aid = this.props.answerid;
  $.ajax({
            url:'/answerDislikes/'+aid,
            data:{user:cookies.get('emailId')},
            type:'POST',
            success:function(data)
            {
              that.checkForDisLikeSuccessAlert();
            },
            error:function(err)
            {
              that.checkForDisLikeErrorAlert();
            }


  });

}

render(){
  return(
    <div>
        <Paper  zDepth={1} style={styles.paper}>
        <Table style={{marginTop:'1%',marginBottom:'1%',}}>
          <TableBody displayRowCheckbox={false} style={{paddingTop:'5%'}}>
            <TableRow style={{height:'50%',width:'100%',height:'auto'}}>
              {/*}<TableRowColumn colSpan="2">
                <img className="inset" src={"../../images/"+this.state.picture}/>
              </TableRowColumn>*/}
              <TableRowColumn colSpan="1" style={{position:'relative'}}>
                {this.state.profileImg?<img className="inset" align="top" src={"../../images/"+this.state.picture} />:
                <Avatar
                  color={deepOrange300}
                  backgroundColor={purple500}
                  size={50}
                  style={{
                  textTransform:'capitalize',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  zIndex: '999',
                  marginBottom: '20%'
                }}
                >
                  {this.state.firstletter}
                </Avatar>}
              </TableRowColumn>
              <TableRowColumn colSpan="11" style={{wordWrap: 'break-word', whiteSpace: 'normal'}}>
                <p className="answer">{this.props.answer}</p>
              </TableRowColumn>
            </TableRow>
              <TableRow style={{height:'50%',float:'left',border:'0%',marginLeft:'180%'}}>
              {this.state.token && <TableRowColumn colSpan="1" style={styles.col2}>
                <IconButton tooltip="Thumbs Up" tooltipPosition='top-center' onClick={this.like.bind(this)}>
                  <Badge
                    badgeContent={this.state.like}
                    primary={true}
                  >
                    <i className="material-icons">thumb_up</i>
                  </Badge>
                </IconButton>
              </TableRowColumn>}
              {this.state.token && <TableRowColumn colSpan="1" style={styles.col1} >
                <IconButton tooltip="Thumbs Down" tooltipPosition='top-center'  onClick={this.dislike.bind(this)}>
                  <Badge
                    badgeContent={this.state.dislike}
                    primary={true}
                  >
                    <i className="material-icons">thumb_down</i>
                  </Badge>
                </IconButton>
            </TableRowColumn>}

            <TableRowColumn colSpan="9" style={styles.col3}>
                  <p style={{paddingTop:'1%'}}>Answered  <Moment fromNow>{(this.props.timestamp).toString()}</Moment>   by   </p>
                  <Chip style={{marginLeft:'30px'}}>
                    <Avatar size={32} color={grey50} backgroundColor={grey900}>
                    {this.state.firstletter}
                    </Avatar>
                    {this.props.answered_by}
                  </Chip>
                </TableRowColumn>

            </TableRow>
        </TableBody>
      </Table>
      </Paper>
    </div>
)};
};
export default IndividualQuestion;
