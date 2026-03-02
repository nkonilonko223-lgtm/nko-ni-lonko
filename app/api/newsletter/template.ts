// ============================================================================
// MATRICE DES DONNÉES : N'KO NI LONKO
// Fichier : app/api/newsletter/template.ts
// Rôle : Moteur de rendu HTML World Class 1/1000 pour les e-mails
// ============================================================================

// 🔴 C'EST ICI QUE SE TROUVE LA CORRECTION : (verifyLink: string)
export const generateWelcomeEmail = (verifyLink: string) => {
  return `
    <!DOCTYPE html>
    <html lang="nqo" dir="rtl" translate="no" class="notranslate" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <meta name="google" content="notranslate">
      <title>ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ</title>
      <style>
        /* INJECTION DE LA POLICE SOUVERAINE KIGELIA */
        @font-face {
          font-family: 'Kigelia';
          src: url('https://www.nkonilonko.com/fonts/Kigelia.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'Kigelia';
          src: url('https://www.nkonilonko.com/fonts/Kigelia1.otf') format('opentype');
          font-weight: bold;
          font-style: normal;
        }

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          background-color: #000000;
          color: #ffffff;
          /* LA PILE TYPOGRAPHIQUE IMPÉRIALISTE : Kigelia d'abord, système ensuite */
          font-family: 'Kigelia', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        
        .wrapper {
          padding: 60px 20px;
          background-color: #000000;
        }

        .container {
          max-width: 520px;
          margin: 0 auto;
          background-color: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .header {
          text-align: center;
          padding: 50px 40px 30px;
        }

        .logo-text {
          font-size: 32px;
          font-weight: bold;
          color: #ffffff;
          letter-spacing: 1px;
          margin: 0;
          font-family: 'Kigelia', sans-serif;
        }

        .logo-dot {
          color: #eab308;
        }

        .content {
          padding: 0 40px 40px;
          text-align: center;
        }

        .devise-nko {
          font-size: 26px;
          line-height: 1.8;
          color: #eab308;
          margin-bottom: 12px;
          font-weight: bold;
        }

        .devise-fr {
          font-size: 12px;
          color: #737373;
          letter-spacing: 2px;
          margin-bottom: 50px;
          text-transform: uppercase;
          font-family: sans-serif; 
        }

        .message-nko {
          color: #e5e5e5;
          font-size: 20px;
          line-height: 2;
          margin-bottom: 40px;
        }

        .btn-gold {
          background-color: #eab308;
          color: #000000 !important;
          padding: 18px 48px;
          border-radius: 100px;
          text-decoration: none;
          font-weight: bold;
          font-size: 20px;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .footer {
          padding: 30px;
          text-align: center;
        }

        .unsubscribe-link {
          color: #525252;
          font-size: 12px;
          text-decoration: none;
          letter-spacing: 0.5px;
          font-family: sans-serif;
        }
      </style>
    </head>
    <body>
      <table class="wrapper" width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table class="container" width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td class="header">
                  <h1 class="logo-text notranslate" dir="rtl">ߒߞߏ ߣߌ߫ ߟߐ߲ߞߏ<span class="logo-dot">.</span></h1>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <div class="devise-nko notranslate" dir="rtl">
                    ߟߐ߲ߞߏ ߡߊ߫ ߘߊ߲߬ ߠߊ߫ ߝߊ߬ߛߏ߬ ߛߌ߫ ߡߊ߬.<br>
                    ߞߊ߲ ߝߣߊ߫ ߡߊ߫ ߞߊ߲߫ ߞߊ߬ ߞߍ߫ ߞߎ߬ߡߊ߬ߜߏߟߏ߲߫ ߘߌ߫.
                  </div>
                  <div class="devise-fr notranslate" dir="ltr">
                    La science n'a pas de frontières.<br>
                    La langue ne devrait plus en être une.
                  </div>
                  <div class="message-nko notranslate" dir="rtl">
                    ߌ ߣߌ߫ ߛߣߍ߫ ߟߐ߲ߞߏ ߘߎߢߊ߫ ߘߐ߫.<br>
                    ߌ ߟߊ߫ ߞߘߎߡߊ ߟߊߛߙߋߦߊ߫ ߖߊ߰ߣߌ߲߫.
                  </div>
                  <div>
                    <a href="${verifyLink}" class="btn-gold notranslate" dir="rtl">
                      ߊ߬ߥߐ ߒ ߓߘߊ߫ ߛߐ߲߬
                    </a>
                  </div>
                </td>
              </tr>
            </table>
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td class="footer">
                  <a href="https://www.nkonilonko.com" class="unsubscribe-link notranslate">Se désabonner</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};