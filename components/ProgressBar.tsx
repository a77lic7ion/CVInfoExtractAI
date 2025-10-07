import React from 'react';

const ProgressBar: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto my-8">
      <p className="text-center text-sm text-slate-600 dark:text-slate-300 mb-2">
        Analyzing CV... This may take a moment.
      </p>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-full">
           <div className="h-full w-1/2 bg-indigo-600 rounded-full animate-indeterminate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
