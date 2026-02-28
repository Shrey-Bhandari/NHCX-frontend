import React, { useState, useEffect } from 'react';

export function JsonPanel({ step, data, onJsonEdit }) {
    const [localJson, setLocalJson] = useState('');
    const [error, setError] = useState(null);

    // Sync external data changes to local state, but only when it structurally changes
    // to avoid resetting the cursor while typing valid JSON
    useEffect(() => {
        setLocalJson(JSON.stringify(data, null, 2));
        setError(null);
    }, [data]);

    const handleJsonChange = (e) => {
        const newValue = e.target.value;
        setLocalJson(newValue);

        // Only attempt to parse and lift state if we are in step 1 (Structured Review)
        if (step === 1 && onJsonEdit) {
            try {
                const parsed = JSON.parse(newValue);
                setError(null);
                // Call the parent update function
                onJsonEdit(parsed);
            } catch (err) {
                // If it's invalid JSON while typing, just show an error but don't crash
                setError("Invalid JSON format");
            }
        }
    };

    const isEditable = step === 1;

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-gray-300 font-mono text-sm shadow-inner relative">
            <div className="px-4 py-3 bg-[#252526] border-b border-[#333] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold cursor-default">
                        Console & JSON Context
                    </h3>
                    {isEditable && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Editable
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-xs text-red-400">{error}</span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-medical-500/20 text-medical-400 border border-medical-500/30">
                        State: {["Waiting", "Reviewing", "Validating", "Ready"][step]}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {isEditable ? (
                    <textarea
                        value={localJson}
                        onChange={handleJsonChange}
                        spellCheck={false}
                        className="absolute inset-0 w-full h-full bg-transparent text-[#D4D4D4] text-xs leading-relaxed p-4 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 custom-scrollbar"
                    />
                ) : (
                    <pre className="absolute inset-0 overflow-auto p-4 text-xs leading-relaxed text-[#D4D4D4] custom-scrollbar">
                        {localJson}
                    </pre>
                )}
            </div>
        </div>
    );
}
