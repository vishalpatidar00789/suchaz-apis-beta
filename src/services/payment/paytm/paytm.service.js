const checksum_lib = require('./checksum');
const https = require('https');


// this method is called by /placeOrder Api
exports.paytmChecksum = async (_payload) => {
    return new Promise((resolve, reject) => {
        if (_payload && _payload.orderId && _payload.contact_no
            && _payload.userEmail) {
            const params = {
                MID: process.env.PTM_MERCHANT_ID,
                WEBSITE: process.env.PTM_WEBSITE,
                CHANNEL_ID: 'WEB',
                INDUSTRY_TYPE_ID: 'Retail',
                ORDER_ID: _payload.orderId,
                CUST_ID: _payload.userid,
                MOBILE_NO: _payload.contact_no,
                EMAIL: _payload.userEmail,
                TXN_AMOUNT: (parseFloat(_payload.giftWrapChargesTotal ? _payload.giftWrapChargesTotal : 0) 
                + parseFloat(_payload.subTotal ? _payload.subTotal : 0) 
                + parseFloat(_payload.shippingCharges ? _payload.shippingCharges : 0)).toString(),
                CALLBACK_URL: process.env.CALLBACK_URL + 'apiv2/admin/order/callback',
            };

            checksum_lib.genchecksum(params, process.env.PTM_MERCHANT_KEY, function (err, checksum) {
                if(err) {
                    reject({ data: null, msg: err.message})
                }
                console.log('checksum created ::')
                console.log(JSON.stringify(checksum))
                resolve({ data: checksum }) 
            });
        } else {
            reject({data: null, msg: 'Invalid Paytm Params'})
        }
    })
}

// this method is called by callback api by paytm
exports.verifyChecksumAndValidateOrder = async (_payload) => {
    return new Promise((resolve, reject) => {
        if (_payload && _payload['CHECKSUMHASH']) {
            const paytmChecksum = _payload['CHECKSUMHASH']
            // received_data
            console.log("Request body :: ", JSON.stringify(_payload));

            let paytmParams = {..._payload}
            delete paytmParams['CHECKSUMHASH']
            console.log("Paytm params :: ", JSON.stringify(paytmParams));
            let isChecksumValid = checksum_lib.verifychecksum(paytmParams, process.env.PTM_MERCHANT_KEY, paytmChecksum);
            if (isChecksumValid) {
                console.log('checksum matched.');
                /* initialize an object */
                const params = {};
                params['MID'] = paytmParams['MID'];
                params['ORDERID'] = paytmParams['ORDERID'];
        
                params['CHECKSUMHASH'] = paytmChecksum;
        
                let post_data = JSON.stringify(params);
        
                const options = {
                    /* for Staging */
                    hostname: process.env.PTM_HOSTNAME,
                    port: 443,
                    path: '/order/status',
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

                    });
                });
        
                post_req.write(post_data);
                post_req.end();
        
            } else {
                console.log('checksum not matched.');
                return fail(res, 'No user found', httpCode.BAD_REQUES);
                //res.json('checksum not matched');
            }
        } else {
            reject()
        }
    })
}