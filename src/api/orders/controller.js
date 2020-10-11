

// exports.createOrder = async (req, res) => {
//   try {
//     upload(req, res, async (err) => {
//       if (err) return fail(res, 'Invaid file type', httpCode.BAD_REQUEST);
//       let data = req.body;
//       let rules = {
//         userEmail: 'required',
//         lineItems: 'required',
//         shippingAddress: 'required',
//         subTotal: 'required'
//       };
//       let validation = new Validator(data, rules);
//       if (validation.fails()) {
//         return fail(res, validation.errors.all(), httpCode.BAD_REQUEST);
//       }
//       let images = [];
//       if (req.files && req.files.length) {
//         images = req.files.map(file => file.location);
//       }
//       if (data.lineItems == "") {
//         return fail(res, 'No item in your cart');
//       }
//       let orderTotal = [];
//       orderTotal = JSON.parse(data.lineItems),
//         await orderTotal.map((key, index) => {
//           key['finalTotal'] = (parseFloat(key.giftWrapSelected ? key.giftWrapCharges : 0) + parseFloat(key.shippingCharges ? key.shippingCharges : 0) + parseFloat(key.lineTotal ? (key.lineTotal * key.quantity) : 0)).toString();
//           //orderTotal.push({'finalTotal': (parseFloat(key.giftWrapCharges?key.giftWrapCharges:0) +  parseFloat(key.shippingCharges?key.shippingCharges:0) +  parseFloat(key.lineTotal?key.shippingCharges:0)).toString() });
//         })

//       await orderTotal.map(async (key, index) => {
//         let newPlace = moveFiles(key.customize_images);
//         let newval = [];
//         if (key.customize_images) {
//           key.customize_images.map(val => {
//             newval.push(val.replace("/Temp/", "/customization/"));
//           })
//         }
//         key['customize_images'] = newval;
//       })


//       let add = {
//         userEmail: data.userEmail,
//         userId: req.user ? req.user.id : null,
//         contact_no: data.contact_no ? data.contact_no : "",
//         userContactNumber: data.userContactNumber,
//         lineItems: orderTotal,
//         shippingAddress: JSON.parse(data.shippingAddress),
//         giftWrapCharges: data.giftWrapCharges,
//         subTotal: data.subTotal,
//         shippingCharges: data.shippingCharges,
//         finalTotal: parseFloat(data.giftWrapCharges ? data.giftWrapCharges : 0) + parseFloat(data.subTotal ? data.subTotal : 0) + parseFloat(data.shippingCharges ? data.shippingCharges : 0),
//         gst: data.GST,
//         orderStatus: 0,
//         paymentStatus: "Init",
//         orderStatusMsg: "Init",
//         paymentMethod: data.paymentMethod,
//         createdBy: data.createdBy,
//         lastUpdatedBy: data.lastUpdatedBy
//       }

//       Orders.create(add, function (err, result) {
//         if (err) {
//           return fail(res, err.message);
//         }
//         console.log(result.orderId);

//         let orderItems = [];
//         orderItems = JSON.parse(data.lineItems),
//           orderItems.map(async (key, value) => {
//             await VenderItem.updateOne({ "_id": key.productId }, { "$inc": { "quantity": - parseInt(key.quantity) } });
//             await VenderItem.updateOne({ "_id": key.productId, "quantity": { "$lt": 0 } }, { "quantity": 0 });
//           })
//         //singleMail('place_order', data.userEmail, data.userEmail, {id: result._id});

//         var params = {
//           MID: MerchantID,
//           WEBSITE: Website,
//           CHANNEL_ID: 'WEB',
//           INDUSTRY_TYPE_ID: 'Retail',
//           ORDER_ID: result.orderId,
//           CUST_ID: req.user ? req.user.id : null,
//           MOBILE_NO: data.contact_no,
//           EMAIL: data.userEmail,
//           TXN_AMOUNT: (parseFloat(data.giftWrapChargesTotal ? data.giftWrapChargesTotal : 0) + parseFloat(data.subTotal ? data.subTotal : 0) + parseFloat(data.shippingCharges ? data.shippingCharges : 0)).toString(),
//           CALLBACK_URL: AppUrl + 'apiv2/admin/order/callback',
//         };

//         checksum_lib.genchecksum(params, MerchantKey, function (err, checksum) {
//           var paytmParams = {
//             ...params,
//             CHECKSUMHASH: checksum,
//           };
//           console.log('order created :: passing params ::')
//           console.log(JSON.stringify(paytmParams))
//           return success(res, paytmParams, { message: 'Checksum created successfully' });
//           //res.json({"Hi":paytmParams});
//         });
//         // return success(res, result, { message: 'Added successfully' });
//       });

//     });
//   } catch (error) {
//     return fail(res, error.message);
//   }
// }