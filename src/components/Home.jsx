import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { RiHome2Fill, RiFileEditFill, RiSettings2Fill, RiRefreshFill } from 'react-icons/ri';
import RestEndpoint from "./RestEndPoint";
import SchemaBuilder from "./SchemaBuilder";
import JsonMapper from "./JsonMapper/JsonMapper";
import Rebrand from "./Rebrand";

function Home() {
  const [activeComponent, setActiveComponent] = useState("RestEndpoint");

  const navigate = useNavigate();

  const handleNavigation = (component) => {
    setActiveComponent(component);
    switch (component) {
      case "RestEndpoint":
        navigate("/rest-endpoint");
        break;
      case "SchemaBuilder":
        navigate("/schema-builder");
        break;
      case "JsonMapper":
        navigate("/json-mapper");
        break;
      case "Rebrand":
        navigate("/rebrand");
        break;
      default:
        break;
    }
  };

  return (
    <div className="container-fluid " style={{width: "97vw"}}>
      <div className="row">
        <div className="col-lg-2 col-md-4 bg-light border">
          <div className="d-flex flex-column  justify-content-center  p-3  " style={{height: "80vh"}}>
            <button
              className={`btn btn-primary mb-4 ${activeComponent === "RestEndpoint" ? "active" : ""}`}
              onClick={() => handleNavigation("RestEndpoint")}
              title="Rest Endpoint"
            >
              <RiHome2Fill className="me-2" /> Rest Endpoint
            </button>
            <button
              className={`btn btn-warning mb-4 ${activeComponent === "SchemaBuilder" ? "active" : ""}`}
              onClick={() => handleNavigation("SchemaBuilder")}
              title="Schema Builder"
            >
              <RiFileEditFill className="me-2" /> SchemaBuilder
            </button>
            <button
              className={`btn btn-info mb-4 ${activeComponent === "JsonMapper" ? "active" : ""}`}
              onClick={() => handleNavigation("JsonMapper")}
              title="JSON Mapper"
            >
              <RiSettings2Fill className="me-2" /> JSON Mapper
            </button>
            <button
              className={`btn btn-success ${activeComponent === "Rebrand" ? "active" : ""}`}
              onClick={() => handleNavigation("Rebrand")}
              title="Rebrand"
            >
              <RiRefreshFill className="me-2" /> Rebrand
            </button>
          </div>
        </div>
        <div className="col-lg-10 col-md-8 border">
          <Routes>
            <Route path="/rest-endpoint" element={<RestEndpoint />} />
            <Route path="/schema-builder" element={<SchemaBuilder />} />
            <Route path="/json-mapper" element={<JsonMapper />} />
            <Route path="/rebrand" element={<Rebrand />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Home;
