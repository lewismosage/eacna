// components/EmailTemplate.tsx
import React from 'react';
import eacnalogo from '../../assets/eacnaLogo.jpg'; 
import ReactDOMServer from 'react-dom/server';

interface EmailTemplateProps {
  title?: string;
  recipientName?: string;
  content: string;
  type?: 'newsletter' | 'payment' | 'contact' | 'system';
  footerLinks?: {
    unsubscribe?: string;
    preferences?: string;
    contact?: string;
    viewInBrowser?: string;
  };
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  title = '',
  recipientName = '',
  content,
  type = 'system',
  footerLinks = {}
}) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px', 
      border: '1px solid #eaeaea',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eaeaea'
      }}>
        <img 
        src="https://eacna.vercel.app/eacna_logo.png" 
        alt="EACNA Logo" 
        style={{ 
            maxWidth: '150px', 
            height: 'auto', 
            margin: '0 auto 15px auto',
            display: 'block'
        }}
        />
        {title && <h1 style={{ color: '#1a3e72', margin: '0 0 10px 0' }}>{title}</h1>}
        <p style={{ color: '#666666', margin: 0 }}>
          {type === 'newsletter' ? 'Your Monthly Newsletter' : 'Official Communication'}
        </p>
      </div>
      
      {/* Content */}
      <div style={{ 
        padding: '20px',
        lineHeight: '1.6',
        color: '#333333'
      }}>
        {recipientName && <p>Dear {recipientName},</p>}
        
        {/* Dynamic content from frontend */}
        <div dangerouslySetInnerHTML={{ __html: content }} />
        
        <p style={{ marginTop: '30px' }}>
          Best regards,<br />
          The EACNA Team
        </p>
      </div>
      
      {/* Footer */}
      <div style={{ 
        marginTop: '30px', 
        paddingTop: '20px',
        borderTop: '1px solid #eaeaea',
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#666666'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <a href="https://facebook.com/eacna" style={{ margin: '0 10px', color: '#1a6fef', textDecoration: 'none' }}>Facebook</a>
          <a href="https://twitter.com/eacna" style={{ margin: '0 10px', color: '#1a6fef', textDecoration: 'none' }}>Twitter</a>
          <a href="https://linkedin.com/company/eacna" style={{ margin: '0 10px', color: '#1a6fef', textDecoration: 'none' }}>LinkedIn</a>
          <a href="https://instagram.com/eacna" style={{ margin: '0 10px', color: '#1a6fef', textDecoration: 'none' }}>Instagram</a>
        </div>
        
        {type === 'newsletter' && (
          <div style={{ marginBottom: '15px' }}>
            <a href="/unsubscribe" style={{ margin: '0 10px', color: '#1a6fef', textDecoration: 'none' }}>Unsubscribe</a>
            {footerLinks.viewInBrowser && (
              <a href={footerLinks.viewInBrowser} style={{ margin: '0 10px', color: '#1a6fef', textDecoration: 'none' }}>View in Browser</a>
            )}
          </div>
        )}
        
        <p>© {currentYear} East African Community Network Association. All rights reserved.</p>
        <p>EACNA Headquarters</p>
        <p>5th Ngong Avenue, Nairobi, Kenya</p>
      </div>
    </div>
  );
};

export const getEmailTemplateHTML = (props: EmailTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${props.title || 'EACNA Communication'}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px;">
      ${ReactDOMServer.renderToStaticMarkup(<EmailTemplate {...props} />)}
    </body>
    </html>
  `;
};