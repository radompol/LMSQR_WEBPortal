import { Button, Form, InputGroup, Modal, Table } from "react-bootstrap";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../Utils/Firebase_config";
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { cities, provinces, regions } from "philippines";

import QRCode from "react-qr-code";
import barangay from "barangay";
import { onAuthStateChanged } from "firebase/auth";
import { toWords } from "number-to-words";
import { useNavigate } from "react-router-dom";

function Loans({ setLoggedIn }) {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [list_, setList_] = useState([]);
  //const [list, setList] = useState([]);number-to-words
  const [loanInfo, setLoanInfo] = useState({
    amountNumeric: 0,
    interest: 0,
    weeklyPayment: 0,
    loanTerm: "",
    amountWords: "",
    selectedCustomer: {
      creditLimit: 0,
    },
    selectedCustomerID: "",
  });
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
  const [collateral, setCollateral] = useState("");
  const [collateralURL, setCollateralURl] = useState("");
  const [selectSettings, setSelectSetting] = useState({
    regions: "",
    province: "",
    city: "",
    barangay: "",
  });
  const [regions, setRegions] = useState([]);
  const [province, setProvince] = useState([]);
  const [city, setCity] = useState([]);
  const [barangay_, setBarangay] = useState([]);
  const removeArrayItem = (index) => {
    return collateralList.filter((item, index_) => {
      if (index_ !== index) {
        return item;
      }
    });
  };
  useEffect(() => {
    const auth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setLoggedIn(true);

        //navigate('/home')
      } else {
        setLoggedIn(false);
        navigate("/");
        console.log("no Account logged in");
      }
    });
    return auth;
  });
  function getCurrentCredit(list, id) {
    let total = 0;
    let new_List = list.filter((item, index) => {
      if (item.data().selectedCustomerID === id) {
        return item;
      }
    });
    new_List.forEach((item, index) => {
      total = total + Number.parseFloat(item.data().amountNumeric);
    });
    return total;
  }
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
  function fullAddress(street, barangay, municipality, province, zipcode) {
    return (
      street +
      " " +
      barangay +
      " " +
      municipality +
      " " +
      province +
      " " +
      zipcode
    );
  }
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
    const q2 = query(collection(FIRESTORE_DB, "LoansList"));
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

    //  console.log("These are the reiggions:", regions);
    setRegions(barangay());
    console.log(
      "These are provinces:",
      barangay("REGION X - NORTHERN MINDANAO", "BUKIDNON", "MANOLO FORTICH")
    );
    // console.log("These are the reiggions:", cities);
  }, []);
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
        collateralList,
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
  function to_pesos(amount) {
    return Number.parseFloat(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
    });
  }
  const searchHandler = (text) => {
    try {
      if (text !== "") {
        setBorrowerList(
          borrowerlist.filter((res) => {
            if (
              res.data().fname.toLowerCase().match(text.toLowerCase()) ||
              res.data().lname.toLowerCase().match(text.toLowerCase()) ||
              res.data().mname.toLowerCase().match(text.toLowerCase())
            ) {
              return res;
            }
          })
        );
      } else {
        setBorrowerList(borrowerlist_);
      }
    } catch (err) {
      alert(err);
    }
  };
  // const divRef = useRef(null);
  function print_now(div) {
    let my_window = window.open(
      "",
      "mywindow1",
      "status=1,width=1080,height=1256"
    );

    my_window.document.write("<html>");
    my_window.document.write("<head>");
    my_window.document.write(
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"/>'
    );
    my_window.document.write("</head>");
    my_window.document.write("<body>");
    my_window.document.write(document.getElementById(div).innerHTML);
    my_window.document.write("</body>");

    my_window.document.write("</html>");
  }
  return (
    <div className="mx-2 mt-2">
      <div className="card">
        <div className="card-header">
          <b> LOAN LIST</b>

          <a onClick={handleShow} className="btn btn-primary float-end">
            <i className="fa fa-plus" aria-hidden="true"></i> Add Loan
            Information
          </a>
        </div>
        <div className="card-body">
          <label>Area Filter</label>
          <div className="d-flex my-2">
            <select
              onChange={(evt) => {
                setSelectSetting((prev) => ({
                  ...prev,
                  regions: evt.target.value,
                }));
                setProvince(barangay(evt.target.value));
              }}
              className="form-select"
            >
              {regions.map((item, index) => {
                return <option key={index}>{item}</option>;
              })}
            </select>
            <select
              onChange={(evt) => {
                if (evt.target.value !== "") {
                  setSelectSetting((prev) => ({
                    ...prev,
                    province: evt.target.value,
                  }));
                  setCity(barangay(selectSettings.regions, evt.target.value));
                }
              }}
              className="form-select"
            >
              <option value="">Select Province Here</option>
              {province.map((item, index) => {
                return <option key={index}>{item}</option>;
              })}
            </select>
            <select
              onChange={(evt) => {
                setSelectSetting((prev) => ({
                  ...prev,
                  city: evt.target.value,
                }));
                setBarangay(
                  barangay(
                    selectSettings.regions,
                    selectSettings.province,
                    evt.target.value
                  )
                );
              }}
              className="form-select"
            >
              {city.map((item, index) => {
                return <option key={index}>{item}</option>;
              })}
            </select>
            <select
              onChange={(evt) => {
                setSelectSetting((prev) => ({
                  ...prev,
                  barangay: evt.target.value,
                }));
              }}
              className="form-select"
            >
              <option value={"ALL"}>All</option>
              {barangay_.map((item, index) => {
                return <option key={index}>{item}</option>;
              })}
            </select>
            <button
              onClick={() => {
                if (selectSettings.barangay === "ALL") {
                  setList(list_);
                } else {
                  setList(
                    list_.filter((res) => {
                      if (
                        res.data().selectedCustomer.barangay.toLowerCase() ===
                        selectSettings.barangay.toLowerCase()
                      ) {
                        return res;
                      }
                    })
                  );
                }
              }}
              className="form-control btn btn-primary"
            >
              Filter
            </button>
          </div>
          <div className="table-responsive table-bordered">
            <table class="table ">
              <thead className="table-light">
                <tr>
                  <th scope="col">LID</th>
                  <th scope="col">Borrower Name</th>
                  <th>Address</th>
                  <th scope="col">Amount</th>

                  <th scope="col">Loan For</th>
                  <th scope="col">Date Created</th>
                  <th scope="col">Status</th>

                  <th scope="col">
                    <i className="fa fa-cogs" aria-hidden="true"></i> Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((res, index) => {
                  return (
                    <tr>
                      <td>{res.id}</td>
                      <td>
                        {res.data().selectedCustomer.lname +
                          ", " +
                          res.data().selectedCustomer.fname +
                          " " +
                          res.data().selectedCustomer.mname}
                      </td>
                      <td>
                        {fullAddress(
                          res.data().selectedCustomer.street,
                          res.data().selectedCustomer.barangay,
                          res.data().selectedCustomer.municipal,
                          res.data().selectedCustomer.province,
                          res.data().selectedCustomer.zipcode
                        )}
                      </td>
                      <td>{to_pesos(getTotalAmount(res.data()))}</td>
                      <td>{res.data().loanType}</td>
                      <td>
                        {new Date(res.data().dateAdded).toLocaleString()}
                      </td>{" "}
                      <td>
                        <span
                          className={
                            res.data().loanStatus === "active"
                              ? "badge bg-success text-white"
                              : "badge bg-danger text-white"
                          }
                        >
                          {res.data().loanStatus
                            ? res.data().loanStatus.toUpperCase()
                            : ""}
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
          <button
            className="btn btn-primary"
            onClick={() => {
              print_now("div_print");
            }}
          >
            <i class="fa fa-print" aria-hidden="true"></i>
            Print
          </button>
          <div id="div_print">
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
                  <p className="my-0">
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
                  </p>
                  <p className="my-0">
                    Amount : <b>{to_pesos(selectedLoan.amountNumeric)}</b>
                  </p>
                  <p className="my-0">
                    In Words : <b>{selectedLoan.amountWords}</b>
                  </p>
                  <p className="my-0">
                    Loan Term :{" "}
                    <b>{selectedLoan.loanTerm ? selectedLoan.loanTerm : ""}</b>
                  </p>
                  <p className="my-0">
                    Interest :{" "}
                    <b>
                      {selectedLoan.interest
                        ? selectedLoan.interest * 100 + "%"
                        : ""}
                    </b>
                  </p>
                  <p className="my-0">
                    Weekly Payment :{" "}
                    <b>
                      {selectedLoan.weeklyPayment
                        ? to_pesos(selectedLoan.weeklyPayment)
                        : ""}
                    </b>
                  </p>
                </div>

                <div className="mt-2 mx-3">
                  <p>LOAN BALANCE: </p>
                  <span style={{ fontWeight: "bold", fontSize: 40 }}>
                    {to_pesos(
                      Number.parseFloat(getTotalAmount(selectedLoan)).toFixed(
                        2
                      ) -
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
                                <td>
                                  {res.collectionStatus
                                    ? res.collectionStatus.toUpperCase()
                                    : ""}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="mt-2 ">
                <label>COLLATERAL</label>
                <Table>
                  <thead className="table-primary">
                    <tr>
                      <td>ID</td>
                      <td>Collateral</td>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLoan.collateralList
                      ? selectedLoan.collateralList.map((res, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <a target="blank_" href={res.collateralURL}>
                                  {res.collateral}
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      : null}
                  </tbody>
                </Table>
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

      <Modal backdrop={"static"} show={show} onHide={handleClose}>
        <Modal.Header className="bg-primary">
          <Modal.Title className="text-white">
            {isProceedToLoan ? "Loan Info Created" : "Add Loan Info"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            id="thisSentForm"
            onSubmit={(evt) => {
              evt.preventDefault();
              if (
                Number.parseFloat(loanInfo.amountNumeric) >
                Number.parseFloat(loanInfo.selectedCustomer.creditLimit)
              ) {
                alert("The loan amount is greater than the credit limit.");
              } else {
                sendLoanReq();
              }
            }}
          >
            {isSelect ? (
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
                        onKeyDown={(evt) => {
                          //console.log(evt.target.value);
                          searchHandler(evt.target.value);
                        }}
                        placeholder="Search Borrower here..."
                        className="form-control"
                        type="text"
                      />
                      <i
                        class="fa fa-search  p-2 border"
                        aria-hidden="true"
                      ></i>
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
                        <td hidden>Borrower ID</td>
                        <td>Credit Limit</td>
                        <td>Current Credit</td>
                        <td>Name</td>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowerlist.map((res, index) => {
                        let total = getCurrentCredit(list, res.id);

                        return (
                          <tr
                            onClick={() => {
                              setLoanInfo((prev) => ({
                                ...prev,
                                selectedCustomer: res.data(),
                                selectedCustomerID: res.id,
                                amountNumeric: 0,
                                amountWords: "",
                              }));
                              setIsSelect(false);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td hidden> {res.id}</td>
                            <td>
                              {to_pesos(
                                res.data().creditLimit
                                  ? res.data().creditLimit
                                  : 0
                              )}
                            </td>
                            <td>{to_pesos(total)}</td>
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
                    type="button"
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
                  <div className="row ">
                    <div className="col">
                      <label>Current Credits</label>
                      <p style={{ fontWeight: "bold" }}>
                        {to_pesos(
                          getCurrentCredit(list, loanInfo.selectedCustomerID)
                        )}
                      </p>
                    </div>
                    <div className="col">
                      <label>Credit Limit</label>
                      <p style={{ fontWeight: "bold" }}>
                        {to_pesos(loanInfo.selectedCustomer.creditLimit)}
                      </p>
                    </div>
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
                      required
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
                            {getCurrentCredit(
                              list,
                              loanInfo.selectedCustomerID
                            ) >= loanInfo.selectedCustomer.creditLimit ||
                            Number.parseFloat(loanInfo.amountNumeric) >
                              Number.parseFloat(
                                loanInfo.selectedCustomer.creditLimit
                              ) ? (
                              <div>
                                <p
                                  style={{ fontSize: "xx-small" }}
                                  className="p-2 text-white  bg-danger"
                                >
                                  The customer has consumed the credit limit
                                  allocated
                                </p>
                              </div>
                            ) : null}

                            <label>Amount</label>
                            <input
                              disabled={
                                getCurrentCredit(
                                  list,
                                  loanInfo.selectedCustomerID
                                ) >= loanInfo.selectedCustomer.creditLimit
                              }
                              onChange={(evt) => {
                                let amount = Number.parseFloat(
                                  evt.target.value
                                );

                                let words = toWords(isNaN(amount) ? 0 : amount);
                                setLoanInfo((prev) => ({
                                  ...prev,
                                  amountNumeric: evt.target.value,
                                  amountWords: words,
                                }));
                              }}
                              value={loanInfo.amountNumeric}
                              className="form-control"
                              type={"number"}
                              placeholder={"Enter Amount"}
                              required
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <label>Amount in Words</label>
                            <input
                              className="form-control"
                              type={"text"}
                              value={loanInfo.amountWords.toUpperCase()}
                              placeholder={"Enter Amount"}
                              disabled
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <hr />
                <label>
                  <b>Computation</b>
                </label>
                <div className="row">
                  <div className="col">
                    <label>Loan Term</label>
                    <select
                      onChange={(evt) => {
                        let interest = 0.03;
                        let amount_interest =
                          Number.parseFloat(loanInfo.amountNumeric) * interest;
                        let loanTerm = evt.target.value;
                        let savings = 65;
                        let savings_loanTerm =
                          savings * Number.parseInt(loanTerm.split(" ")[0]);
                        let totalAmount =
                          Number.parseFloat(loanInfo.amountNumeric) +
                          amount_interest +
                          savings_loanTerm;
                        let weeklyPayment =
                          totalAmount / Number.parseInt(loanTerm.split(" ")[0]);
                        weeklyPayment = weeklyPayment;
                        setLoanInfo((prev) => ({
                          ...prev,
                          loanTerm,
                          interest,
                          weeklyPayment,
                        }));
                      }}
                      value={loanInfo.loanTerm}
                      className="form-select"
                      required
                    >
                      <option>Select Here</option>
                      <option>12 Weeks</option>
                      <option>24 Weeks</option>
                      <option>36 Weeks</option>
                      <option>48 Weeks</option>
                    </select>
                    <div className="row">
                      <div className="col">
                        <label>Interest</label>
                        <input
                          onChange={(evt) => {
                            if (Number.parseFloat(evt.target.value) >= 0) {
                              setLoanInfo((prev) => ({
                                ...prev,
                                interest: evt.target.value,
                              }));
                            } else {
                              setLoanInfo((prev) => ({
                                ...prev,
                                interest: 0,
                              }));
                            }
                          }}
                          value={loanInfo.interest}
                          className="form-control"
                          placeholder="Enter Weekly"
                          type="number"
                          disabled
                        />
                      </div>
                      <div className="col">
                        <label>Weekly Payment</label>
                        <input
                          onChange={(evt) => {
                            if (Number.parseFloat(evt.target.value) >= 0) {
                              setLoanInfo((prev) => ({
                                ...prev,
                                weeklyPayment: evt.target.value,
                              }));
                            } else {
                              setLoanInfo((prev) => ({
                                ...prev,
                                weeklyPayment: 0,
                              }));
                            }
                          }}
                          value={loanInfo.weeklyPayment}
                          className="form-control"
                          placeholder="Enter Weekly"
                          type="number"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-2">
              <label>Collateral</label>
              <InputGroup className="mb-3">
                <Form.Control
                  onChange={(evt) => {
                    let word = evt.target.value;
                    if (word) {
                      setCollateral(word);
                    } else {
                      console.log("Invalid Input");
                    }
                  }}
                  placeholder="Enter Collateral"
                />
                <Form.Control
                  onChange={(evt) => {
                    let word = evt.target.value;
                    if (word) {
                      setCollateralURl(word);
                    } else {
                      console.log("Invalid Input");
                    }
                  }}
                  placeholder="Enter Document URL"
                />
                <Button
                  onClick={() => {
                    setCollateralList((prev) => [
                      ...prev,
                      { collateral, collateralURL },
                    ]);
                  }}
                >
                  + Add
                </Button>
              </InputGroup>

              <Table>
                <col width={"10%"} />
                <col width={"10%"} />
                <col width={"80%"} />
                <thead>
                  <tr>
                    <th>
                      <i className="fa fa-cogs"></i> Actions
                    </th>
                    <th>ID</th>
                    <th>Collateral</th>
                  </tr>
                </thead>
                <tbody>
                  {collateralList.map((res, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <i
                            onClick={() => {
                              setCollateralList(removeArrayItem(index));
                            }}
                            className="fa fa-trash text-danger pointer"
                          ></i>
                        </td>
                        <td>{index + 1}</td>
                        <td>
                          <a target="blank_" href={res.collateralURL}>
                            {res.collateral}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </form>
        </Modal.Body>
        {isProceedToLoan ? (
          <>
            <Modal.Footer>
              <Button variant="primary" type="submit" form="thisSentForm">
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
              <Button variant="primary" type="submit" form="thisSentForm">
                Create Loan Info
              </Button>
            </Modal.Footer>
          </>
        ) : null}
      </Modal>
    </div>
  );
}

export default Loans;
