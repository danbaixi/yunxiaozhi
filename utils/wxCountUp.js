/**
 * 数字滚动
 * 
 * @param {String} target   滚动对象
 * @param {Number} endVal   滚动结束时的数字
 * @param {Object} options  配置
 * @param {Object} context  微信小程序当前this对象
 * 
 * forked from https://github.com/inorganik/CountUp.js
 */
class WxCountUp {
  constructor(target = '', endVal = 0, options = {}, context = {}) {
    var _this = this
    this.target = target;
    this.endVal = endVal;
    this.options = options;
    this.context = context;
    this.version = '1.0.0';
    this.defaults = {
      startVal: 0,
      decimalPlaces: 0,
      duration: 2,
      useEasing: true,
      useGrouping: true,
      smartEasingThreshold: 999,
      smartEasingAmount: 333,
      separator: ',',
      decimal: '.',
      prefix: '',
      suffix: ''
    }
    this.finalEndVal = null;
    this.useEasing = true;
    this.countDown = false;
    this.error = '';
    this.startVal = 0;
    this.paused = true;
    this.count = function (timestamp) {
      if (!_this.startTime) {
        _this.startTime = timestamp;
      }
      var progress = timestamp - _this.startTime;
      _this.remaining = _this.duration - progress;
      // to ease or not to ease
      if (_this.useEasing) {
        if (_this.countDown) {
          _this.frameVal = _this.startVal - _this.easingFn(progress, 0, _this.startVal - _this.endVal, _this.duration);
        }
        else {
          _this.frameVal = _this.easingFn(progress, _this.startVal, _this.endVal - _this.startVal, _this.duration);
        }
      }
      else {
        if (_this.countDown) {
          _this.frameVal = _this.startVal - ((_this.startVal - _this.endVal) * (progress / _this.duration));
        }
        else {
          _this.frameVal = _this.startVal + (_this.endVal - _this.startVal) * (progress / _this.duration);
        }
      }
      // don't go past endVal since progress can exceed duration in the last frame
      if (_this.countDown) {
        _this.frameVal = (_this.frameVal < _this.endVal) ? _this.endVal : _this.frameVal;
      }
      else {
        _this.frameVal = (_this.frameVal > _this.endVal) ? _this.endVal : _this.frameVal;
      }
      // decimal
      _this.frameVal = Math.round(_this.frameVal * _this.decimalMult) / _this.decimalMult;
      // format and print value
      _this.printValue(_this.frameVal);
      // whether to continue
      if (progress < _this.duration) {
        _this.rAF = doAnimationFrame(_this.count);
      }
      else if (_this.finalEndVal !== null) {
        // smart easing
        _this.update(_this.finalEndVal);
      }
      else {
        if (_this.callback) {
          _this.callback();
        }
      }
    };
    // 默认格式和缓和函数
    this.formatNumber = function (num) {
      var neg = (num < 0) ? '-' : '';
      var result, x, x1, x2, x3;
      result = Math.abs(num).toFixed(_this.options.decimalPlaces);
      result += '';
      x = result.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? _this.options.decimal + x[1] : '';
      if (_this.options.useGrouping) {
        x3 = '';
        for (var i = 0, len = x1.length; i < len; ++i) {
          if (i !== 0 && (i % 3) === 0) {
            x3 = _this.options.separator + x3;
          }
          x3 = x1[len - i - 1] + x3;
        }
        x1 = x3;
      }
      // optional numeral substitution
      if (_this.options.numerals && _this.options.numerals.length) {
        x1 = x1.replace(/[0-9]/g, function (w) { return _this.options.numerals[+w]; });
        x2 = x2.replace(/[0-9]/g, function (w) { return _this.options.numerals[+w]; });
      }
      return neg + _this.options.prefix + x1 + x2 + _this.options.suffix;
    };
    this.easeOutExpo = function (t, b, c, d) {
      return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    };
    this.options = __assign({}, this.defaults, options);
    this.formattingFn = (this.options.formattingFn) ? this.options.formattingFn : this.formatNumber;
    this.easingFn = (this.options.easingFn) ? this.options.easingFn : this.easeOutExpo;
    this.startVal = this.validateValue(this.options.startVal);
    this.frameVal = this.startVal;
    this.endVal = this.validateValue(endVal);
    this.options.decimalPlaces = Math.max(0 || this.options.decimalPlaces);
    this.decimalMult = Math.pow(10, this.options.decimalPlaces);
    this.resetDuration();
    this.options.separator = String(this.options.separator);
    this.useEasing = this.options.useEasing;
    if (this.options.separator === '') {
      this.options.useGrouping = false;
    }
    if (this.target && typeof target === 'string') {
      this.printValue(this.startVal);
    } else {
      this.error = '[CountUp] target is null or undefined';
    }
  }

