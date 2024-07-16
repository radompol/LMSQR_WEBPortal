import React, { Component } from "react";

import Home from "./Home";

export class Home_ extends Component {
  constructor(props) {
    super(props);
    this.state = { props };
  }
  render() {
    return <Home setLoggedIn={this.props.setLoggedIn} />;
  }
}

export default Home_;
