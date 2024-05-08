import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RenderRazorpay from './razorpay';
import { MyContext } from './context';
import { useContext } from 'react';
function Order() {
    const [displayRazorpay, setDisplayRazorpay] = useState(false);
    const { loginuserid,setloginuserid } = useContext(MyContext);
    const [orderDetails, setOrderDetails] = useState({
        orderId: null,
        currency: null,
        amount: null,
    });

    const handleCreateOrder = async (amount, currency) => {
        try {
            console.log(loginuserid,"login userId")
            const response = await axios.post('http://localhost:5000/api/order', {
                amount: amount, // Convert amount into lowest unit (e.g., Dollar to Cents)
                currency,
                keyId: process.env.REACT_APP_RAZORPAY_KEY_ID,
                keySecret: process.env.REACT_APP_RAZORPAY_KEY_SECRET,
            });

            if (response.data && response.data.order_id) {
                setOrderDetails({
                    orderId: response.data.order_id,
                    currency: response.data.currency,
                    amount: response.data.amount,
                });
                setDisplayRazorpay(true);
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

   
    return (
        <div>
            <button onClick={() => handleCreateOrder(1, 'INR')}>Place Order</button>
            
            {displayRazorpay && (
                <RenderRazorpay
                    amount={orderDetails.amount}
                    currency={orderDetails.currency}
                    orderId={orderDetails.orderId}
                    keyId={process.env.REACT_APP_RAZORPAY_KEY_ID}
                    keySecret={process.env.REACT_APP_RAZORPAY_KEY_SECRET}
                />
            )}
        </div>
    );
}

export default Order;
