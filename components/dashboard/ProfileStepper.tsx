'use client';
import { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  bit: number;
}

interface ProfileStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number;
  onStepClick: (step: number) => void;
  children: ReactNode;
  title: string;
  subtitle: string;
  progressPercent: number;
  onSave: () => void;
  saving: boolean;
  canGoNext: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export default function ProfileStepper({
  steps, currentStep, completedSteps, onStepClick,
  children, title, subtitle, progressPercent,
  onSave, saving, canGoNext, onNext, onPrev,
}: ProfileStepperProps) {
  const isStepDone = (bit: number) => !!(completedSteps & (1 << bit));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-2xl text-gray-900">{progressPercent}%</div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Steps sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1 sticky top-24">
            {steps.map((step, i) => {
              const done = isStepDone(step.bit);
              const active = currentStep === i;
              return (
                <button
                  key={step.label}
                  onClick={() => onStepClick(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                    active ? 'bg-blue-50 text-blue-700 font-semibold' :
                    done ? 'text-green-700 hover:bg-green-50' :
                    'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    done ? 'bg-green-500 text-white' :
                    active ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? <Check size={12} /> : i + 1}
                  </div>
                  <span className="leading-tight">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-5">
              Step {currentStep + 1}: {steps[currentStep]?.label}
            </h2>

            {children}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
              <button
                onClick={onPrev}
                disabled={currentStep === 0}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all"
              >
                ← Previous
              </button>

              <div className="flex gap-3">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Save'}
                </button>

                {currentStep < steps.length - 1 && (
                  <button
                    onClick={onNext}
                    className="btn-cta px-5 py-2.5 rounded-xl text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
