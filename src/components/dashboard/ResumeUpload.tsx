
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResumeUploadProps {
  userId: string;
  currentResumeUrl?: string;
  onUploadComplete: (resumeUrl: string, summary?: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  userId,
  currentResumeUrl,
  onUploadComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { toast } = useToast();

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      } else {
        // For other file types, return filename as fallback
        resolve(`Resume file: ${file.name}`);
      }
    });
  };

  const generateSummary = async (resumeText: string): Promise<string | null> => {
    try {
      setIsGeneratingSummary(true);
      
      const response = await fetch('/api/generate-resume-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return null;
    } finally {
      setIsGeneratingSummary(false);
    }
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

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `resume_${userId}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      const resumeUrl = urlData.publicUrl;

      // Extract text and generate summary for text files
      let summary = null;
      if (file.type === 'text/plain') {
        const resumeText = await extractTextFromFile(file);
        summary = await generateSummary(resumeText);
      }

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          resume_url: resumeUrl,
          ...(summary && { bio: summary })
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      onUploadComplete(resumeUrl, summary || undefined);
      
      toast({
        title: "Resume uploaded successfully",
        description: summary ? "AI summary has been generated and added to your profile." : "Your resume has been uploaded.",
      });

    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Resume</h4>
            {isGeneratingSummary && (
              <div className="flex items-center text-sm text-blue-600">
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Generating AI summary...
              </div>
            )}
          </div>
          
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
