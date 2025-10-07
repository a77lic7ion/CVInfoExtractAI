import { GoogleGenAI, Type } from "@google/genai";
import type { ExtractedCVData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: { 
      type: Type.STRING,
      description: "The full name of the candidate."
    },
    age: { 
      type: Type.NUMBER,
      description: "Calculate the candidate's age based on their Date of Birth and the current year."
    },
    driversLicense: {
      type: Type.BOOLEAN,
      description: "Does the candidate have a driver's license? True or false."
    },
    ownTransport: {
      type: Type.BOOLEAN,
      description: "Does the candidate have their own transport? True or false."
    },
    noticePeriod: {
      type: Type.STRING,
      description: "The candidate's notice period. If not mentioned, state 'Available immediately'."
    },
    salaryRequirement: {
      type: Type.STRING,
      description: "The candidate's required salary. If not mentioned, state 'Not specified'."
    },
    workHistory: {
      type: Type.ARRAY,
      description: "The candidate's professional work experience.",
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, description: "The name of the company." },
          position: { type: Type.STRING, description: "The job title or position." },
          duration: { type: Type.STRING, description: "The start and end dates of the employment (e.g., 'Sep 2023 – Present')." },
          reasonForLeaving: { type: Type.STRING, description: "The reason for leaving the job. If not specified, infer from context or write 'Not specified'." }
        },
        required: ['company', 'position', 'duration', 'reasonForLeaving']
      }
    },
    qualifications: {
      type: Type.ARRAY,
      description: "The candidate's educational qualifications.",
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING, description: "The name of the educational institution." },
          course: { type: Type.STRING, description: "The name of the certificate, diploma, or degree." },
          year: { type: Type.STRING, description: "The year or duration of the study (e.g., 'Mar 2021 – May 2022')." }
        },
        required: ['institution', 'course', 'year']
      }
    }
  },
  required: ['fullName', 'age', 'driversLicense', 'ownTransport', 'noticePeriod', 'salaryRequirement', 'workHistory', 'qualifications']
};


export const extractCVInfo = async (
  file: File
): Promise<ExtractedCVData> => {
  try {
    const base64Data = await fileToBase64(file);

    const filePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const prompt = `You are an expert HR assistant. Your task is to analyze the provided CV document (which could be an image, PDF, or text document) and extract specific information into a structured JSON format. Be as accurate as possible. Follow the provided schema precisely.

- Calculate the candidate's age based on their Date of Birth (D.O.B) and the current year.
- Determine if they have a driver's license and their own transport. For the user's template, we will assume they have their own transport if they have a license.
- Extract all work history and qualifications.
- If information like salary or notice period isn't available, use a sensible default as described in the schema.
- Format durations exactly as they appear in the CV.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [filePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    return parsedData as ExtractedCVData;
  } catch (error) {
    console.error("Error extracting CV info:", error);
    throw new Error("Failed to extract information from the CV. Please check the console for details.");
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove prefix `data:${file.type};base64,`
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};