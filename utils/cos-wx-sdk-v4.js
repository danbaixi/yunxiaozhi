'use strict';

/* CosCloud */
function CosCloud(opt) {
	this.appid = opt.appid;
	this.bucket = opt.bucket;
	this.region = opt.region;
	this.sign_url = opt.sign_url;
	this.progressInterval = opt.progressInterval || 1000;
	if (opt.getAppSign) {
		this.getAppSign = opt.getAppSign;
	}
	if (opt.getAppSignOnce) {
		this.getAppSignOnce = opt.getAppSignOnce;
	}
}

//512K
var SLICE_SIZE_512K = 524288;
//1M
var SLICE_SIZE_1M = 1048576;
//2M
var SLICE_SIZE_2M = 2097152;
//3M
var SLICE_SIZE_3M = 3145728;
//20M 大于20M的文件需要进行分片传输
var MAX_UNSLICE_FILE_SIZE = 20971520;

CosCloud.prototype.cosapi_cgi_url = "https://REGION.file.myqcloud.com/files/v2/";
CosCloud.prototype.sliceSize = 3 * 1024 * 1024;
CosCloud.prototype.getExpired = function (second) {
	return parseInt(Date.now() / 1000) + (second || 60);
};


CosCloud.prototype.set = function (opt) {

	if (opt) {
		this.appid = opt.appid;
		this.bucket = opt.bucket;
		this.region = opt.region;
        this.sign_url = opt.sign_url;
		if (opt.getAppSign) {
			this.getAppSign = opt.getAppSign;
		}
		if (opt.getAppSignOnce) {
			this.getAppSignOnce = opt.getAppSignOnce;
		}
	}
};

CosCloud.prototype.getCgiUrl = function (destPath) {
	var region = this.region;
	var bucket = this.bucket;
	var url = this.cosapi_cgi_url;
	url = url.replace('REGION', region);

	return url + this.appid + '/' + bucket + '/' + destPath;

};

CosCloud.prototype.updateFolder = function (success, error, bucketName, remotePath, bizAttribute) {
	remotePath = fixPath.call(this, remotePath, 'folder');
	this.updateBase(success, error, bucketName, remotePath, bizAttribute);
};

CosCloud.prototype.updateFile = function (success, error, bucketName, remotePath, bizAttribute) {
	remotePath = fixPath.call(this, remotePath);
	this.updateBase(success, error, bucketName, remotePath, bizAttribute);
};

CosCloud.prototype.updateBase = function (success, error, bucketName, remotePath, bizAttribute, authority, customHeaders) {
	var that = this;
	that.getAppSignOnce(function (sign) {
		var url = that.getCgiUrl(remotePath);

		var data = {
            op: 'update'
		};

		if (bizAttribute) {
            data.biz_attr = bizAttribute;
		}
		//authority	权限类型，可选参数，可选值为eInvalid,eWRPrivate,eWPrivateRPublic
		//			文件可以与bucket拥有不同的权限类型，已经设置过权限的文件如果想要撤销，直接赋值为eInvalid，则会采用bucket的权限
		if (authority) {
            data.authority = authority;
		}

		if (customHeaders) {
			customHeaders = JSON.stringify(customHeaders);
            data.customHeaders = customHeaders;
		}

		wx.request({
            method: 'POST',
			url: url,
            header: {'Authorization': sign},
			data: data,
			success: success,
			fail: error
		});
	});
};

CosCloud.prototype.deleteFolder = function (success, error, bucketName, remotePath) {
	remotePath = fixPath.call(this, remotePath, 'folder');
	this.deleteBase(success, error, bucketName, remotePath);
};

CosCloud.prototype.deleteFile = function (success, error, bucketName, remotePath) {
	remotePath = fixPath.call(this, remotePath);
	this.deleteBase(success, error, bucketName, remotePath);
};

CosCloud.prototype.deleteBase = function (success, error, bucketName, remotePath) {
	if (remotePath == "/") {
		error({"code": 10003, "message": "不能删除Bucket"});
		return;
	}
	var that = this;
	this.getAppSignOnce(function (sign) {
		var url = that.getCgiUrl(remotePath);
		var data = {
            op: 'delete'
		};
		wx.request({
			method: 'POST',
			url: url,
            header: {'Authorization': sign},
			data: data,
			success: success,
			fail: error
		});
	});
};

CosCloud.prototype.getFolderStat = function (success, error, bucketName, remotePath) {
	remotePath = fixPath(remotePath, 'folder');
	this.statBase(success, error, bucketName, remotePath);
};

CosCloud.prototype.getFileStat = function (success, error, bucketName, remotePath) {
	remotePath = fixPath(remotePath);
	this.statBase(success, error, bucketName, remotePath);
};

CosCloud.prototype.statBase = function (success, error, bucketName, remotePath) {
	var that = this;
	this.getAppSign.call(that, function (sign) {
		var url = that.getCgiUrl(remotePath);
		var data = {
			op: "stat"
		};
		wx.request({
			url: url,
			method: "GET",
            header: {'Authorization': sign},
			data: data,
			success: success,
			fail: error
		});
	});

};

