// frontend/components/StageIndicator.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronRight, X, University, Filter, TrendingUp, FileText, Plane, PackageCheck, User, Mail, LogOut, Edit2 } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  order: number;
}

interface StageIndicatorProps {
  currentStage: string;
  allStages?: Stage[];
  userId: string;
  userProfile: any;
  onLogout?: () => void;
}

interface University {
  id: string;
  name: string;
  country: string;
  ranking: number;
  tuitionFee: string;
  programs: string[];
  matchReason: string;
  programRelevance: string;
  fitScore?: number;
  tradeoffs?: string;
}

// Updated stages structure
const defaultStages: Stage[] = [
  {
    id: 'profile-setup',
    name: 'Profile Setup',
    description: 'Complete your basic information',
    status: 'completed',
    order: 1
  },
  {
    id: 'university-discovery',
    name: 'University Discovery',
    description: 'Explore universities that match your profile',
    status: 'current',
    order: 2
  },
  {
    id: 'university-shortlist',
    name: 'University Shortlist',
    description: 'Filter and prioritize your top choices',
    status: 'upcoming',
    order: 3
  },
  {
    id: 'application',
    name: 'Submit Applications',
    description: 'Submit your university applications',
    status: 'upcoming',
    order: 4
  },
  {
    id: 'visa-process',
    name: 'Visa Process',
    description: 'Complete visa requirements',
    status: 'upcoming',
    order: 5
  },
  {
    id: 'pre-departure',
    name: 'Pre-Departure',
    description: 'Prepare for your journey',
    status: 'upcoming',
    order: 6
  }
];

