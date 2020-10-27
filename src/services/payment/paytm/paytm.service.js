const checksum_lib = require('./checksum');
const https = require('https');
const PaytmChecksum = require("paytmchecksum");


export const paytmGenChecksum = async (params) => {
    return new Promise((resolve, reject) => {
        if (params && params.ORDERID && params.MOBILE_NO && params.TXN_AMOUNT) {
            const body = {mid: process.env.PTM_MERCHANT_ID, orderId: params.ORDERID }

            var paytmChecksum = PaytmChecksum.generateSignature(JSON.stringify(body), process.env.PTM_MERCHANT_KEY);
            paytmChecksum.then(function(checksum){
                console.log("generateSignature Returns: " + checksum);
                console.log(JSON.stringify(checksum))
                resolve(checksum)
            }).catch(function(error){
                console.log(error);
                reject({ data: null, msg: 'Invalid Paytm Params' })
            });

        } else {
            reject({ data: null, msg: 'Invalid Paytm Params' })
        }
    })
}

export const initiateTransaction = async (params) => {
    return new Promise(async (resolve, reject) => {
        paytmGenChecksum(params)
        .then(checksum => {
            var paytmParams = {};

            paytmParams.body = {
                "requestType": "Payment",
                "mid": params.MID,
                "websiteName": params.WEBSITE,
                "orderId": params.ORDERID,
                "callbackUrl": params.CALLBACK_URL,
                "txnAmount": {
                    "value": params.TXN_AMOUNT,
                    "currency": "INR",
                },
                "userInfo": {
                    "custId": params.CUST_ID,
                },
            };

            paytmParams.head = {
                "signature": checksum
            };

            var post_data = JSON.stringify(paytmParams);

            var options = {
                hostname: process.env.PTM_HOSTNAME,

                port: 443,
                path: `/theia/api/v1/initiateTransaction?mid=${process.env.PTM_MERCHANT_ID}&orderId=${params.ORDERID}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', function () {
                    console.log('Response: ', response);
                    resolve(response)
                });
            });

            post_req.write(post_data);
            post_req.end();
        }).catch(err => {
            reject(err)
        })
    })
}

export const verifyChecksum = async (params, checksum) => {
    const body = {mid: process.env.PTM_MERCHANT_ID, orderId: params.ORDERID }
    const isVerifySignature = PaytmChecksum.verifySignature(JSON.stringify(body), process.env.PTM_MERCHANT_KEY, checksum);
    if (isVerifySignature) {
        console.log("Checksum Matched");
        return true
    } else {
        console.log("Checksum Mismatched");
        return false;
    }
}

export const orderStatus = async (post_data) => {
    return new Promise((resolve, reject) => {
        if (post_data) {
            const options = {
                /* for Staging */
                hostname: process.env.PTM_HOSTNAME,
                port: 443,
                path: 'v3//order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length,
                },
            };

            var response = '';
            var post_req = https.request(options, async function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', async function () {
                    response = JSON.parse(response);
                    resolve(response)
                });
            });

            post_req.write(post_data);
            post_req.end();
        } else reject('Bad Request')   
    })
}
