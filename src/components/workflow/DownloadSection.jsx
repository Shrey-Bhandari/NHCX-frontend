import React, { useState } from 'react';
import { FileJson, Copy, Check, DownloadCloud, RefreshCw } from 'lucide-react';

export function DownloadSection({ fhirBundle, onReset }) {
    const [copied, setCopied] = useState(false);

    const jsonString = fhirBundle ? JSON.stringify(fhirBundle.fhirJson, null, 2) : "{}";

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nhcx-bundle-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Export Artifact</h2>
                    <p className="text-gray-500 mt-1">Download the generated JSON or copy it to clipboard.</p>
                </div>
                <button
                    onClick={onReset}
                    className="text-gray-500 hover:text-medical-600 flex items-center gap-1.5 text-sm font-medium transition-colors bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" /> Start New
                </button>
            </div>

            <div className="flex-1 bg-[#1E1E1E] rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col">
                <div className="bg-[#252526] px-4 py-3 flex justify-between items-center border-b border-[#333]">
                    <div className="flex items-center gap-2 text-gray-300">
                        <FileJson className="w-5 h-5 text-medical-400" />
                        <span className="text-sm font-medium font-mono">bundle-output.json</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    <pre className="text-sm font-mono text-[#D4D4D4] leading-relaxed">
                        {jsonString}
                    </pre>
                </div>
                <div className="bg-[#252526] p-4 border-t border-[#333] flex justify-end">
                    <button
                        onClick={handleDownload}
                        className="bg-medical-600 hover:bg-medical-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                        <DownloadCloud className="w-5 h-5" /> Download JSON
                    </button>
                </div>
            </div>
        </div>
    );
}
