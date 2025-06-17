
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EditableProfileField from './EditableProfileField';

interface HRProfileSummaryProps {
  profile: any;
  onProfileUpdate?: () => void;
}

const HRProfileSummary: React.FC<HRProfileSummaryProps> = ({ profile, onProfileUpdate }) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState(profile);

  const updateProfile = async (field: string, value: string) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>HR Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <EditableProfileField
          label="About"
          value={profileData.bio}
          onSave={(value) => updateProfile('bio', value)}
          type="textarea"
          placeholder="Add a professional bio describing your role and experience in HR"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <EditableProfileField
              label="Company"
              value={profileData.company}
              onSave={(value) => updateProfile('company', value)}
              placeholder="Your company name"
            />
            
            <EditableProfileField
              label="Department"
              value={profileData.department}
              onSave={(value) => updateProfile('department', value)}
              placeholder="HR Department"
            />
          </div>
          
          <div className="space-y-4">
            <EditableProfileField
              label="Location"
              value={profileData.location}
              onSave={(value) => updateProfile('location', value)}
              placeholder="Office location"
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
          label="Role/Title"
          value={profileData.role}
          onSave={(value) => updateProfile('role', value)}
          placeholder="Your job title"
        />

        {/* Display profile information */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Email:</span>
            <span className="font-medium">{profileData.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Company:</span>
            <span className="font-medium">{profileData.company || 'Not specified'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRProfileSummary;
