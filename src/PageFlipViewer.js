
// import React, { useState, useEffect } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import FlipPage from 'react-pageflip';

// // Specify the URL to the worker script
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// const PDFViewer = ({ pdf }) => {
//     const [numPages, setNumPages] = useState(null);
//     const [error, setError] = useState(null);

//     // Function to handle loading of PDF
//     const onDocumentLoadSuccess = ({ numPages }) => {
//         setNumPages(numPages);
//     };

//     const onError = error => {
//         setError(error);
//     };

//     useEffect(() => {
//         if (pdf) {
//             // Load the first page of the PDF to determine the number of pages
//             fetch(`${pdf}#page=1`)
//                 .then(response => response.blob())
//                 .then(() => {
//                     setNumPages(10); // Set the number of pages manually for demonstration
//                 })
//                 .catch(error => {
//                     setError(error);
//                 });
//         }
//     }, [pdf]);

//     return (
//         <div>
//             {error && <div>Error loading PDF: {error.message}</div>}
//             {numPages && (
//                 <FlipPage
//                     className="flip-page-container"
//                     width={600} // Set the width of the flip page
//                     height={800} // Set the height of the flip page
//                     orientation="horizontal"
//                     uncutPages={true} // Display partial pages at the edg
//                 >
//                     {Array.from(new Array(numPages), (el, index) => (
//                         <div key={`page_${index + 1}`} className="page-container">
//                             {/* Render each page here */}
//                             <Document
//                                 file={pdf}
//                                 onLoadSuccess={onDocumentLoadSuccess}
//                                 onError={onError}
//                             >
//                                 <Page pageNumber={index + 1} />
//                             </Document>
//                         </div>
//                     ))}
//                 </FlipPage>
//             )}
//         </div>
//     );
// };

// export default PDFViewer;
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import FlipPage from 'react-pageflip';
import { MyContext } from './context';
import { useContext } from 'react';
import './PageFlip.css'
import axios from 'axios';
// Import Firebase modules
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Order from './order';
// import { signInWithGoogle } from "./firebase.config";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAsZMFAImqpaVczwan1e37Jln-pN4wFRQk",
    authDomain: "magazine-16106.firebaseapp.com",
    projectId: "magazine-16106",
    storageBucket: "magazine-16106.appspot.com",
    messagingSenderId: "149408882503",
    appId: "1:149408882503:web:92d16e0877ea2347917662",
    measurementId: "G-CXSJR22FET"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
let response;
// Specify the URL to the worker script
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ pdf }) => {
    const { payment,setpayment,showMagazine, setShowMagazine,loginuserid,setloginuserid ,subscribed,setsubscribed} = useContext(MyContext);
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    

    // Initialize Firebase authentication
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
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
                    setShowMagazine(true);
                    return true;
                } else {
                    console.log('User is not subscribed to the magazine');
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
            console.log(response.data)
          
            if(loginuserid){
                const check= checkMagazineSubscription(loginuserid);
                if(check){
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
      }, [isAuthenticated]);
    

    // Function to handle Google sign-in
    const handleSignInWithGoogle = async () => {
        console.log("numPages:", numPages);

        try {
            const result = await signInWithPopup(auth, provider);
            setIsAuthenticated(true);
            setShowMagazine(false)
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    // Function to handle loading of PDF
    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log("Number of pages:", numPages);
        setNumPages(numPages);
    };

    const onPageClick = (pageNumber) => {
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
            setNumPages(2);
        }
    }, [pdf]);
    useEffect(() => {
        // Check if user is already authenticated on component mount
        const user = auth.currentUser;
        if (user) {
            setIsAuthenticated(true);
        }
    }, []);


    return (
        <div className='pageContainer'>
            {error && <div>Error loading PDF: {error.message}</div>}
            {numPages && showMagazine &&(
                <FlipPage
                    className="flip-page-container"
                    width={600} // Set the width of the flip page
                    height={800} // Set the height of the flip page
                    orientation="horizontal"
                    uncutPages={true} // Display partial pages at the edge
                    currentPage={currentPage}
                    onChange={(newPage) => setCurrentPage(newPage)}
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
            {!isAuthenticated && numPages >= 4 && (
                <>
                    {console.log("nckdj")}
                    <button  onClick={googleAuth}>Sign in with Google to view all pages</button>
                </>
            )}
            {
                isAuthenticated && !payment && !showMagazine && !subscribed && (
                    <Order/>

                   
                )
            }
        </div>
    );
};

export default PDFViewer;




