// frontend/components/ProfileStrengthCard.tsx
'use client';

import { useState } from 'react';
import { TrendingUp, Target, Award, X, CheckCircle, Circle } from 'lucide-react';

interface ProfileStrengthCardProps {
  strength: number; // 0-100
  userId: string;
  currentProfile: any; // The user's profile data
}

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  impact: number; // How much this improves the score (0-100)
  status: 'completed' | 'pending';
  category: 'academic' | 'experience' | 'tests' | 'documents';
}

export default function ProfileStrengthCard({ strength, userId, currentProfile }: ProfileStrengthCardProps) {
  const [showModal, setShowModal] = useState(false);

  const getStrengthLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    return { label: 'Needs Work', color: 'text-orange-600', bgColor: 'bg-orange-500' };
  };

  // Generate improvement recommendations based on profile
  const getImprovementItems = (): ImprovementItem[] => {
    const improvements: ImprovementItem[] = [];
    
    // Check for missing academic information
    if (!currentProfile?.gpa || currentProfile.gpa < 3.0) {
      improvements.push({
        id: 'improve-gpa',
        title: 'Academic Performance',
        description: 'Add or improve your GPA. A strong GPA (3.5+) significantly boosts your profile strength.',
        impact: 15,
        status: currentProfile?.gpa ? 'completed' : 'pending',
        category: 'academic'
      });
    }

    // Check for test scores
    if (!currentProfile?.testScores?.gre && !currentProfile?.testScores?.toefl) {
      improvements.push({
        id: 'add-test-scores',
        title: 'Standardized Test Scores',
        description: 'Add GRE/GMAT and English proficiency test scores (TOEFL/IELTS). These are critical for most programs.',
        impact: 20,
        status: 'pending',
        category: 'tests'
      });
    }

    // Check for work experience
    if (!currentProfile?.workExperience || currentProfile.workExperience.length === 0) {
      improvements.push({
        id: 'add-experience',
        title: 'Work Experience',
        description: 'Add relevant work experience, internships, or research projects to strengthen your application.',
        impact: 15,
        status: 'pending',
        category: 'experience'
      });
    }

    // Check for statement of purpose
    if (!currentProfile?.sop) {
      improvements.push({
        id: 'add-sop',
        title: 'Statement of Purpose',
        description: 'Draft your Statement of Purpose. This is your opportunity to tell your story and stand out.',
        impact: 12,
        status: 'pending',
        category: 'documents'
      });
    }

    // Check for letters of recommendation
    if (!currentProfile?.lors || currentProfile.lors.length < 3) {
      improvements.push({
        id: 'add-lors',
        title: 'Letters of Recommendation',
        description: 'Secure 2-3 strong letters of recommendation from professors or supervisors.',
        impact: 10,
        status: currentProfile?.lors?.length > 0 ? 'completed' : 'pending',
        category: 'documents'
      });
    }

    // Check for extracurriculars
    if (!currentProfile?.extracurriculars || currentProfile.extracurriculars.length === 0) {
      improvements.push({
        id: 'add-activities',
        title: 'Extracurricular Activities',
        description: 'Add leadership roles, volunteering, or other activities that showcase your well-rounded profile.',
        impact: 8,
        status: 'pending',
        category: 'experience'
      });
    }

    return improvements;
  };

  const improvements = getImprovementItems();
  const pendingImprovements = improvements.filter(i => i.status === 'pending');
  const potentialIncrease = pendingImprovements.reduce((sum, item) => sum + item.impact, 0);

  const level = getStrengthLevel(strength);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (strength / 100) * circumference;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'tests': return 'bg-purple-100 text-purple-800';
      case 'experience': return 'bg-green-100 text-green-800';
      case 'documents': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Profile Strength</h3>
          <div className={`p-2 rounded-xl ${level.color.replace('text', 'bg').replace('600', '50')}`}>
            <Award className={`w-5 h-5 ${level.color}`} />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="45"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-gray-100"
              />
              <circle
                cx="80"
                cy="80"
                r="45"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${level.bgColor.replace('bg', 'text')} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-900">{strength}%</div>
              <div className={`text-sm font-medium ${level.color} mt-1`}>{level.label}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Completion</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{strength}%</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">Potential</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">+{potentialIncrease}%</div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Improve Profile
        </button>

        {/* Tips */}
        {strength < 100 && (
          <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              💡 <span className="font-medium">Quick tip:</span> Complete {pendingImprovements.length} pending items to boost your strength by {potentialIncrease}%
            </p>
          </div>
        )}
      </div>

      {/* Improvement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Improve Your Profile</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete these items to reach {Math.min(100, strength + potentialIncrease)}% strength
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {improvements.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      item.status === 'completed'
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`font-semibold ${
                            item.status === 'completed' ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                              +{item.impact}%
                            </span>
                          </div>
                        </div>

                        <p className={`text-sm mb-3 ${
                          item.status === 'completed' ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {item.description}
                        </p>

                        {item.status === 'pending' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800">
                              <span className="font-semibold">Impact:</span> Completing this will increase your profile strength by {item.impact} points, making you more competitive for top universities.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pendingImprovements.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Excellent Work!
                  </h3>
                  <p className="text-gray-600">
                    You've completed all recommended improvements. Your profile is strong!
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {pendingImprovements.length} items remaining
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}