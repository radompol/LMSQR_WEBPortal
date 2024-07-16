import { Col, Form, InputGroup, ListGroup } from "react-bootstrap";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../Utils/Firebase_config";
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";

function ClientPage({ setLoggedIn }) {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [list_, setList_] = useState([]);
  //const [list, setList] = useState([]);
  const [loanInfo, setLoanInfo] = useState({});
  const [show, setShow] = useState(false);
  const [isSelect, setIsSelect] = useState(false);
  const [isProceedToLoan, setIsProceedToLoan] = useState(false);
  const [isViewLoan, setIsViewLoan] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [borrowerlist, setBorrowerList] = useState([]);
  const [borrowerlist_, setBorrowerList_] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState({});
  const [collectionList, setcollectionList] = useState([]);
  const [collectionList_, setcollectionList_] = useState([]);
  const [collateralList, setCollateralList] = useState([]);
  useEffect(() => {
    const auth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setLoggedIn(true);
        const q2 = query(
          collection(FIRESTORE_DB, "LoansList"),
          where("selectedCustomer.email", "==", user.email)
        );
        const unsubscribe2 = onSnapshot(
          q2,
          (querySnapshot) => {
            //resolve(querySnapshot)
            let list = querySnapshot.docs.map((res) => {
              return res;
            });
            setList(list);
            setList_(list);
          },
          () => {
            return unsubscribe2();
          },
          (err) => {
            console.log(err);
          }
        );
        //navigate('/home')
      } else {
        setLoggedIn(false);
        navigate("/");
        console.log("no Account logged in");
      }
    });
    return auth;
  });
  function getTotalCollected(list) {
    let total = 0;
    list.forEach((element) => {
      total =
        Number.parseFloat(total) + Number.parseFloat(element.amountCollected);
    });
    // console.log(total);
    return Number.parseFloat(total).toFixed(2);
  }
  useEffect(() => {
    window.onpopstate = function (event) {
      // Redirect the user to a specific location
      navigate(window.localStorage.getItem("what_path"));
    };
    const q1 = query(
      collection(FIRESTORE_DB, "BorrowerList"),
      where("borrowerStatus", "==", "active")
    );
    const unsubscribe1 = onSnapshot(
      q1,
      (querySnapshot) => {
        //resolve(querySnapshot)
        let list = querySnapshot.docs.map((res) => {
          return res;
        });
        console.log(list);
        setBorrowerList(list);
        setBorrowerList_(list);
      },
      () => {
        return unsubscribe1();
      },
      (err) => {
        console.log(err);
      }
    );
    const q5 = query(collection(FIRESTORE_DB, "CollectionsList"));
    const unsubscribe5 = onSnapshot(
      q5,
      (querySnapshot) => {
        //resolve(querySnapshot)
        let list = querySnapshot.docs.map((res) => {
          return { ...res.data(), id: res.id };
        });
        console.log(list);
        setcollectionList(list);
        setcollectionList_(list);
      },
      () => {
        return unsubscribe5();
      },
      (err) => {
        console.log(err);
      }
    );
  }, []);
  function getTotalAmount(res) {
    let loanTerm = res.loanTerm ? res.loanTerm.split(" ")[0] : 0;
    loanTerm = Number.parseInt(loanTerm);
    let totalAmount = Number.parseFloat(res.amountNumeric);
    let interest = totalAmount * 0.03;
    totalAmount = totalAmount + interest;
    let savingsTotal = 65 * loanTerm;
    totalAmount = totalAmount + savingsTotal;
    return totalAmount;
  }
  function sendLoanReq() {
    if (
      loanInfo.selectedCustomer &&
      loanInfo.loanType &&
      loanInfo.amountNumeric &&
      loanInfo.amountNumeric > 0 &&
      loanInfo.loanType !== ""
    ) {
      addDoc(collection(FIRESTORE_DB, "LoansList"), {
        ...loanInfo,
        dateAdded: new Date().toString(),
        loanStatus: "active",
      });

      //setIsProceedToLoan(true);

      handleClose();
      alert("Loan Successfully Created!");
    } else {
      alert("Please fill all fields.");
    }
  }
  const getUserData = (list, id) => {
    var data = {};
    list.forEach((element) => {
      if (element.id == id) {
        data = element;
      }
    });
    return data.data();
  };
  const removeHandler = async (id, remarks_removed) => {
    const ref = doc(FIRESTORE_DB, "products", id);
    await updateDoc(ref, {
      status: "archived",
      remarks_removed,
    });
  };
  const approveHandler = async (id) => {
    const ref = doc(FIRESTORE_DB, "products", id);
    await updateDoc(ref, {
      status: "active",
    });
  };
  const filterHandler = (text) => {
    console.log(text);
    try {
      if (text !== "") {
        let temp = list.filter((res) => {
          console.log(res.sellerID === text);
          if (res.sellerID === text) {
            return res;
          }
        });
        if (temp.length <= 0) {
          alert("No products displayed by this store.");
          temp = list_;
        }
        setList(temp);
      } else {
        setList(list_);
      }
    } catch (err) {
      alert(err);
    }
  };
  const searchHandler = (text) => {
    try {
      if (text !== "") {
        setList(
          list.filter((res) => {
            if (
              res.productName.toUpperCase().match(text.toUpperCase()) ||
              res.productDescription.toUpperCase().match(text.toUpperCase())
            ) {
              return res;
            }
          })
        );
      } else {
        setList(list_);
      }
    } catch (err) {
      alert(err);
    }
  };
  function to_pesos(amount) {
    return Number.parseFloat(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
    });
  }

  return (
    <div className="mx-2 mt-2">
      <div className="card">
        <div className="card-header">
          <b>MY LOAN LIST</b>

          {/* <a onClick={handleShow} className="btn btn-primary float-end">
            <i className="fa fa-plus" aria-hidden="true"></i> Add Loan
            Information
          </a> */}
        </div>
        <div className="card-body">
          <div className="table-responsive table-bordered">
            <table class="table ">
              <thead className="table-light">
                <tr>
                  <th scope="col">LID</th>

                  {/* <th scope="col">Amount</th> */}

                  <th scope="col">Loan For</th>
                  <th>Date/Time Added</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <i className="fa fa-cogs" aria-hidden="true"></i> Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((res, index) => {
                  let totalAmount = getTotalAmount(res.data());

                  return (
                    <tr>
                      <td>{res.id}</td>

                      {/* <td>{to_pesos(totalAmount)}</td> */}
                      <td>{res.data().loanType}</td>
                      <td>{res.data().dateAdded}</td>
                      <td>
                        <span
                          className={
                            res.data().loanStatus === "active"
                              ? "badge bg-success text-white"
                              : "badge bg-danger text-white"
                          }
                        >
                          {res.data().loanStatus.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <i
                          onClick={() => {
                            setIsViewLoan(true);
                            console.log({ id: res.id, ...res.data() });
                            setSelectedLoan({ id: res.id, ...res.data() });
                          }}
                          style={{ cursor: "pointer" }}
                          class="fa fa-eye text-primary "
                          aria-hidden="true"
                        ></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal size={"lg"} show={isViewLoan} onHide={() => setIsViewLoan(false)}>
        <Modal.Header
          className={
            selectedLoan.loanStatus == "paid" ? "bg-danger" : "bg-success"
          }
        >
          <Modal.Title className={"text-white"}>Loan Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col d-flex justify-content-center">
              <QRCode
                size={256}
                style={{ height: "auto", width: 200 }}
                value={selectedLoan.id}
              />
            </div>

            <div className="col">
              <div>
                <p className="my-0">
                  Loan ID: <b>{selectedLoan.id}</b>
                </p>
                {/* <p className="my-0">
                  Borrower :{" "}
                  <b>
                    {selectedLoan.selectedCustomer
                      ? selectedLoan.selectedCustomer.fname +
                        " " +
                        selectedLoan.selectedCustomer.mname +
                        " " +
                        selectedLoan.selectedCustomer.lname
                      : ""}
                  </b>
                </p> */}
                <p className="my-0">
                  Loan Term : <b>{selectedLoan.loanTerm}</b>
                </p>
                <p className="my-0">
                  Weekly Payment: <b>{to_pesos(selectedLoan.weeklyPayment)}</b>
                </p>
                {/* <p className="my-0">
                  Amount : <b>{to_pesos(selectedLoan.amountNumeric)}</b>
                </p> */}
                {/* <p className="my-0">
                  In Words : <b>{selectedLoan.amountWords}</b>
                </p> */}
              </div>
              <div className="mt-2 mx-3">
                <p>LOAN BALANCE: </p>
                <span style={{ fontWeight: "bold", fontSize: 40 }}>
                  {to_pesos(
                    Number.parseFloat(getTotalAmount(selectedLoan)).toFixed(2) -
                      getTotalCollected(
                        collectionList.filter((res) => {
                          if (res.loanID === selectedLoan.id) {
                            return res;
                          }
                        })
                      )
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* //LISt of Collections */}
          <div className="mx-2 mt-2">
            <div className="card">
              <div className="card-header">
                <b>PAYMENT LIST</b>
              </div>
              <div className="card-body">
                <div className="table-responsive table-bordered">
                  <table class="table ">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">PID</th>
                        <th scope="col">Collector</th>

                        <th scope="col">Payment Amount</th>
                        <th scope="col">Date Applied</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionList
                        .filter((res) => {
                          if (res.loanID === selectedLoan.id) {
                            return res;
                          }
                        })
                        .map((res) => {
                          return (
                            <tr>
                              <td>{res.id}</td>
                              <td>
                                {res.collectorData.fname +
                                  " " +
                                  res.collectorData.lname}
                              </td>

                              <td>{to_pesos(res.amountCollected)}</td>
                              <td>{res.dateTimeAdded}</td>
                              <td>{res.collectionStatus.toUpperCase()}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsViewLoan(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header className="bg-primary">
          <Modal.Title className="text-white">
            {isProceedToLoan ? "Loan Info Created" : "Add Loan Info"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isProceedToLoan ? (
            <div className="row">
              <div className="col">
                <div
                  style={{
                    height: "auto",
                    maxWidth: 64,
                    width: "100%",
                  }}
                >
                  <QRCode
                    size={256}
                    style={{ height: "auto", width: 150 }}
                    value={"ID:123912421321"}
                  />
                </div>
              </div>
              <div className="col">
                <div>
                  <p className="my-0">
                    Loan ID: <b>1931023781231</b>
                  </p>
                  <p className="my-0">
                    Borrower : <b>Example user 1</b>
                  </p>
                  <p className="my-0">
                    Amount : <b>PHP 200.00</b>
                  </p>
                  <p className="my-0">
                    In Words : <b>Two Hundred Pesos</b>
                  </p>
                </div>
              </div>
            </div>
          ) : isSelect ? (
            <>
              <div className="row">
                <div className="col">
                  <button
                    onClick={() => {
                      setIsSelect(false);
                    }}
                    className="btn btn-danger form-control"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="d-flex m-2">
                    <input
                      placeholder="Search Borrower here..."
                      className="form-control"
                      type="text"
                    />
                    <i class="fa fa-search  p-2 border" aria-hidden="true"></i>
                  </div>
                </div>
              </div>

              <div
                style={{ maxHeight: "40vh", overflowY: "auto" }}
                className="table-responsive my-2"
              >
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <td>Borrower ID</td>
                      <td>Name</td>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowerlist.map((res, index) => {
                      return (
                        <tr
                          onClick={() => {
                            setLoanInfo((prev) => ({
                              ...prev,
                              selectedCustomer: res.data(),
                              selectedCustomerID: res.id,
                            }));
                            setIsSelect(false);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{res.id}</td>
                          <td>
                            {res.data().lname +
                              ", " +
                              res.data().fname +
                              " " +
                              res.data().mname}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="row">
                <button
                  onClick={() => {
                    setIsSelect(true);
                  }}
                  className="btn btn-primary"
                >
                  Select Borrower
                </button>
                <div className="col">
                  <label>Borrower Name: </label>
                  <p style={{ fontWeight: "bold" }}>
                    {loanInfo.selectedCustomer
                      ? loanInfo.selectedCustomer.fname +
                        " " +
                        loanInfo.selectedCustomer.mname +
                        " " +
                        loanInfo.selectedCustomer.lname
                      : " No Borrower Selected"}
                  </p>
                </div>
                <div className="col">
                  <label>Loan Type</label>
                  <Form.Select
                    onChange={(evt) => {
                      setLoanInfo((prev) => ({
                        ...prev,
                        loanType: evt.target.value,
                      }));
                    }}
                  >
                    <option>No selected</option>
                    <option>Educational</option>
                    <option>Personal</option>
                  </Form.Select>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <table className="table ">
                    <thead>
                      <tr className="border-0">
                        <th colSpan={3}>Loan Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <label>Amount</label>
                          <input
                            onChange={(evt) => {
                              setLoanInfo((prev) => ({
                                ...prev,
                                amountNumeric: evt.target.value,
                              }));
                            }}
                            value={loanInfo.amountNumeric}
                            className="form-control"
                            type={"number"}
                            placeholder={"Enter Amount"}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label>Amount in Words</label>
                          <input
                            onChange={(evt) => {
                              setLoanInfo((prev) => ({
                                ...prev,
                                amountWords: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type={"text"}
                            value={loanInfo.amountWords}
                            placeholder={"Enter Amount"}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                  <Form.Control
                    placeholder="Username"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                  />
                </InputGroup>

                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Recipient's username"
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                  />
                  <InputGroup.Text id="basic-addon2">
                    @example.com
                  </InputGroup.Text>
                </InputGroup>
              </div>
            </>
          )}
        </Modal.Body>
        {isProceedToLoan ? (
          <>
            <Modal.Footer>
              <Button
                variant="primary"
                onClick={() => {
                  //
                  setIsProceedToLoan(false);
                  setLoanInfo({});
                  //sendLoanReq();
                }}
              >
                Done
              </Button>
            </Modal.Footer>
          </>
        ) : !isSelect ? (
          <>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  sendLoanReq();
                }}
              >
                Create Loan Info
              </Button>
            </Modal.Footer>
          </>
        ) : null}
      </Modal>
    </div>
  );
}

export default ClientPage;
