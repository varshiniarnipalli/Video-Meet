import "./Auth.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../config";

export default function Signup() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
  });
  const { email, password, username } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${API_URL}/signup`,
        inputValue,
        { withCredentials: true }
      );

      const { success, message } = data;

      if (success) {
        handleSuccess(message || "Account created successfully!");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        handleError(message || "Signup failed!");
      }
    } catch (error) {
      handleError(
        error.response?.data?.message ||
        "Signup failed. Please try again."
      );
    }

    setInputValue({
      email: "",
      password: "",
      username: "",
    });
  };


  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-left">
          <h1>Create Account</h1>

          <p>
            Start hosting secure meetings and collaborate
            with anyone around the world.
          </p>

          <i className="fa fa-video-camera auth-icon"></i>
        </div>

        <div className="auth-right">
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleOnChange}
              placeholder="Full Name"
              className="auth-input"
            />

            <input
              type="email"
              name="email"
              value={email}
              onChange={handleOnChange}
              placeholder="Email Address"
              className="auth-input"

            />

            <input
              type="password"
              name="password"
              value={password}
              onChange={handleOnChange}
              placeholder="Password"
              className="auth-input"
            />

            <button type="submit" className="auth-btn">
              Create Account
            </button>

            <p className="auth-link">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
