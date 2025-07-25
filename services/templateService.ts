import { Template } from '../types/templates';
import * as apiGateway from './apiGateway';

// ============================================================================
// This service now acts as a client to the apiGateway for template operations.
// ============================================================================


/**
 * Fetches templates from the API gateway, with optional filters.
 */
export async function getTemplates(filters?: {
  category?: string;
  specialty?: string;
}): Promise<Template[]> {
  return apiGateway.getTemplates(filters);
}

/**
 * Saves a custom template via the API gateway.
 */
export async function saveCustomTemplate(template: Template): Promise<void> {
  return apiGateway.saveCustomTemplate(template);
}


/**
 * Applies variables to a template's content string.
 * This is a pure utility function and can remain on the client-side.
 * @param template The template object.
 * @param variables A key-value map of variables to replace.
 * @returns The final content string with variables interpolated.
 */
export function applyTemplate(template: Template, variables: Record<string, string>): string {
  let content = template.structure.sections
    .map(section => section.content)
    .join('\n\n');

  // Substituir variáveis
  Object.entries(variables).forEach(([key, value]) => {
    const replacement = value ?? ''; // Use empty string for null/undefined values
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), replacement);
  });

  // Limpar quaisquer variáveis não substituídas que possam ter restado
  content = content.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '');

  return content.trim();
}
