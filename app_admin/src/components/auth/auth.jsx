var React = require('react')
  , SignIn = require('./sign-in')
  , SignUp = require('./sign-up')
  , Socials = require('./socials');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      title: 'Sign In',
      create_account: false
    };
  },
  changeOption: function() {
    if(this.state.create_account) {
      this.setState({title: 'Sign In', create_account: false});
    } else {
      this.setState({title: 'Sign Up', create_account: true});
    }
  },
  render: function() {
    return (
      <div className="panel panel-default sigin-panel">
        <div className="panel-heading">
          <h3 className="panel-title">{this.state.title}</h3>
        </div>
        <div className="panel-body">
          {this.renderOption()}
          <hr />
          <Socials />
        </div>
      </div>
    );
  },
  renderOption: function() {
    if(!this.state.create_account) {
      return (<div>
        <SignIn />
        <a onClick={this.changeOption}>Create an account</a>
      </div>);
    } else {
      return (<div>
        <SignUp />
        <a onClick={this.changeOption}>Already have an account?</a>
      </div>);
    }
  }
});
