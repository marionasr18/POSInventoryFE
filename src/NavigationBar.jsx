// import Container from 'react-bootstrap/Container';
// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
function NavigationBar() {
  const nav = useNavigate();
  const [user, setUser] = useState(false)
  useEffect(() => {
    let userFromStorage = localStorage.getItem('item_key');
    if (userFromStorage === 'SU')
      setUser(true)
  }, [])
  const handleLogout = () => {
    sessionStorage.removeItem('auth')
    localStorage.removeItem('item_key');

    nav("/", { replace: true })
  }
  return (<>
    <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        {/* <svg className="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z"/></svg> */}
        <span className="font-semibold text-xl tracking-tight">Sports Buddy</span>
      </div>
      <div className="block lg:hidden">
        <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Home</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
        </button>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center ">
        <div className="text-sm lg:flex-grow">
          <a href="/profile" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white col-2">
            <span className='lead'>Home </span>
          </a>
          {!user && <a href="/friends" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white col-2">
            <span className='lead'>Friends  </span>
          </a>}
         
          {!user &&   <a href="/event" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white  col-2">
            <span className='lead'>Games</span>
          </a>}
          {!user && <a href="editProfile" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white  col-2">
            <span className='lead'>Profile</span>
          </a>}
          {!user && <a href="/chatRoom" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white  col-3">
              <span className='lead'>Chat Room</span>
            </a>}
          {user && <> <a href="/sportsDefinition" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white  col-3">
            <span className='lead'>Sport Definition</span>
          </a>
            <a href="/fieldsDefinition" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white  col-3">
              <span className='lead'>Fields Definition</span>
            </a>
            <a href="/disableUser" className="block lg:inline-block lg:mt-0 text-teal-200 hover:text-white  col-3">
              <span className='lead'>Disable User</span>
            </a>
           
          </>}
        </div>
        <div>
          <button className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white lg:mt-0" onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    </nav>

  </>);
}

export default NavigationBar;
