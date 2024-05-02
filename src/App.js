// MainComponent.js

import React, { useState } from 'react';

import PDFViewer from './PageFlipViewer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Import AnnotationLayer CSS
import 'react-pdf/dist/esm/Page/TextLayer.css'; // Import TextLayer CSS
import pdf from './images/march.pdf'
import { MyContext } from './context';

import './App.css'

const App = () => {
   const [payment,setpayment]=useState(false);
   const [payementConfirm,setpaymentConfirm]=useState(false)
   const [showMagazine, setShowMagazine] = useState(true);
   const [loginuserid,setloginuserid]=useState(null);
   const [subscribed,setsubscribed]=useState(false);
  console.log(pdf)

  return (
    <MyContext.Provider value={{payment,setpayment,payementConfirm,setpaymentConfirm,showMagazine, setShowMagazine,loginuserid,setloginuserid,subscribed,setsubscribed}}>
      <div>
        <PDFViewer pdf={pdf} />
      </div>
    </MyContext.Provider>

  );
};

export default App;

