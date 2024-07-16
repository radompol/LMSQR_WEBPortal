import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

import Borrower_ from "./Pages/Borrowers/Borrower_";
import Borrowers from "./Pages/Borrowers/Borrowers";
import ClientPage from "./Pages/ClientPage/ClientPage";
import ClientPage_ from "./Pages/ClientPage/ClientPage_";
import Collectors_ from "./Pages/Collectors/Collectors_";
import { FIREBASE_AUTH } from "./Utils/Firebase_config";
import Home from "./Pages/Dashboard/Home";
import Home_ from "./Pages/Dashboard/Home_";
import Loans from "./Pages/Loans/Loans";
import Loans_ from "./Pages/Loans/Loans_";
import Login from "./Pages/Login/Login";
import Navigation from "./Navigation/Navigation";
import Payments from "./Pages/Payments/Payments";
import Payments_ from "./Pages/Payments/Payments_";
import ViewMapComponent from "./Pages/ViewMap/ViewMapComponent";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedIn_, setLoggedIn_] = useState(true);

  const [routes_link, setRoutes_link] = useState([
    {
      type: 0,
      path: "/",
      component: (
        <Login
          setLoggedIn={setLoggedIn}
          setLoggedIn_={setLoggedIn_}
          loggedIn={loggedIn}
        />
      ),
    },
    {
      type: 0,
      path: "/home",
      component: <Home_ setLoggedIn={setLoggedIn} loggedIn={loggedIn} />,
      name: "Home",
      icon: <i class="fa fa-home" aria-hidden="true"></i>,
    },

    // {
    //   path: "/users",
    //   component: <Userlist setLoggedIn={setLoggedIn} loggedIn={loggedIn} />,
    //   name: "Users",
    // },
    {
      type: 0,
      path: "/borrowers",
      component: <Borrower_ setLoggedIn={setLoggedIn} loggedIn={loggedIn} />,
      name: "Borrowers",
      icon: <i class="fa fa-users" aria-hidden="true"></i>,
    },
    {
      type: 0,
      path: "/loans",
      component: <Loans_ setLoggedIn={setLoggedIn} loggedIn={loggedIn} />,
      name: "Loans",
      icon: <i class="fa fa-file" aria-hidden="true"></i>,
    },
    {
      type: 0,
      path: "/payments",
      component: <Payments_ setLoggedIn={setLoggedIn} loggedIn={loggedIn} />,
      name: "Payments",
      icon: <i class="fas fa-money-bill    "></i>,
    },
    {
      type: 1,
      path: "/borrower",
      component: <ClientPage_ setLoggedIn={setLoggedIn} loggedIn={loggedIn} />,
      name: "Profile",
    },
    {
      type: 0,
      path: "/collectors",
      component: <Collectors_ setLoggedIn={setLoggedIn} loggedIn={loggedIn} />,
      name: "Collectors",
      icon: <i class="fa fa-user-secret" aria-hidden="true"></i>,
    },
  ]);

  // useEffect(() => {
  //   const auth =onAuthStateChanged(FIREBASE_AUTH, (user) => {
  //     if (user) {

  //     } else {

  //     }
  //   });
  //   return auth;
  // });
  return (
    <BrowserRouter>
      {loggedIn ? (
        <Navigation
          routes_link={routes_link}
          setLoggedIn={setLoggedIn}
          loggedIn={loggedIn}
          setLoggedIn_={setLoggedIn_}
        />
      ) : null}

      <Routes>
        {/* {loggedIn_ ? ( */}
        <Route path={"view_map"} element={<ViewMapComponent />} />
        {/* // ) : null} */}

        {routes_link.map((res) => (
          <Route path={res.path} element={res.component} />
        ))}
      </Routes>
    </BrowserRouter>
    // <div>
    //   <h1>HEllo</h1>
    // </div>
  );
}

export default App;
