import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to Minority Report 👋",
      content: "Here's how it works: [Placeholder for future detailed instructions about gesture control and features]",
      buttonText: "Get Started"
    },
    {
      title: "Camera Access Required",
      content: "To detect your hand gestures, Minority Report needs access to your camera. When you enable the extension, your browser will prompt you to allow camera access. Please click 'Allow' when prompted.\n\nAll processing happens locally on your device—your video never leaves your computer.",
      buttonText: "I Understand",
      action: async () => {
        // Camera will be requested when overlay loads, not from popup
        setStep(step + 1);
      }
    },
    {
      title: "You're All Set!",
      content: "[Placeholder for future instructions about using gestures, enabling the extension, and tips for best results]",
      buttonText: "Start Using Minority Report"
    }
  ];
  
  const currentStep = steps[step];
  
  const handleNext = () => {
    if (currentStep.action) {
      currentStep.action();
    } else if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="w-[400px] p-6 bg-white">
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded ${
                idx <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
        <p className="text-gray-600 mb-6 whitespace-pre-line">{currentStep.content}</p>
      </div>
      
      <button
        onClick={handleNext}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        {currentStep.buttonText}
      </button>
      
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-2 w-full text-gray-500 hover:text-gray-700 text-sm"
        >
          Back
        </button>
      )}
    </div>
  );
}

