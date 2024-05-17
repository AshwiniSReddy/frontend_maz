import { useEffect, useRef,useContext } from 'react';
import crypto from 'crypto-js';
import PropTypes from 'prop-types';
import Axios from 'axios';
import { MyContext } from './context';


// Function to load script and append in DOM tree.
const loadScript = src => new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => {
    console.log('razorpay loaded successfully');
    resolve(true);
  };
  script.onerror = () => {
    console.log('error in loading razorpay');
    resolve(false);
  };
  document.body.appendChild(script);
});

const serverBaseUrl = "http://localhost:5000";

const RenderRazorpay = ({
  orderId,
  keyId,
  keySecret,
  currency,
  amount,
}) => {
  const paymentId = useRef(null);
  const paymentMethod = useRef(null);
  const { payementConfirm,setpaymentConfirm ,showMagazine, setShowMagazine,loginuserid,setloginuserid,subscribed,setsubscribed,setLoading,loading} = useContext(MyContext);
  // To load razorpay checkout modal script.
  const displayRazorpay = async (options) => {
    const res = await loadScript(
      'https://checkout.razorpay.com/v1/checkout.js',
    );

    if (!res) {
      console.log('Razorpay SDK failed to load. Are you online?');
      return;
    }
    // All information is loaded in options which we will discuss later.
    const rzp1 = new window.Razorpay(options);

    // If you want to retreive the chosen payment method.
    rzp1.on('payment.submit', (response) => {
      paymentMethod.current = response.method;
    });

    // To get payment id in case of failed transaction.
    rzp1.on('payment.failed', (response) => {
      paymentId.current = response.error.metadata.payment_id;
    });

    // to open razorpay checkout modal.
    rzp1.open();
  };


  // informing server about payment
  const handlePayment = async (status, orderDetails = {}) => {
    try {
        // Make a POST request to your backend to inform about the payment status
        await Axios.post(`${serverBaseUrl}/api/payment`, {
          status,
          orderDetails,
        });
    
        // If payment is successful, update the payementConfirm state to true
        if (status === 'succeeded') {
          setpaymentConfirm(true);
           setShowMagazine(true);
           try{
            await Axios.post(`${serverBaseUrl}/api/magazine_subscribe`, {
              loginuserid,
              orderDetails
              // Add any other parameters you need to update
            });
            setsubscribed(true);
           }catch(error){
               console.log("error handling magazine_subscribe ",error)
           }
           
        }
      } catch (error) {
        console.error('Error handling payment:', error);
      }
  };


  // we will be filling this object in next step.
  const options = {
    key: keyId, // key id from props
    amount, // Amount in lowest denomination from props
    currency, // Currency from props.
    name: 'My custom title', // Title for your organization to display in checkout modal
    // image, // custom logo  url
    order_id: orderId, // order id from props
    prefill: {
      email: loginuserid, // Assuming `loginuserid` is the user's email
    },
    // This handler menthod is always executed in case of succeeded payment
    handler: (response) => {
      console.log('succeeded');
      console.log(response);
      paymentId.current = response.razorpay_payment_id;

      // Most important step to capture and authorize the payment. This can be done of Backend server.
      const succeeded = crypto.HmacSHA256(`${orderId}|${response.razorpay_payment_id}`, keySecret).toString() === response.razorpay_signature;
   
      // If successfully authorized. Then we can consider the payment as successful.
      if (succeeded) {
        setpaymentConfirm(true);
        setShowMagazine(true);
        try{
           Axios.post(`${serverBaseUrl}/api/magazine_subscribe`, {
            loginuserid,
           
            // Add any other parameters you need to update
          });
          setsubscribed(true);
         }catch(error){
             console.log("error handling payment ",error)
         }
        
        handlePayment('succeeded', {
          orderId,
          paymentId,
          signature: response.razorpay_signature,
        });
      } else {
        handlePayment('failed', {
          orderId,
          paymentId: response.razorpay_payment_id,
        });
      }
    },
    modal: {
      confirm_close: true, // this is set to true, if we want confirmation when clicked on cross button.
      // This function is executed when checkout modal is closed
      // There can be 3 reasons when this modal is closed.
      ondismiss: async (reason) => {
        const {
          reason: paymentReason, field, step, code,
        } = reason && reason.error ? reason.error : {};
        // Reason 1 - when payment is cancelled. It can happend when we click cross icon or cancel any payment explicitly. 
        if (reason === undefined) {
          console.log('cancelled');
          handlePayment('Cancelled');
        } 
        // Reason 2 - When modal is auto closed because of time out
        else if (reason === 'timeout') {
          console.log('timedout');
          handlePayment('timedout');
        } 
        // Reason 3 - When payment gets failed.
        else {
          console.log('failed');
          handlePayment('failed', {
            paymentReason, field, step, code,
          });
        }
      },
    },
    // This property allows to enble/disable retries.
    // This is enabled true by default. 
    retry: {
      enabled: false,
    },
    timeout: 900, // Time limit in Seconds
    theme: {
      color: 'green', // Custom color for your checkout modal.
    },
  };

  useEffect(() => {
    console.log('in razorpay');
    displayRazorpay(options);
    const paymentInProgress = window.localStorage.setItem('paymentInProgress', 'true');
    const amountlocal=window.localStorage.setItem('amountlocal',amount)

    let timer;
  
    const handleUnload = async (event) => {
      event.preventDefault();
      setLoading(true);
       timer = setTimeout(async () => {
        try {
          const response = await Axios.get('http://localhost:5000/api/check_payment_status',{ loginuserid });
          if (response.data.paymentStatus==="captured") {
            // Payment is done, update local storage
            window.localStorage.setItem('paymentInProgress', 'false');
            setLoading(false)
          }else{
            window.localStorage.setItem('paymentInProgress', 'false');
            setLoading(false)
             
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        } finally {
          setLoading(false);
        }
      }, 5000); // 5 seconds
  };
     
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [loading]);

  return null;
};

export default RenderRazorpay;
