
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Check, X } from 'lucide-react';

interface EditableProfileFieldProps {
  label: string;
  value: string | number | null;
  onSave: (newValue: string) => Promise<void>;
  type?: 'text' | 'textarea' | 'number';
  placeholder?: string;
  className?: string;
}

const EditableProfileField: React.FC<EditableProfileFieldProps> = ({
  label,
  value,
  onSave,
  type = 'text',
  placeholder,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            {type === 'textarea' ? (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="resize-none"
              />
            ) : (
              <Input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={placeholder}
              />
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="p-2"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="p-1 h-6 w-6"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-sm text-gray-600">
        {value || <span className="text-gray-400 italic">{placeholder || 'Not specified'}</span>}
      </p>
    </div>
  );
};

export default EditableProfileField;
