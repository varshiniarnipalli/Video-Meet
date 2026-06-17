import "./Auth.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;
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
      position: "bottom-left",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:4000/login",
        inputValue,
        { withCredentials: true }
      );

      const { success, message } = data;

      if (success) {
        handleSuccess(message || "Login successful!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        handleError(message || "Incorrect email or password!");
      }
    } catch (error) {
      handleError(
        error.response?.data?.message ||
        "Incorrect email or password!"
      );
    }

    setInputValue({
      email: "",
      password: "",
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-left">
          <h1>Welcome Back!</h1>

          <p>
            Join meetings, collaborate with your team,
            and stay connected from anywhere.
          </p>

          <i className="fa fa-video-camera auth-icon"></i>
        </div>

        <div className="auth-right">
          <h2>Log In</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              className="auth-input"
              name="email"
              value={email}
              onChange={handleOnChange}
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
              Log In
            </button>

            <p className="auth-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
