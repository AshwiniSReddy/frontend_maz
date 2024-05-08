// MainComponent.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import PDFViewer from './PageFlipViewer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Import AnnotationLayer CSS
import 'react-pdf/dist/esm/Page/TextLayer.css'; // Import TextLayer CSS
import Order from './order';
import pdf from './images/march.pdf'
import { MyContext } from './context';
import Loading from './loading';

import './App.css'


const App = () => {
  const [payment, setpayment] = useState(false);
  const [payementConfirm, setpaymentConfirm] = useState(false)
  const [showMagazine, setShowMagazine] = useState(true);
  const [loginuserid, setloginuserid] = useState(null);
  const [subscribed, setsubscribed] = useState(false);
  const [displayuser, setdisplayuser] = useState(null);
  const [subscribetomagazine, setsubscribetomagazine] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  console.log(pdf)
  let response;
  const paymentInProgress1 = window.localStorage.getItem('paymentInProgress') === 'true';
  const amountlocal = window.localStorage.getItem('amountlocal')

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
        console.log(response, "message")
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
      response = await axios.get('http://localhost:5000/api/auth/check', { withCredentials: true });
      console.log(response, "response")
      if (response.data.isLoggedIn) {
        setIsAuthenticated(true);
        setShowMagazine(false);
        setloginuserid(response.data.user.email);
        setdisplayuser(response.data.user.email)
        console.log(response.data)
        if (paymentInProgress1) {



          const delayRefund = async () => {
            // Wait for 5 seconds
            await new Promise(resolve => setTimeout(resolve, 10000));

            const response1 = await axios.get(`http://localhost:5000/api/getpayment/${response.data.user.email}`);
            console.log(response1, "getpaymentid")
            // Extract the payment ID from the response data
            const paymentId = response1.data.paymentId;

            // const fetchPaymentDetails = async (paymentId) => {
            //   try {
            //     const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
            //       auth: {
            //         username: process.env.REACT_APP_RAZORPAY_KEY_ID,
            //         password: process.env.REACT_APP_RAZORPAY_KEY_SECRET
            //       }
            //     });
            //     return response.data;
            //   } catch (error) {
            //     console.error('Error fetching payment details:', error);
            //     throw error;
            //   }
            // };

            // const checkPaymentStatus = async (paymentId) => {
            //   try {
            //     const paymentDetails = await fetchPaymentDetails(paymentId);
            //     console.log('Payment details:', paymentDetails);
            //     console.log('Payment status:', paymentDetails.status);
            //     return paymentDetails.status;
            //   } catch (error) {
            //     // Handle error
            //   }
            // };
            // Ensure paymentId.current is not null before accessing its current property
            try {
              const response = await axios.post('http://localhost:5000/api/refund', {
                paymentId: paymentId,
                amountlocal,
              });
              setSuccess(true);
              if (response) {
                setLoading(false);
              }
              console.log(response.data);
            } catch (error) {
              setError(error.response.data.error);
            } finally {
              setLoading(false);
            }



          };

          // Call delayRefund after 5 seconds
          delayRefund();


        } else {
          // Handle the scenario where paymentId.current is null
          console.log('Payment process was interrupted. Unable to initiate refund.');
          setLoading(false); // Make sure to set loading state accordingly
        }
        if (loginuserid) {
          const check = checkMagazineSubscription(loginuserid);
          if (check) {
            setsubscribed(true)
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

  useEffect(() => {
    fetchAuthStatus();
  }, [isAuthenticated, showMagazine]);


  return (
    <MyContext.Provider value={{ payment, setpayment, payementConfirm, setpaymentConfirm, showMagazine, setShowMagazine, loginuserid, setloginuserid, subscribed, setsubscribed, displayuser, setdisplayuser, subscribetomagazine, setsubscribetomagazine, isAuthenticated, numPages, setNumPages, loading, setLoading, success, setSuccess, paymentInProgress, setPaymentInProgress }}>
      {paymentInProgress1 ? <Loading /> : <div className='pdf'>
        <div>
          {displayuser && <div>welcome: {displayuser}</div>}
          {subscribetomagazine && <div>{subscribetomagazine}</div>}
        </div>

        <PDFViewer pdf={pdf} />
        <PDFViewer pdf={pdf} />
        <div>
          {console.log(isAuthenticated, "authenticated")}
          {!isAuthenticated && numPages >= 4 && !showMagazine && (
            <>
              {console.log("nckdj")}
              <button onClick={googleAuth}>Sign in with Google to view all pages</button>
            </>
          )}
          {
            isAuthenticated && !payment && !showMagazine && !subscribed && (
              <Order />


            )
          }
        </div>

      </div>}
    </MyContext.Provider>

  );
};

export default App;

