# Email Templates

This folder contains HTML email templates with placeholder variables.

## Available Templates

### 1. `otp-email.template.html`

Template untuk OTP (One-Time Password) emails.

**Placeholders:**

- `{{TITLE}}` - Email title/subject
- `{{ICON}}` - Header icon emoji (🔐, ✉️, 🔑)
- `{{HEADER_TITLE}}` - Main heading text
- `{{MESSAGE}}` - Message body text
- `{{OTP_CODE}}` - The 6-digit OTP code
- `{{EXPIRY_TIME}}` - How long the OTP is valid (e.g., "10 minutes")
- `{{CURRENT_YEAR}}` - Current year for copyright
- `{{APP_NAME}}` - Application name from env

**Usage:**

```typescript
const html = templateService.render('otp-email', {
  TITLE: 'Verify Your Email',
  ICON: '✉️',
  HEADER_TITLE: 'Email Verification',
  MESSAGE: 'Please use the code below to verify your email:',
  OTP_CODE: '123456',
  EXPIRY_TIME: '10 minutes',
  CURRENT_YEAR: 2025,
  APP_NAME: 'NestJS Auth',
});
```

### 2. `verification-email.template.html`

Template untuk verification link emails.

**Placeholders:**

- `{{GREETING}}` - Personalized greeting (e.g., "Hi John,")
- `{{VERIFICATION_URL}}` - Full verification URL with token
- `{{EXPIRY_TIME}}` - How long the link is valid (e.g., "24 hours")
- `{{CURRENT_YEAR}}` - Current year for copyright
- `{{APP_NAME}}` - Application name from env

**Usage:**

```typescript
const html = templateService.render('verification-email', {
  GREETING: 'Hi John Doe,',
  VERIFICATION_URL: 'https://yourapp.com/verify?token=xxx',
  EXPIRY_TIME: '24 hours',
  CURRENT_YEAR: 2025,
  APP_NAME: 'NestJS Auth',
});
```

## Creating New Templates

1. Create a new `.template.html` file in this folder
2. Use `{{VARIABLE_NAME}}` for placeholders
3. Use the template in your service:

```typescript
const html = templateService.render('your-template-name', {
  VARIABLE_NAME: 'value',
  ANOTHER_VAR: 'another value',
});
```

## Template Structure

All templates follow this structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{TITLE}}</title>
    <style>
      /* Inline CSS styles */
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Template content with {{PLACEHOLDERS}} -->
    </div>
  </body>
</html>
```

## Best Practices

1. **Use Inline CSS** - Email clients don't support external stylesheets
2. **Mobile Responsive** - Use max-width and viewport meta tag
3. **Simple HTML** - Avoid complex layouts, use tables for compatibility
4. **Test Across Clients** - Test in Gmail, Outlook, Apple Mail, etc.
5. **Placeholder Convention** - Use UPPERCASE for placeholders: `{{VARIABLE_NAME}}`

## Testing Templates

Test templates using the TemplateService:

```typescript
import { TemplateService } from './template.service';

const templateService = new TemplateService();

// Check if template exists
if (templateService.exists('otp-email')) {
  // Render template
  const html = templateService.render('otp-email', {
    // ... variables
  });

  console.log(html);
}

// Get all available templates
const templates = templateService.getAvailableTemplates();
console.log('Available templates:', templates);
```

## Customization

To customize templates:

1. Edit the HTML file directly
2. Add new placeholders as needed
3. Update the corresponding service call to include new variables
4. Keep styling inline for email client compatibility

## Example: Custom Welcome Email

**File:** `welcome-email.template.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to {{APP_NAME}}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome, {{USER_NAME}}!</h1>
      <p>{{WELCOME_MESSAGE}}</p>
      <a href="{{GET_STARTED_URL}}">Get Started</a>
    </div>
  </body>
</html>
```

**Usage:**

```typescript
const html = templateService.render('welcome-email', {
  APP_NAME: 'My App',
  USER_NAME: 'John Doe',
  WELCOME_MESSAGE: 'Thanks for joining us!',
  GET_STARTED_URL: 'https://myapp.com/onboarding',
});
```
