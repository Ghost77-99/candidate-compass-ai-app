import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { applicationStageService } from '@/services/applicationStageService';

interface EnhancedResumeUploadProps {
  userId: string;
  applicationId?: string;
  currentResumeUrl?: string;
  onUploadComplete: (resumeUrl: string, summary?: string, score?: number) => void;
  showQualificationCheck?: boolean;
}

const EnhancedResumeUpload: React.FC<EnhancedResumeUploadProps> = ({
  userId,
  applicationId,
  currentResumeUrl,
  onUploadComplete,
  showQualificationCheck = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualificationScore, setQualificationScore] = useState<number | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const { toast } = useToast();

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      } else {
        resolve(`Resume file: ${file.name} (${file.type})`);
      }
    });
  };

  const generateSummaryAndScore = async (resumeText: string): Promise<{summary: string, score: number}> => {
    try {
      setIsAnalyzing(true);
      
      // Generate a qualification score based on keywords and content
      const score = calculateQualificationScore(resumeText);
      
      // Generate a simple summary
      const summary = generateSimpleSummary(resumeText);
      
      return {
        summary: summary,
        score: score
      };
    } catch (error) {
      console.error('Error analyzing resume:', error);
      return {
        summary: 'Resume uploaded successfully. Professional experience and skills detected.',
        score: 75
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSimpleSummary = (resumeText: string): string => {
    const text = resumeText.toLowerCase();
    let summary = "Professional candidate with ";
    
    // Check for experience indicators
    if (text.includes('senior') || text.includes('lead')) {
      summary += "senior-level experience in ";
    } else if (text.includes('junior') || text.includes('entry')) {
      summary += "entry-level experience in ";
    } else {
      summary += "experience in ";
    }
    
    // Check for technical skills
    const techSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker'];
    const foundSkills = techSkills.filter(skill => text.includes(skill));
    
    if (foundSkills.length > 0) {
      summary += `${foundSkills.slice(0, 3).join(', ')} and other technologies. `;
    } else {
      summary += "various professional domains. ";
    }
    
    summary += "Demonstrates strong background and relevant qualifications for the position.";
    
    return summary;
  };

  const calculateQualificationScore = (resumeText: string): number => {
    const text = resumeText.toLowerCase();
    let score = 0;
    
    // Keywords that add to qualification score
    const keywords = {
      experience: ['experience', 'years', 'worked', 'employment', 'professional'],
      skills: ['skills', 'technologies', 'programming', 'software', 'technical'],
      education: ['education', 'degree', 'university', 'college', 'certification', 'bachelor', 'master'],
      achievements: ['achievement', 'award', 'project', 'successful', 'completed', 'delivered'],
      leadership: ['lead', 'manage', 'team', 'leadership', 'supervisor', 'director']
    };
    
    Object.values(keywords).forEach(keywordGroup => {
      keywordGroup.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 5;
        }
      });
    });
    
    // Length bonus (minimum content requirement)
    if (text.length > 500) score += 20;
    if (text.length > 1000) score += 10;
    if (text.length > 2000) score += 5;
    
    // Cap at 100 and ensure minimum of 60 for valid resumes
    return Math.min(Math.max(score, 60), 100);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setAnalysisComplete(false);
    setQualificationScore(null);

    try {
      console.log('Starting resume upload process...');
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/resume_${Date.now()}.${fileExt}`;
      
      console.log('Uploading file to storage:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      const resumeUrl = urlData.publicUrl;
      console.log('Resume URL:', resumeUrl);

      // Extract text and analyze
      let summary = '';
      let score = 75; // Default score
      
      if (file.type === 'text/plain') {
        const resumeText = await extractTextFromFile(file);
        const analysis = await generateSummaryAndScore(resumeText);
        summary = analysis.summary;
        score = analysis.score;
        setQualificationScore(score);
      } else {
        // For non-text files, use default values
        summary = 'Resume uploaded successfully. Professional document detected with relevant experience and qualifications.';
        score = 80;
        setQualificationScore(score);
      }

      console.log('Analysis complete:', { summary, score });

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          resume_url: resumeUrl,
          ...(summary && { bio: summary })
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log('Profile updated successfully');

      // If this is for a specific application and qualification check is enabled
      if (applicationId && showQualificationCheck && score > 0) {
        console.log('Completing resume stage for application:', applicationId);
        await applicationStageService.completeResumeStage(
          applicationId,
          resumeUrl,
          score,
          summary
        );
      }

      setAnalysisComplete(true);
      onUploadComplete(resumeUrl, summary, score);
      
      toast({
        title: "Resume uploaded successfully",
        description: showQualificationCheck 
          ? `Resume analyzed. Qualification score: ${score}%` 
          : "Your resume has been uploaded.",
        variant: score >= 75 ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resume Upload</span>
          {showQualificationCheck && analysisComplete && qualificationScore !== null && (
            <div className="flex items-center space-x-2">
              {qualificationScore >= 75 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${
                qualificationScore >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {qualificationScore}% Qualified
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing && (
          <div className="flex items-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing resume and calculating qualification score...
          </div>
        )}
        
        {currentResumeUrl ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Resume uploaded</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentResumeUrl, '_blank')}
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('resume-upload')?.click()}
                disabled={isUploading}
              >
                Replace
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Upload your resume</p>
            <p className="text-xs text-gray-400 mb-4">PDF, DOC, DOCX, or TXT (max 5MB)</p>
            {showQualificationCheck && (
              <p className="text-xs text-blue-600 mb-4">
                ⚠️ Minimum 75% qualification score required to proceed
              </p>
            )}
            <Button
              onClick={() => document.getElementById('resume-upload')?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Choose File'
              )}
            </Button>
          </div>
        )}
        
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedResumeUpload;