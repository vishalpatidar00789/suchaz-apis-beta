import Orders from '../../api/orders/model'
import Products from '../../api/seller-items/model'
var mongoose = require('mongoose');
let path = require("path");
import { singleMailWithAttachment } from '../sendgrid/index'

export const verifyOrder = (
    orderId, txnAmount 
) => {
    return new Promise ((resolve, reject) => {
        Orders.findById(orderId)
        .then(order => {
            // validate amount, status and other info
            if (order.finalTotal.toString() === txnAmount) {
                resolve(order)
            } else {
                // invalid amount in the response, update order.
                reject("Invalid amount in the response")
            }
        }).catch(error => {
            console.log(error)
            // order not found, invalid order in response
            reject("Order not found, invalid order in response")
        })
    })
}

export const confirmOrder = (order, res) => {
    return new promise((resolve, reject) => {
        // update product quntity
        let _line_promises = order.lineItems.map(line => {
            return new Promise ((resolve, reject) => {
                Products.findById(line.productId)
                .then(product => {
                    const _req_sku = product.skus.some(sku => sku.key === line.sku.key)
                    if (_req_sku) {
                        Products.updateOne(
                        {_id: line.productId, "skus.key": line.sku.key},
                        { $set: { 
                            "skus.$.quantity" :  _req_sku.quantity-parseInt(line.quantity), 
                            "quantity": product.quantity - parseInt(line.quantity)
                        } })
                        .then(doc => {
                            // update line
                            line.lineStatus = 1
                            line.lineStatusMsg = 'Confirmed'
                            line.lineStatusDate = new Date()
                            resolve(line)
                        })
                        .catch(error => {
                            // log error and update order line accordingly
                            line.lineErrorMsg = error.message
                            line.lineStatusDate = new Date()
                            resolve(line)
                        })
                    } else {
                        // log error and update order line accordingly
                        line.lineErrorMsg = 'Requested sku not found'
                        line.lineStatusDate = new Date()
                        resolve(line)
                    }
                })
                .catch(error => {
                    // update line order status accordingly.
                    line.lineErrorMsg = error.message
                    line.lineStatusDate = new Date()
                    resolve(line)
                })
            })
        });
        // resolve all line processes
        Promise.all(_line_promises)
        .then(_lines => {
            // update order, send sms/email to user, generate invoice, send invoice to sellers and admin
            order.lineItems = _lines
            order.orderStatus = 1
            order.orderStatusMsg = 'Confirmed'
            order.paymentStatus = 'Success'
            order.paymentMethod = "Paytm-"+response.body.paymentMode
            order.txn_id = res.body.txnId
            Orders.findByIdAndUpdate(order._id, order)
            // send email, generate invoice
            generateAndSendSellerInvoices(order._id)
            resolve(order)
        })
        .catch(error => {
            // update order accordingly
            console.log(error)
            reject("Error while confirming order.")
        })
    })
}

export const generateAndSendSellerInvoices = async (_order_id) => {
    return new Promise(async (resolve, reject) => {
        if (_order_id) {
            // access line items by order id
            const _lines = await Orders.aggregate([
                [
                    {
                      '$match': {
                        '_id': mongoose.Types.ObjectId(_order_id),
                        'orderStatus': 1
                      }
                    }, {
                      '$unwind': {
                        'path': '$lineItems', 
                        'preserveNullAndEmptyArrays': false
                      }
                    }, {
                      '$lookup': {
                        'from': 'vendor_items', 
                        'localField': 'lineItems.productId', 
                        'foreignField': '_id', 
                        'as': 'lineItems.vendorItem'
                      }
                    }, {
                      '$unwind': {
                        'path': '$lineItems.vendorItem'
                      }
                    }, {
                      '$lookup': {
                        'from': 'vendors', 
                        'localField': 'lineItems.vendorItem.vendorId', 
                        'foreignField': 'userId', 
                        'as': 'lineItems.vendorItem.vendor'
                      }
                    }, {
                        '$unwind': {
                          'path': '$lineItems.vendorItem.vendor'
                        }
                    }
                ]
            ])
            console.log(_lines)
            // process lines, generate pdfs and send emails to respective sellers
            if (_lines && _lines.length > 0 ) {

                for (let _line of _lines) {
                    let _line_pdf = await createLineInvoicePdf(_line)
                    console.log(_line_pdf)
                    if (_line_pdf && _line_pdf.filename) {
                        // read file and send mails to the seller
                        const pathToAttachment = `${__dirname}/invoice-${_line.lineItems._id}.pdf`;
                        const _attachment = fs.readFileSync(pathToAttachment).toString("base64");
                        singleMailWithAttachment(
                            'Order Line Item - Invoice', _line.lineItems.vendorItem.vendor.email,
                            'text testing', _attachment, `invoice-${_line.lineItems._id}.pdf`,
                            'application/pdf'
                        ).then(()=> {
                            // once done delete the file
                            console.log('mail sent successfully')
                            fs.unlink(path.join(__dirname, `invoice-${_line.lineItems._id}.pdf`), (err) => {
                                if (err)
                                    console.log('file not removed')
                                else
                                    console.log('file removed')
                            })
                        }).catch(()=> {
                            // log err or retry
                        })
                    }
                }
                resolve(1)

            } else {
                reject('No product line found.')
            }

        } else {
            reject('No Order Id is provided.')
        }
    })
}

const createLineInvoicePdf = async (_data) => {
    console.log(_data)
    return new Promise((resolve, reject) => {
      let document = {
        html: html,
        data: {
          orderLine: _data
        },
        path: path.join(__dirname, `invoice-${_data.lineItems._id}.pdf`)
      };
      console.log(options)
      pdf.create(document, options)
      .then(res => {
          console.log(res)
          resolve(res)
      })
      .catch(error => {
          console.error(error)
          reject(false)
      })
    })
}