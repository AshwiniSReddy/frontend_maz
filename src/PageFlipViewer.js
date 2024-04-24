
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
import './PageFlip.css'
// Import Firebase modules
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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

// Specify the URL to the worker script
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ pdf }) => {
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [showMagazine, setShowMagazine] = useState(true);

    // Initialize Firebase authentication
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const googleAuth = () => {

		window.open(
			`http://localhost:5000/api/auth/google/callback`,
			"_self"
		);
	};

    // Function to handle Google sign-in
    const handleSignInWithGoogle = async () => {
        console.log("numPages:", numPages);

        try {
            const result = await signInWithPopup(auth, provider);
            setIsAuthenticated(true);
            setShowMagazine(true);
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
        if(pageNumber===4){
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
        </div>
    );
};

export default PDFViewer;




