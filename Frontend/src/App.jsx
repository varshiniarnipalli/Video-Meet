import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from './Landing_Page/Home.jsx';
import Hero from "./Landing_Page/Hero.jsx";
import Features from "./Landing_Page/Features.jsx";
import HIW from "./Landing_Page/HIW.jsx";
import Login from './Landing_Page/Login.jsx';
import Signup from './Landing_Page/Signup.jsx';
import NotFound from './NotFound.jsx';
import HomePage from './Dashboard/HomePage.jsx';
import Meetings from './Dashboard/Meetings.jsx';
import Profile from './Dashboard/Profile.jsx';
import Settings from './Dashboard/Settings.jsx';
import JoinMeeting from './Dashboard/JoinMeeting.jsx';
import MeetingRoom from './Dashboard/MeetingRoom.jsx';
import CreateMeeting from './Dashboard/CreateMeeting.jsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hero" element={<Hero />} />
        <Route path="/features" element={<Features />} />
        <Route path="/hiw" element={<HIW />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/dashboard/meetings" element={<Meetings />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/join" element={<JoinMeeting />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
        <Route path="/create" element={<CreateMeeting />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;