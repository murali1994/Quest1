import React from 'react';
import '../ReactLandingpage/reactlandingpage.css';
import './landingpage.css';
import Navbar from './navbar.js';
import {Link,Redirect} from 'react-router-dom';

class DisplayAnswer extends React.Component {

  constructor(props) {
      super(props);
    };


render(){
  return(
    <div >
      <div className="navs">
          <Navbar style={{marginTop:'-15%'}}/>
      </div>
      <div className="tabs1">
          {this.props.location.state.answers}
      </div>
      <div className="container-fluid" >
        <div className="footer-block footer1" style={{backgroundColor:'#00BCD4',padding:'2%'}}>
          <div className="container copyRights">
            <ul className="list-inline bullets">
              <p class="pull-right">Copyright 2017 © Quest Pvt. Ltd.</p>
            </ul>
          </div>
        </div>
      </div>
    </div>

)};
};
export default DisplayAnswer;
