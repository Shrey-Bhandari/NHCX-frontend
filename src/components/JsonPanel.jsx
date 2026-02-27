import React from 'react';

export function JsonPanel({ step, data }) {
    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-gray-300 font-mono text-sm shadow-inner">
            <div className="px-4 py-3 bg-[#252526] border-b border-[#333] flex justify-between items-center">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold cursor-default">
                    Console & JSON Context
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-medical-500/20 text-medical-400 border border-medical-500/30">
                    State: {["Waiting", "Reviewing", "Validating", "Ready"][step]}
                </span>
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <pre className="text-xs leading-relaxed text-[#D4D4D4]">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );
}
