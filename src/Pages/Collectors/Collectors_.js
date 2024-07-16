import React, { Component } from "react";

import Collectors from "./Collectors";

export class Collectors_ extends Component {
  constructor(props) {
    super(props);
    this.state = { props };
  }
  render() {
    return <Collectors setLoggedIn={this.props.setLoggedIn} />;
  }
}

export default Collectors_;
