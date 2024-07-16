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
import textLogo from "../../assets/Logo_main.jpg";
import { useNavigate } from "react-router-dom";

function Home({ setLoggedIn }) {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [list_, setList_] = useState([]);
  const [sellerList, setSellerList] = useState([]);
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
      navigate("/home");
    };
    const q = query(
      collection(FIRESTORE_DB, "products"),
      where("status", "==", "active")
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        //resolve(querySnapshot)
        let list = querySnapshot.docs.map((res) => {
          return {
            productID: res.id,
            productName: res.data().name,
            sellerID: res.data().userId,
            productDescription: res.data().desc,
            productImage: res.data().pic,
          };
        });
        setList(list);
        setList_(list);
        // console.log(list)
      },
      () => {
        return unsubscribe();
      },
      (err) => {
        console.log(err);
      }
    );
    const q1 = query(
      collection(FIRESTORE_DB, "users"),
      where("userType", "!=", 1)
    );
    const unsubscribe1 = onSnapshot(
      q1,
      (querySnapshot) => {
        //resolve(querySnapshot)
        let list = querySnapshot.docs.map((res) => {
          return res;
        });
        //console.log(list);
        setSellerList(list);
      },
      () => {
        return unsubscribe1();
      },
      (err) => {
        console.log(err);
      }
    );
  }, []);
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
  return (
    <div className="justify-content-center mt-4">
      <div className="container">
        <p>
          <div className="row">
            <div
              style={{
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
              className="col "
            >
              <img className="mx-4" src={textLogo} style={{ width: 380 }} />
            </div>
            <div className="col">
              <h3 className="text-center"> HISTORY OF CAPS-R </h3>
              <p
                style={{ textIndent: 50, textAlign: "justify" }}
                className="text-wrap "
              >
                This archdiocesan program that provides financial assistance to
                the unemployed women in Cebu was started by Cebu caritas, Inc.
                in the early 90’s under the chairmanship of Msgr. Roberto F.
                Alesna. It was a response to the need of some women coming from
                disadvantaged background whose desire to pursue some
                entrepreneurial undertakings were undermined due to financial
                anemia. They asked if it was possible for the Church to lend
                them startup funds. Msgr. Alesna negotiated with the Philippine
                Charity Sweepstakes Office or PCSO for a grant.
              </p>
              <p
                style={{ textIndent: 50, textAlign: "justify" }}
                className="text-wrap "
              >
                With the help of PCSO and with an eye for a much viable
                solution, Cebu Caritas crafted a temporary program called
                “Kaunlaran Pangkabuhayan Project.” A venture primarily anchored
                on trust. It lent capital to the women without any interest with
                the understanding that they gradually pay back by installment so
                that others like them may avail. Majority of borrowers failed to
                repay and lacking the proper tools of the trade, the program
                ended but the call for financial inclusion persisted.
              </p>
            </div>
          </div>
        </p>
      </div>
    </div>
  );
}

export default Home;