export default function StageIndicator({ currentStage, allStages, userId, userProfile, onLogout }: StageIndicatorProps) {
  const [stages, setStages] = useState<Stage[]>((allStages && allStages.length > 0) ? allStages : defaultStages);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showShortlist, setShowShortlist] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [shortlistedUniversities, setShortlistedUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPriorities, setUserPriorities] = useState({
    cost: 50,
    ranking: 50,
    location: 50,
    career: 50
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedUniversities = localStorage.getItem(`universities_${userId}`);
    const savedShortlist = localStorage.getItem(`shortlist_${userId}`);
    const savedStages = localStorage.getItem(`stages_${userId}`);

    if (savedUniversities) {
      setUniversities(JSON.parse(savedUniversities));
    }
    if (savedShortlist) {
      setShortlistedUniversities(JSON.parse(savedShortlist));
    }
    if (savedStages) {
      setStages(JSON.parse(savedStages));
    }
  }, [userId]);

  const updateStageStatus = (stageId: string, status: 'completed' | 'current' | 'upcoming') => {
    setStages(prevStages => {
      const updatedStages = prevStages.map(stage => {
        if (stage.id === stageId) {
          return { ...stage, status: status as 'completed' | 'current' | 'upcoming' };
        }
        // Update next stage to current if completing a stage
        if (status === 'completed') {
          const currentStageOrder = prevStages.find(s => s.id === stageId)?.order || 0;
          if (stage.order === currentStageOrder + 1) {
            return { ...stage, status: 'current' as const };
          }
        }
        return stage;
      });
      
      // Save to localStorage
      localStorage.setItem(`stages_${userId}`, JSON.stringify(updatedStages));
      return updatedStages;
    });
  };

  const handleStageClick = async (stage: Stage) => {
    setSelectedStage(stage);
    
    // Handle profile setup stage
    if (stage.id === 'profile-setup') {
      setShowProfileSetup(true);
      return;
    }
    
    // Handle university discovery stage
    if (stage.id === 'university-discovery') {
      setShowDiscovery(true);
      // Don't auto-fetch if we already have universities
      if (universities.length === 0) {
        await discoverUniversities();
      }
    }
    
    // Handle shortlisting stage
    if (stage.id === 'university-shortlist') {
      // Check if discovery is completed
      const discoveryStage = stages.find(s => s.id === 'university-discovery');
      if (discoveryStage?.status !== 'completed') {
        alert('Please complete University Discovery first!');
        return;
      }
      
      setShowShortlist(true);
      // Don't auto-fetch if we already have shortlist
      if (shortlistedUniversities.length === 0 && universities.length > 0) {
        await handleShortlist();
      }
    }
  };

  const discoverUniversities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/discover-universities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userProfile })
      });

      if (!response.ok) throw new Error('Failed to discover universities');

      const data = await response.json();
      setUniversities(data.universities);
      
      // Save to localStorage
      localStorage.setItem(`universities_${userId}`, JSON.stringify(data.universities));
      
      // Mark discovery stage as completed
      updateStageStatus('university-discovery', 'completed');
    } catch (error) {
      console.error('Error discovering universities:', error);
      alert('Failed to discover universities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortlist = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Shortlisting with priorities:', userPriorities);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/shortlist-universities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          universities,
          priorities: userPriorities,
          userProfile 
        })
      });

      if (!response.ok) throw new Error('Failed to shortlist universities');

      const data = await response.json();
      console.log('✅ Shortlist response:', data);
      
      setShortlistedUniversities(data.shortlist);
      
      // Save to localStorage
      localStorage.setItem(`shortlist_${userId}`, JSON.stringify(data.shortlist));
      
      // Mark shortlist stage as completed
      updateStageStatus('university-shortlist', 'completed');
      
      if (!showShortlist) {
        setShowShortlist(true);
      }
    } catch (error) {
      console.error('Error shortlisting universities:', error);
      alert('Failed to create shortlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteDiscovery = () => {
    if (universities.length === 0) {
      alert('Please discover universities first!');
      return;
    }
    setShowDiscovery(false);
    updateStageStatus('university-discovery', 'completed');
  };

  const handleCompleteShortlist = () => {
    if (shortlistedUniversities.length === 0) {
      alert('Please create a shortlist first!');
      return;
    }
    setShowShortlist(false);
    updateStageStatus('university-shortlist', 'completed');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear localStorage
      localStorage.clear();
      // Call parent logout handler if provided
      if (onLogout) {
        onLogout();
      } else {
        // Default logout behavior
        window.location.href = '/';
      }
    }
  };

  const getStageIcon = (stage: Stage) => {
    const iconMap: Record<string, any> = {
      'profile-setup': User,
      'university-discovery': University,
      'university-shortlist': Filter,
      'application': FileText,
      'visa-process': Plane,
      'pre-departure': PackageCheck
    };

    const IconComponent = iconMap[stage.id] || Circle;

    if (stage.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (stage.status === 'current') {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-white" />
        </div>
      );
    }
    return <IconComponent className="w-6 h-6 text-gray-300" />;
  };

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const progressPercentage = stages.length > 0 ? (completedCount / stages.length) * 100 : 0;

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Journey</h3>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {completedCount}/{stages.length} Completed
            </span>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div key={stage.id}>
                <button
                  onClick={() => handleStageClick(stage)}
                  disabled={stage.status === 'upcoming' && stage.order > 3}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    stage.status === 'completed'
                      ? 'bg-green-50/50 hover:bg-green-50 border border-green-100'
                      : stage.status === 'current'
                      ? 'bg-blue-50/50 hover:bg-blue-50 border border-blue-200 shadow-sm'
                      : stage.order > 3
                      ? 'bg-gray-50/30 border border-gray-100 opacity-50 cursor-not-allowed'
                      : 'bg-gray-50/30 hover:bg-gray-50 border border-gray-100'
                  } ${selectedStage?.id === stage.id ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStageIcon(stage)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-semibold ${
                          stage.status === 'completed'
                            ? 'text-green-900'
                            : stage.status === 'current'
                            ? 'text-blue-900'
                            : 'text-gray-600'
                        }`}>
                          {stage.name}
                          {stage.order > 3 && <span className="ml-2 text-xs text-gray-400">(Coming Soon)</span>}
                        </h4>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                          stage.status === 'completed'
                            ? 'text-green-400'
                            : stage.status === 'current'
                            ? 'text-blue-400'
                            : 'text-gray-300'
                        }`} />
                      </div>
                      <p className={`text-sm mt-1 ${
                        stage.status === 'completed'
                          ? 'text-green-700'
                          : stage.status === 'current'
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                </button>

                {index < stages.length - 1 && (
                  <div className="ml-7 h-6 w-0.5 bg-gradient-to-b from-gray-200 to-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Profile Setup
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Your academic profile and preferences
                  </p>
                </div>
                <button
                  onClick={() => setShowProfileSetup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* User Info Section */}
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">User ID</p>
                      <p className="text-sm font-semibold text-gray-900">{userId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {userProfile?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Profile Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Academic Profile
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Field of Study</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {userProfile?.field || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Target Degree</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {userProfile?.targetDegree || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Budget</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userProfile?.budget || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Target Intake</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {userProfile?.intake || 'Not specified'}
                    </p>
                  </div>
                  {userProfile?.gpa && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">GPA</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {userProfile.gpa}
                      </p>
                    </div>
                  )}
                  {userProfile?.testScores && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Test Scores</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {typeof userProfile.testScores === 'object' 
                          ? Object.entries(userProfile.testScores).map(([key, val]) => `${key}: ${val}`).join(', ')
                          : userProfile.testScores
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Preferences */}
              {userProfile?.preferences && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Preferences</h3>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {typeof userProfile.preferences === 'object'
                        ? JSON.stringify(userProfile.preferences, null, 2)
                        : userProfile.preferences
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    // TODO: Implement edit profile functionality
                    alert('Edit profile functionality coming soon!');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowProfileSetup(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* University Discovery Modal */}
      {showDiscovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <University className="w-6 h-6 text-blue-600" />
                    University Discovery
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Exploring universities that match your profile
                  </p>
                </div>
                <button
                  onClick={() => setShowDiscovery(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Discovering universities for you...</p>
                </div>
              ) : universities.length === 0 ? (
                <div className="text-center py-12">
                  <University className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Click the button below to discover universities</p>
                  <button
                    onClick={discoverUniversities}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Start Discovery
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {universities.map((uni) => (
                    <div
                      key={uni.id}
                      className="p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{uni.name}</h3>
                          <p className="text-sm text-gray-600">{uni.country}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          Rank #{uni.ranking}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1">Tuition Fee</p>
                          <p className="font-semibold text-gray-900">{uni.tuitionFee}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1">Programs</p>
                          <p className="font-semibold text-gray-900">{uni.programs.length} available</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">Why it matches</p>
                          <p className="text-sm text-blue-800">{uni.matchReason}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs font-medium text-green-900 mb-1">Program relevance</p>
                          <p className="text-sm text-green-800">{uni.programRelevance}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCompleteDiscovery}
                disabled={universities.length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Discovery & Move to Shortlisting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortlisting Modal */}
{showShortlist && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-6 h-6 text-blue-600" />
              University Shortlist
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Your top recommendations based on priorities
            </p>
          </div>
          <button
            onClick={() => setShowShortlist(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Priority Sliders */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Adjust Your Priorities</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(userPriorities).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-700 capitalize block mb-2 flex items-center justify-between">
                <span>{key === 'cost' ? 'Cost Sensitivity' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className="text-blue-600 font-bold">{value}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={value}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  setUserPriorities(prev => ({ ...prev, [key]: newValue }));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleShortlist}
          disabled={isLoading}
          className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Update Shortlist
            </>
          )}
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(90vh-400px)]">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing best matches...</p>
          </div>
        ) : shortlistedUniversities.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Click "Update Shortlist" to generate your personalized recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shortlistedUniversities.map((uni, index) => (
              <div
                key={uni.id}
                className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{uni.name}</h3>
                      <p className="text-sm text-gray-600">{uni.country}</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white p-2 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Rank</p>
                    <p className="font-bold text-gray-900">#{uni.ranking}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Fee</p>
                    <p className="font-bold text-gray-900 text-xs">{uni.tuitionFee}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Fit</p>
                    <p className="font-bold text-green-600">{uni.fitScore || 95}%</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-700"><span className="font-semibold">Why shortlisted:</span> {uni.matchReason}</p>
                  <p className="text-blue-700"><span className="font-semibold">Key advantage:</span> {uni.programRelevance}</p>
                  {uni.tradeoffs && (
                    <p className="text-orange-700"><span className="font-semibold">Trade-offs:</span> {uni.tradeoffs}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-semibold">Next step:</span> Review these universities and prepare your application materials.
        </p>
        <button
          onClick={handleCompleteShortlist}
          disabled={shortlistedUniversities.length === 0}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Confirm Shortlist & Proceed
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}