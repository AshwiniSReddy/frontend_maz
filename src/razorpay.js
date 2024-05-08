import { useEffect, useRef, useContext,useState } from 'react';
import axios from 'axios';
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
  const [error, setError] = useState(null);
  
  const { payementConfirm, setpaymentConfirm, showMagazine, setShowMagazine, loginuserid, setloginuserid, subscribed, setsubscribed, loading, setLoading,success, setSuccess,paymentInProgress, setPaymentInProgress} = useContext(MyContext);
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
        try {
          await Axios.post(`${serverBaseUrl}/api/magazine_subscribe`, {
            loginuserid,

            // Add any other parameters you need to update
          });
          setsubscribed(true);
        } catch (error) {
          console.log("error handling magazine_subscribe ", error)
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
    // This handler menthod is always executed in case of succeeded payment
    handler: (response) => {
      console.log('succeeded');
      console.log(response);
      paymentId.current = response.razorpay_payment_id;

      // Most important step to capture and authorize the payment. This can be done of Backend server.
      const succeeded = crypto.HmacSHA256(`${orderId}|${response.razorpay_payment_id}`, keySecret).toString() === response.razorpay_signature;

      // If successfully authorized. Then we can consider the payment as successful.
      if (succeeded) {

        paymentId.current = response.razorpay_payment_id;
        console.log("payment succeded",paymentId.current)
        setpaymentConfirm(true);
        setShowMagazine(true);
        try {
          Axios.post(`${serverBaseUrl}/api/magazine_subscribe`, {
            loginuserid,

            // Add any other parameters you need to update
          });
          setsubscribed(true);
        } catch (error) {
          console.log("error handling payment ", error)
        }

        handlePayment('succeeded', {
          orderId,
          paymentId,
          loginuserid,
          signature: response.razorpay_signature,
        });
      } else {
        handlePayment('failed', {
          orderId,
          loginuserid,
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
    const handleUnload = async (event) => {
      event.preventDefault();
      setLoading(true);
  
      // Function to initiate refund after a delay
      const delayRefund = async () => {
          // Wait for 5 seconds
          await new Promise(resolve => setTimeout(resolve, 5000));
  
          // Ensure paymentId.current is not null before accessing its current property
          
  
          if (paymentInProgress) {
            console.log("payement in process")
              try {
                  const response = await axios.post('http://localhost:5000/api/refund', {
                      paymentId: paymentId.current,
                      amount,
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
          } else {
              // Handle the scenario where paymentId.current is null
              console.log('Payment process was interrupted. Unable to initiate refund.');
              setLoading(false); // Make sure to set loading state accordingly
          }
      };
  
      // Call delayRefund after 5 seconds
      delayRefund();
  };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [loading]);

  return null;
};

export default RenderRazorpay;
