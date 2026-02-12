'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Page
 * Handles errors at the root level, including layout errors.
 * This component must include its own html and body tags since
 * it replaces the entire root layout when an error occurs.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#F5F0E8',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1A1A1A',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '512px',
          margin: '0 auto',
          padding: '24px',
          textAlign: 'center',
        }}>
          {/* Critical Error Icon */}
          <div style={{
            width: '160px',
            height: '160px',
            margin: '0 auto 32px',
            opacity: 0.2,
          }}>
            <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Golf course with maintenance sign */}
              {/* Ground/Course */}
              <path
                d="M10 120 Q40 110, 80 115 T150 120 L150 140 L10 140 Z"
                fill="#1B3A2D"
                fillOpacity="0.3"
              />

              {/* Maintenance barrier posts */}
              <rect x="30" y="70" width="6" height="50" rx="1" fill="#1B3A2D" stroke="#1B3A2D" strokeWidth="2" />
              <rect x="124" y="70" width="6" height="50" rx="1" fill="#1B3A2D" stroke="#1B3A2D" strokeWidth="2" />

              {/* Barrier tape */}
              <rect x="36" y="80" width="88" height="10" rx="2" fill="#1B3A2D" fillOpacity="0.4" stroke="#1B3A2D" strokeWidth="1.5" />
              <rect x="36" y="95" width="88" height="10" rx="2" fill="#1B3A2D" fillOpacity="0.4" stroke="#1B3A2D" strokeWidth="1.5" />

              {/* Warning triangle */}
              <path
                d="M80 25 L105 65 L55 65 Z"
                fill="#1B3A2D"
                fillOpacity="0.2"
                stroke="#1B3A2D"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Exclamation mark in triangle */}
              <line x1="80" y1="38" x2="80" y2="52" stroke="#1B3A2D" strokeWidth="4" strokeLinecap="round" />
              <circle cx="80" cy="58" r="2.5" fill="#1B3A2D" />

              {/* Wrench/tool icon */}
              <path
                d="M130 40 Q140 30, 145 35 Q150 40, 140 50 L125 65 L120 60 L135 45 Q130 40, 130 40"
                fill="#1B3A2D"
                fillOpacity="0.4"
                stroke="#1B3A2D"
                strokeWidth="2"
              />

              {/* Cone */}
              <path
                d="M70 120 L75 95 L85 95 L90 120 Z"
                fill="#1B3A2D"
                fillOpacity="0.3"
                stroke="#1B3A2D"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Error Heading */}
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '28px',
            fontWeight: 600,
            color: '#1B3A2D',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}>
            Course Under Maintenance
          </h1>

          {/* Error Message */}
          <p style={{
            fontSize: '16px',
            color: '#4A4A4A',
            marginBottom: '8px',
          }}>
            We&apos;re experiencing a critical issue with our systems.
          </p>
          <p style={{
            fontSize: '14px',
            color: '#7A7A7A',
            marginBottom: '32px',
          }}>
            Our groundskeepers are working to restore full operation.
            Please try again in a moment.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
          }}>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#1B3A2D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#162F24'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1B3A2D'}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Try Again
            </button>

            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#1B3A2D',
                border: '1px solid rgba(27, 58, 45, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(27, 58, 45, 0.05)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Go to Homepage
            </a>
          </div>

          {/* Error Reference */}
          {error.digest && (
            <p style={{
              marginTop: '32px',
              fontSize: '12px',
              color: '#7A7A7A',
            }}>
              Reference: <code style={{
                fontFamily: 'monospace',
                backgroundColor: 'rgba(27, 58, 45, 0.05)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}>{error.digest}</code>
            </p>
          )}

          {/* Dev Mode Error Details */}
          {isDev && (
            <details style={{
              marginTop: '32px',
              textAlign: 'left',
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '14px',
                color: '#7A7A7A',
              }}>
                View error details (dev only)
              </summary>
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: 'rgba(27, 58, 45, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(27, 58, 45, 0.1)',
                overflow: 'auto',
              }}>
                <p style={{
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: '#EF4444',
                  marginBottom: '8px',
                }}>
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#7A7A7A',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}>
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
