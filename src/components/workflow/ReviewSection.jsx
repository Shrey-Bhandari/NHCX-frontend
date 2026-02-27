import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, ShieldAlert, Edit2, Trash2, Plus, Undo } from 'lucide-react';

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
                {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
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

    // Local state to simulate editing
    const [benefits, setBenefits] = useState(data?.benefits || []);
    const [lastDeleted, setLastDeleted] = useState(null);
    const handleProceed = () => {
        onReviewComplete({
            ...data,
            benefits,
            reviewedAt: new Date().toISOString()
        });
    };

    const handleBenefitChange = (index, field, value) => {
        const newBenefits = [...benefits];
        newBenefits[index] = { ...newBenefits[index], [field]: value };
        setBenefits(newBenefits);
        if (onDataChange) {
            onDataChange({ ...data, benefits: newBenefits });
        }
    };

    const handleAddBenefit = () => {
        const newBenefits = [...benefits, { name: '', limit: '', condition: '' }];
        setBenefits(newBenefits);
        if (onDataChange) {
            onDataChange({ ...data, benefits: newBenefits });
        }
    };

    const handleDeleteBenefit = (index) => {
        const itemToDelete = benefits[index];
        setLastDeleted({ index, item: itemToDelete });

        const newBenefits = [...benefits];
        newBenefits.splice(index, 1);
        setBenefits(newBenefits);
        if (onDataChange) {
            onDataChange({ ...data, benefits: newBenefits });
        }
    };

    const handleUndoDelete = () => {
        if (!lastDeleted) return;

        const newBenefits = [...benefits];
        // Insert back at the same index
        newBenefits.splice(lastDeleted.index, 0, lastDeleted.item);
        setBenefits(newBenefits);
        setLastDeleted(null);

        if (onDataChange) {
            onDataChange({ ...data, benefits: newBenefits });
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Human Review</h2>
                    <p className="text-gray-500 mt-1">Review and correct the extracted data before FHIR bundle generation.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-md border border-green-200 font-medium text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Extraction Confidence: 92%
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <Card title="Coverage Benefits">
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Benefit Name</th>
                                    <th className="px-4 py-3">Limit</th>
                                    <th className="px-4 py-3">Condition</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {benefits.map((b, i) => (
                                    <tr key={i} className="bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={b.name || ''}
                                                onChange={(e) => handleBenefitChange(i, 'name', e.target.value)}
                                                className="w-full bg-transparent border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 transition-shadow text-gray-900 font-medium"
                                                placeholder="e.g. Consultation"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={b.limit || ''}
                                                onChange={(e) => handleBenefitChange(i, 'limit', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 transition-colors"
                                                placeholder="e.g. ₹500"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={b.condition || ''}
                                                onChange={(e) => handleBenefitChange(i, 'condition', e.target.value)}
                                                className="w-full bg-transparent border border-transparent hover:border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 transition-colors"
                                                placeholder="e.g. Per visit"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleDeleteBenefit(i)}
                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <button
                            onClick={handleAddBenefit}
                            className="text-sm flex items-center gap-1 text-medical-600 font-medium hover:text-medical-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Benefit Row
                        </button>
                        {lastDeleted && (
                            <button
                                onClick={handleUndoDelete}
                                className="text-sm flex items-center gap-1 text-amber-600 font-medium hover:text-amber-700 transition-colors animate-in fade-in"
                            >
                                <Undo className="w-4 h-4" /> Undo Delete
                            </button>
                        )}
                    </div>
                </Card>

                <Card title="Sub-limits" defaultOpen={false}>
                    <div className="p-4 text-sm text-gray-500 bg-gray-50 rounded border border-gray-200 text-center">
                        Review sub-limit rules mapped from the document.
                        (Placeholder table)
                    </div>
                </Card>

                <Card title="Exclusions & Co-pay Rules" defaultOpen={false}>
                    <div className="p-4 text-sm text-gray-500 bg-gray-50 rounded border border-gray-200 flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                        <span>3 potential exclusions found requiring manual verification.</span>
                    </div>
                </Card>

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
