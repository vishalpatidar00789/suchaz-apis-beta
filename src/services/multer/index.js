const multer = require('multer');
const path = require('path');
const moment = require('moment');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.setPromisesDependency();
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET,
    accessKeyId: process.env.AWS_KEY,
    region: process.env.REGION
});
const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true)
    } else {
        cb(new Error("File format should be PNG,JPG,JPEG"), false)
    }
};

async function moveData(images) {
    try {
        var copyParam = {
            Bucket: process.env.SUCHAZ_CUSTOM,
            CopySource: process.env.SUCHAZ_TEMP + '/' + images.split('/').pop(),
            Key: images.split('/').pop(),
            ACL: 'public-read',
        };
        await s3.copyObject(copyParam, async function (err, data) {
            if (err) {
                console.log(err);
                return "";
            } else {
                var deleteParam = {
                    Bucket: process.env.SUCHAZ_TEMP,
                    Key: images.split('/').pop()
                };

                await s3.deleteObject(deleteParam, function (err, data) {
                    if (err) {
                        return images.replace("/Temp/", "/customization/");
                    } else {
                        return images.replace("/Temp/", "/customization/");
                    }
                });
            }
        });
    } catch (error) {
        return "";
        //console.log(error.message);
    }
}

export const moveFiles = (ImageArray) => {
    let newImageArray = [];
    ImageArray.forEach(element => {

        let url = moveData(element)
        console.log(url);

        newImageArray.push(url);
    });
    return newImageArray;
}

export const singleDelete = (bucket, Image) => {
    if (Image.trim() == "") {
        return false;
    }
    var deleteParam = {
        Bucket: bucket ? bucket : process.env.CATEGORY_BUCKET,
        Key: Image.split('/').pop()
    };
    s3.deleteObject(deleteParam, (err, data) => {
        if (err) {
            return false;
        } else {
            return true;
        }
    });
}

export const multiDelete = (bucket, Image, key) => {
    if (Image.trim() == "") {
        return false;
    }

    let keyArray = [];
    let delete_image = JSON.parse(Image);

    delete_image.map(v => {
        keyArray.push({ Key: key.concat(v.split('/').pop()) });
    });
    console.log("Delete Array", keyArray);

    var deleteParam = {
        Bucket: bucket,
        Delete: {
            Objects: keyArray
        }
    };
    s3.deleteObjects(deleteParam, function (err, data) {
        if (err) {
            return false;
        } else {
            return true;
        }
    });
}

export const upload = (bucket) => {
    const storage = multerS3({
        s3: s3,
        bucket: bucket ? bucket : process.env.CATEGORY_BUCKET,
        acl: 'public-read',
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
            cb(null, file.fieldname + '-' + uniqueSuffix)
        }
    })
    return multer({ storage: storage, fileFilter: fileFilter }).single('image');
}

export const uploadMultiple = (bucket) => {
    const storage = multerS3({
        s3: s3,
        bucket: bucket ? bucket : process.env.SUCHAZ_PRODUCT_BUCKET,
        acl: 'public-read',
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
            cb(null, file.fieldname + '-' + uniqueSuffix)
        }
    })
    return multer({ storage: storage, fileFilter: fileFilter }).array('images');
} 