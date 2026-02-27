import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export function UploadSection({ onUploadComplete }) {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleStartExtraction = () => {
        setIsUploading(true);
        // Simulate API Call
        setTimeout(() => {
            setIsUploading(false);
            onUploadComplete({
                fileName: file.name,
                extractedData: {
                    benefits: [{ id: 1, name: "Consultation", limit: "₹500", condition: "Per visit" }],
                    subLimits: [{ id: 1, category: "Room Rent", limit: "1% of Sum Insured" }],
                },
                rawTextLength: 15420
            });
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Upload Insurance Plan</h2>
                <p className="text-gray-500 mt-1">Upload the PDF document to begin the extraction process.</p>
            </div>

            <div
                className="flex-1 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-12 transition-colors hover:bg-gray-100 hover:border-gray-400"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {!file ? (
                    <>
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8 text-medical-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Drag and drop your PDF here</h3>
                        <p className="text-sm text-gray-500 mb-6">Max file size: 50MB</p>

                        <label className="bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition-colors">
                            Browse Files
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                        </label>
                    </>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-md">
                        <div className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 mb-8 shadow-sm">
                            <div className="bg-medical-50 p-3 rounded-lg text-medical-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                            >
                                ✕
                            </button>
                        </div>

                        <button
                            onClick={handleStartExtraction}
                            disabled={isUploading}
                            className="w-full bg-medical-600 hover:bg-medical-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Extracting Content...
                                </>
                            ) : (
                                "Start Extraction"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
