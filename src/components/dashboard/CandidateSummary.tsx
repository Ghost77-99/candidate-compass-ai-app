
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Award, Target } from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { useToast } from '@/hooks/use-toast';

interface CandidateSummaryData {
  id: string;
  candidate: {
    name: string;
    email: string;
    skills: string[];
    experience_years: number;
  };
  job: {
    title: string;
    company: string;
  };
  status: string;
  progress_percentage: number;
  applied_date: string;
  interviews: Array<{
    stage: string;
    rating?: number;
    feedback?: string;
    status: string;
  }>;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'hire' | 'consider' | 'reject';
  readinessLevel: 'ready' | 'needs_improvement' | 'not_ready';
}

const CandidateSummary = () => {
  const [candidates, setCandidates] = useState<CandidateSummaryData[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateSummaryData[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSummaryData | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCandidateSummaries();
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredCandidates(candidates);
    } else {
      setFilteredCandidates(candidates.filter(c => c.recommendation === filterStatus));
    }
  }, [filterStatus, candidates]);

  const loadCandidateSummaries = async () => {
    try {
      setIsLoading(true);
      const applications = await applicationService.getAllApplicationsForHR();
      
      // Transform applications into candidate summaries with mock interview data
      const summaries: CandidateSummaryData[] = applications.map(app => {
        // Generate mock interview data based on application status
        const interviews = generateMockInterviews(app.status);
        const overallScore = calculateOverallScore(interviews);
        const { strengths, weaknesses } = generateStrengthsWeaknesses(app.profiles.skills, interviews);
        const recommendation = getRecommendation(overallScore, interviews.length);
        const readinessLevel = getReadinessLevel(overallScore, app.status);

        return {
          id: app.id,
          candidate: {
            name: app.profiles.name,
            email: app.profiles.email,
            skills: app.profiles.skills || [],
            experience_years: app.profiles.experience_years || 0,
          },
          job: {
            title: app.jobs.title,
            company: app.jobs.company,
          },
          status: app.status,
          progress_percentage: app.progress_percentage,
          applied_date: app.applied_date,
          interviews,
          overallScore,
          strengths,
          weaknesses,
          recommendation,
          readinessLevel,
        };
      });

      setCandidates(summaries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load candidate summaries.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockInterviews = (status: string) => {
    const allStages = ['Aptitude Test', 'Group Discussion', 'Technical Test', 'HR Round'];
    const interviews = [];
    
    const statusToStagesMap: { [key: string]: number } = {
      'applied': 0,
      'aptitude_test': 1,
      'group_discussion': 2,
      'technical_test': 3,
      'hr_round': 4,
      'completed': 4,
      'rejected': Math.floor(Math.random() * 4) + 1
    };

    const completedStages = statusToStagesMap[status] || 0;

    for (let i = 0; i < completedStages; i++) {
      interviews.push({
        stage: allStages[i],
        rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
        feedback: generateMockFeedback(),
        status: 'completed'
      });
    }

    return interviews;
  };

  const generateMockFeedback = () => {
    const feedbacks = [
      'Strong technical skills and good problem-solving approach.',
      'Excellent communication skills, needs improvement in technical depth.',
      'Good team player with leadership potential.',
      'Creative thinker with innovative solutions.',
      'Solid foundation but needs more experience.',
      'Outstanding performance across all areas.'
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  const calculateOverallScore = (interviews: any[]) => {
    if (interviews.length === 0) return 0;
    const total = interviews.reduce((sum, interview) => sum + (interview.rating || 0), 0);
    return Math.round((total / interviews.length) * 20); // Convert to percentage
  };

  const generateStrengthsWeaknesses = (skills: string[], interviews: any[]) => {
    const allStrengths = [
      'Strong technical foundation',
      'Excellent communication skills',
      'Problem-solving abilities',
      'Team collaboration',
      'Leadership potential',
      'Adaptability',
      'Creative thinking',
      'Attention to detail'
    ];

    const allWeaknesses = [
      'Needs more industry experience',
      'Could improve time management',
      'Requires mentorship in advanced concepts',
      'Communication could be clearer',
      'Needs confidence building',
      'Should develop broader skill set'
    ];

    const numStrengths = Math.min(Math.floor(Math.random() * 3) + 2, 4);
    const numWeaknesses = Math.min(Math.floor(Math.random() * 2) + 1, 3);

    return {
      strengths: allStrengths.slice(0, numStrengths),
      weaknesses: allWeaknesses.slice(0, numWeaknesses)
    };
  };

  const getRecommendation = (score: number, interviewCount: number): 'hire' | 'consider' | 'reject' => {
    if (score >= 80 && interviewCount >= 3) return 'hire';
    if (score >= 60 && interviewCount >= 2) return 'consider';
    return 'reject';
  };

  const getReadinessLevel = (score: number, status: string): 'ready' | 'needs_improvement' | 'not_ready' => {
    if (status === 'completed' && score >= 80) return 'ready';
    if (score >= 60) return 'needs_improvement';
    return 'not_ready';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire': return 'bg-green-100 text-green-800';
      case 'consider': return 'bg-yellow-100 text-yellow-800';
      case 'reject': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'hire': return <CheckCircle className="w-4 h-4" />;
      case 'consider': return <Clock className="w-4 h-4" />;
      case 'reject': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getReadinessIcon = (readiness: string) => {
    switch (readiness) {
      case 'ready': return <Award className="w-5 h-5 text-green-600" />;
      case 'needs_improvement': return <Target className="w-5 h-5 text-yellow-600" />;
      case 'not_ready': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading candidate summaries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList className="grid w-full grid-cols-4 lg:w-96">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="hire">Hire</TabsTrigger>
          <TabsTrigger value="consider">Consider</TabsTrigger>
          <TabsTrigger value="reject">Reject</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="space-y-4">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {candidate.candidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{candidate.candidate.name}</h3>
                        <p className="text-gray-600">{candidate.job.title} at {candidate.job.company}</p>
                        <p className="text-sm text-gray-500">{candidate.candidate.email}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">Overall Score</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={candidate.overallScore} className="flex-1 h-2" />
                            <span className="text-sm font-bold">{candidate.overallScore}%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getReadinessIcon(candidate.readinessLevel)}
                            <span className="text-sm font-medium">Readiness</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {candidate.readinessLevel.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Experience</span>
                          </div>
                          <span className="text-sm">{candidate.candidate.experience_years} years</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-700 mb-1">Key Strengths:</p>
                            <div className="flex flex-wrap gap-1">
                              {candidate.strengths.slice(0, 2).map((strength, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700">
                                  {strength}
                                </Badge>
                              ))}
                              {candidate.strengths.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{candidate.strengths.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-700 mb-1">Areas for Improvement:</p>
                            <div className="flex flex-wrap gap-1">
                              {candidate.weaknesses.slice(0, 2).map((weakness, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-orange-200 text-orange-700">
                                  {weakness}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <Badge className={`${getRecommendationColor(candidate.recommendation)} flex items-center space-x-1`}>
                      {getRecommendationIcon(candidate.recommendation)}
                      <span className="capitalize">{candidate.recommendation}</span>
                    </Badge>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl">
                            {selectedCandidate?.candidate.name} - Detailed Summary
                          </DialogTitle>
                          <DialogDescription>
                            Complete performance analysis across all interview stages
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedCandidate && (
                          <div className="space-y-6">
                            {/* Header Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <div className="text-2xl font-bold text-blue-600">{selectedCandidate.overallScore}%</div>
                                  <div className="text-sm text-gray-600">Overall Score</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <div className="text-2xl font-bold text-green-600">{selectedCandidate.interviews.length}</div>
                                  <div className="text-sm text-gray-600">Interviews Completed</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <div className="text-2xl font-bold text-purple-600">{selectedCandidate.candidate.experience_years}</div>
                                  <div className="text-sm text-gray-600">Years Experience</div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Interview Performance */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Interview Performance</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {selectedCandidate.interviews.map((interview, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{interview.stage}</h4>
                                        <div className="flex items-center space-x-2">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`w-4 h-4 ${
                                                i < (interview.rating || 0) 
                                                  ? 'text-yellow-400 fill-current' 
                                                  : 'text-gray-300'
                                              }`}
                                            />
                                          ))}
                                          <span className="text-sm font-medium">
                                            {interview.rating}/5
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600">{interview.feedback}</p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-green-700">Strengths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedCandidate.strengths.map((strength, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm">{strength}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-orange-700">Areas for Improvement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedCandidate.weaknesses.map((weakness, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <Target className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm">{weakness}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Skills */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Technical Skills</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {selectedCandidate.candidate.skills.map((skill, index) => (
                                    <Badge key={index} variant="outline">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Final Recommendation */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Hiring Recommendation</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center space-x-4">
                                  <Badge className={`${getRecommendationColor(selectedCandidate.recommendation)} text-lg px-4 py-2`}>
                                    {getRecommendationIcon(selectedCandidate.recommendation)}
                                    <span className="ml-2 capitalize">{selectedCandidate.recommendation}</span>
                                  </Badge>
                                  <div className="text-sm text-gray-600">
                                    Based on {selectedCandidate.interviews.length} completed interviews and overall performance score of {selectedCandidate.overallScore}%
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCandidates.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Star className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500">No candidates found for this filter</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateSummary;
