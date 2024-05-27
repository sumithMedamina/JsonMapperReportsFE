import React, { createContext, useState } from "react";

const JsonContext = createContext();

export const JsonProvider = ({ children }) => {
  const [sourceJson, setSourceJson] = useState([]);
  const [targetJson, setTargetJson] = useState({});

  return (
    <JsonContext.Provider value={{ sourceJson, setSourceJson, targetJson, setTargetJson }}>
      {children}
    </JsonContext.Provider>
  );
};

export default JsonContext;
