import './NavBar.css'
import { Link } from 'react-router-dom'

export default function NavBar() {
    return(
        <>
            <nav className="navbar navbar-expand-lg navbar-light p-3 border-bottom bg-white fixed-top mb-5">
            <div className="container-fluid">
                <i className="fa fa-video-camera video-icon" aria-hidden="true"></i>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/">Video Meet</Link>
                    </li>
                    
                </ul>
                <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                    <a className="nav-link" href="#features">
                        Features
                    </a>
                    </li>
                    <li className="nav-item dropdown">
                    <Link className="nav-link dropdown-toggle" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Meetings
                    </Link>
                    <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/login">Host a meeting</Link></li>
                        <li><Link className="dropdown-item" to="/login">Join a meeting</Link></li>
                    </ul>
                    </li>
                        <a className="nav-link" href="#hiw">
                            How It Works
                        </a>
                        <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" to="/signup">Sign Up</Link>
                        </li>
                        <li className="nav-item">
                        <Link className="nav-link active " aria-current="page" to="/login">Log In</Link>
                    </li>
                </ul>
                </div>
            </div>
            </nav>
        </>
    )
}