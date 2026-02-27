import React, { useState } from 'react';
import { Zap, Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export function GenerateValidateSection({ reviewedData, onValidationComplete }) {
    const [status, setStatus] = useState('idle'); // idle -> generating -> validating -> completed
    const [errors, setErrors] = useState([]);

    const handleGenerateAndValidate = () => {
        setStatus('generating');

        // Simulate FHIR Bundle Generation
        setTimeout(() => {
            setStatus('validating');

            // Simulate Validation
            setTimeout(() => {
                // Mocking a successful validation with minor warnings or a failure if we wanted
                const mockErrors = [
                    /* Example of validation errors if we had any
                    { id: 1, path: "InsurancePlan.identifier[0]", field: "system", message: "NHCX naming system URI recommended."} 
                    */
                ];

                setErrors(mockErrors);
                setStatus('completed');

                onValidationComplete({
                    bundleRef: "Bundle/nhcx-inst-12345",
                    isValid: mockErrors.length === 0,
                    validationLogs: mockErrors,
                    fhirJson: {
                        resourceType: "Bundle",
                        type: "collection",
                        entry: [
                            {
                                resource: {
                                    resourceType: "InsurancePlan",
                                    id: "plan-example-1",
                                    status: "active",
                                    name: reviewedData?.benefits?.[0]?.name || "Parsed Plan"
                                }
                            }
                        ]
                    }
                });

            }, 1500);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Generate & Validate</h2>
                    <p className="text-gray-500 mt-1">Convert reviewed data into an NHCX-compliant FHIR bundle and run conformance checks.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {status === 'idle' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm h-64 mt-4">
                        <div className="w-16 h-16 bg-medical-50 rounded-full flex items-center justify-center mb-4">
                            <Zap className="w-8 h-8 text-medical-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Resource</h3>
                        <p className="text-gray-500 text-sm max-w-sm mb-6">
                            The payload has been reviewed and is ready to be transformed into a standard FHIR JSON format.
                        </p>
                        <button
                            onClick={handleGenerateAndValidate}
                            className="bg-medical-600 hover:bg-medical-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition-all flex items-center gap-2"
                        >
                            Generate NHCX Bundle
                        </button>
                    </div>
                )}

                {(status === 'generating' || status === 'validating') && (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm h-64 mt-4">
                        <div className="w-16 h-16 relative flex items-center justify-center mb-6">
                            <Activity className="w-8 h-8 text-medical-600 animate-pulse" />
                            <div className="absolute inset-0 border-4 border-medical-200 border-t-medical-600 rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {status === 'generating' ? 'Mapping Data to FHIR Resources...' : 'Running Profile Validation...'}
                        </h3>
                        <p className="text-gray-500 text-sm max-w-sm">
                            {status === 'generating'
                                ? 'Constructing InsurancePlan, CoverageEligibilityRequest, and related objects.'
                                : 'Checking constraints against NHCX implementation guides.'}
                        </p>
                    </div>
                )}

                {status === 'completed' && (
                    <div className="space-y-6">
                        <div className="bg-white border border-green-200 rounded-xl p-8 flex flex-col items-center text-center shadow-sm shadow-green-50">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Validation Passed</h3>
                            <p className="text-gray-600 mb-6">
                                The generated FHIR bundle conforms to the NHCX Insurance Plan standard.
                            </p>

                            <div className="flex gap-4 w-full max-w-md bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex-1 text-center border-r border-gray-200 last:border-0">
                                    <div className="text-2xl font-bold text-gray-800">1</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Resource</div>
                                </div>
                                <div className="flex-1 text-center border-r border-gray-200 last:border-0">
                                    <div className="text-2xl font-bold text-green-600">0</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Errors</div>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="text-2xl font-bold text-amber-500">0</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Warnings</div>
                                </div>
                            </div>
                        </div>

                        {errors.length > 0 && (
                            <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <span className="font-semibold text-red-800">Validation Issues</span>
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {errors.map((err, i) => (
                                        <li key={i} className="p-4 flex gap-4 hover:bg-gray-50">
                                            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{err.message}</p>
                                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                                    {err.path} • {err.field}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
