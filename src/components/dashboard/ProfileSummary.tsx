
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Briefcase, Calendar, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EditableProfileField from './EditableProfileField';
import ResumeUpload from './ResumeUpload';

interface ProfileSummaryProps {
  profile: any;
  onProfileUpdate?: () => void;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ profile, onProfileUpdate }) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState(profile);

  const updateProfile = async (field: string, value: string | string[] | number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', profile.id);

      if (error) throw error;

      setProfileData({ ...profileData, [field]: value });
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });

      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSkills = async (skillsString: string) => {
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
    await updateProfile('skills', skillsArray);
  };

  const updateExperienceYears = async (value: string) => {
    const numericValue = parseInt(value) || 0;
    await updateProfile('experience_years', numericValue);
  };

  const handleResumeUpload = (resumeUrl: string, summary?: string) => {
    setProfileData({ 
      ...profileData, 
      resume_url: resumeUrl,
      ...(summary && { bio: summary })
    });
    if (onProfileUpdate) {
      onProfileUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EditableProfileField
            label="About"
            value={profileData.bio}
            onSave={(value) => updateProfile('bio', value)}
            type="textarea"
            placeholder="Add a bio to help employers understand your background and interests"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <EditableProfileField
                label="Skills"
                value={profileData.skills?.join(', ')}
                onSave={updateSkills}
                placeholder="Add your skills (comma separated)"
              />
              
              <EditableProfileField
                label="Experience (Years)"
                value={profileData.experience_years}
                onSave={updateExperienceYears}
                type="number"
                placeholder="Years of experience"
              />
            </div>
            
            <div className="space-y-4">
              <EditableProfileField
                label="Location"
                value={profileData.location}
                onSave={(value) => updateProfile('location', value)}
                placeholder="Your location"
              />
              
              <EditableProfileField
                label="Phone"
                value={profileData.phone}
                onSave={(value) => updateProfile('phone', value)}
                placeholder="Your phone number"
              />
            </div>
          </div>

          <EditableProfileField
            label="Department"
            value={profileData.department}
            onSave={(value) => updateProfile('department', value)}
            placeholder="Your department or field"
          />

          {/* Display current skills as badges */}
          {profileData.skills?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                <Briefcase className="h-4 w-4" />
                <span>Current Skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ResumeUpload
        userId={profile.id}
        currentResumeUrl={profileData.resume_url}
        onUploadComplete={handleResumeUpload}
      />
    </div>
  );
};

export default ProfileSummary;
