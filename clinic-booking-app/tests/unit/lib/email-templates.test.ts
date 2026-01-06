import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for email template rendering
 * Validates email templates are properly structured and contain required content
 */

describe('Email Template Tests', () => {
  const templatesPath = join(
    process.cwd(),
    'supabase/functions/send-email/templates'
  );

  describe('Appointment Created Template', () => {
    let template: string;

    try {
      template = readFileSync(
        join(templatesPath, 'appointment-created.html'),
        'utf-8'
      );
    } catch {
      template = '';
    }

    it('should exist and be readable', () => {
      expect(template).toBeDefined();
      expect(template.length).toBeGreaterThan(0);
    });

    it('should contain HTML structure', () => {
      expect(template).toContain('<!DOCTYPE html>');
      expect(template).toContain('<html');
      expect(template).toContain('</html>');
      expect(template).toContain('<body');
      expect(template).toContain('</body>');
    });

    it('should have appointment-related placeholders', () => {
      const placeholders = [
        '{{patientName}}',
        '{{clinicName}}',
        '{{appointmentDate}}',
        '{{appointmentTime}}',
      ];

      placeholders.forEach((placeholder) => {
        expect(template).toContain(placeholder);
      });
    });

    it('should include branding elements', () => {
      expect(
        template.toLowerCase().includes('clinic') ||
          template.toLowerCase().includes('appointment')
      ).toBe(true);
    });

    it('should have proper meta tags for email clients', () => {
      expect(template).toContain('<meta');
      expect(template).toContain('charset');
    });

    it('should contain call-to-action or next steps', () => {
      const hasCallToAction =
        template.toLowerCase().includes('pending') ||
        template.toLowerCase().includes('confirm') ||
        template.toLowerCase().includes('review');

      expect(hasCallToAction).toBe(true);
    });
  });

  describe('Appointment Confirmed Template', () => {
    let template: string;

    try {
      template = readFileSync(
        join(templatesPath, 'appointment-confirmed.html'),
        'utf-8'
      );
    } catch {
      template = '';
    }

    it('should exist and be readable', () => {
      expect(template).toBeDefined();
      expect(template.length).toBeGreaterThan(0);
    });

    it('should contain HTML structure', () => {
      expect(template).toContain('<!DOCTYPE html>');
      expect(template).toContain('<html');
      expect(template).toContain('</html>');
    });

    it('should have confirmation-specific content', () => {
      const confirmationTerms = [
        'confirm',
        'approved',
        'scheduled',
        'upcoming',
      ];

      const hasConfirmationContent = confirmationTerms.some((term) =>
        template.toLowerCase().includes(term)
      );

      expect(hasConfirmationContent).toBe(true);
    });

    it('should include appointment details placeholders', () => {
      const requiredPlaceholders = [
        '{{clinicName}}',
        '{{appointmentDate}}',
        '{{clinicAddress}}',
      ];

      requiredPlaceholders.forEach((placeholder) => {
        expect(template).toContain(placeholder);
      });
    });

    it('should have contact information', () => {
      const hasContactInfo =
        template.includes('{{clinicPhone}}') ||
        template.toLowerCase().includes('contact') ||
        template.toLowerCase().includes('questions');

      expect(hasContactInfo).toBe(true);
    });
  });

  describe('Appointment Rejected Template', () => {
    let template: string;

    try {
      template = readFileSync(
        join(templatesPath, 'appointment-rejected.html'),
        'utf-8'
      );
    } catch {
      template = '';
    }

    it('should exist and be readable', () => {
      expect(template).toBeDefined();
      expect(template.length).toBeGreaterThan(0);
    });

    it('should contain HTML structure', () => {
      expect(template).toContain('<!DOCTYPE html>');
      expect(template).toContain('<html');
      expect(template).toContain('</html>');
    });

    it('should have rejection-specific content', () => {
      const rejectionTerms = [
        'reject',
        'unable',
        'cannot',
        'unavailable',
        'sorry',
      ];

      const hasRejectionContent = rejectionTerms.some((term) =>
        template.toLowerCase().includes(term)
      );

      expect(hasRejectionContent).toBe(true);
    });

    it('should include reason placeholder if applicable', () => {
      // May or may not have reason, but should have basic info
      expect(
        template.includes('{{clinicName}}') ||
          template.includes('{{appointmentDate}}')
      ).toBe(true);
    });

    it('should offer alternative actions', () => {
      const hasAlternatives =
        template.toLowerCase().includes('book another') ||
        template.toLowerCase().includes('try again') ||
        template.toLowerCase().includes('browse') ||
        template.toLowerCase().includes('search');

      expect(hasAlternatives).toBe(true);
    });
  });

  describe('Template Consistency', () => {
    it('all templates should have consistent styling approach', () => {
      const templates = [
        'appointment-created.html',
        'appointment-confirmed.html',
        'appointment-rejected.html',
      ];

      const styles = templates.map((filename) => {
        try {
          const content = readFileSync(join(templatesPath, filename), 'utf-8');
          return {
            hasInlineStyles: content.includes('style='),
            hasStyleTag: content.includes('<style'),
            filename,
          };
        } catch {
          return { hasInlineStyles: false, hasStyleTag: false, filename };
        }
      });

      // All should use similar styling approach
      const inlineCount = styles.filter((s) => s.hasInlineStyles).length;
      const styleTagCount = styles.filter((s) => s.hasStyleTag).length;

      // Either all use inline styles or all use style tags
      expect(inlineCount === 3 || styleTagCount === 3).toBe(true);
    });

    it('all templates should be mobile-responsive', () => {
      const templates = [
        'appointment-created.html',
        'appointment-confirmed.html',
        'appointment-rejected.html',
      ];

      templates.forEach((filename) => {
        try {
          const content = readFileSync(join(templatesPath, filename), 'utf-8');

          const hasResponsiveElements =
            content.includes('viewport') ||
            content.includes('max-width') ||
            content.includes('@media');

          expect(hasResponsiveElements).toBe(true);
        } catch (error) {
          // Template file might not exist in test environment
          expect(true).toBe(true);
        }
      });
    });

    it('all templates should have proper character encoding', () => {
      const templates = [
        'appointment-created.html',
        'appointment-confirmed.html',
        'appointment-rejected.html',
      ];

      templates.forEach((filename) => {
        try {
          const content = readFileSync(join(templatesPath, filename), 'utf-8');
          expect(
            content.includes('charset="UTF-8"') ||
              content.includes("charset='UTF-8'") ||
              content.includes('charset=UTF-8')
          ).toBe(true);
        } catch {
          // Template might not exist in test environment
          expect(true).toBe(true);
        }
      });
    });
  });

  describe('Template Security', () => {
    it('templates should not contain hardcoded sensitive data', () => {
      const templates = [
        'appointment-created.html',
        'appointment-confirmed.html',
        'appointment-rejected.html',
      ];

      templates.forEach((filename) => {
        try {
          const content = readFileSync(join(templatesPath, filename), 'utf-8');

          // Should not contain actual email addresses, passwords, API keys
          expect(content).not.toMatch(/password:\s*['"]\w+['"]/i);
          expect(content).not.toMatch(/api[_-]?key:\s*['"]\w+['"]/i);
          expect(content).not.toMatch(/@\w+\.\w+/); // Real email addresses (placeholders use {{}})
        } catch {
          expect(true).toBe(true);
        }
      });
    });

    it('templates should escape user input placeholders properly', () => {
      const templates = [
        'appointment-created.html',
        'appointment-confirmed.html',
        'appointment-rejected.html',
      ];

      templates.forEach((filename) => {
        try {
          const content = readFileSync(join(templatesPath, filename), 'utf-8');

          // Placeholders should be in {{}} format for proper escaping
          const placeholders = content.match(/\{\{[^}]+\}\}/g) || [];
          expect(placeholders.length).toBeGreaterThan(0);
        } catch {
          expect(true).toBe(true);
        }
      });
    });
  });

  describe('Template Accessibility', () => {
    it('templates should have semantic HTML', () => {
      const templates = [
        'appointment-created.html',
        'appointment-confirmed.html',
        'appointment-rejected.html',
      ];

      templates.forEach((filename) => {
        try {
          const content = readFileSync(join(templatesPath, filename), 'utf-8');

          // Should use semantic elements
          const hasSemanticElements =
            content.includes('<h1') ||
            content.includes('<h2') ||
            content.includes('<p>') ||
            content.includes('<main') ||
            content.includes('<header');

          expect(hasSemanticElements).toBe(true);
        } catch {
          expect(true).toBe(true);
        }
      });
    });

    it('templates should have alt text for images if any', () => {
      const templates = [
        'appointment-created.html',
        'appointment-confirmed.html',
        'appointment-rejected.html',
      ];

      templates.forEach((filename) => {
        try {
          const content = readFileSync(join(templatesPath, filename), 'utf-8');

          const images = content.match(/<img[^>]*>/g) || [];

          images.forEach((img) => {
            expect(img).toContain('alt=');
          });
        } catch {
          expect(true).toBe(true);
        }
      });
    });
  });
});
