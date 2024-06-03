import React, { useContext, useState } from "react";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";
import JsonContext from "./JsonContext";
import { useNavigate } from "react-router-dom";

const SchemaBuilder = () => {
  const { sourceJson, setTargetJson } = useContext(JsonContext);
  const [editorValue, setEditorValue] = useState({});
  const navigate = useNavigate();

  const handleEditorChange = (newValue) => {
    setEditorValue(newValue);
  };

  const handleTargetButtonClick = () => {
    setTargetJson(editorValue);
    alert("Data saved in target");
    navigate('/json-mapper');
  };

  // Function to extract the 0 index object from an array of objects, if it exists
  const extractZeroIndexObject = (obj) => {
    const newObj = { ...obj };
    for (const key in newObj) {
      if (Array.isArray(newObj[key]) && newObj[key].length > 0) {
        newObj[key] = newObj[key][0];
      }
    }
    return newObj;
  };
    
  

  // Extracting the 0 index object from the sourceJson
  const valueToRender = sourceJson.length > 0 ? extractZeroIndexObject(sourceJson[0]) : {};

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col">
          <h3 className="text-warning">Schema Builder:</h3>
          {sourceJson.length > 0 && (
            <Editor
              value={valueToRender}
              onChange={handleEditorChange}
              modes={["tree", "code"]}
              mode="tree"
              history={true}
              search={true}
              indentation={4}
            />
          )}
          <button className="btn btn-success my-2" onClick={handleTargetButtonClick}>
            Target
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;
