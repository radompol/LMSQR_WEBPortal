import { Col, Form, InputGroup, ListGroup, Table } from "react-bootstrap";
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
  sendEmailVerification,
} from "firebase/auth";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import barangay from "barangay";
import { useNavigate } from "react-router-dom";

function Borrowers({ setLoggedIn }) {
  const navigate = useNavigate();
  const [borrowerInfo, setBorrowerInfo] = useState({
    borrowerStatus: "active",
  });
  const [borrowerInfoView, setBorrowerInfoView] = useState({
    borrowerStatus: "active",
    creditLimit: 0,
  });
  const [sellerList, setSellerList] = useState([]);
  const [sellerList_, setSellerList_] = useState([]);
  const [show, setShow] = useState(false);
  const [show_, setShow_] = useState(false);
  const [borrowerList, setBorrowerList] = useState([]);
  const [borrowerList_, setBorrowerList_] = useState([]);
  const [selectedID, setSelectedID] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [requirementsList, setRequirementsList] = useState([]);
  const [requirementsURL, setRequirementsURL] = useState([]);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleClose_ = () => setShow_(false);
  const handleShow_ = () => setShow_(true);
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
  useEffect(() => {
    const auth = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setLoggedIn(true);
        //navigate('/home')
        console.log(
          "These are provinces:",
          barangay("REGION X - NORTHERN MINDANAO", "BUKIDNON", "MANOLO FORTICH")
        );

        setRegions(barangay());
      } else {
        setLoggedIn(false);
        navigate("/");
        console.log("no Account logged in");
      }
    });
    return auth;
  }, []);
  const removeArrayItem = (index) => {
    return requirementsList.filter((item, index_) => {
      if (index_ !== index) {
        return item;
      }
    });
  };
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
        //console.log(list);
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
  }, []);
  const searchHandler = (text) => {
    try {
      if (text !== "") {
        let temp = sellerList.filter((res) => {
          if (
            res.data().storename.toUpperCase().match(text.toUpperCase()) ||
            res.data().email.toUpperCase().match(text.toUpperCase())
          ) {
            return res;
          }
        });
        if (temp <= 0) {
          temp = sellerList_;
        }
        setSellerList(temp);
      } else {
        setSellerList(sellerList_);
      }
    } catch (err) {
      alert(err);
    }
  };
  function updateNewBorrower(id) {
    ///console.log(borrowerInfo);
    let answer = window.confirm("Are you sure to update this information?");
    if (answer) {
      setDoc(doc(FIRESTORE_DB, "BorrowerList", id), borrowerInfoView);
      handleClose_();
      alert("Updated Successfully!");
    }
  }
  function insertNewBorrower() {
    console.log(borrowerInfo);
    createUserWithEmailAndPassword(
      getAuth(),
      borrowerInfo.email,
      borrowerInfo.password
    )
      .then((result) => {
        addDoc(collection(FIRESTORE_DB, "BorrowerList"), {
          ...borrowerInfo,
          requirementsList,
        });
        sendEmailVerification(getAuth().currentUser);
        alert("Added Successfully!");
        setShow(false);
      })
      .catch((err) => {
        alert(err);
      });
  }
  function fullName(fname, mname, lname) {
    return fname + " " + mname + " " + lname;
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
  return (
    <div className="mx-2 mt-2">
      <div className="card">
        <div className="card-header">
          <b>
            <i class="fa fa-list" aria-hidden="true"></i> BORROWER LIST
          </b>

          <a className="btn btn-primary float-end" onClick={handleShow}>
            <i className="fa fa-plus" aria-hidden="true"></i> Add Borrower
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
                  setBorrowerList(borrowerList_);
                } else {
                  setBorrowerList(
                    borrowerList_.filter((res) => {
                      if (
                        res.data().barangay.toLowerCase() ===
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
                  <th scope="col">CID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Address</th>
                  <th scope="col">
                    <i className="fa fa-cogs" aria-hidden="true"></i> Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {borrowerList.map((res) => {
                  return (
                    <tr>
                      <td>{res.id}</td>
                      <td>
                        {fullName(
                          res.data().fname,
                          res.data().mname,
                          res.data().lname
                        )}
                      </td>
                      <td>
                        {fullAddress(
                          res.data().street,
                          res.data().barangay,
                          res.data().municipal,
                          res.data().province,
                          res.data().zipcode
                        )}
                      </td>
                      <td>
                        <i
                          onClick={() => {
                            setSelectedID(res.id);
                            setBorrowerInfoView(res.data());
                            handleShow_();
                          }}
                          style={{ cursor: "pointer" }}
                          className="fa fa-eye mx-2 text-primary"
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
        {/* Update */}
        <Modal fullscreen show={show_} onHide={handleClose_}>
          <Modal.Header className="bg-primary  text-white" closeButton>
            <Modal.Title> Borrower Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col">
                <table className="table ">
                  <thead>
                    <tr className="border-0">
                      <th colSpan={3}>Personal Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <label>Firstname</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              fname: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.fname}
                          placeholder="Enter Firstname"
                        />
                      </td>
                      <td>
                        <label>Middlename</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              mname: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.mname}
                          placeholder="Enter Middlename"
                        />
                      </td>
                      <td>
                        <label>Lastname</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              lname: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.lname}
                          placeholder="Enter Lastname"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Civil Status</label>
                        <select
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              civilStatus: evt.target.value,
                            }));
                          }}
                          value={borrowerInfoView.civilStatus}
                          className="form-select"
                        >
                          <option value="">Select Status Here</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widow">Widow</option>
                        </select>
                      </td>
                      <td>
                        <label>Birthday</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              bday: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="date"
                          name=""
                          value={borrowerInfoView.bday}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col">
                <table className="table ">
                  <thead>
                    <tr className="border-0">
                      <th colSpan={3}>Address Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <label>Region</label>
                        <select
                          onChange={(evt) => {
                            setSelectSetting((prev) => ({
                              ...prev,
                              regions: evt.target.value,
                            }));
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              region: evt.target.value,
                            }));
                            setProvince(barangay(evt.target.value));
                          }}
                          className="form-select"
                          value={borrowerInfoView.region}
                        >
                          {regions.map((item, index) => {
                            return <option key={index}>{item}</option>;
                          })}
                        </select>
                      </td>
                      <td>
                        <label>Province</label>
                        <select
                          value={borrowerInfoView.province}
                          onChange={(evt) => {
                            if (evt.target.value !== "") {
                              setSelectSetting((prev) => ({
                                ...prev,
                                province: evt.target.value,
                              }));
                              setBorrowerInfoView((prev) => ({
                                ...prev,
                                province: evt.target.value,
                              }));
                              setCity(
                                barangay(
                                  selectSettings.regions,
                                  evt.target.value
                                )
                              );
                            }
                          }}
                          className="form-select"
                        >
                          <option value="">Select Province Here</option>
                          {province.map((item, index) => {
                            return <option key={index}>{item}</option>;
                          })}
                        </select>
                      </td>
                      <td>
                        <label>Municipal/City</label>
                        <select
                          value={borrowerInfoView.municipal}
                          onChange={(evt) => {
                            setSelectSetting((prev) => ({
                              ...prev,
                              city: evt.target.value,
                            }));
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              municipal: evt.target.value,
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
                      </td>
                      <td>
                        <label>Barangay</label>
                        <select
                          value={borrowerInfoView.barangay}
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              barangay: evt.target.value,
                            }));
                          }}
                          className="form-select"
                        >
                          {barangay_.map((item, index) => {
                            return <option key={index}>{item}</option>;
                          })}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <label>Street</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              street: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.street}
                          placeholder="Block/Lot/Street"
                          required
                        />
                      </td>
                      <td>
                        <label>Zipcode</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              zipcode: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.zipcode}
                          placeholder="Enter Zipcode"
                          required
                        />
                      </td>
                      <td>
                        <label>Address Status</label>
                        <select
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              addressStatus: evt.target.value,
                            }));
                          }}
                          value={borrowerInfoView.addressStatus}
                          className="form-select"
                          required
                        >
                          <option value="">Select Status Here</option>
                          <option value="Permanent">Permanent</option>
                          <option value="Temporary">Temporary</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-6">
                <table className="table ">
                  <thead>
                    <tr className="border-0">
                      <th colSpan={3}>Work Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3}>
                        <label>Organization/Institution</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              organization: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.organization}
                          placeholder="Enter Organization/Institution"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Main Work</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              mainWork: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.mainWork}
                          placeholder="Enter Main Work"
                        />
                      </td>

                      <td>
                        <label>Secondary Work</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfoView((prev) => ({
                              ...prev,
                              secondWork: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfoView.secondWork}
                          placeholder="Enter Secondary"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-sm-12 col-md-12 col-lg-6">
                <table className="table ">
                  <col width={"50%"} />
                  <col width={"50%"} />
                  <thead>
                    <tr className="border-0">
                      <th colSpan={3}>Account Settings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <td>
                      <label>Credit Limit</label>
                      <input
                        onChange={(evt) => {
                          setBorrowerInfoView((prev) => ({
                            ...prev,
                            creditLimit: evt.target.value,
                          }));
                        }}
                        className="form-control"
                        type="number"
                        name=""
                        value={borrowerInfoView.creditLimit}
                        placeholder="Enter limit"
                      />
                    </td>
                  </tbody>
                </table>
              </div>
              <div className="col-sm-12 col-md-12 col-lg-6">
                <label>Requirement List</label>

                <Table>
                  <col width={"10%"} />
                  <col width={"80%"} />
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowerInfoView.requirementsList
                      ? borrowerInfoView.requirementsList.map((res, index) => {
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <a target="blank_" href={res.requirementsURL}>
                                  {res.requirements}
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      : null}
                  </tbody>
                </Table>
              </div>
              <div className="col-sm-12 col-md-12 col-lg-6">
                <table className="table ">
                  <col width={"50%"} />
                  <col width={"50%"} />
                  <thead>
                    <tr className="border-0">
                      <th colSpan={3}>Login Credentials</th>
                    </tr>
                  </thead>
                  <tbody>
                    <td>
                      <label>Email</label>
                      <input
                        disabled
                        onChange={(evt) => {
                          setBorrowerInfoView((prev) => ({
                            ...prev,
                            email: evt.target.value,
                          }));
                        }}
                        className="form-control"
                        type="text"
                        name=""
                        value={borrowerInfoView.email}
                        placeholder="Enter example@gmail.com"
                      />
                    </td>
                    <td>
                      <label>Password</label>
                      <input
                        disabled
                        onChange={(evt) => {
                          setBorrowerInfoView((prev) => ({
                            ...prev,
                            password: evt.target.value,
                          }));
                        }}
                        className="form-control"
                        type="text"
                        name=""
                        value={borrowerInfoView.password}
                        placeholder="Enter example@gmail.com"
                      />
                    </td>
                  </tbody>
                </table>
              </div>
              {/* <div className="col-sm-12 col-md-12 col-lg-6">
                <table className="table ">
                  <thead>
                    <tr className="border-0">
                      <th colSpan={3}>Loan Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={2}>
                        <label>Loan Purpose </label>
                        <select className="form-select">
                          <option value="">Select Loan for</option>
                          <option value="">Food Vending</option>
                          <option value="">Load Retailer</option>
                          <option value="">Other Loan Purpose</option>
                        </select>
                      </td>
                      <td>
                        <label>Loan Amount</label>
                        <select className="form-select">
                          <option value="">Select Loan for</option>
                          <option value="">Food Vending</option>
                          <option value="">Other Loan Amount</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        <label>Amount in Words</label>
                        <input
                          className="form-control"
                          type="text"
                          name=""
                          value=""
                          placeholder="Enter Amount in Words"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div> */}
            </div>

            {/* CONTENT HERE */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose_}>
              Close
            </Button>
            <button
              onClick={() => updateNewBorrower(selectedID)}
              className="btn btn-primary"
              type=""
            >
              UPDATE BORROWER INFORMATION
            </button>
            {/* <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button> */}
          </Modal.Footer>
        </Modal>

        {/* //ADD INFO */}
        <Modal fullscreen show={show} onHide={handleClose}>
          <Modal.Header className="bg-primary  text-white" closeButton>
            <Modal.Title> Borrower Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form
              id="insertNewData"
              onSubmit={(evt) => {
                evt.preventDefault();
                insertNewBorrower();
              }}
            >
              <div className="row">
                <div className="col">
                  <table className="table ">
                    <thead>
                      <tr className="border-0">
                        <th colSpan={3}>Personal Information</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <label>Firstname</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                fname: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.fname}
                            placeholder="Enter Firstname"
                            required
                          />
                        </td>
                        <td>
                          <label>Middlename</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                mname: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.mname}
                            placeholder="Enter Middlename"
                            required
                          />
                        </td>
                        <td>
                          <label>Lastname</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                lname: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.lname}
                            placeholder="Enter Lastname"
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label>Civil Status</label>
                          <select
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                civilStatus: evt.target.value,
                              }));
                            }}
                            value={borrowerInfo.civilStatus}
                            className="form-select"
                            required
                          >
                            <option value="">Select Status Here</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widow">Widow</option>
                          </select>
                        </td>
                        <td>
                          <label>Birthday</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                bday: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="date"
                            name=""
                            value={borrowerInfo.bday}
                            required
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col">
                  <table className="table ">
                    <thead>
                      <tr className="border-0">
                        <th colSpan={3}>Address Information</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <label>Region</label>
                          <select
                            onChange={(evt) => {
                              setSelectSetting((prev) => ({
                                ...prev,
                                regions: evt.target.value,
                              }));
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                region: evt.target.value,
                              }));
                              setProvince(barangay(evt.target.value));
                            }}
                            className="form-select"
                            value={borrowerInfo.region}
                          >
                            {regions.map((item, index) => {
                              return <option key={index}>{item}</option>;
                            })}
                          </select>
                        </td>
                        <td>
                          <label>Province</label>
                          <select
                            value={borrowerInfo.province}
                            onChange={(evt) => {
                              if (evt.target.value !== "") {
                                setSelectSetting((prev) => ({
                                  ...prev,
                                  province: evt.target.value,
                                }));
                                setBorrowerInfo((prev) => ({
                                  ...prev,
                                  province: evt.target.value,
                                }));
                                setCity(
                                  barangay(
                                    selectSettings.regions,
                                    evt.target.value
                                  )
                                );
                              }
                            }}
                            className="form-select"
                          >
                            <option value="">Select Province Here</option>
                            {province.map((item, index) => {
                              return <option key={index}>{item}</option>;
                            })}
                          </select>
                        </td>
                        <td>
                          <label>Municipal/City</label>
                          <select
                            value={borrowerInfo.municipal}
                            onChange={(evt) => {
                              setSelectSetting((prev) => ({
                                ...prev,
                                city: evt.target.value,
                              }));
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                municipal: evt.target.value,
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
                        </td>
                        <td>
                          <label>Barangay</label>
                          <select
                            value={borrowerInfo.barangay}
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                barangay: evt.target.value,
                              }));
                            }}
                            className="form-select"
                          >
                            {barangay_.map((item, index) => {
                              return <option key={index}>{item}</option>;
                            })}
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <label>Street</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                street: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.street}
                            placeholder="Block/Lot/Street"
                            required
                          />
                        </td>
                        <td>
                          <label>Zipcode</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                zipcode: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.zipcode}
                            placeholder="Enter Zipcode"
                            required
                          />
                        </td>
                        <td>
                          <label>Address Status</label>
                          <select
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                addressStatus: evt.target.value,
                              }));
                            }}
                            value={borrowerInfo.addressStatus}
                            className="form-select"
                            required
                          >
                            <option value="">Select Status Here</option>
                            <option value="Permanent">Permanent</option>
                            <option value="Temporary">Temporary</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12 col-md-12 col-lg-6">
                  <table className="table ">
                    <thead>
                      <tr className="border-0">
                        <th colSpan={3}>Work Information</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={3}>
                          <label>Organization/Institution</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                organization: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.organization}
                            placeholder="Enter Organization/Institution"
                            required
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label>Main Work</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                mainWork: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.mainWork}
                            placeholder="Enter Main Work"
                            required
                          />
                        </td>

                        <td>
                          <label>Secondary Work</label>
                          <input
                            onChange={(evt) => {
                              setBorrowerInfo((prev) => ({
                                ...prev,
                                secondWork: evt.target.value,
                              }));
                            }}
                            className="form-control"
                            type="text"
                            name=""
                            value={borrowerInfo.secondWork}
                            placeholder="Enter Secondary"
                            required
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-sm-12 col-md-12 col-lg-6">
                  <table className="table ">
                    <col width={"50%"} />
                    <col width={"50%"} />
                    <thead>
                      <tr className="border-0">
                        <th colSpan={3}>Account Settings</th>
                      </tr>
                    </thead>
                    <tbody>
                      <td>
                        <label>Credit Limit</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfo((prev) => ({
                              ...prev,
                              creditLimit: evt.target.value,
                            }));
                          }}
                          className="form-control"
                          type="number"
                          name=""
                          value={borrowerInfo.creditLimit}
                          placeholder="Enter limit"
                        />
                      </td>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2">
                  <label>Requirements</label>
                  <InputGroup className="mb-3">
                    <Form.Control
                      onChange={(evt) => {
                        let word = evt.target.value;
                        if (word) {
                          setRequirements(word);
                        } else {
                          console.log("Invalid Input");
                        }
                      }}
                      placeholder="Enter Requirements"
                    />
                    <Form.Control
                      onChange={(evt) => {
                        let word = evt.target.value;
                        if (word) {
                          setRequirementsURL(word);
                        } else {
                          console.log("Invalid Input");
                        }
                      }}
                      placeholder="Enter Document URL"
                    />
                    <Button
                      onClick={() => {
                        setRequirementsList((prev) => [
                          ...prev,
                          { requirements, requirementsURL },
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
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirementsList.map((res, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              <i
                                onClick={() => {
                                  setRequirementsList(removeArrayItem(index));
                                }}
                                className="fa fa-trash text-danger pointer"
                              ></i>
                            </td>
                            <td>{index + 1}</td>
                            <td>
                              <a target="blank_" href={res.requirementsURL}>
                                {res.requirements}
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
                <div className="col-sm-12 col-md-12 col-lg-6">
                  <table className="table ">
                    <col width={"50%"} />
                    <col width={"50%"} />
                    <thead>
                      <tr className="border-0">
                        <th colSpan={3}>Login Credentials</th>
                      </tr>
                    </thead>
                    <tbody>
                      <td>
                        <label>Email</label>
                        <input
                          onChange={(evt) => {
                            setBorrowerInfo((prev) => ({
                              ...prev,
                              email: evt.target.value,
                              password:
                                Math.floor(Math.random() * 100) +
                                "" +
                                borrowerInfo.lname +
                                Math.floor(Math.random() * 100),
                            }));
                          }}
                          className="form-control"
                          type="text"
                          name=""
                          value={borrowerInfo.email}
                          placeholder="Enter example@gmail.com"
                          required
                        />
                      </td>
                      <td></td>
                    </tbody>
                  </table>
                </div>
                {/* <div className="col-sm-12 col-md-12 col-lg-6">
                <table className="table ">
                  <thead>
                    <tr className="border-0">
                      <th colSpan={3}>Loan Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={2}>
                        <label>Loan Purpose </label>
                        <select className="form-select">
                          <option value="">Select Loan for</option>
                          <option value="">Food Vending</option>
                          <option value="">Load Retailer</option>
                          <option value="">Other Loan Purpose</option>
                        </select>
                      </td>
                      <td>
                        <label>Loan Amount</label>
                        <select className="form-select">
                          <option value="">Select Loan for</option>
                          <option value="">Food Vending</option>
                          <option value="">Other Loan Amount</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        <label>Amount in Words</label>
                        <input
                          className="form-control"
                          type="text"
                          name=""
                          value=""
                          placeholder="Enter Amount in Words"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div> */}
              </div>
            </form>
            {/* CONTENT HERE */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
            <button
              className="btn btn-primary"
              type="submit"
              form="insertNewData"
            >
              ADD BORROWER INFORMATION
            </button>
            {/* <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button> */}
          </Modal.Footer>
        </Modal>
        {/* <div className="card-footer text-muted">
              LMs-QR@2023
            </div> */}
      </div>
    </div>
  );
}

export default Borrowers;
