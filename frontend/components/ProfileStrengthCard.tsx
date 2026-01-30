// frontend/components/ProfileStrengthCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, X, CheckCircle, Circle, Loader2 } from 'lucide-react';

interface ProfileStrengthCardProps {
  strength: number;
  userId: string;
  currentProfile: any;
  onStrengthUpdate?: (newStrength: number) => void;
  onProfileUpdate?: (newProfile: any) => void;
}

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  impact: number;
  status: 'completed' | 'pending';
  category: 'academic' | 'experience' | 'tests' | 'documents';
}

const API_BASE_URL = 'http://localhost:4000/api';

export default function ProfileStrengthCard({ 
  strength: initialStrength, 
  userId, 
  currentProfile,
  onStrengthUpdate,
  onProfileUpdate 
}: ProfileStrengthCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentStrength, setCurrentStrength] = useState(initialStrength);
  const [profile, setProfile] = useState(currentProfile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Update local profile when prop changes
  useEffect(() => {
    setProfile(currentProfile);
    const newStrength = calculateProfileStrength(currentProfile);
    setCurrentStrength(newStrength);
  }, [currentProfile]);

  const calculateProfileStrength = (profileData: any): number => {
    let score = 10;

    if (profileData?.gpa) {
      if (profileData.gpa >= 3.5) score += 15;
      else if (profileData.gpa >= 3.0) score += 10;
      else score += 5;
    }

    if (profileData?.testScores) {
      if (profileData.testScores.gre || profileData.testScores.gmat) score += 10;
      if (profileData.testScores.toefl || profileData.testScores.ielts) score += 10;
    }

    if (profileData?.workExperience && profileData.workExperience.length > 0) {
      score += Math.min(15, profileData.workExperience.length * 5);
    }

    if (profileData?.sop) score += 12;

    if (profileData?.lors && profileData.lors.length > 0) {
      score += Math.min(10, profileData.lors.length * 3.5);
    }

    if (profileData?.extracurriculars && profileData.extracurriculars.length > 0) {
      score += Math.min(8, profileData.extracurriculars.length * 2.5);
    }

    if (profileData?.publications && profileData.publications.length > 0) {
      score += Math.min(10, profileData.publications.length * 5);
    }

    return Math.min(100, Math.round(score));
  };

  const getStrengthLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    return { label: 'Needs Work', color: 'text-orange-600', bgColor: 'bg-orange-500' };
  };

  const getImprovementItems = (): ImprovementItem[] => {
    const improvements: ImprovementItem[] = [];
    
    // GPA Check
    if (!profile?.gpa || profile.gpa < 3.0) {
      improvements.push({
        id: 'improve-gpa',
        title: 'Academic Performance',
        description: 'Add or improve your GPA. A strong GPA (3.5+) significantly boosts your profile.',
        impact: 15,
        status: 'pending',
        category: 'academic'
      });
    }

    // Test Scores Check
    const hasTestScores = profile?.testScores?.gre || 
                         profile?.testScores?.gmat || 
                         profile?.testScores?.toefl || 
                         profile?.testScores?.ielts;
    
    if (!hasTestScores) {
      improvements.push({
        id: 'add-test-scores',
        title: 'Standardized Test Scores',
        description: 'Add GRE/GMAT and English proficiency test scores (TOEFL/IELTS).',
        impact: 20,
        status: 'pending',
        category: 'tests'
      });
    }

    // Work Experience Check
    if (!profile?.workExperience || profile.workExperience.length === 0) {
      improvements.push({
        id: 'add-experience',
        title: 'Work Experience',
        description: 'Add relevant work experience, internships, or research projects.',
        impact: 15,
        status: 'pending',
        category: 'experience'
      });
    }

    // Statement of Purpose Check
    if (!profile?.sop) {
      improvements.push({
        id: 'add-sop',
        title: 'Statement of Purpose',
        description: 'Draft your Statement of Purpose. Tell your story and stand out.',
        impact: 12,
        status: 'pending',
        category: 'documents'
      });
    }

    // Letters of Recommendation Check
    const lorCount = profile?.lors?.length || 0;
    if (lorCount < 2) {
      improvements.push({
        id: 'add-lors',
        title: 'Letters of Recommendation',
        description: lorCount === 0 
          ? 'Secure 2-3 strong letters of recommendation from professors or supervisors.'
          : `You have ${lorCount} letter(s). Aim for 2-3 strong recommendations.`,
        impact: 10,
        status: 'pending',
        category: 'documents'
      });
    }

    // Extracurriculars Check
    if (!profile?.extracurriculars || profile.extracurriculars.length === 0) {
      improvements.push({
        id: 'add-activities',
        title: 'Extracurricular Activities',
        description: 'Add leadership roles, volunteering, or activities that showcase your profile.',
        impact: 8,
        status: 'pending',
        category: 'experience'
      });
    }

    return improvements;
  };

  const handleMarkComplete = async (item: ImprovementItem) => {
    if (item.status === 'completed') return;

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      let itemData: any = {};

      switch (item.id) {
        case 'improve-gpa':
          itemData = { gpa: 3.5 };
          break;
        case 'add-test-scores':
          itemData = { gre: 320, toefl: 100 };
          break;
        case 'add-experience':
          itemData = {
            company: 'Example Company',
            position: 'Software Engineer',
            duration: '2 years',
            description: 'Sample work experience'
          };
          break;
        case 'add-sop':
          itemData = { sop: 'Sample Statement of Purpose' };
          break;
        case 'add-lors':
          itemData = {
            name: 'Professor Name',
            title: 'Professor',
            institution: 'University',
            relationship: 'Academic Advisor'
          };
          break;
        case 'add-activities':
          itemData = {
            activity: 'Volunteer Work',
            role: 'Team Lead',
            description: 'Community service project'
          };
          break;
      }

      const response = await fetch(`${API_BASE_URL}/profile/${userId}/complete-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, itemData }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();

      // Update local state with new profile data
      setProfile(data.dashboardJson);
      setCurrentStrength(data.profileStrength);
      setUpdateMessage(`✓ ${item.title} completed! +${item.impact}%`);

      // Notify parent
      onStrengthUpdate?.(data.profileStrength);
      onProfileUpdate?.(data.dashboardJson);

      setTimeout(() => setUpdateMessage(null), 3000);

    } catch (error) {
      console.error('Error marking item complete:', error);
      setUpdateMessage('❌ Failed to update. Please try again.');
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const improvements = getImprovementItems();
  const pendingImprovements = improvements.filter(i => i.status === 'pending');
  const completedCount = 6 - pendingImprovements.length; // Total possible items = 6
  const potentialIncrease = pendingImprovements.reduce((sum, item) => sum + item.impact, 0);

  const level = getStrengthLevel(currentStrength);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (currentStrength / 100) * circumference;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'tests': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'experience': return 'bg-green-50 text-green-700 border-green-200';
      case 'documents': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profile Strength</h3>
          <div className={`p-2 rounded-lg ${level.color.replace('text', 'bg').replace('600', '50')}`}>
            <Award className={`w-5 h-5 ${level.color}`} />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-100"
              />
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${level.bgColor.replace('bg', 'text')} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-gray-900">{currentStrength}%</div>
              <div className={`text-xs font-medium ${level.color} mt-1`}>{level.label}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Completed</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{completedCount}/6</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">Potential</span>
            </div>
            <div className="text-xl font-bold text-purple-900">+{potentialIncrease}%</div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          {pendingImprovements.length > 0 ? 'Improve Profile' : 'View Details'}
        </button>

        {/* Quick Tip */}
        {pendingImprovements.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              💡 <span className="font-medium">Quick tip:</span> {pendingImprovements.length} tasks remaining
            </p>
          </div>
        )}

        {pendingImprovements.length === 0 && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              🎉 <span className="font-medium">Perfect!</span> All tasks completed
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Improvement</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {pendingImprovements.length > 0 
                      ? `${pendingImprovements.length} tasks to reach ${Math.min(100, currentStrength + potentialIncrease)}%`
                      : 'All tasks completed! 🎉'
                    }
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isUpdating}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{completedCount}/6</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / 6) * 100}%` }}
                  />
                </div>
              </div>

              {/* Update Message */}
              {updateMessage && (
                <div className={`mt-3 p-2.5 rounded-lg border ${
                  updateMessage.includes('✓') 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-xs font-medium ${
                    updateMessage.includes('✓') ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {updateMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-180px)]">
              <div className="space-y-3">
                {improvements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Circle className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                            <span className="text-xs font-bold text-blue-600">
                              +{item.impact}%
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                          {item.description}
                        </p>

                        <button
                          onClick={() => handleMarkComplete(item)}
                          disabled={isUpdating}
                          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Mark Complete (Demo)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pendingImprovements.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Excellent Work!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your profile is at {currentStrength}% strength
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  {pendingImprovements.length > 0 ? (
                    <span className="text-gray-600">
                      {pendingImprovements.length} remaining • 
                      <span className="font-semibold text-blue-600 ml-1">
                        +{potentialIncrease}% potential
                      </span>
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      ✓ All completed
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isUpdating}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}