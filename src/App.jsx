import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { StepIndicator } from './components/StepIndicator';
import { JsonPanel } from './components/JsonPanel';
import { UploadSection } from './components/workflow/UploadSection';
import { ReviewSection } from './components/workflow/ReviewSection';
import { GenerateValidateSection } from './components/workflow/GenerateValidateSection';
import { DownloadSection } from './components/workflow/DownloadSection';

function App() {
    const [currentStep, setCurrentStep] = useState(0);
    const [highestStep, setHighestStep] = useState(0);

    // Centralized application state
    const [extractedContext, setExtractedContext] = useState(null);
    const [reviewedData, setReviewedData] = useState(null);
    const [validationResult, setValidationResult] = useState(null);

    const handleUploadComplete = (data) => {
        setExtractedContext(data);
        setCurrentStep(1); // Move to Review
        setHighestStep(prev => Math.max(prev, 1));
    };

    const handleReviewComplete = (data) => {
        setReviewedData(data);
        setCurrentStep(2); // Move to Generate & Validate
        setHighestStep(prev => Math.max(prev, 2));
    };

    const handleValidationComplete = (result) => {
        setValidationResult(result);
        // If validation fails entirely we could stay on step 2, but for now allow proceed if successful/warnings
        if (result.isValid) {
            setCurrentStep(3); // Move to Download
            setHighestStep(prev => Math.max(prev, 3));
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setHighestStep(0);
        setExtractedContext(null);
        setReviewedData(null);
        setValidationResult(null);
    };

    const handleStepClick = (stepId) => {
        if (stepId <= highestStep) {
            setCurrentStep(stepId);
        }
    };

    // Determine what data to show in JSON panel based on current step
    const getContextData = () => {
        if (extractedContext) {
            return {
                status: "Structured Review JSON",
                data: extractedContext
            };
        }
        return { status: "Awaiting PDF file..." };
    };

    const handleReviewDataChange = (updatedData) => {
        setExtractedContext(prev => ({
            ...prev,
            extractedData: updatedData
        }));
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
            <TopNav />
            <StepIndicator
                currentStep={currentStep}
                highestStep={highestStep}
                onStepClick={handleStepClick}
            />

            <main className="flex-1 flex overflow-hidden">
                {/* Left Workflow Area */}
                <div className="flex-[3] overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="h-full flex flex-col max-w-5xl mx-auto">
                        {currentStep === 0 && <UploadSection onUploadComplete={handleUploadComplete} />}
                        {currentStep === 1 && <ReviewSection
                            data={extractedContext?.extractedData}
                            onReviewComplete={handleReviewComplete}
                            onDataChange={handleReviewDataChange}
                        />}
                        {currentStep === 2 && <GenerateValidateSection reviewedData={reviewedData} onValidationComplete={handleValidationComplete} />}
                        {currentStep === 3 && <DownloadSection fhirBundle={validationResult} onReset={handleReset} />}
                    </div>
                </div>

                {/* Right JSON Panel */}
                <div className="flex-[2] hidden lg:block border-l border-[#333]">
                    <JsonPanel step={currentStep} data={getContextData()} />
                </div>
            </main>
        </div>
    );
}

export default App;
