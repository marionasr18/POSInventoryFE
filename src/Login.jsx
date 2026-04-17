import React, { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { LoadingContext } from "./LoadingContextWrapper";
import Swal from "sweetalert2";




const Login = () => {

    const [uname, setUname] = useState('');
    const [pass, setPass] = useState('');

    const nav = useNavigate();
    const { setIsLoading } = useContext(LoadingContext);


    const handleChangePs = useCallback(
        (e) => {
            setPass(e.target.value)
            // console.log(pass)
        }, [pass])
    const handleChangeNm = useCallback((e) => {


        setUname(e.target.value)
        // console.log(uname)


    }, [uname])


    async function handleSubmit(e) {
        e.preventDefault();
        // Super user → inventory admin dashboard
        if (uname === "su" && pass === "su") {
            sessionStorage.setItem("auth", uname);
            sessionStorage.setItem("userRole", "admin");
            localStorage.setItem("item_key", uname);
            nav("/HomeDashboard", { replace: true });
            return;
        }
        // Staff / cashier → POS (transaction + purchase tabs)
        if (uname === "cy" && pass === "123") {
            sessionStorage.setItem("auth", uname);
            sessionStorage.setItem("userRole", "pos");
            localStorage.setItem("item_key", uname);
            nav("/pos/sales", { replace: true });
            return;
        }
        Swal.fire({
            title: "Error",
            text: "Invalid username or password",
            icon: "error",
            confirmButtonText: "OK",
        });
        // const params = {

        //     "username": uname,
        //     "password": pass,


        // }
        // setIsLoading(prv => prv + 1);
        // let userData = await FetchData("http://localhost:3001/api/users/login", 'post', params).
        //     catch(error => {
        //         throw error
        //     })

        // setIsLoading(prv => prv - 1)

        // const userData = users.find((user) => user.username === uname);

        // Compare user info


        // if (userData) {
        //     setRole(userData)
        //     if (userData.data.success === 0) {
        //         // Invalid password
        //         Swal.fire({
        //             title: "Error",
        //             text: "Invalid username or password",
        //             icon: "error",
        //             confirmButtonText: "OK",
        //           });
        //         // alert("Invalid Username or Password")
        //     } else if (userData.data.success === 1) {


        //         sessionStorage.setItem('auth', userData.data.token)
        //         localStorage.setItem("item_key", uname);
        //         nav("/profile", { replace: true })



        //     }
        // } else {
        //     // Username not found
        //     Swal.fire({
        //         title: "Error",
        //         text: "Invalid username or password",
        //         icon: "error",
        //         confirmButtonText: "OK",
        //       });
        //    // alert("Invalid Username or Password")
        // }
    }
    const handleSignUp = useCallback(() => {
        nav('/signUp')
    }, [])

    return (
        <div className="login-container">
          <div className="login-card">
            <h2 className="login-title">Sign in</h2>
      
            <form onSubmit={handleSubmit}>
              <input
                className="login-input"
                value={uname}
                type="text"
                placeholder="Username"
                onChange={handleChangeNm}
              />
      
              <input
                className="login-input"
                value={pass}
                type="password"
                placeholder="Password"
                onChange={handleChangePs}
              />
      
              <button className="login-btn" type="submit">
                Sign In
              </button>
            </form>
      
            <div className="login-footer">
              Don't have an account?{" "}
              <button className="login-link" onClick={handleSignUp}>
                Sign up
              </button>
            </div>
          </div>
        </div>
      );
}
export default Login;