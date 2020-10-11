 const path = require('path');
 const fs = require('fs');

 exports.fail = function(res, error, status = 500) {
     return res.status(status).json({
         status: false,
         message: error
     });
 }
 exports.success = function(res, payload, status = 201, extra) {
     console.log(extra);
     return res.status(status).json({
         status: true,
         data: payload,
         ...extra
     });
 }
 exports.removeFile = function(path) {
     if (fs.existsSync(path)) {
         fs.unlinkSync(path);
     }
 }

 exports.convertToSlug = (text) => {
    return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
 }

 exports.httpCode = {
     'BAD_REQUEST': 400,
     'OK': 200,
     'CONTINUE': 100,
     'INTERNAL_SERVER_ERROR': 500,
     'NOT_FOUND': 404,
 };