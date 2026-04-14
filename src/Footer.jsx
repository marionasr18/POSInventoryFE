import React, { useState, useCallback, useEffect, useContext } from "react";
import { FetchData } from "./functions";
import { useNavigate } from "react-router-dom"
import './App.css'
import { LoadingContext } from "./LoadingContextWrapper";




const Footer = () => {

    
    return (
       <footer>
        <span>Made with Love </span>
       </footer>
    )
}
export default Footer;