import React, { Component } from "react";

import ClientPage from "./ClientPage";

export default class ClientPage_ extends Component {
  constructor(props) {
    super(props);
    this.state = { props };
  }
  render() {
    return <ClientPage setLoggedIn={this.props.setLoggedIn} />;
  }
}
