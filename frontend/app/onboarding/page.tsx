// FILE: app/onboarding/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import OnboardingProgress from '@/components/OnboardingProgress';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Academic Background
  const [educationLevel, setEducationLevel] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [gpa, setGpa] = useState('');

  // Step 2: Study Goals
  const [targetDegree, setTargetDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [intakeYear, setIntakeYear] = useState('');
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);

  // Step 3: Budget
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [fundingType, setFundingType] = useState('');

  // Step 4: Exams & Readiness
  const [ieltsStatus, setIeltsStatus] = useState('');
  const [greStatus, setGreStatus] = useState('');
  const [sopStatus, setSopStatus] = useState('');

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const toggleCountry = (country: string) => {
    if (preferredCountries.includes(country)) {
      setPreferredCountries(preferredCountries.filter(c => c !== country));
    } else {
      setPreferredCountries([...preferredCountries, country]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Help us personalize your study abroad journey
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

          {/* Step 1: Academic Background */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Academic Background
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Degree/Major
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPA / Percentage
                </label>
                <input
                  type="text"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3.7 or 85%"
                />
              </div>
            </div>
          )}

          {/* Step 2: Study Goals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Study Goals
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Degree
                </label>
                <select
                  value={targetDegree}
                  onChange={(e) => setTargetDegree(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select degree</option>
                  <option value="Bachelor">Bachelor's</option>
                  <option value="Master">Master's</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Artificial Intelligence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Intake Year
                </label>
                <input
                  type="number"
                  value={intakeYear}
                  onChange={(e) => setIntakeYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Countries
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Netherlands'].map(country => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => toggleCountry(country)}
                      className={`px-4 py-2 rounded-md border text-sm font-medium ${
                        preferredCountries.includes(country)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Budget Planning
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Budget (USD per year)
                </label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Budget (USD per year)
                </label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="60000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Type
                </label>
                <select
                  value={fundingType}
                  onChange={(e) => setFundingType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select funding type</option>
                  <option value="Self-funded">Self-funded</option>
                  <option value="Seeking Scholarship">Seeking Scholarship</option>
                  <option value="Partial Scholarship">Partial Scholarship</option>
                  <option value="Education Loan">Education Loan</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Exams & Readiness */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Test Scores & Documents
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IELTS/TOEFL Status
                </label>
                <select
                  value={ieltsStatus}
                  onChange={(e) => setIeltsStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GRE/GMAT Status
                </label>
                <select
                  value={greStatus}
                  onChange={(e) => setGreStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                  <option value="not_required">Not Required</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statement of Purpose Status
                </label>
                <select
                  value={sopStatus}
                  onChange={(e) => setSopStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md font-medium"
              >
                Complete Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}