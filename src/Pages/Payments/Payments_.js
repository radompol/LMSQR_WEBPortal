import React, { Component } from "react";

import Payments from "./Payments";

export class Payments_ extends Component {
  constructor(props) {
    super(props);
    this.state = { props };
  }

  render() {
    return <Payments setLoggedIn={this.props.setLoggedIn} />;
  }
}

export default Payments_;
