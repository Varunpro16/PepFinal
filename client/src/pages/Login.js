import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";

function Login() {
  const [cookies] = useCookies([]);
  const [selectedDomainOption,setSelectedDomainOption]=useState('');
  const [selectedRoleOption,setSelectedRoleOption]=useState('');
  const [password,setPassword]=useState('');

  const navigate = useNavigate();

  const handleChange1 = (event) => {
    setSelectedRoleOption(event.target.value);
  };
  const handleChange2 = (event) => {
    setSelectedDomainOption(event.target.value);
  };
  useEffect(() => {
    if (cookies.jwt) {
      navigate("/");
    }
  }, [cookies, navigate]);

  const generateError = (error) =>
    toast.error(error, {
      position: "bottom-right",
    });
  const handleSubmit = async (event) => {
    console.log(selectedDomainOption,selectedRoleOption,password);
    event.preventDefault();
    try {
      const { data } = await axios.post(
        "http://10.10.30.179:4000/login",
        {
          role:selectedRoleOption,
          domain:( selectedRoleOption != "hod" ? selectedDomainOption: 'hod'),
          password:password
        },
        { withCredentials: true }
      );
      if (data) {
        if (data.errors) {
          const { regis, password } = data.errors;
          if (regis) generateError(regis);
          else if (password) generateError(password);
        } else {
          navigate("/");
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  };
  return (
    <div className="container">
      <h2>Login to your Account</h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div>
          <label htmlFor="role">Role</label>
          <select id="dropdown" value={selectedRoleOption} onChange={handleChange1}>
            <option value="">Select...</option>
            <option value="staff">Staff</option>
            <option value="admin">admin</option>
            <option value="hod">hod</option>
            {/* Add more options as needed */}
          </select>

        </div>
        {selectedRoleOption!="hod" && <div>
          <label htmlFor="role">Domain</label>
          <select id="dropdown" value={selectedDomainOption} onChange={handleChange2}>
            <option value="">Select...</option>
            <option value="fullstack">Fullstack</option>
            <option value="ml">ML</option>
            {/* Add more options as needed */}
          </select>
        </div>}
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;
