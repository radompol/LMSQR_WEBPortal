import React, { Component } from "react";

import Borrowers from "./Borrowers";

export class Borrower_ extends Component {
  constructor(props) {
    super(props);
    this.state = { props };
  }
  render() {
    return <Borrowers setLoggedIn={this.props.setLoggedIn} />;
  }
}

export default Borrower_;



