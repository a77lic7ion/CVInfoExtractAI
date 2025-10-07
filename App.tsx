import React, { useState, useCallback, useEffect } from 'react';
import { extractCVInfo } from './services/geminiService';
import type { ExtractedCVData } from './types';
import Loader from './components/Loader';
import ResultDisplay from './components/ResultDisplay';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isDocFile, setIsDocFile] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File is too large. Please select a file smaller than 15MB.');
        setFile(null);
        setIsDocFile(false);
        setExtractedData(null);
        return;
      }

      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();

      const isImage = fileType.startsWith('image/');
      const isPdf = fileType === 'application/pdf';
      const isText = fileType === 'text/plain' || fileName.endsWith('.txt');
      const isDocx =
        fileType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx');
      const isDoc =
        fileType === 'application/msword' || fileName.endsWith('.doc');

      if (isDoc) {
        setIsDocFile(true);
        setError(
          "Legacy .doc file detected. Please open it in MS Word or Google Docs, 'Save As' a .docx or PDF, and upload the new file."
        );
        setFile(selectedFile);
        setExtractedData(null);
      } else if (isImage || isPdf || isText || isDocx) {
        setIsDocFile(false);
        setFile(selectedFile);
        setError(null);
        setExtractedData(null);
      } else {
        setIsDocFile(false);
        setError(
          'Please upload a valid file format (JPG, PNG, PDF, DOCX, TXT).'
        );
        setFile(null);
      }
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragOver(true);
    } else if (e.type === 'dragleave') {
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

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center py-10 px-4">
       <div className="w-full max-w-4xl mx-auto flex justify-end mb-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
          CV Information Extractor
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Upload a CV file to automatically generate a standardized candidate
          profile.
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8">
          <div
            onDragEnter={handleDragEvents}
            onDragOver={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ${
              dragOver ? 'border-indigo-600 bg-indigo-50 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) =>
                handleFileChange(e.target.files ? e.target.files[0] : null)
              }
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 16v-4m0 0l-2 2m2-2l2 2m-8-4h12"
                ></path>
              </svg>
              <p className="text-slate-600 dark:text-slate-300 font-semibold">
                <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                PNG, JPG, PDF, DOC, DOCX, TXT up to 15MB
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-4 text-center text-sm text-slate-700 dark:text-slate-300">
              <p>
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={!file || isLoading || isDocFile}
            className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Extracting...' : 'Extract Information'}
          </button>
        </div>

        {isLoading && <Loader />}

        {error && (
          <div
            className={`mt-8 w-full px-4 py-3 rounded-lg ${
              isDocFile
                ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-500/50 text-blue-800 dark:text-blue-300'
                : 'bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300'
            }`}
            role="alert"
          >
            <strong className="font-bold">
              {isDocFile ? 'Action Required:' : 'Error:'}{' '}
            </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {extractedData && <ResultDisplay data={extractedData} />}
      </div>
    </div>
  );
};

export default App;