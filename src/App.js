// MainComponent.js

import React, { useState,useEffect } from 'react';
import axios from 'axios';

import PDFViewer from './PageFlipViewer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Import AnnotationLayer CSS
import 'react-pdf/dist/esm/Page/TextLayer.css'; // Import TextLayer CSS
import Order from './order';
import pdf from './images/march.pdf'
import { MyContext } from './context';


import './App.css'

const App = () => {
   const [payment,setpayment]=useState(false);
   const [payementConfirm,setpaymentConfirm]=useState(false)
   const [showMagazine, setShowMagazine] = useState(true);
   const [loginuserid,setloginuserid]=useState(null);
   const [subscribed,setsubscribed]=useState(false);
   const [displayuser,setdisplayuser]=useState(null);
   const [subscribetomagazine,setsubscribetomagazine]=useState(null);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [numPages, setNumPages] = useState(null);
   const [loading,setLoading]=useState(false)
  console.log(pdf)
  let response;

  const googleAuth = () => {

		window.open(
			`http://localhost:5000/api/auth/google/callback`,
			"_self"
		);
	};

  const checkMagazineSubscription = async (loginuserid) => {
    try {
        // Make a POST request to the API endpoint
        const response = await axios.post('http://localhost:5000/api/check_subscription', { loginuserid });
        
        // Check if the request was successful
        if (response.status === 200) {
            // Check if the magazine is subscribed
            // const { message } = response;
            console.log(response,"message")
            if (response.data.isSubscribed === true) {
                console.log('User is subscribed to the magazine');
                setsubscribetomagazine("subscribed")
                setShowMagazine(true);
                setpayment(true);
                setsubscribed(true);
                return true;

            } else {
                console.log('User is not subscribed to the magazine');
                setShowMagazine(false)
                setsubscribetomagazine(`${displayuser} is not subscribed to the magazine`)
                setpayment(false)
                setsubscribed(false)
                return false;
            }
        } else {
            console.log('Failed to check magazine subscription');
            return false;
        }
    } catch (error) {
        console.error('Error checking magazine subscription:', error);
        return false;
    }
};

     
const fetchAuthStatus = async () => {
    try {
     response = await axios.get('http://localhost:5000/api/auth/check',{ withCredentials: true });
      console.log(response,"response")
      if (response.data.isLoggedIn) {
        setIsAuthenticated(true);
        setShowMagazine(false);
        setloginuserid(response.data.user.email);
        setdisplayuser(response.data.user.email)
        console.log(response.data)
      
        if(loginuserid){
            const check= checkMagazineSubscription(loginuserid);
            if(check){
                setsubscribed(true)
              }else{
                setsubscribed(false)
              }
        }
       
          
      } else {
        console.log(false)
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to fetch auth status:', error);
    }
  };

  const checkPaymentAndDisplay = async () => {
    try {
        const response = await axios.get(`http://localhost:5000/api/check_payment_status`, { params: { userId: loginuserid }});
        if (response.data.paymentDone) {
            setShowMagazine(true);
            localStorage.setItem('backClicked', 'false');
            // setNumPages(null); // assuming you reset this to show all pages
        } else {
            setShowMagazine(false);
            setNumPages(4); // show limited pages
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
    }
};

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const onBackButtonEvent = (e) => {
        e.preventDefault();
        if (!localStorage.getItem('backClicked')) {
            localStorage.setItem('backClicked', 'true');
            checkPaymentAndDisplay();
        }
    };
    window.onpopstate = onBackButtonEvent;

    return () => {
        window.onpopstate = null;
    };
}, []);

  useEffect(() => {
    fetchAuthStatus();
  }, [isAuthenticated,showMagazine]);


  return (
    <> {localStorage.getItem('backClicked')?<div>please wait for 5 mins</div>: <MyContext.Provider value={{payment,setpayment,payementConfirm,setpaymentConfirm,showMagazine, setShowMagazine,loginuserid,setloginuserid,subscribed,setsubscribed,displayuser,setdisplayuser,subscribetomagazine,setsubscribetomagazine,isAuthenticated,numPages, setNumPages,loading,setLoading}}>
    <div className='pdf'>
      <div>
      {displayuser && <div>welcome: {displayuser}</div>}
          {subscribetomagazine && <div>{subscribetomagazine}</div>}
      </div>
    
      <PDFViewer pdf={pdf} />
      <PDFViewer pdf={pdf} />
      <div>
        {console.log(isAuthenticated,"authenticated")}
      {!isAuthenticated && numPages >= 4 &&  !showMagazine &&(
              <>
                  {console.log("nckdj")}
                  <button  onClick={googleAuth}>Sign in with Google to view all pages</button>
              </>
          )}
          {
              isAuthenticated && !payment  && !showMagazine  && !subscribed && (
                  <Order/>

                 
              )
          }
      </div>
    
    </div>
  </MyContext.Provider>}  
</>

  );
};

export default App;

