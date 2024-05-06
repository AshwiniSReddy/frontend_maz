
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import FlipPage from 'react-pageflip';
import { MyContext } from './context';
import { useContext } from 'react';
import './PageFlip.css'
import axios from 'axios';
// Import Firebase modules

import Order from './order';

let response;
// Specify the URL to the worker script
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ pdf }) => {
    const { payment,setpayment,showMagazine, setShowMagazine,loginuserid,setloginuserid ,subscribed,setsubscribed,displayuser,setdisplayuser,subscribetomagazine,setsubscribetomagazine,isAuthenticated,numPages, setNumPages} = useContext(MyContext);
    
    const [error, setError] = useState(null);
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    

    
    
   
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
    


    // Function to handle loading of PDF
    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log("Number of pages:", numPages);
        setNumPages(numPages);
    };

    const onPageClick = (pageNumber) => {
        
        if(loginuserid){
            const check= checkMagazineSubscription(loginuserid);
            if(check){
                setsubscribed(true)
              }else{
                setsubscribed(false)
              }
        }
       
        console.log("Clicked page number:", pageNumber);
        setCurrentPage(pageNumber);
        if(pageNumber===4 && !isAuthenticated ){
            setShowMagazine(false);
        }

    };

    const onError = error => {
        setError(error);
    };

    useEffect(() => {
        if (pdf) {
            // Load the first page of the PDF initially
            
            setNumPages(4);
        }
    }, [pdf]);
 


    return (
        <div className='pageContainer'>
            {error && <div>Error loading PDF: {error.message}</div>}
           
            {numPages && showMagazine && !payment && !subscribed &&(
                <FlipPage
                    className="flip-page-container"
                    width={600} // Set the width of the flip page
                    height={800} // Set the height of the flip page
                    orientation="horizontal"
                    uncutPages={true} // Display partial pages at the edge
                    currentPage={currentPage}
                    onChange={(newPage) =>{setCurrentPage(newPage);console.log(newPage,"pagenumber")} }
                    flippingTime={100}
                >
                    {Array.from(new Array(4), (el, index) => (
                        <div key={`page_${index + 1}`} className="page-container">
                            {/* Render each page here */}
                            <Document
                                file={pdf}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onError={onError}
                            >
                                <Page pageNumber={index + 1} onClick={() => onPageClick(index + 1)} />
                            </Document>
                        </div>
                    ))}
                </FlipPage>
            )}
            {numPages && showMagazine && payment && subscribed &&(
                <FlipPage
                    className="flip-page-container"
                    width={600} // Set the width of the flip page
                    height={800} // Set the height of the flip page
                    orientation="horizontal"
                    uncutPages={true} // Display partial pages at the edge
                    currentPage={currentPage}
                    onChange={(newPage) =>{setCurrentPage(newPage);console.log(newPage,"pagenumber")} }
                    flippingTime={100}
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        <div key={`page_${index + 1}`} className="page-container">
                            {/* Render each page here */}
                            <Document
                                file={pdf}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onError={onError}
                            >
                                <Page pageNumber={index + 1} onClick={() => onPageClick(index + 1)} />
                            </Document>
                        </div>
                    ))}
                </FlipPage>
            )}
            {/* Render Google sign-in button if not authenticated */}
            
        </div>
    );
};

export default PDFViewer;




