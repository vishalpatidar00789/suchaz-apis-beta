import { success, notFound, fail } from '../../services/response/'
import Orders from './model'
import Products from '../seller-items/model'
import Transactions from '../transactions/model'
import mongoose from 'mongoose'
import { process } from 'babel-jest'
import { paytmGenChecksum, initiateTransaction, verifyChecksum, orderStatus } from '../../services/payment/paytm/paytm.service'
import { resolve } from 'bluebird'
import { verifyOrder, confirmOrder } from '../../services/order/order.service'


const processOrder = async (body) => {
    return new Promise(async (resolve, reject) => {
        const order = {
            ...body
        }
        let subtotal = 0, finalTotal = 0, shippingCharges = 0, giftWrapCharges = 0, gst = 0
        order.lineItems = body.lineItems.map((line) => {
            const product = await Products.findById(line.productId)
            if (!product) reject('requested product not found')
            const _req_sku = product.skus.some(sku => sku.key === line.sku.key)
            if (!_req_sku) reject('requested product sku not found')
            if (_req_sku.quantity > line.quantity) reject('requested product is not available')
            line.unitPrice = _req_sku.price
            line.lineSubTotal = _req_sku.price * line.quantity
            line.shippingCharges = product.shippingCharge * line.quantity
            // overall shipping charges
            shippingCharges = shippingCharges + (product.shippingCharge * line.quantity)
            // overall subtotal
            subtotal = subtotal + line.lineSubTotal

            if (line.giftWrapSelected) {
                line.giftWrapCharges = (product.giftWrapCharge * line.quantity)
                // overall giftwrapcharges
                giftWrapCharges = giftWrapCharges + (product.giftWrapCharge * line.quantity)
            }
            line.lineTotal = line.lineSubTotal + line.shippingCharges + line.giftWrapCharges
            line.gst = (parseFloat(line.lineSubTotal) - parseFloat(line.lineSubTotal) / parseFloat('1.' + product.gst))
            // overall gst
            gst = gst + line.gst
            line.lineStatus = 0
            line.lineStatusMsg = 'Init'
            return line
        })
        finalTotal = subtotal + shippingCharges + giftWrapCharges
        order.subTotal = subtotal
        order.finalTotal = finalTotal
        order.shippingCharges = shippingCharges
        order.giftWrapCharges = giftWrapCharges
        order.gst = gst
        order.orderStatus = 0
        order.orderStatusMsg = 'Init'
        order.paymentStatus = 'Init'
        order.activated = true
        resolve(order)
    })
}

export const create = async ({ bodymen: { body }, user, files }, res, next) => {

    if (body.lineItems && body.lineItems.length > 0) {
        processOrder(body)
            .then(orderPayload => {
                orderPayload.createdBy = user.id
                orderPayload.userId = user.id
                Orders.create(orderPayload)
                    .then(order => {
                        // init payment using this order
                        var params = {
                            MID: process.env.PTM_MERCHANT_ID,
                            WEBSITE: process.env.PTM_WEBSITE,
                            CHANNEL_ID: 'WEB',
                            INDUSTRY_TYPE_ID: 'Retail',
                            ORDERID: order._id,
                            CUST_ID: user.id,
                            MOBILE_NO: order.userContact.toString(),
                            EMAIL: order.userEmail,
                            TXN_AMOUNT: order.finalTotal.toString(),
                            CALLBACK_URL: process.env.CALLBACK_URL + 'api/orders/callback',
                        };
                        initiateTransaction(params)
                            .then(res => {
                                if (res && res.resultInfo.resultCode == "0000") {
                                    // verify checksum
                                    if (verifyChecksum(params, res.head.signature)) {
                                        // update order with checksum and txn number, this txn number is valid only for 15 mins
                                        Orders.findByIdAndUpdate(order._id, 
                                        { txn_id: res.body.txnToken, checksum: res.head.signature})
                                        const html =
                                        `<html>
                                            <head>
                                            <title>Safe Payment</title>
                                            </head>
                                            <body>
                                            <center>
                                                <h1>Please do not refresh this page...</h1>
                                            </center>
                                            <form method="post" action="${process.env.PTM_WEBSITE}/theia/api/v1/showPaymentPage?mid=${process.env.PTM_MERCHANT_ID}&orderId=${order._id}" name="paytm">
                                                <table border="1">
                                                    <tbody>
                                                        <input type="hidden" name="mid" value="${process.env.PTM_MERCHANT_ID}">
                                                        <input type="hidden" name="orderId" value="${order._id}">
                                                        <input type="hidden" name="txnToken" value="${res.body.txnToken}">
                                                    </tbody>
                                                </table>
                                                <script type="text/javascript"> document.paytm.submit(); </script>
                                            </form>
                                            </body>
                                        </html>`
                                        res.writeHead(200, { 'Content-Type': 'text/html'})
                                        res.write(html)
                                        res.end()
                                    } else {
                                        fail(res, 400, 'Checksum is invalid')
                                    }
                                } else {
                                    fail(res, 400, res.resultInfo.resultMsg)
                                }
                            })
                    })
            }).catch(next)
    } else {
        fail(res, 400, 'Bad Request: No product line found for given order')
    }
}

export const callback = async (req, res, next) => {
	const body = req.body;
	// received_data
	console.log("Request body", JSON.stringify(body));

	const { CHECKSUMHASH, ORDERID, MID } = body

    let params = { ...body }
    delete params['CHECKSUMHASH']
    
    if (verifyChecksum(params, CHECKSUMHASH)) {
        const paytmParams = {};
        paytmParams.body = {
            "mid" : MID,
            "orderId" : ORDERID,
        };
        paytmParams.head = {
            "signature"	: CHECKSUMHASH
        };

        orderStatus(JSON.stringify(paytmParams))
        .then(response => {
            let web_url = process.env.WEB_BASE ? process.env.WEB_BASE : 'http://localhost:3000/'
            if (verifyChecksum(params, response.head.signature)) {
                if (response.body.resultInfo.resultCode == "01" 
                && response.body.resultInfo.resultStatus === "TXN_SUCCESS") {
                    // case 1: transaction success
                    // verify order and amount
                    verifyOrder(ORDERID, response.body.txnAmount)
                    .then(order => {
                        // redirect user to thank you page and confirm order
                        confirmOrder(order, response)
                        // update transaction
                        Transactions.create({
                            orderId: ORDERID,
							userId: order.userId,
							transaction: {
                                ...response.head,
                                ...response.body
                            }
                        })
                        .then(done => {
                            console.log(done)
                            console.log('Transaction save successfully')
                        })
                        return res.redirect(`${web_url}thank-you?orderid=${order._id}&status=Confirmed`)
                    })
                    .catch(error => {
                        // redirect user to error page and display error msg
                    })
                } else if (response.body.resultInfo.resultStatus === "PENDING") {
                    // case 2: transaction pending
                    return res.redirect(`${web_url}thank-you?orderid=${order._id}&status=Pending&msg=${response.body.resultInfo.resultMsg}`)
                } else if (response.body.resultInfo.resultStatus === "TXN_FAILURE") {
                    // case 3: transaction failed
                    return res.redirect(`${web_url}account/shipping?msg=${response.body.resultInfo.resultMsg}`);
                }
            } else {
                // redirect user to error page, checksum doesnt match
            }
        })
        .catch(error => next(error))
    } else {
        // redirect to error page with checksum doesnt match message.
    }

}
