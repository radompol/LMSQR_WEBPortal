import { Button, Modal } from "react-bootstrap";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../Utils/Firebase_config";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Payments({ setLoggedIn }) {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [collectionList_, setcollectionList_] = useState([]);
  const [collectionList, setcollectionList] = useState([]);
  const [collectionListR, setcollectionListR] = useState([]);
  const [collectionListL, setcollectionListL] = useState([]);
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
  useEffect(() => {
    window.onpopstate = function (event) {
      // Redirect the user to a specific location
      navigate(window.localStorage.getItem("what_path"));
    };

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
    const q6 = query(
      collection(FIRESTORE_DB, "CollectionsList"),
      where("collectionStatus", "==", "Received")
    );
    const unsubscribe6 = onSnapshot(
      q6,
      (querySnapshot) => {
        //resolve(querySnapshot)
        let list = querySnapshot.docs.map((res) => {
          return { ...res.data(), id: res.id };
        });

        setcollectionListR(list);
      },
      () => {
        return unsubscribe6();
      },
      (err) => {
        console.log(err);
      }
    );
    const q7 = query(collection(FIRESTORE_DB, "CollectionsList"));
    const unsubscribe7 = onSnapshot(
      q7,
      (querySnapshot) => {
        //resolve(querySnapshot)
        let list = querySnapshot.docs.map((res) => {
          return { ...res.data(), id: res.id };
        });

        setcollectionListL(list);
      },
      () => {
        return unsubscribe7();
      },
      (err) => {
        console.log(err);
      }
    );
  }, []);
  const searchHandler = (text) => {
    try {
    } catch (err) {
      alert(err);
    }
  };
  function confirmReceive(id) {
    let answer = window.confirm("Are you sure to confirm this collection?");
    if (answer) {
      let updateRef = doc(FIRESTORE_DB, "CollectionsList", id);
      updateDoc(updateRef, {
        collectionStatus: "Received",
      });
      alert("Confirmed Successfully!");
    }
  }
  function confirmRemove(id) {
    let answer = window.confirm(
      "Are you sure to remove this duplicate collection?"
    );
    if (answer) {
      let updateRef = doc(FIRESTORE_DB, "CollectionsList", id);
      updateDoc(updateRef, {
        collectionStatus: "Removed",
      });
      alert("Removed Successfully!");
    }
  }
  function getTotalCollected(list, id) {
    let total = 0;
    list.forEach((element) => {
      if (element.loanID == id) {
        total =
          Number.parseFloat(total) + Number.parseFloat(element.amountCollected);
      }
    });
    // console.log(total);
    return Number.parseFloat(total).toFixed(2);
  }
  function to_pesos(amount) {
    return Number.parseFloat(amount).toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
    });
  }
  const [show, setShow] = useState(false);
  const [tempList, setTempList] = useState([]);
  const [genDetails, setGenDetails] = useState({
    dateFrom: "",
    dateTo: "",
  });
  function genReport(dateFrom, dateTo) {
    // setTempList(collectionListL);
    let listR = [];
    collectionListL.forEach((res) => {
      console.log(new Date(dateFrom));
      if (
        new Date(res.dateTimeAdded).setHours(0, 0, 0, 0) >=
          new Date(dateFrom).setHours(0, 0, 0, 0) &&
        new Date(res.dateTimeAdded).setHours(0, 0, 0, 0) <=
          new Date(dateTo).setHours(23, 59, 59, 999)
      ) {
        listR.push(res);
      }
    });
    console.log({ listR });

    setTempList(
      listR.sort(
        (a, b) => new Date(a.dateTimeAdded) - new Date(b.dateTimeAdded)
      )
    );
  }
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
    <>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="bg-primary" closeButton>
          <Modal.Title className="text-white">
            <i class="fa fa-file" aria-hidden="true"></i>
            Generate Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Date From </label>
          <input
            onChange={(evt) => {
              setGenDetails((prev) => ({
                ...prev,
                dateFrom: evt.target.value,
              }));
            }}
            type="date"
            className="form-control"
          />
          <label>Date To </label>
          <input
            onChange={(evt) => {
              setGenDetails((prev) => ({
                ...prev,
                dateTo: evt.target.value,
              }));
            }}
            type="date"
            className="form-control"
          />

          <div id="hhh" hidden>
            <h6 className="text-center">Payment Report</h6>

            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th scope="col">Date Applied</th>
                  <th scope="col">PID</th>
                  <th scope="col">Collector</th>
                  <th>Borrower</th>
                  <th>Loan Amount</th>

                  <th scope="col">Payment Amount</th>
                </tr>
              </thead>
              <tbody>
                {tempList.map((res, index) => {
                  return (
                    <tr key={index}>
                      <td>{res.dateTimeAdded}</td>
                      <td>{res.id}</td>
                      <td>
                        {res.collectorData.fname +
                          " " +
                          res.collectorData.lname}
                      </td>
                      <td>
                        {res.loanDetails.selectedCustomer.fname +
                          "" +
                          res.loanDetails.selectedCustomer.lname}
                      </td>
                      <td>{to_pesos(res.loanDetails.amountNumeric)}</td>

                      <td>{to_pesos(res.amountCollected)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setShow(false);
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              genReport(genDetails.dateFrom, genDetails.dateTo);
              print_now("hhh");
            }}
            size="sm"
            variant="primary"
          >
            {" "}
            <i class="fa fa-file" aria-hidden="true"></i> Generate Report
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="mx-2 mt-2">
        <div className="card">
          <div className="card-header">
            <b>PAYMENT LIST</b>
            <div className="float-end">
              <button
                onClick={() => setShow(true)}
                className="btn btn-sm btn-primary"
              >
                <i class="fa fa-file" aria-hidden="true"></i> Generate Report
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive table-bordered">
              <table class="table ">
                <thead className="table-light">
                  <tr>
                    <th scope="col">PID</th>
                    <th scope="col">Collector</th>
                    <th>Borrower</th>
                    <th>Loan Amount</th>
                    <th>Loan Balance</th>
                    <th scope="col">Payment Amount</th>
                    <th scope="col">Date Applied</th>
                    <th scope="col">
                      <i className="fa fa-cogs" aria-hidden="true"></i> Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collectionList.map((res) => {
                    return (
                      <tr>
                        <td>{res.id}</td>
                        <td>
                          {res.collectorData.fname +
                            " " +
                            res.collectorData.lname}
                        </td>
                        <td>
                          {res.loanDetails.selectedCustomer.fname +
                            "" +
                            res.loanDetails.selectedCustomer.lname}
                        </td>
                        <td>{to_pesos(res.loanDetails.amountNumeric)}</td>
                        <td className="text-danger">
                          <b>
                            {to_pesos(
                              Number.parseFloat(res.loanDetails.amountNumeric) -
                                getTotalCollected(collectionListR, res.loanID)
                            )}
                          </b>
                        </td>
                        <td>{to_pesos(res.amountCollected)}</td>
                        <td>{res.dateTimeAdded}</td>
                        <td>
                          <span
                            onClick={() => {
                              confirmReceive(res.id);
                            }}
                            style={{ cursor: "pointer" }}
                            className="badge bg-success"
                          >
                            <i class="fa fa-check px-1" aria-hidden="true"></i>
                            Receive
                          </span>
                          <>
                            {to_pesos(
                              Number.parseFloat(res.loanDetails.amountNumeric) -
                                getTotalCollected(collectionListR, res.loanID)
                            ) <= 0 ? (
                              <span
                                onClick={() => {
                                  confirmRemove(res.id);
                                }}
                                style={{ cursor: "pointer" }}
                                className="badge bg-danger"
                              >
                                <i class="fa fa-trash" aria-hidden="true"></i>
                                Remove
                              </span>
                            ) : null}
                          </>

                          {/* <span className="badge bg-danger mx-2">
                          <i
                            className="fa fa-window-close px-1"
                            aria-hidden="true"
                          ></i>
                          Decline
                        </span> */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Payments;
