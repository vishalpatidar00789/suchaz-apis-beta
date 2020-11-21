const client = require("twilio")(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_SID;

export const sendOTP = (contact, country_code) => {

    return new Promise((resolve, reject) => {
        client.verify()
        .services(serviceSid)
        .verifications.create({ to: phone_number, channel: "sms" })
        .then(verification => console.log(verification.status));
        
    })
}