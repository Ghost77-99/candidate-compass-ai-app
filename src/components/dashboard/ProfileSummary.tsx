
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Briefcase, Calendar } from 'lucide-react';

interface ProfileSummaryProps {
  profile: any;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profile Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">About</h4>
            <p className="text-sm text-gray-600">
              {profile.bio || 'No bio added yet. Add a bio to help employers understand your background and interests.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                <Briefcase className="h-4 w-4" />
                <span>Skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length ? (
                  profile.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Experience</span>
              </h4>
              <p className="text-gray-600 text-sm">
                {profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </h4>
            <p className="text-gray-600 text-sm">{profile.location || 'Not specified'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Department:</span>
              <p className="font-medium">{profile.department || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="font-medium">{profile.phone || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        <Button className="mt-4" variant="outline">
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSummary;