CosCloud.prototype.createFolder = function (success, error, bucketName, remotePath, bizAttr) {
	var that = this;
	this.getAppSign(function (sign) {
		remotePath = fixPath(remotePath, 'folder');
		var url = that.getCgiUrl(remotePath);
		var data = {
            op: 'create',
            biz_attr: bizAttr || ''
		};
		wx.request({
			method: 'POST',
			url: url,
            header: {'Authorization': sign},
			data: data,
			success: success,
			fail: error
		});
	});
};

CosCloud.prototype.copyFile = function (success, error, bucketName, remotePath, destPath, overWrite) {
	var that = this;
	this.getAppSign(function (sign) {
		remotePath = fixPath(remotePath);
		var url = that.getCgiUrl(remotePath);
		var data = {
            op: 'copy',
            dest_fileid: destPath,
            to_over_write: overWrite
		};

		wx.request({
			method: 'POST',
			url: url,
            header: {'Authorization': sign},
			data: data,
			success: success,
			fail: error
		});
	});
};

CosCloud.prototype.moveFile = function (success, error, bucketName, remotePath, destPath, overWrite) {
	var that = this;
	this.getAppSign(function (sign) {
		remotePath = fixPath(remotePath);
		var url = that.getCgiUrl(remotePath);
		var data = {
			op: 'move',
            dest_fileid: destPath,
            to_over_write: overWrite
		};

		wx.request({
			method: 'POST',
			url: url,
            header: {'Authorization': sign},
			data: data,
			success: success,
			fail: error
		});
	});
};

CosCloud.prototype.getFolderList = function (success, error, bucketName, remotePath, num, context, order, pattern, prefix) {
	var that = this;

	remotePath = fixPath(remotePath, 'folder');

	that.listBase(success, error, bucketName, remotePath, num, context, order, pattern);
};

CosCloud.prototype.listBase = function (success, error, bucketName, remotePath, num, context, order, pattern, prefix) {
	var that = this;
	that.getAppSign(function (sign) {
		var url = that.getCgiUrl(remotePath);

		num = num || 20;
        context = context || '';
		order = order || 0;
		pattern = pattern || 'eListBoth';

        var data = {
            op: "list",
            num: num,
            context: context,
            order: order,
            pattern: pattern
        };
        wx.request({
            url: url,
            method: "GET",
            header: {'Authorization': sign},
            data: data,
            success: success,
            fail: error
        });
	});
};

CosCloud.prototype.uploadFile = function (success, error, bucketName, remotePath, tempFilePath, insertOnly) {

	var options = {};
	var bizAttr = {};
	var onProgress;
	if (typeof success === 'object') {
        options = success;
        bizAttr = options.bizAttr;
        success = options.success;
        error = options.error;
        bucketName = options.bucket;
        remotePath = options.path;
        tempFilePath = options.filepath;
        insertOnly = options.insertOnly;
        if (options.onProgress && (typeof options.onProgress === 'function')) {
            onProgress = (function () {
                var time0 = Date.now();
                var size0 = 0;
                var FinishSize = 0;
                var FileSize = 0;
                var progressTimer;
                var update = function () {
                    progressTimer = 0;
					var time1 = Date.now();
					var speed = parseInt((FinishSize - size0) / ((time1 - time0) / 1000) * 100) / 100 || 0;
					var percent = parseInt(FinishSize / FileSize * 100) / 100 || 0;
					time0 = time1;
					size0 = FinishSize;
					try {
						options.onProgress({
							loaded: FinishSize,
							total: FileSize,
							speed: speed,
							percent: percent
						});
					} catch (e) {
					}
                };
                return function (info, immediately) {
                	if (info) {
                        FinishSize = info.totalBytesSent;
                        FileSize = info.totalBytesExpectedToSend;
					}
                    if (immediately) {
                        if (progressTimer) {
                            clearTimeout(progressTimer);
                            update();
                        }
                    } else {
                        if (progressTimer) return;
                        progressTimer = setTimeout(update, that.progressInterval || 1000);
                    }
                };
            })();
		}
	}

	var that = this;
	remotePath = fixPath(remotePath);
	that.getAppSign(function (sign) {
		var url = that.getCgiUrl(remotePath);
		var data = {
            op: 'upload'
        };
        if (insertOnly >= 0) {//insertOnly==0 表示允许覆盖文件 1表示不允许 其他值忽略
            data['insertOnly'] = insertOnly;
        }
        if (bizAttr) {
            data['biz_attr'] = bizAttr;
        }
        var uploadTask = wx.uploadFile({
            url: url,
            filePath: tempFilePath,
            name: 'fileContent',
            header: {'Authorization': sign},
            formData: data,
            success: function (result) {
                result.data = JSON.parse(result.data);
                onProgress(null, true);
                success.call(this, result);
			},
            fail: error
        });
        onProgress && uploadTask && uploadTask.onProgressUpdate && uploadTask.onProgressUpdate(onProgress);
	});
};

//处理路径
function fixPath(path, type) {

	if (!path) {
		return '';
	}
	var self = this;
	path = path.replace(/(^\/*)|(\/*$)/g, '');
	if (type == 'folder') {
		path = encodeURIComponent(path + '/').replace(/%2F/g, '/');
	} else {
		path = encodeURIComponent(path).replace(/%2F/g, '/');
	}

	if (self) {
		self.path = '/' + self.appid + '/' + self.bucket + '/' + path;
	}

	return path;
}

module.exports = CosCloud;