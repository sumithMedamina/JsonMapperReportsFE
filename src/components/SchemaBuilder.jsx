import React, { useContext, useState, useEffect } from "react";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor-react/es/editor.min.css";
import JsonContext from "./JsonContext";
import { useNavigate } from "react-router-dom";

const SchemaBuilder = () => {
  const { sourceJson, setTargetJson } = useContext(JsonContext);
  const [editorValue, setEditorValue] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Function to extract the 0 index object from an array of objects, if it exists
    const extractZeroIndexObject = (obj) => {
      const newObj = { ...obj };
      for (const key in newObj) {
        if (Array.isArray(newObj[key]) && newObj[key].length > 0) {
          if (typeof newObj[key][0] === 'object') {
            // If the value is an array of objects, take only the 0th index
            newObj[key] = [newObj[key][0]];
          }
        }
      }
      return newObj;
    };

    // Normalize sourceJson to handle array, single object, and nested arrays
    const normalizeSourceJson = (json) => {
      if (Array.isArray(json)) {
        console.log("sourceJson is an array:", json);
        if (json.length > 0 && Array.isArray(json[0])) {
          // If the first item is an array, take the 0th index of each nested array
          return json.map(subArray => {
            const normalizedSubArray = extractZeroIndexObject(subArray);
            return Object.keys(normalizedSubArray).length > 0 ? normalizedSubArray : {};
          });
        } else {
          return json.length > 0 ? extractZeroIndexObject(json[0]) : {};
        }
      } else if (json && typeof json === 'object') {
        console.log("sourceJson is a single object:", json);
        return extractZeroIndexObject(json);
      }
      console.log("sourceJson is neither an array nor an object:", json);
      return {};
    };

    console.log("Raw sourceJson:", sourceJson);
    const normalizedValue = normalizeSourceJson(sourceJson);
    console.log("Normalized sourceJson:", normalizedValue);
    setEditorValue(normalizedValue);
  }, [sourceJson]);

  const handleEditorChange = (newValue) => {
    console.log("Editor value changed:", newValue);
    setEditorValue(newValue);
  };

  const handleTargetButtonClick = () => {
    console.log("Saving target JSON:", editorValue);
    setTargetJson(editorValue);
    alert("Data saved in target");
    navigate('/json-mapper');
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col">
          <h4 className="text-danger">Create Your Own Schema:</h4>
          {Object.keys(editorValue).length > 0 ? (
            <Editor
              value={editorValue}
              onChange={handleEditorChange}
              modes={["tree", "code"]}
              mode="tree"
              history={true}
              search={true}
              indentation={4}
            />
          ) : (
            <p>No source JSON available</p>
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
