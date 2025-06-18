import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video, Phone, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { interviewService, InterviewSchedule } from '@/services/interviewService';
import InterviewFeedbackForm from './InterviewFeedbackForm';
import { useToast } from '@/hooks/use-toast';

const InterviewCalendar = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUpcomingInterviews();
  }, []);

  const loadUpcomingInterviews = async () => {
    try {
      setIsLoading(true);
      const data = await interviewService.getUpcomingInterviews(20);
      setInterviews(data);
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (interviewId: string, status: InterviewSchedule['status']) => {
    try {
      await interviewService.updateInterviewStatus(interviewId, status);
      await loadUpcomingInterviews();
      
      toast({
        title: "Success",
        description: `Interview ${status} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interview status",
        variant: "destructive",
      });
    }
  };

  const sendReminder = async (interviewId: string) => {
    try {
      await interviewService.sendInterviewReminder(interviewId);
      await loadUpcomingInterviews();
      
      toast({
        title: "Success",
        description: "Interview reminder sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom':
      case 'teams':
      case 'meet':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading interviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Interview Calendar
          </CardTitle>
          <CardDescription>
            Manage upcoming interviews and provide feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming interviews scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            {interview.applications?.profiles?.name || 'Unknown Candidate'}
                          </h4>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                          {interview.applications?.jobs?.title} at {interview.applications?.jobs?.company}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(interview.scheduled_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(interview.start_time)} - {formatTime(interview.end_time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getPlatformIcon(interview.meeting_platform)}
                            <span className="capitalize">{interview.meeting_platform.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {interview.meeting_link && (
                          <div className="mb-3">
                            <a 
                              href={interview.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}

                        {interview.preparation_notes && (
                          <div className="bg-gray-50 p-3 rounded-md mb-3">
                            <p className="text-sm text-gray-700">{interview.preparation_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {interview.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(interview.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                            {!interview.reminder_sent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => sendReminder(interview.id)}
                              >
                                Send Reminder
                              </Button>
                            )}
                          </>
                        )}
                        
                        {interview.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(interview.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}

                        {interview.status === 'completed' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Add Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Interview Feedback</DialogTitle>
                                <DialogDescription>
                                  Provide feedback for the completed interview
                                </DialogDescription>
                              </DialogHeader>
                              <InterviewFeedbackForm
                                interviewId={interview.id}
                                candidateName={interview.applications?.profiles?.name || 'Unknown'}
                                position={interview.applications?.jobs?.title || 'Unknown Position'}
                                onSubmit={() => {
                                  loadUpcomingInterviews();
                                }}
                                onCancel={() => {}}
                              />
                            </DialogContent>
                          </Dialog>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInterview(interview)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Details Modal */}
      {selectedInterview && (
        <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Interview Details</DialogTitle>
              <DialogDescription>
                Complete information about the scheduled interview
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Candidate</Label>
                  <p>{selectedInterview.applications?.profiles?.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Position</Label>
                  <p>{selectedInterview.applications?.jobs?.title}</p>
                </div>
                <div>
                  <Label className="font-semibold">Date & Time</Label>
                  <p>{formatDate(selectedInterview.scheduled_date)} at {formatTime(selectedInterview.start_time)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Platform</Label>
                  <p className="capitalize">{selectedInterview.meeting_platform.replace('_', ' ')}</p>
                </div>
              </div>
              
              {selectedInterview.agenda && Object.keys(selectedInterview.agenda).length > 0 && (
                <div>
                  <Label className="font-semibold">Agenda</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm">{JSON.stringify(selectedInterview.agenda, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InterviewCalendar;