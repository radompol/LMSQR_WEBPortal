import React, { useDebugValue, useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import Container from "react-bootstrap/Container";
import { FIRESTORE_DB } from "../Utils/Firebase_config";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Navbar from "react-bootstrap/Navbar";
import textLogo from "../assets/Logo_main.jpg";
import { useNavigate } from "react-router-dom";

function Navigation({ setLoggedIn, routes_link, setLoggedIn_ }) {
  const navigate = useNavigate();
  const [type_, setType_] = useState(0);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const auth = getAuth();
    const auth_in = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        // setLoggedIn(window.localStorage.getItem("loggedIn"));
        // setLoggedIn_(false);
        //setType_(window.localStorage.getItem("access_type"));
        // ...

        const q5 = query(
          collection(FIRESTORE_DB, "CollectionsList"),
          where("collectionStatus", "==", "pending")
        );
        const unsubscribe5 = onSnapshot(
          q5,
          (querySnapshot) => {
            //resolve(querySnapshot)
            let list = querySnapshot.docs.map((res) => {
              return { ...res.data(), id: res.id };
            });
            console.log(list);
            setTotal(list.length);
          },
          () => {
            return unsubscribe5();
          },
          (err) => {
            console.log(err);
          }
        );

        setType_(window.localStorage.getItem("access_type"));
      } else {
        navigate("/");
        // User is signed out
        // ...
      }
    });
    return auth_in;
  }, []);
  const logout = () => {
    getAuth().signOut();

    window.localStorage.setItem("loggedIn", false);
    setLoggedIn(false);
    setLoggedIn_(false);
  };
  return (
    <Navbar bg="white border-bottom" expand="lg">
      <Navbar.Brand className="mx-2">
        <img className="mx-4" src={textLogo} style={{ width: 50 }} />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" className="mx-2" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto mx-4">
          {routes_link
            .filter((item) => {
              if (item.path !== "/") {
                return item;
              }
            })
            .map((item) => {
              console.log(type_);
              if (Number.parseInt(type_) == Number.parseInt(item.type)) {
                return (
                  <>
                    <Nav.Link onClick={() => navigate(item.path)}>
                      {item.icon} {item.name}
                      {item.name === "Payments" ? (
                        <span className="badge bg-danger">{total}</span>
                      ) : null}
                    </Nav.Link>
                    <hr />
                  </>
                );
              }
            })}
        </Nav>
        <Nav className=" mx-4">
          <NavDropdown
            align={"end"}
            className="dropdown-menu-end"
            title={<i class="fa fa-user" aria-hidden="true"></i>}
            id="basic-nav-dropdown"
          >
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={logout}>Signout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
