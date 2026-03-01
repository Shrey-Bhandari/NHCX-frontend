import React, { useState, useEffect } from 'react';
import { ChevronRight, Trash2, Plus } from 'lucide-react';

const Card = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-transparent"
                style={{ borderBottomColor: isOpen ? '#e5e7eb' : 'transparent' }}
            >
                <span className="font-medium text-gray-800">{title}</span>
            </button>
            {isOpen && (
                <div className="p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
};

export function ReviewSection({ data, onReviewComplete, onDataChange }) {

    // Extract editable entries from bundle (same structure as Excel export)
    const extractEntries = (d) => {
        if (!d || !d.bundle || !Array.isArray(d.bundle.entry)) return [];
        return d.bundle.entry.map((entry, idx) => ({
            index: idx,
            resourceType: entry.resource?.resourceType || '',
            id: entry.resource?.id || '',
            status: entry.resource?.status || '',
            name: entry.resource?.name || ''
        }));
    };

    const [entries, setEntries] = useState(extractEntries(data));

    // Sync when data changes externally (from JsonPanel)
    useEffect(() => {
        setEntries(extractEntries(data));
    }, [data]);

    // Handle cell edit
    const handleCellChange = (rowIdx, field, value) => {
        const newEntries = [...entries];
        newEntries[rowIdx][field] = value;
        setEntries(newEntries);

        // Update the backing data structure
        if (onDataChange && data?.bundle) {
            const updatedBundle = { ...data.bundle };
            if (updatedBundle.entry[rowIdx]) {
                updatedBundle.entry[rowIdx] = {
                    ...updatedBundle.entry[rowIdx],
                    resource: {
                        ...updatedBundle.entry[rowIdx].resource,
                        resourceType: newEntries[rowIdx].resourceType,
                        id: newEntries[rowIdx].id,
                        status: newEntries[rowIdx].status,
                        name: newEntries[rowIdx].name
                    }
                };
            }
            onDataChange({ ...data, bundle: updatedBundle });
        }
    };

    const handleAddRow = () => {
        const newIdx = entries.length;
        const newEntries = [...entries, {
            index: newIdx,
            resourceType: '',
            id: '',
            status: '',
            name: ''
        }];
        setEntries(newEntries);

        // Add new entry to bundle
        if (onDataChange && data?.bundle) {
            const updatedBundle = { ...data.bundle };
            if (!Array.isArray(updatedBundle.entry)) updatedBundle.entry = [];
            updatedBundle.entry.push({
                resource: {
                    resourceType: '',
                    id: '',
                    status: '',
                    name: ''
                }
            });
            onDataChange({ ...data, bundle: updatedBundle });
        }
    };

    const handleDeleteRow = (rowIdx) => {
        const newEntries = entries.filter((_, i) => i !== rowIdx);
        setEntries(newEntries);

        // Remove from bundle
        if (onDataChange && data?.bundle) {
            const updatedBundle = { ...data.bundle };
            if (Array.isArray(updatedBundle.entry)) {
                updatedBundle.entry.splice(rowIdx, 1);
            }
            onDataChange({ ...data, bundle: updatedBundle });
        }
    };

    const handleProceed = () => {
        onReviewComplete({
            ...data,
            reviewedAt: new Date().toISOString()
        });
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Human Review</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Bundle Resources</h3>
                    </div>
                    
                    {entries.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Resource Type</th>
                                        <th className="px-4 py-3 font-medium">ID</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Plan Name</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={entry.resourceType}
                                                    onChange={(e) => handleCellChange(idx, 'resourceType', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent hover:border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Resource Type"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={entry.id}
                                                    onChange={(e) => handleCellChange(idx, 'id', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent hover:border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="ID"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={entry.status}
                                                    onChange={(e) => handleCellChange(idx, 'status', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent hover:border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Status"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={entry.name}
                                                    onChange={(e) => handleCellChange(idx, 'name', e.target.value)}
                                                    className="w-full bg-transparent border border-transparent hover:border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Plan Name"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteRow(idx)}
                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <p>No resources in bundle. Click "Add Row" to add entries.</p>
                        </div>
                    )}

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={handleAddRow}
                            className="text-sm flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Row
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center text-blue-900">
                    <p className="text-sm font-medium">Edit the table above, then click Confirm & Proceed</p>
                    <p className="text-xs text-blue-700 mt-1">Changes will be synced with Console & JSON Context</p>
                </div>
            </div>

            <div className="pt-6 mt-auto border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="bg-medical-600 hover:bg-medical-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                    Confirm & Proceed to Generation
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
