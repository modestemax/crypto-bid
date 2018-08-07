"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Mutex = function () {
    function Mutex() {
        (0, _classCallCheck3.default)(this, Mutex);


        this._locking = _promise2.default.resolve();
        this._locks = 0;
    }

    (0, _createClass3.default)(Mutex, [{
        key: "isLocked",
        value: function isLocked() {

            return this._locks > 0;
        }
    }, {
        key: "lock",
        value: function lock() {
            var _this = this;

            this._locks += 1;

            var unlockNext = void 0;

            var willLock = new _promise2.default(function (resolve) {
                return unlockNext = function unlockNext() {
                    _this._locks -= 1;

                    resolve();
                };
            });

            var willUnlock = this._locking.then(function () {
                return unlockNext;
            });

            this._locking = this._locking.then(function () {
                return willLock;
            });

            return willUnlock;
        }
    }]);
    return Mutex;
}();

exports.default = Mutex;