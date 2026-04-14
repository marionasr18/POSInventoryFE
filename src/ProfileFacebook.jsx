import "./profileToShow.css";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { FetchData } from './functions';
import { cloneDeep, isEmpty } from "lodash";
import axios from "axios";
import logo from './ufo.png'

import NavigationBar from './NavigationBar';
function ProfileFacebook() {
  const STATE = {
name:'mario',
coverPic:'./ufo.png',
profilePic:'./ufo.png',
  }
  const [state, setState] = useState(STATE)
  useEffect(() => {
    FillData()
  }, [])
  const FillData = useCallback(async () => {
    // const test = await FetchData('http://localhost:3001/api','get')
    // let test = await axios({ method: 'get', url: 'http://localhost:3001/api' , crossDomain: true, signal: null });
    const _data = {
      country: 'us',
      category: 'sports',
      apiKey: '9f79c0c7e60f45ef824d2876e97a1ee2'
    }
    let queryparams = new URLSearchParams({ ..._data });
    // let data = await FetchData('https://newsapi.org/v2/top-headlines','get',_data)
    let data = await axios({ method: 'get', url: 'https://newsapi.org/v2/top-headlines' + `${!isEmpty(_data) ? `?${queryparams.toString()}` : ''}`, crossDomain: true, signal: null });
    // let data2 = await FetchData( 'http://20.74.234.61:18792/DailyRate/Service1.svc/web/getrate', 'get');
    console.log(data.data.articles)

    setState(prv => {
      return {
        ...prv,
        articles: data.data.articles
      }
    })
  }, [])


  return (<>
    <NavigationBar />
    <div className="images">
      {/* <img src={logo} alt="" className="cover" /> */}
      <img src={logo} alt="" className="profilePic" />
    </div>
    <div className="profileContainer">
      <div className="uInfo">
        <div className="left">
          <a href="http://facebook.com">
            <FacebookTwoToneIcon fontSize="large" />
          </a>
          <a href="http://facebook.com">
            <InstagramIcon fontSize="large" />
          </a>
          <a href="http://facebook.com">
            <TwitterIcon fontSize="large" />
          </a>
          <a href="http://facebook.com">
            <LinkedInIcon fontSize="large" />
          </a>
        </div>
        <div className="center">
          <span className="bold">{state.name}</span>
          <div className="info">
            <div className="item">
              <PlaceIcon />
              <span>Jbeil</span>
            </div>
            
          </div>
        </div>
        </div>
        </div>
      </> );
}

      export default ProfileFacebook;