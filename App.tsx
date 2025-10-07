import React, { useState, useCallback } from 'react';
import { extractCVInfo } from './services/geminiService';
import type { ExtractedCVData } from './types';
import Loader from './components/Loader';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
        const fileType = selectedFile.type;
        const fileName = selectedFile.name.toLowerCase();

        const isImage = fileType.startsWith('image/');
        const isPdf = fileType === 'application/pdf';
        const isText = fileType === 'text/plain' || fileName.endsWith('.txt');
        const isDoc = fileType === 'application/msword' || fileName.endsWith('.doc');
        const isDocx = fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx');

        if (isImage || isPdf || isText || isDoc || isDocx) {
            setFile(selectedFile);
            setError(null);
            setExtractedData(null);
        } else {
            setError('Please upload a valid file format (JPG, PNG, PDF, DOC, DOCX, TXT).');
        }
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
        setDragOver(true);
    } else if (e.type === "dragleave") {
        setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleExtract = useCallback(async () => {
    if (!file) {
      setError('Please select a CV file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const data = await extractCVInfo(file);
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">CV Information Extractor</h1>
        <p className="text-lg text-slate-600 mb-8">
          Upload a CV file to automatically generate a standardized candidate profile.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div 
            onDragEnter={handleDragEvents}
            onDragOver={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ${dragOver ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
            />
             <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0 0l-2 2m2-2l2 2m-8-4h12"></path></svg>
                <p className="text-slate-600 font-semibold">
                    <span className="text-indigo-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF, DOC, DOCX, TXT up to 10MB</p>
            </label>
          </div>
          
          {file && (
            <div className="mt-4 text-center text-sm text-slate-700">
              <p>Selected file: <span className="font-medium">{file.name}</span></p>
            </div>
          )}
          
          <button
            onClick={handleExtract}
            disabled={!file || isLoading}
            className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Extracting...' : 'Extract Information'}
          </button>
        </div>
        
        {isLoading && <Loader />}
        
        {error && (
          <div className="mt-8 w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {extractedData && <ResultDisplay data={extractedData} />}
      </div>
    </div>
  );
};

export default App;