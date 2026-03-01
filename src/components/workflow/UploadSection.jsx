import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export function UploadSection({ onUploadComplete, onChunk, onLog }) {
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [processingLogs, setProcessingLogs] = useState([]);
    const [progressText, setProgressText] = useState('');

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
        setTotalChunks(0);
        setProcessingLogs([]);
        setProgressText('');

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

            if (!response.body) {
                throw new Error('No response body from server');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let jsonMode = false;
            let jsonBuffer = '';

            const processLine = (line) => {
                const normalized = line.replace(/\r$/, '');
                const trimmed = normalized.trim();

                if (!jsonMode) {
                    if (trimmed === '---JSON RESULT---') {
                        jsonMode = true;
                        return;
                    }

                    
                    // Detect a line that declares total chunks: "Processing X chunks..."
                    const totalMatch = trimmed.match(/^Processing\s+(\d+)\s+chunks/i);
                    if (totalMatch) {
                        const total = Number.parseInt(totalMatch[1], 10);
                        setTotalChunks(total);
                        const logLine = `Processing ${total} chunks`;
                        setProcessingLogs(prev => [...prev, logLine]);
                        setProgressText(prev => prev + logLine + '\n');
                        if (onLog) onLog(logLine);
                        return;
                    }

                    const chunkMatch = trimmed.match(/^chunk\s+(\d+)\/(\d+)/i);

                    if (chunkMatch) {
                        const current = Number.parseInt(chunkMatch[1], 10);
                        const total = Number.parseInt(chunkMatch[2], 10);
                        const logLine = `Processing chunk ${current}/${total}`;

                        setCurrentChunk(current);
                        setTotalChunks(total);
                        setProcessingLogs(prev => [...prev, logLine]);
                        setProgressText(prev => prev + logLine + '\n');

                        if (onLog) {
                            onLog(logLine);
                        }
                        if (onChunk) {
                            onChunk(logLine + '\n');
                        }
                    }
                    return;
                }

                jsonBuffer += normalized + '\n';
            };

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (!value) continue;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    processLine(line);
                }
            }

            buffer += decoder.decode();
            if (buffer) {
                processLine(buffer);
            }

            try {
                const parsed = JSON.parse(jsonBuffer);
                onUploadComplete(parsed);
            } catch (parseErr) {
                console.error('Failed to parse streamed JSON result', parseErr);
            }
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
                                        {totalChunks > 0
                                            ? `Processing chunk ${currentChunk}/${totalChunks}...`
                                            : 'Processing...'}
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

            {/* show live stream output only - hide separate 'Progress' box per design */}
            {progressText && (
                <div className="mt-4">
                    <div className="flex flex-col gap-1">
                        <h4 className="font-semibold text-sm text-gray-700">Live Stream Output</h4>
                        <div id="progress" className="p-3 bg-gray-900 text-green-400 rounded-md border border-gray-800 max-h-64 overflow-y-auto text-xs font-mono whitespace-pre-wrap break-all shadow-inner">
                            {progressText}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
