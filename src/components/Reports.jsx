import React, { useEffect, useState } from 'react';
import { MenuItem, Select, TableBody, TableRow, TableCell, Box, TableContainer, Table, TableHead, Paper, Checkbox, ListItemText, Tooltip, TextField, IconButton } from '@mui/material';
import { Button } from "react-bootstrap";
import axios from 'axios';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const formatColumnName = (name) => {
  return name
    .split('_') // Split the name by underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join the words with a space
};

export default function Reports() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [keys, setKeys] = useState([]);
  const [files, setFiles] = useState({});
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [finalKeys, setFinalKeys] = useState([]);
  const [queryConditions, setQueryConditions] = useState([]);
  const [report, setReport] = useState({});

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/fields-data');
        setFiles(response.data);
      } catch (error) {
        console.error("There was an error fetching the file list!", error);
      }
    };

    fetchFiles();
  }, []);

  const handleChange = (event) => {
    const options = event.target.value;
    setSelectedOptions(options);
    const combinedKeys = options.flatMap(option => files[option] || []);
    setKeys(combinedKeys);
    setSelectedKeys([]);
  };

  const handleGenerateReport = async () => {
    const parsedQueryCondition = queryConditions.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const postData = {
      organisation_fields: finalKeys.filter(key => files['Organisation']?.includes(key)),
      script_fields: finalKeys.filter(key => files['Script']?.includes(key)),
      user_fields: finalKeys.filter(key => files['User']?.includes(key)),
      conditions: parsedQueryCondition,
    };

    try {
      const response = await axios.post('http://localhost:5000/generate-reports', postData);
      setReport(response.data);
    } catch (error) {
      console.error("There was an error generating the report!", error);
    }
  };

  const handleKeySelect = (event) => {
    const options = event.target.options;
    const selected = [];
    for (const option of options) {
      if (option.selected) {
        selected.push(option.value);
      }
    }
    setSelectedKeys(selected);
  };

  const handleAddKeys = () => {
    setFinalKeys(prevFinalKeys => [...new Set([...prevFinalKeys, ...selectedKeys])]);
  };

  const handleAddQueryCondition = () => {
    setQueryConditions(prev => [...prev, { key: '', value: '' }]);
  };

  const handleQueryConditionChange = (index, field, value) => {
    const updatedConditions = [...queryConditions];
    updatedConditions[index][field] = value;
    setQueryConditions(updatedConditions);
  };

  const renderTable = () => {
    if (!report || !report.organisation) return null;

    const combinedData = [];
    const orgLength = report.organisation.length;
    const scriptLength = report.script.length;
    const userLength = report.user.length || 0;
    const maxLength = Math.max(orgLength, scriptLength, userLength);

    for (let i = 0; i < maxLength; i++) {
      const org = report.organisation[i] || {};
      const script = report.script[i] || {};
      const user = report.user[i] || {};
      const mergedRow = { ...org, ...script, ...user };

      finalKeys.forEach(key => {
        if (!mergedRow[key]) {
          mergedRow[key] = "_";
        }
      });

      combinedData.push(mergedRow);
    }

    return (
      <TableContainer component={Paper} style={{ marginTop: '20px', maxWidth: '80%', marginBottom: '60px', backgroundColor: '#f5f5f5' }}>
        <Table>
          <TableHead className="thead-dark">
            <TableRow>
              {finalKeys.map((key, index) => (
                <TableCell key={index} style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>{formatColumnName(key)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {combinedData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {finalKeys.map((key, cellIndex) => (
                  <TableCell key={cellIndex} style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row[key] || ''}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eaeaea', padding: '20px', borderRadius: '10px' }}>
      <h2 className='mt-2' style={{ color: '#e77619', backgroundColor: '#33322d', padding: '10px', borderRadius: '8px' }}>
        Reports
      </h2>
      <Select
        multiple
        value={selectedOptions}
        onChange={handleChange}
        renderValue={(selected) => selected.join(', ')}
        displayEmpty
        style={{ width: '300px', marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '5px' }}
      >
        <MenuItem value="">Select options</MenuItem>
        {Object.keys(files).map((option, index) => (
          <MenuItem key={index} value={option}>
            <Checkbox checked={selectedOptions.indexOf(option) > -1} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
      <br />
      <Box display="flex" alignItems="center" style={{ marginTop: '20px' }}>
        <Select multiple native size="10" style={{ width: '200px', backgroundColor: '#ffffff', borderRadius: '5px' }} onChange={handleKeySelect}>
          {keys.map((key, index) => (
            <option key={index} value={key}>{key}</option>
          ))}
        </Select>
        <Button onClick={handleAddKeys} style={{ margin: '0 20px' }}>→</Button>
        <Select multiple native size="10" style={{ width: '200px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
          {finalKeys.map((key, index) => (
            <option key={index} value={key}>{key}</option>
          ))}
        </Select>
      </Box>
      <br />
      <Box display="flex" flexDirection="column" alignItems="flex-start" style={{ marginTop: '20px' }}>
        {queryConditions.map((condition, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <Select
              native
              value={condition.key}
              onChange={(e) => handleQueryConditionChange(index, 'key', e.target.value)}
              style={{ width: '200px', marginRight: '10px', backgroundColor: '#ffffff', borderRadius: '5px' }}
            >
              <option value="">Select Key</option>
              {finalKeys.map((key, i) => (
                <option key={i} value={key}>{key}</option>
              ))}
            </Select>
            <TextField
              value={condition.value}
              onChange={(e) => handleQueryConditionChange(index, 'value', e.target.value)}
              placeholder="Enter Value"
              style={{ width: '200px', backgroundColor: '#ffffff', borderRadius: '5px' }}
            />
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={handleAddQueryCondition}
          startIcon={<AddCircleIcon fontSize="small" />}
          size="small"
          style={{
            borderColor: 'grey',
            color: 'grey',
            padding: '4px 8px',
            fontSize: '0.75rem',
            textTransform: 'none',
            borderRadius: '4px',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'darkblue',
              color: 'darkblue',
            },
          }}
        >
          Add Condition
        </Button>
      </Box>
      <br />
      <Button className='btn btn-secondary' style={{ color: 'white' }} variant="contained" onClick={handleGenerateReport}>Generate Report</Button>
      <br />
      {renderTable()}
    </Box>
  );
}
