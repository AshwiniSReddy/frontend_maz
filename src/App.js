// MainComponent.js

import React from 'react';

import PDFViewer from './PageFlipViewer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Import AnnotationLayer CSS
import 'react-pdf/dist/esm/Page/TextLayer.css'; // Import TextLayer CSS
import pdf from './images/march.pdf'
import './App.css'

const App = () => {
 
  console.log(pdf)

  return (
    <div>
      <PDFViewer pdf={pdf} />
    </div>
  );
};

export default App;

