import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useContext } from 'react';
import { MyContext } from './context';
let localStorageTimer;
function WaitComponent() {
    const { setShowMagazine } = useContext(MyContext);

    useEffect(() => {
        let timer;
       

        const connectSocket = async () => {
            try {
                const socket = io('http://localhost:5000');
                await new Promise((resolve, reject) => {
                    timer = setTimeout(() => {
                        clearTimeout(timer);
                        reject(new Error('Socket connection timeout'));
                    }, 100000);

                    socket.on('connect', () => {
                        clearTimeout(timer);
                        resolve(socket);
                    });

                    // Listen for payment status from the server
                    socket.on('paymentStatus', (data) => {
                        console.log(data, "sockect data received");
                        if (data.status !== 'captured') {
                            console.log("not captured");
                            clearTimeout(localStorageTimer);
                            localStorageTimer = setTimeout(() => {
                                localStorage.removeItem('paymentInProgress');
                                setShowMagazine(true);
                            }, 10000); // Remove 'paymentInProgress' after 10 seconds if status is not captured
                        }else{
                            localStorage.removeItem('paymentInProgress');
                        }
                    });
                });
            } catch (error) {
                console.error('Socket connection error:', error);
            }
        };

        connectSocket();

        return () => {
            clearTimeout(timer); // Clear the connection timeout
            clearTimeout(localStorageTimer); // Clear the localStorage removal timeout
            // Cleanup logic if needed
        };
    }, []);

    return (
        <div>loading</div>
    );
}

export default WaitComponent;
