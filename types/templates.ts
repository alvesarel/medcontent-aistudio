import { Platform } from './types';

/**
 * Defines the structure for a single, replaceable variable within a template.
 */
export interface TemplateVariable {
  /** The key for the variable, used as `{{key}}` in the template content. */
  key: string;
  /** The user-friendly label displayed on the form. */
  label: string;
  /** The type of form input to generate. */
  type: 'text' | 'number' | 'select' | 'date';
  /** Whether this field is required to be filled by the user. */
  required: boolean;
  /** A list of options for 'select' type inputs. */
  options?: string[];
  /** A default value for the form field. */
  defaultValue?: string;
}

/**
 * Defines a single section of content within a template's structure.
 */
export interface TemplateSection {
  id: string;
  type: 'header' | 'body' | 'cta' | 'disclaimer';
  /** The content for this section, which may include `{{variable_key}}` placeholders. */
  content: string;
  /** Whether the user can edit this section's content (future feature). */
  isEditable: boolean;
  characterLimit?: number;
}

/**
 * Defines the overall structure of a template's content.
 */
export interface TemplateStructure {
  sections: TemplateSection[];
  defaultPlatform?: Platform;
  estimatedReadTime?: number;
}

/**
 * Represents a complete, structured content template.
 */
export interface Template {
  id: string;
  name: string;
  category: 'educational' | 'myth-vs-truth' | 'tips' | 'case-study' | 'announcement' | 'custom';
  specialty?: string;
  structure: TemplateStructure;
  variables: TemplateVariable[];
  thumbnail?: string;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
}
