import React, { Component } from "react";

import Loans from "./Loans";

export class Loans_ extends Component {
  constructor(props) {
    super(props);
    this.state = { props };
  }
  render() {
    return <Loans setLoggedIn={this.props.setLoggedIn} />;
  }
}

export default Loans_;
