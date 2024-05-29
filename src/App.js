import React from "react";
import { Route, Link, Routes, BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

import "./App.css";

import Home from "./components/Home";
import { JsonProvider } from "./components/JsonContext";

const App = () => {
  return (
    <BrowserRouter >
    
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/rest-endpoint">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/rest-endpoint">
                  Rest EndPoint
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/schema-builder">
                  Schema Builder
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/json-mapper">
                  JSON Mapper
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/rebrand">
                  Re-Brand
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container mt-3 m-0">
          <JsonProvider>
            <Routes>
              <Route path="/*" element={<Home />} />
            </Routes>
          </JsonProvider>
        </div>
     
    </BrowserRouter>
  );
};

export default App;
