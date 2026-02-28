import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export function UploadSection({ onUploadComplete, onChunk, onLog }) {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [processingLogs, setProcessingLogs] = useState([]);
    // we track number of chunks to show progress, not required for parsing
    const [chunks, setChunks] = useState([]);
    // we don't know total up front, it will grow as the stream comes in
    const totalChunks = chunks.length;

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

    const handleStartExtraction = async () => {
        if (!file) return;
        setIsUploading(true);
        setCurrentChunk(0);
        setChunks([]);
        setProcessingLogs([]);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/convert', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullText = '';
            let chunkIndex = 0;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                if (value) {
                    const text = decoder.decode(value);
                    chunkIndex += 1;

                    // split into lines and filter
                    const lines = text.split(/\r?\n/);
                    lines.forEach(line => {
                        const trimmed = line.trim();
                        const procMatch = trimmed.match(/^Processing chunk \d+\/\d+/);
                        if (procMatch) {
                            // only keep progress messages
                            setProcessingLogs(prev => [...prev, trimmed]);
                            if (onLog) {
                                onLog(trimmed);
                            }
                        } else {
                            fullText += line + '\n';
                            // append to streamingText state via callback if provided
                            if (onChunk) {
                                onChunk(line + '\n');
                            }
                        }
                    });

                    setChunks(prev => [...prev, text]);
                    setCurrentChunk(chunkIndex);
                    console.log('Received chunk', chunkIndex, text);
                }
                done = doneReading;
            }

            let jsonResult = null;
            try {
                jsonResult = JSON.parse(fullText);
            } catch (e) {
                console.error('Failed to parse JSON from server', e);
                jsonResult = { raw: fullText };
            }

            onUploadComplete({ fileName: file.name, ...jsonResult });
        } catch (err) {
            console.error('Extraction error', err);
            // TODO: set some error state to display to user
        } finally {
            setIsUploading(false);
        }
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
                                disabled={isUploading}
                            >
                                ✕
                            </button>
                        </div>

                        <button
                            onClick={handleStartExtraction}
                            disabled={isUploading}
                            className={`w-full text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2 relative overflow-hidden ${isUploading ? 'bg-medical-700 cursor-not-allowed' : 'bg-medical-600 hover:bg-medical-700'}`}
                        >
                            {isUploading && (
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-medical-500 opacity-40 transition-all duration-300"
                                    style={{ width: totalChunks ? `${(currentChunk / totalChunks) * 100}%` : '0%' }}
                                ></div>
                            )}
                            <div className="relative z-10 flex items-center gap-2">
                                {isUploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing chunk {currentChunk}/{totalChunks}...
                                    </>
                                ) : (
                                    "Start Extraction"
                                )}
                            </div>
                        </button>

                        {isUploading && (
                            <p className="mt-4 text-sm text-medical-600 animate-pulse font-medium">
                                Extracting structured review...
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* show processing log lines (filtered) */}
            {processingLogs.length > 0 && (
                <div className="mt-4 p-2 bg-white rounded-md border border-gray-200 max-h-32 overflow-y-auto text-xs">
                    <h4 className="font-semibold mb-1">Progress</h4>
                    {processingLogs.map((log, idx) => (
                        <div key={idx} className="mb-1">
                            {log}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
