import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(to, name) {
  const subject = 'Welcome! Your Registration Was Successful';

  const text = `
Hello ${name},

Welcome! Your registration has been successfully completed.

We're glad to have you with us. You can now sign in to your account and start using the platform.

If you did not create this account, please contact our support team immediately.

Best regards,
The Support Team
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmation</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: Arial, Helvetica, sans-serif;
  color: #333333;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f6f8; padding: 40px 20px;"
  >
    <tr>
      <td align="center">

        <!-- Email Container -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td style="
              padding: 25px 35px;
              background-color: #111827;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 24px;
              ">
                Welcome!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">

              <h2 style="
                margin-top: 0;
                margin-bottom: 20px;
                font-size: 22px;
                color: #111827;
              ">
                Hello ${name},
              </h2>

              <p style="
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 20px;
              ">
                Thank you for registering with us.
                Your account has been successfully created.
              </p>

              <p style="
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 30px;
              ">
                We're excited to have you with us. You can now
                sign in to your account and start using the platform.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="
                    background-color: #2563eb;
                    border-radius: 6px;
                  ">
                    <a
                      href="https://yourdomain.com/login"
                      style="
                        display: inline-block;
                        padding: 13px 25px;
                        color: #ffffff;
                        text-decoration: none;
                        font-size: 15px;
                        font-weight: bold;
                      "
                    >
                      Sign In to Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="
                margin-top: 30px;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                If you did not create this account, please contact
                our support team immediately.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 20px 35px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            ">

              <p style="
                margin: 0 0 8px;
                font-size: 13px;
                color: #6b7280;
              ">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
              </p>

              <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
              ">
                This is an automated email. Please do not reply directly
                to this message.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  await sendEmail(to, subject, text, html);
}

async function sendTransactionEmail(to, name, details) {
  const {
    transactionId,
    amount,
    currency = 'INR',
    fromAccount,
    toAccount,
    status = 'COMPLETED',
    date = new Date(),
  } = details;

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);

  const formattedDate = new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const subject = `Transaction ${status} - ${formattedAmount}`;

  const text = `
Hello ${name},

Your transaction has been ${status.toLowerCase()}.

Transaction ID : ${transactionId}
Amount         : ${formattedAmount}
From Account   : ${fromAccount}
To Account     : ${toAccount}
Status         : ${status}
Date           : ${formattedDate}

If you did not authorize this transaction, please contact our support team immediately.

Best regards,
The Support Team
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transaction Notification</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: Arial, Helvetica, sans-serif;
  color: #333333;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f6f8; padding: 40px 20px;"
  >
    <tr>
      <td align="center">

        <!-- Email Container -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td style="
              padding: 25px 35px;
              background-color: #111827;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 24px;
              ">
                Transaction ${status}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">

              <h2 style="
                margin-top: 0;
                margin-bottom: 20px;
                font-size: 22px;
                color: #111827;
              ">
                Hello ${name},
              </h2>

              <p style="
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 25px;
              ">
                Your transaction of
                <strong>${formattedAmount}</strong>
                has been <strong>${status.toLowerCase()}</strong>.
                Here are the details:
              </p>

              <!-- Details -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  border-collapse: separate;
                  overflow: hidden;
                  font-size: 15px;
                "
              >
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; color: #6b7280; width: 45%;">Transaction ID</td>
                  <td style="padding: 12px 16px; color: #111827;">${transactionId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; color: #6b7280;">Amount</td>
                  <td style="padding: 12px 16px; color: #111827; font-weight: bold;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; color: #6b7280;">From Account</td>
                  <td style="padding: 12px 16px; color: #111827;">${fromAccount}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; color: #6b7280;">To Account</td>
                  <td style="padding: 12px 16px; color: #111827;">${toAccount}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; color: #6b7280;">Status</td>
                  <td style="padding: 12px 16px; color: #111827;">${status}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9fafb; color: #6b7280;">Date</td>
                  <td style="padding: 12px 16px; color: #111827;">${formattedDate}</td>
                </tr>
              </table>

              <p style="
                margin-top: 30px;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                If you did not authorize this transaction, please contact
                our support team immediately.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 20px 35px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            ">

              <p style="
                margin: 0 0 8px;
                font-size: 13px;
                color: #6b7280;
              ">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
              </p>

              <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
              ">
                This is an automated email. Please do not reply directly
                to this message.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  await sendEmail(to, subject, text, html);
}

export { sendRegistrationEmail, sendTransactionEmail, sendEmail, transporter };
