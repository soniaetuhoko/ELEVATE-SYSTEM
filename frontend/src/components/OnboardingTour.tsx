import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import apiService from '@/services/api';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ELEVATE! 🚀',
    content: 'Your mission-driven learning platform. Let\'s take a quick tour to get you started.',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    content: 'Track your progress, view statistics, and access quick actions for missions, projects, and reflections.',
    target: 'dashboard'
  },
  {
    id: 'missions',
    title: 'Create Missions',
    content: 'Set learning goals with missions. Define objectives, deadlines, and track your progress.',
    target: 'missions'
  },
  {
    id: 'projects',
    title: 'Build Projects',
    content: 'Add projects under missions to showcase your work and link repositories.',
    target: 'projects'
  },
  {
    id: 'reflections',
    title: 'Write Reflections',
    content: 'Document your learning journey with weekly reflections and key insights.',
    target: 'reflections'
  },
  {
    id: 'collaboration',
    title: 'Collaborate & Learn',
    content: 'Join peer circles, connect with mentors, and learn together with the ALU community.',
    target: 'collaboration'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      await apiService.markOnboardingCompleted();
      localStorage.setItem('elevate-onboarding-completed', 'true');
    } catch (error) {
      console.error('Failed to update onboarding status:', error);
      localStorage.setItem('elevate-onboarding-completed', 'true');
    }
    onClose();
  };

  const skipTour = async () => {
    try {
      await apiService.markOnboardingCompleted();
      localStorage.setItem('elevate-onboarding-completed', 'true');
    } catch (error) {
      console.error('Failed to update onboarding status:', error);
      localStorage.setItem('elevate-onboarding-completed', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{step.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={skipTour}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{step.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={nextStep}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < onboardingSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          <Button variant="ghost" onClick={skipTour} className="w-full">
            Skip Tour
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}