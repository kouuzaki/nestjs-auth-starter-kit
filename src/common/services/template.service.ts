import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface TemplateVariables {
  [key: string]: string | number;
}

@Injectable()
export class TemplateService {
  private templatesPath: string;

  constructor() {
    // Check if running from dist (production) or src (development)
    const isDist = __dirname.includes('dist');

    if (isDist) {
      // Production: templates are in dist/templates
      this.templatesPath = path.join(__dirname, '../../templates');
    } else {
      // Development: templates are in src/templates
      this.templatesPath = path.join(__dirname, '../../templates');
    }
  }

  /**
   * Load and render HTML template with variables
   * @param templateName - Name of template file (without .html)
   * @param variables - Object with key-value pairs to replace {{KEY}}
   */
  render(templateName: string, variables: TemplateVariables): string {
    const templatePath = path.join(
      this.templatesPath,
      `${templateName}.template.html`,
    );

    // Read template file
    let template: string;
    try {
      template = fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Template not found: ${templatePath}. Error: ${errorMessage}`,
      );
    }

    // Replace all {{VARIABLE}} placeholders
    Object.keys(variables).forEach((key) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(placeholder, String(variables[key]));
    });

    return template;
  }

  /**
   * Check if template exists
   */
  exists(templateName: string): boolean {
    const templatePath = path.join(
      this.templatesPath,
      `${templateName}.template.html`,
    );
    return fs.existsSync(templatePath);
  }

  /**
   * Get list of available templates
   */
  getAvailableTemplates(): string[] {
    if (!fs.existsSync(this.templatesPath)) {
      return [];
    }

    return fs
      .readdirSync(this.templatesPath)
      .filter((file) => file.endsWith('.template.html'))
      .map((file) => file.replace('.template.html', ''));
  }
}
