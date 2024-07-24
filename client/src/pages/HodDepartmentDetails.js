import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'format';

const HodDepartmentDetails = ({ user ,domains}) => {
  const [data, setData] = useState([]);
  const [domain, setDomain] = useState('');
  const [batch, setBatch] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.post("http://localhost:4000/pepDetails",{
          domains:domains
        });
        if (response.data.status === true) {
          setData(response.data.result);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetails();
  }, []);

  const handleFilter = async () => {
    try {
      const response = await axios.post("http://localhost:4000/filterDetails", {
        domain,
        batch: parseInt(batch, 10)
      });
      if (response.data.status === true) {
        setData(response.data.result);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div>
      <h2>Student Leave Information</h2>
      <select value={domain} onChange={(e) => setDomain(e.target.value)}>
      <option value="">Choose Domain</option>
       { domains.map((d,index)=>(
        <option key={index} value={d}>{d.toUpperCase()}</option>
       ))}
        {/* 
        <option value="fullstack">Fullstack</option>
        <option value="ml">ML</option> */}
        {/* Add other domains as needed */}
      </select>
      <select value={batch} onChange={(e) => setBatch(e.target.value)}>
        <option value="">Choose Batch</option>
        <option value="2021">2021</option>
        <option value="2022">2022</option>
        {/* Add other batches as needed */}
      </select>
      <button onClick={handleFilter}>Filter</button>
      <DepartLeaveTable information={data} />
    </div>
  );
};
const DepartLeaveTable = ({ information }) => {
  if (information.length === 0) return <div>No data available</div>;
  console.log("d: ",information);
  var dates = information.map((obj) => {
    return obj.date;
  })
  
  dates.sort();
  var map = {}
  information.map((eachDayData, index) => {
    console.log(eachDayData);
  
    eachDayData.students.map(student => {
      // console.log("student: ", student);
  
      // Ensure the date object exists
      if (!map[eachDayData.date]) {
        map[eachDayData.date] = {};
      }
  
      // Ensure the student object exists
      if (!map[eachDayData.date][student.regisno]) {
        map[eachDayData.date][student.regisno] = {};
      }
  
      // Set the properties
      map[eachDayData.date][student.regisno]["forePresent"] = student.forePresent;
      map[eachDayData.date][student.regisno]["afterPresent"] = student.afterPresent;
    });
  });
  
  // Get the date columns dynamically from the data
  const dateColumns = Object.keys(information).filter(key => key.includes('00:00:00'));

  return (
    
  <div style={{ overflowX: 'auto' }}>
    <table>
      <thead>
        <tr>
          <th style={{whiteSpace:"nowrap"}}>Name</th>
          <th>Reg No</th>
          <th>Department</th>
          {dates.map((d,index) => (
            <th key={index}>{new Date(d).toLocaleDateString()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(information[0].students).map((entry, index) => (
          <tr key={index}>
            <td style={{whiteSpace:"nowrap"}} >{entry.name}</td>
            <td>{entry.regisno}</td>
            <td>{entry.dept}</td>
            {dates.map(date => (
              <td key={date}>{map[date][entry.regisno]["forePresent"] ? "P" : "A"}
                {" | "}{map[date][entry.regisno]["afterPresent"] ? "P" : "A"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};


export default HodDepartmentDetails;