  // 决定数字滚动的方向
  determineDirectionAndSmartEasing() {
    var end = (this.finalEndVal) ? this.finalEndVal : this.endVal;
    this.countDown = (this.startVal > end);
    var animateAmount = end - this.startVal;
    if (Math.abs(animateAmount) > this.options.smartEasingThreshold) {
      this.finalEndVal = end;
      var up = (this.countDown) ? 1 : -1;
      this.endVal = end + (up * this.options.smartEasingAmount);
      this.duration = this.duration / 2;
    }
    else {
      this.endVal = end;
      this.finalEndVal = null;
    }
    if (this.finalEndVal) {
      this.useEasing = false;
    }
    else {
      this.useEasing = this.options.useEasing;
    }
  }

  // 开始动画
  start(callback) {
    if (this.error || !this.context) {
      return;
    }
    this.callback = callback;
    if (this.duration > 0) {
      this.determineDirectionAndSmartEasing();
      this.paused = false;
      this.rAF = doAnimationFrame(this.count);
    } else {
      this.printValue(this.endVal);
    }
  }

  // 暂停/恢复动画
  pauseResume() {
    if (!this.paused) {
      abortAnimationFrame(this.rAF);
    } else {
      this.startTime = null;
      this.duration = this.remaining;
      this.startVal = this.frameVal;
      this.determineDirectionAndSmartEasing();
      this.rAF = doAnimationFrame(this.count);
    }
    this.paused = !this.paused;
  }

  // 重置为 startVal，以便动画可以再次运行
  reset() {
    abortAnimationFrame(this.rAF);
    this.paused = true;
    this.resetDuration();
    this.startVal = this.validateValue(this.options.startVal);
    this.frameVal = this.startVal;
    this.printValue(this.startVal);
  }

  // 通过一个新的 endVal 并开始动画
  update(newEndVal) {
    abortAnimationFrame(this.rAF);
    this.startTime = null;
    this.endVal = this.validateValue(newEndVal);
    if (this.endVal === this.frameVal) {
      return;
    }
    this.startVal = this.frameVal;
    if (!this.finalEndVal) {
      this.resetDuration();
    }
    this.determineDirectionAndSmartEasing();
    this.rAF = doAnimationFrame(this.count);
  }

  // 输出值
  printValue(val) {
    var result = this.formattingFn(val);
    var target = this.target
    this.context && this.context.setData({
      [target]: result
    })
  }

  // 是否数字类型
  ensureNumber(n) {
    return (typeof n === 'number' && !isNaN(n));
  }

  // 验证值的类型
  validateValue(value) {
    var newValue = Number(value);
    if (!this.ensureNumber(newValue)) {
      this.error = "[CountUp] invalid start or end value: " + value;
      return null;
    }
    else {
      return newValue;
    }
  }

  // 重置动画间隔
  resetDuration() {
    this.startTime = null;
    this.duration = Number(this.options.duration) * 1000;
    this.remaining = this.duration;
  }
}

/**
 * 复制对象
 */
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};


/**
 * 代替 requestAnimationFrame 帧渲染
 * copy from https://www.dennic365.com/blog/?p=87
 */

var lastFrameTime = 0;
// 模拟 requestAnimationFrame
var doAnimationFrame = function (callback) {
  var currTime = new Date().getTime();
  var timeToCall = Math.max(0, 16 - (currTime - lastFrameTime));
  var id = setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
  lastFrameTime = currTime + timeToCall;
  return id;
};
// 模拟 cancelAnimationFrame
var abortAnimationFrame = function (id) {
  clearTimeout(id)
}

export default WxCountUp