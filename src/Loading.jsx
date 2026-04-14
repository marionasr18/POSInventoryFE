import React, { useContext } from 'react';
import LoadingContextWrapper, { LoadingContext } from './LoadingContextWrapper';
import logo from './loaderSe.webp';
import './App.css';

export default function Loading() {
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const loaderStyle = {
    display: isLoading > 0 ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
    opacity: 0.4,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  };

  const imgStyle = {
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
  };

  return (
    <div style={loaderStyle}>    
      <img src={logo} alt='loading' style={imgStyle} />
    </div>  
  );
}