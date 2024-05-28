import React, { createContext, useState } from "react";

const JsonContext = createContext();

export const JsonProvider = ({ children }) => {
  const [sourceJson, setSourceJson] = useState([]);
  const [targetJson, setTargetJson] = useState({});
  const [url, setUrl] = useState("https://fakestoreapi.com/products");

  return (
    <JsonContext.Provider value={{ sourceJson, setSourceJson, targetJson, setTargetJson, url, setUrl }}>
      {children}
    </JsonContext.Provider>
  );
};

export default JsonContext;
