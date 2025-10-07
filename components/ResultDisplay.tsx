import React, { useState, useMemo } from 'react';
import type { ExtractedCVData } from '../types';

interface ResultDisplayProps {
  data: ExtractedCVData;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const formattedText = useMemo(() => {
    const experienceSection = data.workHistory
      .map(
        (job) =>
          `${job.duration}\n${job.company}\n${job.position}\n**Reason for leaving: ${job.reasonForLeaving}`
      )
      .join('\n\n');

    const qualificationsSection = data.qualifications
      .map(
        (qual) =>
          `${qual.institution}\n${qual.course} | ${qual.year}`
      )
      .join('\n\n');

    return `Dear Sarah

I hope you are well.

I am pleased to present ${data.fullName} as a candidate for the role you are hiring for.


Experience:

${experienceSection}


Qualifications

${qualificationsSection}


Notice Period:                       ${data.noticePeriod}

Salary Requirement:            ${data.salaryRequirement}

Age:                                       ${data.age}

Driver's License:                    ${data.driversLicense ? 'Yes' : 'No'}

Own transport:                      ${data.ownTransport ? 'Yes' : 'No'}


References:

Available upon request.


Kindly advise if this candidate is of interest to you.


Kind Regards`;
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Generated Profile</h2>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            copied
              ? 'bg-green-600 text-white focus:ring-green-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
          }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
      <pre className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed text-left">
        {formattedText}
      </pre>
    </div>
  );
};

export default ResultDisplay;