import sgMail from '@sendgrid/mail'
import { sendgridKey, defaultEmail } from '../../config'

sgMail.setApiKey(sendgridKey)

export const sendMail = ({
  fromEmail = defaultEmail,
  toEmail,
  subject,
  content
}) => {
  const msg = {
    to: toEmail,
    from: fromEmail,
    subject,
    html: content
  }
  return sgMail.send(msg)
}


export const sendTemplateMail = ({ action, fromEmail = defaultEmail,
  toEmail,
  subject,
  other }) => {

  switch (action) {
    case 'FORGOT_PASSWORD':
        msgBody = {
            to: [toEmail],
            from: fromEmail,
            subject: 'MadeInIndiaGifts - Forgot Password',
            templateId: process.env.TEMPID_FORGET_PASSWORD,
            dynamic_template_data: {
                fname: toEmail,
                subject: "MadeInIndiaGifts - Forgot Password",
                text: "You requested to reset password. Your reset password link is: " + other['link']
            }
        };
        console.log(msgBody);
        sgMail.send(msgBody, (error, result) => {
            
            if (error) {
                // Extract error msg
                const {message, code, response} = error;
            
                // Extract response msg
                const {headers, body} = response;
            
                console.error(body);
            } else {
                console.log("Forgot password mail sent successfully.");
            }
        });
        break;
    case 'NEW_SELLER_REG':
        msgBody = {
            to: [toEmail],
            from: fromEmail,
            subject: 'MadeInIndiaGifts New Seller Registration Application',
            templateId: process.env.TEMPID_SELLER_APPLICATION,
            dynamic_template_data: {
                fname: name,
                subject: "MadeInIndiaGifts New Seller Registration Application",
                text: "Congratulation! your request of becoming a MadeInIndiaGifts Seller has send successfully to MadeInIndiaGifts team. Your application is under review, you will be notified by MadeInIndiaGifts team once your registration application is reviewd. We thank you and wish you best of luck."
            }
        };

        sgMail.send(msgBody, (error, result) => {
            if (error) {
                // Extract error msg
                const {message, code, response} = error;
            
                // Extract response msg
                const {headers, body} = response;
            
                console.error(body);
            } else {
                console.log("New Seller Registration mail sent.");
            }
        });
        break;
    case 'NEW_APP_USER_REG':
        const password = other['password'] ? other['password'] : "";
        msgBody = {
            to: [toEmail],
            from: fromEmail,
            subject: 'MadeInIndiaGifts.in New User Registration',
            templateId: process.env.TEMPID_APP_USER_REG,
            dynamic_template_data: {
                fname: name,
                subject: "MadeInIndiaGifts.in New User Registration",
                text: "Congratulation! You have successfully registered with MadeInIndiaGifts.in, You can login with your credential. UserId: " + toEmail + " and password: " + password
            }
        };

        sgMail.send(msgBody, (error, result) => {
            if (error) {
                // Extract error msg
                const {message, code, response} = error;
            
                // Extract response msg
                const {headers, body} = response;
            
                console.error(body);
            } else {
                console.log("New User Registration mail sent.");
            }
        });
        break;
    case 'NEW_SELLER_REG_ACTION':
        const password = other['password'] ? other['password'] : "";
        msgBody = {
            to: [toEmail],
            from: fromEmail,
            subject: 'MadeInIndiaGifts New Seller Request Approved',
            templateId: process.env.TEMPID_SELLER_APP_APPROVED,
            dynamic_template_data: {
                fname: name,
                subject: "MadeInIndiaGifts New Seller Request Approved",
                text: "Congratulation! your request of becoming a MadeInIndia Seller is approved. You can login to our seller platform using your credentials. Your credentials are: Email: " + toEmail + " and password: " + password
            }
        };

        sgMail.send(msgBody, (error, result) => {
            if (error) {
                console.log(error);
                // Extract error msg
                const {message, code, response} = error;
            
                // Extract response msg
                const {headers, body} = response;
            
                console.error(body);
            } else {
                console.log("MadeInIndiaGifts New Seller Request Approved mail sent.");
            }
        });
        break;
    case 'NEW_SELLER_REG_BY_ADMIN':
        const password = other['password'] ? other['password'] : "";
        msgBody = {
            to: [toEmail],
            from: fromEmail,
            subject: 'MadeInIndiaGifts New Seller Registration Application',
            templateId: process.env.TEMPID_SELLER_REG_BY_ADMIN,
            dynamic_template_data: {
                fname: name,
                subject: "MadeInIndiaGifts New Seller Registration Application",
                text: "Your registraion as MadeInIndiaGifts Seller is completed successfully. You can login with credential Email: " + toEmail + " and password: " + password
            }
        };

        sgMail.send(msgBody, (error, result) => {
            if (error) {
                // Extract error msg
                const {message, code, response} = error;
            
                // Extract response msg
                const {headers, body} = response;
            
                console.error(body);
            } else {
                console.log("That's wassup! Vendor reg");
            }
        });
        break;
    case 'PLACE_ORDER':
        msgBody = {
            to: [toEmail],
            from: fromEmail,
            subject: 'MadeInIndiaGifts.in Order is created',
            templateId: process.env.TEMPID_PLACE_ORDER,
            dynamic_template_data: {
                fname: name,
                subject: "MadeInIndiaGifts.in Order is created",
                text: `We have successfully placed your order ${other.id} Thank you for shopping with us.`
            }
        };

        sgMail.send(msgBody, (error, result) => {
            if (error) {
                // Extract error msg
                const {message, code, response} = error;
            
                // Extract response msg
                const {headers, body} = response;
            
                console.error(body);
            } else {
                console.log("That's wassup! order");
            }
        });
        break;
    default:
        console.log('No email action.')
  }      
}

export const singleMailWithAttachment = async (_subject, _to, _text, _attachment, _filename, _type) => {
  return new Promise((resolve, reject) => {
      const msg = {
          to: _to,
          from: 'no-reply@madeinindiagifts.in',
          cc: 'career.vishalpatidar@gmail.com',
          subject: _subject ? _subject : 'MadeInIndiaGifts.in Order Status Update Event',
          text: _text,
          attachments: [
            {
              content: _attachment,
              filename: _filename ? _filename: "attachment.pdf",
              type: _type ? _type: "application/pdf",
              disposition: "attachment"
            }
          ]
      };
      console.log('email msg :: ', msg)
      sgMail.send(msg, (error, result) => {
          console.log(error)
          if (error) {
              // Extract error msg
              const {message, code, response} = error;
          
              // Extract response msg
              const {headers, body} = response;
          
              console.error(body);
          }
          else
              resolve(200)
      });
  })
  
}
