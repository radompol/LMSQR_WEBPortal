import { FIREBASE_AUTH, FIRESTORE_DB } from "../../Utils/Firebase_config";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  fetchSignInMethodsForEmail,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

import Logo from "../../assets/Logo_main.jpg";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";

function Login({ setLoggedIn, setLoggedIn_ }) {
  const navigate = useNavigate();
  const [setter, setSetter] = useState(false);
  const [isPass, setIsPass] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const auth = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        console.log("user is logged in");
        navigate(window.localStorage.getItem("what_path"));
        setSetter(false);
      } else {
        setSetter(true);
        console.log("no Account logged in");
      }
    });
    return auth;
  }, []);
  const checkFirstIfAccountExist = async () => {
    let userCount = await fetchSignInMethodsForEmail(
      FIREBASE_AUTH,
      userDetails.email
    );
    console.log(userCount.length);
    if (userCount.length > 0) {
      sendPasswordResetEmail(FIREBASE_AUTH, userDetails.email);
      alert("Reset password link successfully sent to your email.");
      setIsPass(false);
    } else {
      alert("Account Does not exists.");
    }
  };
  const handleSignIn = async (userDetails) => {
    signInWithEmailAndPassword(
      getAuth(),
      userDetails.email,
      userDetails.password
    )
      .then((user) => {
        console.log(user);
        //ADMIN
        if (user) {
          if (
            userDetails.email
              .toLowerCase()
              .match("loanmanagementsystemwithqrcode@gmail.com".toLowerCase())
          ) {
            window.localStorage.setItem("access_type", 0);
            window.localStorage.setItem("what_path", "/home");
            navigate("/home");
            swal("Login Successfully!", "Welcome Admin", "success");
          } else {
            window.localStorage.setItem("access_type", 1);
            window.localStorage.setItem("what_path", "/borrower");
            navigate("/borrower");
            swal(
              "Login Successfully!",
              "Welcome to Borrower's Profile",
              "success"
            );
          }
          setLoggedIn_(false);
          setLoggedIn(true);
        } else {
          // alert("Email and password does not match.");
        }
      })
      .catch((err) => {
        window.localStorage.setItem("loggedIn", "");
        alert("Email and password does not match.");
        console.log(err);
      });
  };
  if (setter) {
    if (isPass) {
      return (
        <div className="Auth-form-container">
          <div className="Auth-form">
            <div className={"Auth-form-content"}>
              <p
                onClick={() => {
                  setIsPass(false);
                }}
                className="text-primary pointer "
              >
                <i className="fa fa-arrow-left"></i> Back to Login
              </p>
              <div class="mb-3">
                <h4 className="m-0">Forgot Password</h4>
                <label for="" class="form-label">
                  Please enter email to send change password link.
                </label>
                <input
                  type="email"
                  class="form-control"
                  name=""
                  id=""
                  aria-describedby="emailHelpId"
                  placeholder="example@email.com"
                  onChange={(evt) => {
                    setUserDetails((prev) => ({
                      ...prev,
                      email: evt.target.value,
                    }));
                  }}
                />
                <button
                  class="btn btn-primary  form-control my-2"
                  onClick={() => {
                    checkFirstIfAccountExist();
                  }}
                >
                  Send Password Reset Link
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="Auth-form-container">
          <div className="Auth-form">
            <div className={"Auth-form-content"}>
              <img className="mx-4" src={Logo} style={{ width: 300 }} />

              <div class="mb-3">
                <label for="" class="form-label">
                  Email
                </label>
                <input
                  type="email"
                  class="form-control"
                  name=""
                  id=""
                  aria-describedby="emailHelpId"
                  placeholder="example@email.com"
                  onChange={(evt) => {
                    setUserDetails((prev) => ({
                      ...prev,
                      email: evt.target.value,
                    }));
                  }}
                />
                <div class="mb-3">
                  <label for="" class="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    name=""
                    id=""
                    onChange={(evt) => {
                      setUserDetails((prev) => ({
                        ...prev,
                        password: evt.target.value,
                      }));
                    }}
                    security={true}
                    placeholder=""
                  />
                  <button
                    class="btn btn-primary  form-control my-2"
                    onClick={() => {
                      handleSignIn(userDetails);
                    }}
                  >
                    Login
                  </button>
                  <div>
                    <p
                      onClick={() => {
                        setIsPass(true);
                      }}
                      className="m-0 p-0 text-center text-primary pointer"
                    >
                      Forgot password?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Login;
