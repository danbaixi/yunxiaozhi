import COS from './cos'
const BUCKET_NAME = 'yunxiaozhi-1251388077'
const REGION = 'ap-guangzhou';

//上传文件
function upload(filePath, fileName,dirName) {
  console.log(COS)
  COS.postObject({
    Bucket: BUCKET_NAME,
    Region: REGION,
    Key: dirName + '/' + fileName,
    FilePath: filePath,
    onProgress: function (info) {
      console.log(JSON.stringify(info));
    }
  }, function (err, data) {
      console.log(err || data);
  });
}
module.exports = {
  upload: upload
}