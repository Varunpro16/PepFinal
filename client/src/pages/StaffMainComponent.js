import React,{ useState,useEffect } from 'react'
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import moment from 'moment';
import DetailsComponent from './DetailsComponent';
import RequestComponent from './RequestComponent'
import axios from 'axios';
import LeaveTable from './LeaveTable';
import HodMainComponent from './HodMainComponent';
import HodDepartmentDetails from './HodDepartmentDetails';
import CustomDatePicker from './CustomDatePicker';
import FaceDetection from './FaceDetection';
import { addWeeks } from 'date-fns';

const StaffMainComponent = ({user,domains}) => {
    const [cookies, setCookie, removeCookie] = useCookies([]);
    const [activeButton, setActiveButton] = useState("profile");
    const [selectedStaff, setSelectedStaff] = useState('');
    const navigate = useNavigate();
    
    const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
        if (buttonName === "logout") {
          removeCookie("jwt");
          navigate("/login");
        }
      };
      

    const handleSelectChange = (e) => {
        setSelectedStaff(e.target.value);
    };
    return (
        <div className='student-main'>
            <div className="navbar navbar-councellor">
                <button
                className={activeButton === "profile" ? "active" : ""}
                onClick={() => handleButtonClick("profile")}
                >
                Profile
                </button>
                <button
                className={activeButton === "facedetection" ? "active" : ""}
                onClick={() => handleButtonClick("facedetection")}
                >
                FaceDetection
                </button>
                <button
                className={activeButton === "leaveDetails" ? "active" : ""}
                onClick={() => handleButtonClick("leaveDetails")}
                >
                LeaveDetails
                </button>

                <button
                className={activeButton === "attendence" ? "active" : ""}
                onClick={() => handleButtonClick("attendence")}
                >
                Attendance
                </button>
                
                <button
                    className={activeButton === "logout" ? "active" : ""}
                    onClick={() => handleButtonClick("logout")}
                >
                Log Out
                </button>
            </div> 
            
            <div className='content-student'>
                {activeButton==="profile" && <DetailsComponent user={user}/>}
                {activeButton==="facedetection" && <FaceDetection user={user}/>}
                {/* {activeButton==="request" && <RequestComponent user={user} selectedStaff={selectedStaff}/>}
                {activeButton==="todayabsent" && <CouncellorTodayAbsent user={user}/>} */}
                {activeButton==="attendence" && <Attendance user={user}/>}
                {activeButton==="leaveDetails" && <HodDepartmentDetails user={user} domains={domains}/>}

            </div>
        </div>
    )
}


const Attendance = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [attendanceId, setAttendanceId] = useState(null);
  const [date, setDate] = useState(null);

  const fetchAttendance = async () => {
    if (!date) return;

    const formattedDate = new Date(date); // Ensure date is formatted correctly
    console.log("detail: ",formattedDate,user.domain,user.batch);
    try {
      const response = await axios.get(
        `http://localhost:4000/attendance?date=${formattedDate}&domain=${user.domain}&batch=${user.batch}`
      );
      if(response.data){
        console.log("got: ",response);
        if(Object.keys(response.data).length==0){
          setDate(null)
          alert('Pick the Valid Date!!!')
          const date=prompt('Enter the date as (yyyy-MM-dd)')
          const res = await axios.post('http://localhost:4000/insertDate',{
            date:date,
            batch:user.batch,
            domain:user.domain
          })
        }else{
          setStudents(response.data.students);
          setAttendanceId(response.data._id);
        }
      } else {
        setStudents([]);
        setAttendanceId(null);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    setStudents([]); // Clear students array when selecting a new date
    setAttendanceId(null); // Clear attendance ID when selecting a new date
  };

  const handleCheckboxChange = (index, session, present) => {
    const updatedStudents = [...students];
    updatedStudents[index][session] = present;
    setStudents(updatedStudents);
  };

  const handleReasonChange = (index, session, reason) => {
    const updatedStudents = [...students];
    updatedStudents[index][session] = reason;
    setStudents(updatedStudents);
  };

  const handleSubmit = async () => {
    try {
      if (attendanceId) {
        await axios.put(`http://localhost:4000/attendance/${attendanceId}`, { students });
      } else {
        await axios.post(`http://localhost:4000/attendance`, {
          date:date,
          domain:user.domain,
          batch:user.batch,
          students:students,
        });
      }
      // After successful submission, clear date and fetched data
      setDate(null);
      setStudents([]);
      setAttendanceId(null);
    } catch (error) {
      console.error('Failed to submit attendance:', error);
    }
  };
  const convertToCSV = () => {
    const header = ['Name',"Register No", 'Roll No', 'Forenoon Present', 'Forenoon Reason', 'Afternoon Present', 'Afternoon Reason'];
    const rows = students.map(student => [
      student.name,
      student.regisno,
      student.rollno,
      student.forePresent ? 'Present' : 'Absent',
      student.foreDetail,
      student.afterPresent ? 'Present' : 'Absent',
      student.afterDetail
    ]);

    const csvContent = header.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
  };

  useEffect(()=>{
    console.log("students: ",students);
  },[students])
  useEffect(()=>{
    console.log("date: ",date);
  },[date])
  return (
    <div>
      <h1>Attendance for Domain: {user.domain}, Batch: {user.batch}</h1>
      <CustomDatePicker onDateChange={handleDateChange} date={date}/>
      <button onClick={fetchAttendance}>Fetch Attendance</button>

      {students!=[] && students.length > 0 && (
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Register No</th>
                <th>Roll No</th>
                <th>Forenoon </th>
                <th>Forenoon Reason</th>
                <th>Afternoon</th>
                <th>Afternoon Reason</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.regisno}</td>
                  <td>{student.rollno}</td>
                  <td>
                    <input
                    style={{ marginRight:"15px" }}
                      type="checkbox"
                      checked={student.forePresent}
                      onChange={(e) =>
                        handleCheckboxChange(index, 'forePresent', e.target.checked)
                      }
                    />
                    {students[index].forePresent ? "Present" :"Absent"}
                    
                  </td>
                  <td>
                    <input
                      type="text"
                      value={student.foreDetail}
                      onChange={(e) =>
                        handleReasonChange(index, 'foreDetail', e.target.value)
                      }
                    />
                  </td>
                  <td >
                    <input
                      style={{ marginRight:"15px" }}
                      type="checkbox"
                      checked={student.afterPresent}
                      onChange={(e) =>
                        handleCheckboxChange(index, 'afterPresent', e.target.checked)
                      }
                    />
                    {students[index].afterPresent ? "Present" :"Absent"}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={student.afterDetail}
                      onChange={(e) =>
                        handleReasonChange(index, 'afterDetail', e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSubmit}>Submit</button>
          
        </div>
      )}
      {students.length>0 && <button onClick={convertToCSV}>Download CSV</button>}
    </div>
  );
};



const CouncellorClassDetails = ({user}) => {
  const [data,setData]=useState({})
  const classArr=(user.name).split(' ')

  useEffect(()=>{
    const fetchDetails = async () => {
      try{
        console.log("hello");
        const response = await axios.post("http://localhost:4000/classDetails",{
          section:classArr[1],
          depart:classArr[0],
          batch:user.batch
        })
        if(response.data.status===true){
          setData(response.data.result);
          console.log(response.data.result);
        }
      }catch(err){
        console.log(err);
      }
    }
    fetchDetails()
  },[])

  return (
      <div>CouncellorClassDetails
          <LeaveTable info={data}/>
      </div>
  )
}

export default StaffMainComponent