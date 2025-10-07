import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="ml-4 text-slate-600 dark:text-slate-300">Analyzing CV...</p>
    </div>
  );
};

export default Loader;
