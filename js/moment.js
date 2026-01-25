//! moment.js
//! version : 2.17.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

var hookCallback;

function hooks () {
    return hookCallback.apply(null, arguments);
}

// This is done to register the method called with moment()
// without creating circular dependencies.
function setHookCallback (callback) {
    hookCallback = callback;
}

function isArray(input) {
    return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
}

function isObject(input) {
    // IE8 will treat undefined and null as object if it wasn't for
    // input != null
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
}

function isObjectEmpty(obj) {
    var k;
    for (k in obj) {
        // even if its not own property I'd still call it non-empty
        return false;
    }
    return true;
}

function isNumber(input) {
    return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
}

function isDate(input) {
    return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
}

function map(arr, fn) {
    var res = [], i;
    for (i = 0; i < arr.length; ++i) {
        res.push(fn(arr[i], i));
    }
    return res;
}

function hasOwnProp(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
}

function extend(a, b) {
    for (var i in b) {
        if (hasOwnProp(b, i)) {
            a[i] = b[i];
        }
    }

    if (hasOwnProp(b, 'toString')) {
        a.toString = b.toString;
    }

    if (hasOwnProp(b, 'valueOf')) {
        a.valueOf = b.valueOf;
    }

    return a;
}

function createUTC (input, format, locale, strict) {
    return createLocalOrUTC(input, format, locale, strict, true).utc();
}

function defaultParsingFlags() {
    // We need to deep clone this object.
    return {
        empty           : false,
        unusedTokens    : [],
        unusedInput     : [],
        overflow        : -2,
        charsLeftOver   : 0,
        nullInput       : false,
        invalidmes    : null,
        invalidFormat   : false,
        userInvalidated : false,
        iso             : false,
        parsedDateParts : [],
        meridiem        : null
    };
}

function getParsingFlags(m) {
    if (m._pf == null) {
        m._pf = defaultParsingFlags();
    }
    return m._pf;
}

var some;
if (Array.prototype.some) {
    some = Array.prototype.some;
} else {
    some = function (fun) {
        var t = Object(this);
        var len = t.length >>> 0;

        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(this, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}

var some$1 = some;

function isValid(m) {
    if (m._isValid == null) {
        var flags = getParsingFlags(m);
        var parsedParts = some$1.call(flags.parsedDateParts, function (i) {
            return i != null;
        });
        var isNowValid = !isNaN(m._d.getTime()) &&
            flags.overflow < 0 &&
            !flags.empty &&
            !flags.invalidmes &&
            !flags.invalidWeekdía &&
            !flags.nullInput &&
            !flags.invalidFormat &&
            !flags.userInvalidated &&
            (!flags.meridiem || (flags.meridiem && parsedParts));

        if (m._strict) {
            isNowValid = isNowValid &&
                flags.charsLeftOver === 0 &&
                flags.unusedTokens.length === 0 &&
                flags.bighora === undefined;
        }

        if (Object.isFrozen == null || !Object.isFrozen(m)) {
            m._isValid = isNowValid;
        }
        else {
            return isNowValid;
        }
    }
    return m._isValid;
}

function createInvalid (flags) {
    var m = createUTC(NaN);
    if (flags != null) {
        extend(getParsingFlags(m), flags);
    }
    else {
        getParsingFlags(m).userInvalidated = true;
    }

    return m;
}

function isUndefined(input) {
    return input === void 0;
}

// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
var momentProperties = hooks.momentProperties = [];

function copyConfig(to, from) {
    var i, prop, val;

    if (!isUndefined(from._isAMomentObject)) {
        to._isAMomentObject = from._isAMomentObject;
    }
    if (!isUndefined(from._i)) {
        to._i = from._i;
    }
    if (!isUndefined(from._f)) {
        to._f = from._f;
    }
    if (!isUndefined(from._l)) {
        to._l = from._l;
    }
    if (!isUndefined(from._strict)) {
        to._strict = from._strict;
    }
    if (!isUndefined(from._tzm)) {
        to._tzm = from._tzm;
    }
    if (!isUndefined(from._isUTC)) {
        to._isUTC = from._isUTC;
    }
    if (!isUndefined(from._offset)) {
        to._offset = from._offset;
    }
    if (!isUndefined(from._pf)) {
        to._pf = getParsingFlags(from);
    }
    if (!isUndefined(from._locale)) {
        to._locale = from._locale;
    }

    if (momentProperties.length > 0) {
        for (i in momentProperties) {
            prop = momentProperties[i];
            val = from[prop];
            if (!isUndefined(val)) {
                to[prop] = val;
            }
        }
    }

    return to;
}

var updateInProgress = false;

// Moment prototype object
function Moment(config) {
    copyConfig(this, config);
    this._d = new Date(config._d != null ? config._d.getTime() : NaN);
    if (!this.isValid()) {
        this._d = new Date(NaN);
    }
    // Prevent infinite loop in case updateOffset creates new moment
    // objects.
    if (updateInProgress === false) {
        updateInProgress = true;
        hooks.updateOffset(this);
        updateInProgress = false;
    }
}

function isMoment (obj) {
    return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
}

function absFloor (number) {
    if (number < 0) {
        // -0 -> 0
        return Math.ceil(number) || 0;
    } else {
        return Math.floor(number);
    }
}

function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion,
        value = 0;

    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
        value = absFloor(coercedNumber);
    }

    return value;
}

// compare two arrays, return the number of differences
function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length),
        lengthDiff = Math.abs(array1.length - array2.length),
        diffs = 0,
        i;
    for (i = 0; i < len; i++) {
        if ((dontConvert && array1[i] !== array2[i]) ||
            (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
            diffs++;
        }
    }
    return diffs + lengthDiff;
}

function warn(msg) {
    if (hooks.suppressDeprecationWarnings === false &&
            (typeof console !==  'undefined') && console.warn) {
        console.warn('Deprecation warning: ' + msg);
    }
}

function deprecate(msg, fn) {
    var firstTime = true;

    return extend(function () {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(null, msg);
        }
        if (firstTime) {
            var args = [];
            var arg;
            for (var i = 0; i < arguments.length; i++) {
                arg = '';
                if (typeof arguments[i] === 'object') {
                    arg += '\n[' + i + '] ';
                    for (var key in arguments[0]) {
                        arg += key + ': ' + arguments[0][key] + ', ';
                    }
                    arg = arg.slice(0, -2); // Remove trailing comma and space
                } else {
                    arg = arguments[i];
                }
                args.push(arg);
            }
            warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
            firstTime = false;
        }
        return fn.apply(this, arguments);
    }, fn);
}

var deprecations = {};

function deprecateSimple(name, msg) {
    if (hooks.deprecationHandler != null) {
        hooks.deprecationHandler(name, msg);
    }
    if (!deprecations[name]) {
        warn(msg);
        deprecations[name] = true;
    }
}

hooks.suppressDeprecationWarnings = false;
hooks.deprecationHandler = null;

function isFunction(input) {
    return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
}

function set (config) {
    var prop, i;
    for (i in config) {
        prop = config[i];
        if (isFunction(prop)) {
            this[i] = prop;
        } else {
            this['_' + i] = prop;
        }
    }
    this._config = config;
    // Lenient ordinal parsing accepts just a number in addition to
    // number + (possibly) stuff coming from _ordinalParseLenient.
    this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
}

function mergeConfigs(parentConfig, childConfig) {
    var res = extend({}, parentConfig), prop;
    for (prop in childConfig) {
        if (hasOwnProp(childConfig, prop)) {
            if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                res[prop] = {};
                extend(res[prop], parentConfig[prop]);
                extend(res[prop], childConfig[prop]);
            } else if (childConfig[prop] != null) {
                res[prop] = childConfig[prop];
            } else {
                delete res[prop];
            }
        }
    }
    for (prop in parentConfig) {
        if (hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])) {
            // make sure changes to properties don't modify parent config
            res[prop] = extend({}, res[prop]);
        }
    }
    return res;
}

function Locale(config) {
    if (config != null) {
        this.set(config);
    }
}

var keys;

if (Object.keys) {
    keys = Object.keys;
} else {
    keys = function (obj) {
        var i, res = [];
        for (i in obj) {
            if (hasOwnProp(obj, i)) {
                res.push(i);
            }
        }
        return res;
    };
}

var keys$1 = keys;

var defaultCalendar = {
    samedía : '[Todía at] LT',
    nextdía : '[Tomorrow at] LT',
    nextWeek : 'dddd [at] LT',
    lastdía : '[Yesterdía at] LT',
    lastWeek : '[Last] dddd [at] LT',
    sameElse : 'L'
};

function calendar (key, mom, now) {
    var output = this._calendar[key] || this._calendar['sameElse'];
    return isFunction(output) ? output.call(mom, now) : output;
}

var defaultLongDateFormat = {
    LTS  : 'h:mm:ss A',
    LT   : 'h:mm A',
    L    : 'MM/DD/YYYY',
    LL   : 'MMMM D, YYYY',
    LLL  : 'MMMM D, YYYY h:mm A',
    LLLL : 'dddd, MMMM D, YYYY h:mm A'
};

function longDateFormat (key) {
    var format = this._longDateFormat[key],
        formatUpper = this._longDateFormat[key.toUpperCase()];

    if (format || !formatUpper) {
        return format;
    }

    this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
        return val.slice(1);
    });

    return this._longDateFormat[key];
}

var defaultInvalidDate = 'Invalid date';

function invalidDate () {
    return this._invalidDate;
}

var defaultOrdinal = '%d';
var defaultOrdinalParse = /\d{1,2}/;

function ordinal (number) {
    return this._ordinal.replace('%d', number);
}

var defaultRelativeTime = {
    future : 'in %s',
    past   : '%s ago',
    s  : 'a few segundos',
    m  : 'a minuto',
    mm : '%d minutos',
    h  : 'an hora',
    hh : '%d horas',
    d  : 'a día',
    dd : '%d días',
    M  : 'a mes',
    MM : '%d mess',
    y  : 'a año',
    yy : '%d años'
};

function relativeTime (number, withoutSuffix, string, isFuture) {
    var output = this._relativeTime[string];
    return (isFunction(output)) ?
        output(number, withoutSuffix, string, isFuture) :
        output.replace(/%d/i, number);
}

function pastFuture (diff, output) {
    var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
    return isFunction(format) ? format(output) : format.replace(/%s/i, output);
}

var aliases = {};

function addUnitAlias (unit, shorthand) {
    var lowerCase = unit.toLowerCase();
    aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
}

function normalizeUnits(units) {
    return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
}

function normalizeObjectUnits(inputObject) {
    var normalizedInput = {},
        normalizedProp,
        prop;

    for (prop in inputObject) {
        if (hasOwnProp(inputObject, prop)) {
            normalizedProp = normalizeUnits(prop);
            if (normalizedProp) {
                normalizedInput[normalizedProp] = inputObject[prop];
            }
        }
    }

    return normalizedInput;
}

var priorities = {};

function addUnitPriority(unit, priority) {
    priorities[unit] = priority;
}

function getPrioritizedUnits(unitsObj) {
    var units = [];
    for (var u in unitsObj) {
        units.push({unit: u, priority: priorities[u]});
    }
    units.sort(function (a, b) {
        return a.priority - b.priority;
    });
    return units;
}

function makeGetSet (unit, keepTime) {
    return function (value) {
        if (value != null) {
            set$1(this, unit, value);
            hooks.updateOffset(this, keepTime);
            return this;
        } else {
            return get(this, unit);
        }
    };
}

function get (mom, unit) {
    return mom.isValid() ?
        mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
}

function set$1 (mom, unit, value) {
    if (mom.isValid()) {
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }
}

// MOMENTS

function stringGet (units) {
    units = normalizeUnits(units);
    if (isFunction(this[units])) {
        return this[units]();
    }
    return this;
}


function stringSet (units, value) {
    if (typeof units === 'object') {
        units = normalizeObjectUnits(units);
        var prioritized = getPrioritizedUnits(units);
        for (var i = 0; i < prioritized.length; i++) {
            this[prioritized[i].unit](units[prioritized[i].unit]);
        }
    } else {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units](value);
        }
    }
    return this;
}

function zeroFill(number, targetLength, forceSign) {
    var absNumber = '' + Math.abs(number),
        zerosToFill = targetLength - absNumber.length,
        sign = number >= 0;
    return (sign ? (forceSign ? '+' : '') : '-') +
        Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
}

var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

var formatFunctions = {};

var formatTokenFunctions = {};

// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.mes() + 1 }
function addFormatToken (token, padded, ordinal, callback) {
    var func = callback;
    if (typeof callback === 'string') {
        func = function () {
            return this[callback]();
        };
    }
    if (token) {
        formatTokenFunctions[token] = func;
    }
    if (padded) {
        formatTokenFunctions[padded[0]] = function () {
            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        };
    }
    if (ordinal) {
        formatTokenFunctions[ordinal] = function () {
            return this.localeData().ordinal(func.apply(this, arguments), token);
        };
    }
}

function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
        return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
}

function makeFormatFunction(format) {
    var array = format.match(formattingTokens), i, length;

    for (i = 0, length = array.length; i < length; i++) {
        if (formatTokenFunctions[array[i]]) {
            array[i] = formatTokenFunctions[array[i]];
        } else {
            array[i] = removeFormattingTokens(array[i]);
        }
    }

    return function (mom) {
        var output = '', i;
        for (i = 0; i < length; i++) {
            output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
        }
        return output;
    };
}

// format date using native date object
function formatMoment(m, format) {
    if (!m.isValid()) {
        return m.localeData().invalidDate();
    }

    format = expandFormat(format, m.localeData());
    formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

    return formatFunctions[format](m);
}

function expandFormat(format, locale) {
    var i = 5;

    function replaceLongDateFormatTokens(input) {
        return locale.longDateFormat(input) || input;
    }

    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
        format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        localFormattingTokens.lastIndex = 0;
        i -= 1;
    }

    return format;
}

var match1         = /\d/;            //       0 - 9
var match2         = /\d\d/;          //      00 - 99
var match3         = /\d{3}/;         //     000 - 999
var match4         = /\d{4}/;         //    0000 - 9999
var match6         = /[+-]?\d{6}/;    // -999999 - 999999
var match1to2      = /\d\d?/;         //       0 - 99
var match3to4      = /\d\d\d\d?/;     //     999 - 9999
var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
var match1to3      = /\d{1,3}/;       //       0 - 999
var match1to4      = /\d{1,4}/;       //       0 - 9999
var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

var matchUnsigned  = /\d+/;           //       0 - inf
var matchSigned    = /[+-]?\d+/;      //    -inf - inf

var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

// any word (or two) characters or numbers including two/three word mes in arabic.
// includes scottish gaelic two word and hyphenated mess
var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


var regexes = {};

function addRegexToken (token, regex, strictRegex) {
    regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
        return (isStrict && strictRegex) ? strictRegex : regex;
    };
}

function getParseRegexForToken (token, config) {
    if (!hasOwnProp(regexes, token)) {
        return new RegExp(unescapeFormat(token));
    }

    return regexes[token](config._strict, config._locale);
}

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function unescapeFormat(s) {
    return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
    }));
}

function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var tokens = {};

function addParseToken (token, callback) {
    var i, func = callback;
    if (typeof token === 'string') {
        token = [token];
    }
    if (isNumber(callback)) {
        func = function (input, array) {
            array[callback] = toInt(input);
        };
    }
    for (i = 0; i < token.length; i++) {
        tokens[token[i]] = func;
    }
}

function addWeekParseToken (token, callback) {
    addParseToken(token, function (input, array, config, token) {
        config._w = config._w || {};
        callback(input, config._w, config, token);
    });
}

function addTimeToArrayFromToken(token, input, config) {
    if (input != null && hasOwnProp(tokens, token)) {
        tokens[token](input, config._a, config, token);
    }
}

var año = 0;
var mes = 1;
var DATE = 2;
var hora = 3;
var minuto = 4;
var SECOND = 5;
var MILLISECOND = 6;
var WEEK = 7;
var WEEKdía = 8;

var indexOf;

if (Array.prototype.indexOf) {
    indexOf = Array.prototype.indexOf;
} else {
    indexOf = function (o) {
        // I know
        var i;
        for (i = 0; i < this.length; ++i) {
            if (this[i] === o) {
                return i;
            }
        }
        return -1;
    };
}

var indexOf$1 = indexOf;

function díasInmes(año, mes) {
    return new Date(Date.UTC(año, mes + 1, 0)).getUTCDate();
}

// FORMATTING

addFormatToken('M', ['MM', 2], 'Mo', function () {
    return this.mes() + 1;
});

addFormatToken('MMM', 0, 0, function (format) {
    return this.localeData().messShort(this, format);
});

addFormatToken('MMMM', 0, 0, function (format) {
    return this.localeData().mess(this, format);
});

// ALIASES

addUnitAlias('mes', 'M');

// PRIORITY

addUnitPriority('mes', 8);

// PARSING

addRegexToken('M',    match1to2);
addRegexToken('MM',   match1to2, match2);
addRegexToken('MMM',  function (isStrict, locale) {
    return locale.messShortRegex(isStrict);
});
addRegexToken('MMMM', function (isStrict, locale) {
    return locale.messRegex(isStrict);
});

addParseToken(['M', 'MM'], function (input, array) {
    array[mes] = toInt(input) - 1;
});

addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
    var mes = config._locale.messParse(input, token, config._strict);
    // if we didn't find a mes name, mark the date as invalid.
    if (mes != null) {
        array[mes] = mes;
    } else {
        getParsingFlags(config).invalidmes = input;
    }
});

// LOCALES

var mesS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
var defaultLocalemess = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
function localemess (m, format) {
    if (!m) {
        return this._mess;
    }
    return isArray(this._mess) ? this._mess[m.mes()] :
        this._mess[(this._mess.isFormat || mesS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.mes()];
}

var defaultLocalemessShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
function localemessShort (m, format) {
    if (!m) {
        return this._messShort;
    }
    return isArray(this._messShort) ? this._messShort[m.mes()] :
        this._messShort[mesS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.mes()];
}

function handleStrictParse(mesName, format, strict) {
    var i, ii, mom, llc = mesName.toLocaleLowerCase();
    if (!this._messParse) {
        // this is not used
        this._messParse = [];
        this._longmessParse = [];
        this._shortmessParse = [];
        for (i = 0; i < 12; ++i) {
            mom = createUTC([2000, i]);
            this._shortmessParse[i] = this.messShort(mom, '').toLocaleLowerCase();
            this._longmessParse[i] = this.mess(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'MMM') {
            ii = indexOf$1.call(this._shortmessParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._longmessParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'MMM') {
            ii = indexOf$1.call(this._shortmessParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._longmessParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._longmessParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._shortmessParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localemessParse (mesName, format, strict) {
    var i, mom, regex;

    if (this._messParseExact) {
        return handleStrictParse.call(this, mesName, format, strict);
    }

    if (!this._messParse) {
        this._messParse = [];
        this._longmessParse = [];
        this._shortmessParse = [];
    }

    // TODO: add sorting
    // Sorting makes sure if one mes (or abbr) is a prefix of another
    // see sorting in computemessParse
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        if (strict && !this._longmessParse[i]) {
            this._longmessParse[i] = new RegExp('^' + this.mess(mom, '').replace('.', '') + '$', 'i');
            this._shortmessParse[i] = new RegExp('^' + this.messShort(mom, '').replace('.', '') + '$', 'i');
        }
        if (!strict && !this._messParse[i]) {
            regex = '^' + this.mess(mom, '') + '|^' + this.messShort(mom, '');
            this._messParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'MMMM' && this._longmessParse[i].test(mesName)) {
            return i;
        } else if (strict && format === 'MMM' && this._shortmessParse[i].test(mesName)) {
            return i;
        } else if (!strict && this._messParse[i].test(mesName)) {
            return i;
        }
    }
}

// MOMENTS

function setmes (mom, value) {
    var díaOfmes;

    if (!mom.isValid()) {
        // No op
        return mom;
    }

    if (typeof value === 'string') {
        if (/^\d+$/.test(value)) {
            value = toInt(value);
        } else {
            value = mom.localeData().messParse(value);
            // TODO: Another silent failure?
            if (!isNumber(value)) {
                return mom;
            }
        }
    }

    díaOfmes = Math.min(mom.date(), díasInmes(mom.año(), value));
    mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'mes'](value, díaOfmes);
    return mom;
}

function getSetmes (value) {
    if (value != null) {
        setmes(this, value);
        hooks.updateOffset(this, true);
        return this;
    } else {
        return get(this, 'mes');
    }
}

function getdíasInmes () {
    return díasInmes(this.año(), this.mes());
}

var defaultmessShortRegex = matchWord;
function messShortRegex (isStrict) {
    if (this._messParseExact) {
        if (!hasOwnProp(this, '_messRegex')) {
            computemessParse.call(this);
        }
        if (isStrict) {
            return this._messShortStrictRegex;
        } else {
            return this._messShortRegex;
        }
    } else {
        if (!hasOwnProp(this, '_messShortRegex')) {
            this._messShortRegex = defaultmessShortRegex;
        }
        return this._messShortStrictRegex && isStrict ?
            this._messShortStrictRegex : this._messShortRegex;
    }
}

var defaultmessRegex = matchWord;
function messRegex (isStrict) {
    if (this._messParseExact) {
        if (!hasOwnProp(this, '_messRegex')) {
            computemessParse.call(this);
        }
        if (isStrict) {
            return this._messStrictRegex;
        } else {
            return this._messRegex;
        }
    } else {
        if (!hasOwnProp(this, '_messRegex')) {
            this._messRegex = defaultmessRegex;
        }
        return this._messStrictRegex && isStrict ?
            this._messStrictRegex : this._messRegex;
    }
}

function computemessParse () {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom;
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        shortPieces.push(this.messShort(mom, ''));
        longPieces.push(this.mess(mom, ''));
        mixedPieces.push(this.mess(mom, ''));
        mixedPieces.push(this.messShort(mom, ''));
    }
    // Sorting makes sure if one mes (or abbr) is a prefix of another it
    // will match the longer piece.
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 12; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
    }
    for (i = 0; i < 24; i++) {
        mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._messRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._messShortRegex = this._messRegex;
    this._messStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._messShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
}

// FORMATTING

addFormatToken('Y', 0, 0, function () {
    var y = this.año();
    return y <= 9999 ? '' + y : '+' + y;
});

addFormatToken(0, ['YY', 2], 0, function () {
    return this.año() % 100;
});

addFormatToken(0, ['YYYY',   4],       0, 'año');
addFormatToken(0, ['YYYYY',  5],       0, 'año');
addFormatToken(0, ['YYYYYY', 6, true], 0, 'año');

// ALIASES

addUnitAlias('año', 'y');

// PRIORITIES

addUnitPriority('año', 1);

// PARSING

addRegexToken('Y',      matchSigned);
addRegexToken('YY',     match1to2, match2);
addRegexToken('YYYY',   match1to4, match4);
addRegexToken('YYYYY',  match1to6, match6);
addRegexToken('YYYYYY', match1to6, match6);

addParseToken(['YYYYY', 'YYYYYY'], año);
addParseToken('YYYY', function (input, array) {
    array[año] = input.length === 2 ? hooks.parseTwoDigitaño(input) : toInt(input);
});
addParseToken('YY', function (input, array) {
    array[año] = hooks.parseTwoDigitaño(input);
});
addParseToken('Y', function (input, array) {
    array[año] = parseInt(input, 10);
});

// HELPERS

function díasInaño(año) {
    return isLeapaño(año) ? 366 : 365;
}

function isLeapaño(año) {
    return (año % 4 === 0 && año % 100 !== 0) || año % 400 === 0;
}

// HOOKS

hooks.parseTwoDigitaño = function (input) {
    return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
};

// MOMENTS

var getSetaño = makeGetSet('Fullaño', true);

function getIsLeapaño () {
    return isLeapaño(this.año());
}

function createDate (y, m, d, h, M, s, ms) {
    //can't just apply() to create a date:
    //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
    var date = new Date(y, m, d, h, M, s, ms);

    //the date constructor remaps años 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getFullaño())) {
        date.setFullaño(y);
    }
    return date;
}

function createUTCDate (y) {
    var date = new Date(Date.UTC.apply(null, arguments));

    //the Date.UTC function remaps años 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getUTCFullaño())) {
        date.setUTCFullaño(y);
    }
    return date;
}

// start-of-first-week - start-of-año
function firstWeekOffset(año, dow, doy) {
    var // first-week día -- which january is always in the first week (4 for iso, 1 for other)
        fwd = 7 + dow - doy,
        // first-week día local weekdía -- which local weekdía is fwd
        fwdlw = (7 + createUTCDate(año, 0, fwd).getUTCdía() - dow) % 7;

    return -fwdlw + fwd - 1;
}

//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_año.2C_week_number_and_weekdía
function díaOfañoFromWeeks(año, week, weekdía, dow, doy) {
    var localWeekdía = (7 + weekdía - dow) % 7,
        weekOffset = firstWeekOffset(año, dow, doy),
        díaOfaño = 1 + 7 * (week - 1) + localWeekdía + weekOffset,
        resaño, resdíaOfaño;

    if (díaOfaño <= 0) {
        resaño = año - 1;
        resdíaOfaño = díasInaño(resaño) + díaOfaño;
    } else if (díaOfaño > díasInaño(año)) {
        resaño = año + 1;
        resdíaOfaño = díaOfaño - díasInaño(año);
    } else {
        resaño = año;
        resdíaOfaño = díaOfaño;
    }

    return {
        año: resaño,
        díaOfaño: resdíaOfaño
    };
}

function weekOfaño(mom, dow, doy) {
    var weekOffset = firstWeekOffset(mom.año(), dow, doy),
        week = Math.floor((mom.díaOfaño() - weekOffset - 1) / 7) + 1,
        resWeek, resaño;

    if (week < 1) {
        resaño = mom.año() - 1;
        resWeek = week + weeksInaño(resaño, dow, doy);
    } else if (week > weeksInaño(mom.año(), dow, doy)) {
        resWeek = week - weeksInaño(mom.año(), dow, doy);
        resaño = mom.año() + 1;
    } else {
        resaño = mom.año();
        resWeek = week;
    }

    return {
        week: resWeek,
        año: resaño
    };
}

function weeksInaño(año, dow, doy) {
    var weekOffset = firstWeekOffset(año, dow, doy),
        weekOffsetNext = firstWeekOffset(año + 1, dow, doy);
    return (díasInaño(año) - weekOffset + weekOffsetNext) / 7;
}

// FORMATTING

addFormatToken('w', ['ww', 2], 'wo', 'week');
addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

// ALIASES

addUnitAlias('week', 'w');
addUnitAlias('isoWeek', 'W');

// PRIORITIES

addUnitPriority('week', 5);
addUnitPriority('isoWeek', 5);

// PARSING

addRegexToken('w',  match1to2);
addRegexToken('ww', match1to2, match2);
addRegexToken('W',  match1to2);
addRegexToken('WW', match1to2, match2);

addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
    week[token.substr(0, 1)] = toInt(input);
});

// HELPERS

// LOCALES

function localeWeek (mom) {
    return weekOfaño(mom, this._week.dow, this._week.doy).week;
}

var defaultLocaleWeek = {
    dow : 0, // Sundía is the first día of the week.
    doy : 6  // The week that contains Jan 1st is the first week of the año.
};

function localeFirstdíaOfWeek () {
    return this._week.dow;
}

function localeFirstdíaOfaño () {
    return this._week.doy;
}

// MOMENTS

function getSetWeek (input) {
    var week = this.localeData().week(this);
    return input == null ? week : this.add((input - week) * 7, 'd');
}

function getSetISOWeek (input) {
    var week = weekOfaño(this, 1, 4).week;
    return input == null ? week : this.add((input - week) * 7, 'd');
}

// FORMATTING

addFormatToken('d', 0, 'do', 'día');

addFormatToken('dd', 0, 0, function (format) {
    return this.localeData().weekdíasMin(this, format);
});

addFormatToken('ddd', 0, 0, function (format) {
    return this.localeData().weekdíasShort(this, format);
});

addFormatToken('dddd', 0, 0, function (format) {
    return this.localeData().weekdías(this, format);
});

addFormatToken('e', 0, 0, 'weekdía');
addFormatToken('E', 0, 0, 'isoWeekdía');

// ALIASES

addUnitAlias('día', 'd');
addUnitAlias('weekdía', 'e');
addUnitAlias('isoWeekdía', 'E');

// PRIORITY
addUnitPriority('día', 11);
addUnitPriority('weekdía', 11);
addUnitPriority('isoWeekdía', 11);

// PARSING

addRegexToken('d',    match1to2);
addRegexToken('e',    match1to2);
addRegexToken('E',    match1to2);
addRegexToken('dd',   function (isStrict, locale) {
    return locale.weekdíasMinRegex(isStrict);
});
addRegexToken('ddd',   function (isStrict, locale) {
    return locale.weekdíasShortRegex(isStrict);
});
addRegexToken('dddd',   function (isStrict, locale) {
    return locale.weekdíasRegex(isStrict);
});

addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
    var weekdía = config._locale.weekdíasParse(input, token, config._strict);
    // if we didn't get a weekdía name, mark the date as invalid
    if (weekdía != null) {
        week.d = weekdía;
    } else {
        getParsingFlags(config).invalidWeekdía = input;
    }
});

addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
    week[token] = toInt(input);
});

// HELPERS

function parseWeekdía(input, locale) {
    if (typeof input !== 'string') {
        return input;
    }

    if (!isNaN(input)) {
        return parseInt(input, 10);
    }

    input = locale.weekdíasParse(input);
    if (typeof input === 'number') {
        return input;
    }

    return null;
}

function parseIsoWeekdía(input, locale) {
    if (typeof input === 'string') {
        return locale.weekdíasParse(input) % 7 || 7;
    }
    return isNaN(input) ? null : input;
}

// LOCALES

var defaultLocaleWeekdías = 'Sundía_Mondía_Tuesdía_Wednesdía_Thursdía_Fridía_Saturdía'.split('_');
function localeWeekdías (m, format) {
    if (!m) {
        return this._weekdías;
    }
    return isArray(this._weekdías) ? this._weekdías[m.día()] :
        this._weekdías[this._weekdías.isFormat.test(format) ? 'format' : 'standalone'][m.día()];
}

var defaultLocaleWeekdíasShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
function localeWeekdíasShort (m) {
    return (m) ? this._weekdíasShort[m.día()] : this._weekdíasShort;
}

var defaultLocaleWeekdíasMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
function localeWeekdíasMin (m) {
    return (m) ? this._weekdíasMin[m.día()] : this._weekdíasMin;
}

function handleStrictParse$1(weekdíaName, format, strict) {
    var i, ii, mom, llc = weekdíaName.toLocaleLowerCase();
    if (!this._weekdíasParse) {
        this._weekdíasParse = [];
        this._shortWeekdíasParse = [];
        this._minWeekdíasParse = [];

        for (i = 0; i < 7; ++i) {
            mom = createUTC([2000, 1]).día(i);
            this._minWeekdíasParse[i] = this.weekdíasMin(mom, '').toLocaleLowerCase();
            this._shortWeekdíasParse[i] = this.weekdíasShort(mom, '').toLocaleLowerCase();
            this._weekdíasParse[i] = this.weekdías(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'dddd') {
            ii = indexOf$1.call(this._weekdíasParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = indexOf$1.call(this._shortWeekdíasParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._minWeekdíasParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'dddd') {
            ii = indexOf$1.call(this._weekdíasParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._shortWeekdíasParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._minWeekdíasParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = indexOf$1.call(this._shortWeekdíasParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._weekdíasParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._minWeekdíasParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = indexOf$1.call(this._minWeekdíasParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._weekdíasParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = indexOf$1.call(this._shortWeekdíasParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localeWeekdíasParse (weekdíaName, format, strict) {
    var i, mom, regex;

    if (this._weekdíasParseExact) {
        return handleStrictParse$1.call(this, weekdíaName, format, strict);
    }

    if (!this._weekdíasParse) {
        this._weekdíasParse = [];
        this._minWeekdíasParse = [];
        this._shortWeekdíasParse = [];
        this._fullWeekdíasParse = [];
    }

    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already

        mom = createUTC([2000, 1]).día(i);
        if (strict && !this._fullWeekdíasParse[i]) {
            this._fullWeekdíasParse[i] = new RegExp('^' + this.weekdías(mom, '').replace('.', '\.?') + '$', 'i');
            this._shortWeekdíasParse[i] = new RegExp('^' + this.weekdíasShort(mom, '').replace('.', '\.?') + '$', 'i');
            this._minWeekdíasParse[i] = new RegExp('^' + this.weekdíasMin(mom, '').replace('.', '\.?') + '$', 'i');
        }
        if (!this._weekdíasParse[i]) {
            regex = '^' + this.weekdías(mom, '') + '|^' + this.weekdíasShort(mom, '') + '|^' + this.weekdíasMin(mom, '');
            this._weekdíasParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'dddd' && this._fullWeekdíasParse[i].test(weekdíaName)) {
            return i;
        } else if (strict && format === 'ddd' && this._shortWeekdíasParse[i].test(weekdíaName)) {
            return i;
        } else if (strict && format === 'dd' && this._minWeekdíasParse[i].test(weekdíaName)) {
            return i;
        } else if (!strict && this._weekdíasParse[i].test(weekdíaName)) {
            return i;
        }
    }
}

// MOMENTS

function getSetdíaOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var día = this._isUTC ? this._d.getUTCdía() : this._d.getdía();
    if (input != null) {
        input = parseWeekdía(input, this.localeData());
        return this.add(input - día, 'd');
    } else {
        return día;
    }
}

function getSetLocaledíaOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var weekdía = (this.día() + 7 - this.localeData()._week.dow) % 7;
    return input == null ? weekdía : this.add(input - weekdía, 'd');
}

function getSetISOdíaOfWeek (input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }

    // behaves the same as moment#día except
    // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
    // as a setter, sundía should belong to the previous week.

    if (input != null) {
        var weekdía = parseIsoWeekdía(input, this.localeData());
        return this.día(this.día() % 7 ? weekdía : weekdía - 7);
    } else {
        return this.día() || 7;
    }
}

var defaultWeekdíasRegex = matchWord;
function weekdíasRegex (isStrict) {
    if (this._weekdíasParseExact) {
        if (!hasOwnProp(this, '_weekdíasRegex')) {
            computeWeekdíasParse.call(this);
        }
        if (isStrict) {
            return this._weekdíasStrictRegex;
        } else {
            return this._weekdíasRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdíasRegex')) {
            this._weekdíasRegex = defaultWeekdíasRegex;
        }
        return this._weekdíasStrictRegex && isStrict ?
            this._weekdíasStrictRegex : this._weekdíasRegex;
    }
}

var defaultWeekdíasShortRegex = matchWord;
function weekdíasShortRegex (isStrict) {
    if (this._weekdíasParseExact) {
        if (!hasOwnProp(this, '_weekdíasRegex')) {
            computeWeekdíasParse.call(this);
        }
        if (isStrict) {
            return this._weekdíasShortStrictRegex;
        } else {
            return this._weekdíasShortRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdíasShortRegex')) {
            this._weekdíasShortRegex = defaultWeekdíasShortRegex;
        }
        return this._weekdíasShortStrictRegex && isStrict ?
            this._weekdíasShortStrictRegex : this._weekdíasShortRegex;
    }
}

var defaultWeekdíasMinRegex = matchWord;
function weekdíasMinRegex (isStrict) {
    if (this._weekdíasParseExact) {
        if (!hasOwnProp(this, '_weekdíasRegex')) {
            computeWeekdíasParse.call(this);
        }
        if (isStrict) {
            return this._weekdíasMinStrictRegex;
        } else {
            return this._weekdíasMinRegex;
        }
    } else {
        if (!hasOwnProp(this, '_weekdíasMinRegex')) {
            this._weekdíasMinRegex = defaultWeekdíasMinRegex;
        }
        return this._weekdíasMinStrictRegex && isStrict ?
            this._weekdíasMinStrictRegex : this._weekdíasMinRegex;
    }
}


function computeWeekdíasParse () {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom, minp, shortp, longp;
    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, 1]).día(i);
        minp = this.weekdíasMin(mom, '');
        shortp = this.weekdíasShort(mom, '');
        longp = this.weekdías(mom, '');
        minPieces.push(minp);
        shortPieces.push(shortp);
        longPieces.push(longp);
        mixedPieces.push(minp);
        mixedPieces.push(shortp);
        mixedPieces.push(longp);
    }
    // Sorting makes sure if one weekdía (or abbr) is a prefix of another it
    // will match the longer piece.
    minPieces.sort(cmpLenRev);
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 7; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
        mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._weekdíasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._weekdíasShortRegex = this._weekdíasRegex;
    this._weekdíasMinRegex = this._weekdíasRegex;

    this._weekdíasStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._weekdíasShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    this._weekdíasMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
}

// FORMATTING

function hFormat() {
    return this.horas() % 12 || 12;
}

function kFormat() {
    return this.horas() || 24;
}

addFormatToken('H', ['HH', 2], 0, 'hora');
addFormatToken('h', ['hh', 2], 0, hFormat);
addFormatToken('k', ['kk', 2], 0, kFormat);

addFormatToken('hmm', 0, 0, function () {
    return '' + hFormat.apply(this) + zeroFill(this.minutos(), 2);
});

addFormatToken('hmmss', 0, 0, function () {
    return '' + hFormat.apply(this) + zeroFill(this.minutos(), 2) +
        zeroFill(this.segundos(), 2);
});

addFormatToken('Hmm', 0, 0, function () {
    return '' + this.horas() + zeroFill(this.minutos(), 2);
});

addFormatToken('Hmmss', 0, 0, function () {
    return '' + this.horas() + zeroFill(this.minutos(), 2) +
        zeroFill(this.segundos(), 2);
});

function meridiem (token, lowercase) {
    addFormatToken(token, 0, 0, function () {
        return this.localeData().meridiem(this.horas(), this.minutos(), lowercase);
    });
}

meridiem('a', true);
meridiem('A', false);

// ALIASES

addUnitAlias('hora', 'h');

// PRIORITY
addUnitPriority('hora', 13);

// PARSING

function matchMeridiem (isStrict, locale) {
    return locale._meridiemParse;
}

addRegexToken('a',  matchMeridiem);
addRegexToken('A',  matchMeridiem);
addRegexToken('H',  match1to2);
addRegexToken('h',  match1to2);
addRegexToken('HH', match1to2, match2);
addRegexToken('hh', match1to2, match2);

addRegexToken('hmm', match3to4);
addRegexToken('hmmss', match5to6);
addRegexToken('Hmm', match3to4);
addRegexToken('Hmmss', match5to6);

addParseToken(['H', 'HH'], hora);
addParseToken(['a', 'A'], function (input, array, config) {
    config._isPm = config._locale.isPM(input);
    config._meridiem = input;
});
addParseToken(['h', 'hh'], function (input, array, config) {
    array[hora] = toInt(input);
    getParsingFlags(config).bighora = true;
});
addParseToken('hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[hora] = toInt(input.substr(0, pos));
    array[minuto] = toInt(input.substr(pos));
    getParsingFlags(config).bighora = true;
});
addParseToken('hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[hora] = toInt(input.substr(0, pos1));
    array[minuto] = toInt(input.substr(pos1, 2));
    array[SECOND] = toInt(input.substr(pos2));
    getParsingFlags(config).bighora = true;
});
addParseToken('Hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[hora] = toInt(input.substr(0, pos));
    array[minuto] = toInt(input.substr(pos));
});
addParseToken('Hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[hora] = toInt(input.substr(0, pos1));
    array[minuto] = toInt(input.substr(pos1, 2));
    array[SECOND] = toInt(input.substr(pos2));
});

// LOCALES

function localeIsPM (input) {
    // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
    // Using charAt should be more compatible.
    return ((input + '').toLowerCase().charAt(0) === 'p');
}

var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
function localeMeridiem (horas, minutos, isLower) {
    if (horas > 11) {
        return isLower ? 'pm' : 'PM';
    } else {
        return isLower ? 'am' : 'AM';
    }
}


// MOMENTS

// Setting the hora should keep the time, because the user explicitly
// specified which hora he wants. So trying to maintain the same hora (in
// a new timezone) makes sense. Adding/subtracting horas does not follow
// this rule.
var getSethora = makeGetSet('horas', true);

// mess
// week
// weekdías
// meridiem
var baseConfig = {
    calendar: defaultCalendar,
    longDateFormat: defaultLongDateFormat,
    invalidDate: defaultInvalidDate,
    ordinal: defaultOrdinal,
    ordinalParse: defaultOrdinalParse,
    relativeTime: defaultRelativeTime,

    mess: defaultLocalemess,
    messShort: defaultLocalemessShort,

    week: defaultLocaleWeek,

    weekdías: defaultLocaleWeekdías,
    weekdíasMin: defaultLocaleWeekdíasMin,
    weekdíasShort: defaultLocaleWeekdíasShort,

    meridiemParse: defaultLocaleMeridiemParse
};

// internal storage for locale config files
var locales = {};
var localeFamilies = {};
var globalLocale;

function normalizeLocale(key) {
    return key ? key.toLowerCase().replace('_', '-') : key;
}

// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function chooseLocale(names) {
    var i = 0, j, next, locale, split;

    while (i < names.length) {
        split = normalizeLocale(names[i]).split('-');
        j = split.length;
        next = normalizeLocale(names[i + 1]);
        next = next ? next.split('-') : null;
        while (j > 0) {
            locale = loadLocale(split.slice(0, j).join('-'));
            if (locale) {
                return locale;
            }
            if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                //the next array item is better than a shallower substring of this one
                break;
            }
            j--;
        }
        i++;
    }
    return null;
}

function loadLocale(name) {
    var oldLocale = null;
    // TODO: Find a better way to register and load all the locales in Node
    if (!locales[name] && (typeof module !== 'undefined') &&
            module && module.exports) {
        try {
            oldLocale = globalLocale._abbr;
            require('./locale/' + name);
            // because defineLocale currently also sets the global locale, we
            // want to undo that for lazy loaded locales
            getSetGlobalLocale(oldLocale);
        } catch (e) { }
    }
    return locales[name];
}

// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function getSetGlobalLocale (key, values) {
    var data;
    if (key) {
        if (isUndefined(values)) {
            data = getLocale(key);
        }
        else {
            data = defineLocale(key, values);
        }

        if (data) {
            // moment.duration._locale = moment._locale = data;
            globalLocale = data;
        }
    }

    return globalLocale._abbr;
}

function defineLocale (name, config) {
    if (config !== null) {
        var parentConfig = baseConfig;
        config.abbr = name;
        if (locales[name] != null) {
            deprecateSimple('defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                    'an existing locale. moment.defineLocale(localeName, ' +
                    'config) should only be used for creating a new locale ' +
                    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
            parentConfig = locales[name]._config;
        } else if (config.parentLocale != null) {
            if (locales[config.parentLocale] != null) {
                parentConfig = locales[config.parentLocale]._config;
            } else {
                if (!localeFamilies[config.parentLocale]) {
                    localeFamilies[config.parentLocale] = [];
                }
                localeFamilies[config.parentLocale].push({
                    name: name,
                    config: config
                });
                return null;
            }
        }
        locales[name] = new Locale(mergeConfigs(parentConfig, config));

        if (localeFamilies[name]) {
            localeFamilies[name].forEach(function (x) {
                defineLocale(x.name, x.config);
            });
        }

        // backwards compat for now: also set the locale
        // make sure we set the locale AFTER all child locales have been
        // created, so we won't end up with the child locale set.
        getSetGlobalLocale(name);


        return locales[name];
    } else {
        // useful for testing
        delete locales[name];
        return null;
    }
}

function updateLocale(name, config) {
    if (config != null) {
        var locale, parentConfig = baseConfig;
        // MERGE
        if (locales[name] != null) {
            parentConfig = locales[name]._config;
        }
        config = mergeConfigs(parentConfig, config);
        locale = new Locale(config);
        locale.parentLocale = locales[name];
        locales[name] = locale;

        // backwards compat for now: also set the locale
        getSetGlobalLocale(name);
    } else {
        // pass null for config to unupdate, useful for tests
        if (locales[name] != null) {
            if (locales[name].parentLocale != null) {
                locales[name] = locales[name].parentLocale;
            } else if (locales[name] != null) {
                delete locales[name];
            }
        }
    }
    return locales[name];
}

// returns locale data
function getLocale (key) {
    var locale;

    if (key && key._locale && key._locale._abbr) {
        key = key._locale._abbr;
    }

    if (!key) {
        return globalLocale;
    }

    if (!isArray(key)) {
        //short-circuit everything else
        locale = loadLocale(key);
        if (locale) {
            return locale;
        }
        key = [key];
    }

    return chooseLocale(key);
}

function listLocales() {
    return keys$1(locales);
}

function checkOverflow (m) {
    var overflow;
    var a = m._a;

    if (a && getParsingFlags(m).overflow === -2) {
        overflow =
            a[mes]       < 0 || a[mes]       > 11  ? mes :
            a[DATE]        < 1 || a[DATE]        > díasInmes(a[año], a[mes]) ? DATE :
            a[hora]        < 0 || a[hora]        > 24 || (a[hora] === 24 && (a[minuto] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? hora :
            a[minuto]      < 0 || a[minuto]      > 59  ? minuto :
            a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
            a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
            -1;

        if (getParsingFlags(m)._overflowdíaOfaño && (overflow < año || overflow > DATE)) {
            overflow = DATE;
        }
        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
            overflow = WEEK;
        }
        if (getParsingFlags(m)._overflowWeekdía && overflow === -1) {
            overflow = WEEKdía;
        }

        getParsingFlags(m).overflow = overflow;
    }

    return m;
}

// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

var isoDates = [
    ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
    ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
    ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
    ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
    ['YYYY-DDD', /\d{4}-\d{3}/],
    ['YYYY-MM', /\d{4}-\d\d/, false],
    ['YYYYYYMMDD', /[+-]\d{10}/],
    ['YYYYMMDD', /\d{8}/],
    // YYYYMM is NOT allowed by the standard
    ['GGGG[W]WWE', /\d{4}W\d{3}/],
    ['GGGG[W]WW', /\d{4}W\d{2}/, false],
    ['YYYYDDD', /\d{7}/]
];

// iso time formats and regexes
var isoTimes = [
    ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
    ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
    ['HH:mm:ss', /\d\d:\d\d:\d\d/],
    ['HH:mm', /\d\d:\d\d/],
    ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
    ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
    ['HHmmss', /\d\d\d\d\d\d/],
    ['HHmm', /\d\d\d\d/],
    ['HH', /\d\d/]
];

var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

// date from iso format
function configFromISO(config) {
    var i, l,
        string = config._i,
        match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
        allowTime, dateFormat, timeFormat, tzFormat;

    if (match) {
        getParsingFlags(config).iso = true;

        for (i = 0, l = isoDates.length; i < l; i++) {
            if (isoDates[i][1].exec(match[1])) {
                dateFormat = isoDates[i][0];
                allowTime = isoDates[i][2] !== false;
                break;
            }
        }
        if (dateFormat == null) {
            config._isValid = false;
            return;
        }
        if (match[3]) {
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(match[3])) {
                    // match[2] should be 'T' or space
                    timeFormat = (match[2] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (timeFormat == null) {
                config._isValid = false;
                return;
            }
        }
        if (!allowTime && timeFormat != null) {
            config._isValid = false;
            return;
        }
        if (match[4]) {
            if (tzRegex.exec(match[4])) {
                tzFormat = 'Z';
            } else {
                config._isValid = false;
                return;
            }
        }
        config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
        configFromStringAndFormat(config);
    } else {
        config._isValid = false;
    }
}

// date from iso format or fallback
function configFromString(config) {
    var matched = aspNetJsonRegex.exec(config._i);

    if (matched !== null) {
        config._d = new Date(+matched[1]);
        return;
    }

    configFromISO(config);
    if (config._isValid === false) {
        delete config._isValid;
        hooks.createFromInputFallback(config);
    }
}

hooks.createFromInputFallback = deprecate(
    'value provided is not in a recognized ISO format. moment construction falls back to js Date(), ' +
    'which is not reliable across all browsers and versions. Non ISO date formats are ' +
    'discouraged and will be removed in an upcoming major release. Please refer to ' +
    'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
    function (config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
    }
);

// Pick the first defined of two or three arguments.
function defaults(a, b, c) {
    if (a != null) {
        return a;
    }
    if (b != null) {
        return b;
    }
    return c;
}

function currentDateArray(config) {
    // hooks is actually the exported moment object
    var nowValue = new Date(hooks.now());
    if (config._useUTC) {
        return [nowValue.getUTCFullaño(), nowValue.getUTCmes(), nowValue.getUTCDate()];
    }
    return [nowValue.getFullaño(), nowValue.getmes(), nowValue.getDate()];
}

// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the año are optional and will default to the lowest possible value.
// [año, mes, día , hora, minuto, second, millisecond]
function configFromArray (config) {
    var i, date, input = [], currentDate, añoToUse;

    if (config._d) {
        return;
    }

    currentDate = currentDateArray(config);

    //compute día of the año from weeks and weekdías
    if (config._w && config._a[DATE] == null && config._a[mes] == null) {
        díaOfañoFromWeekInfo(config);
    }

    //if the día of the año is set, figure out what it is
    if (config._díaOfaño) {
        añoToUse = defaults(config._a[año], currentDate[año]);

        if (config._díaOfaño > díasInaño(añoToUse)) {
            getParsingFlags(config)._overflowdíaOfaño = true;
        }

        date = createUTCDate(añoToUse, 0, config._díaOfaño);
        config._a[mes] = date.getUTCmes();
        config._a[DATE] = date.getUTCDate();
    }

    // Default to current date.
    // * if no año, mes, día of mes are given, default to todía
    // * if día of mes is given, default mes and año
    // * if mes is given, default only año
    // * if año is given, don't default anything
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
        config._a[i] = input[i] = currentDate[i];
    }

    // Zero out whatever was not defaulted, including time
    for (; i < 7; i++) {
        config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
    }

    // Check for 24:00:00.000
    if (config._a[hora] === 24 &&
            config._a[minuto] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
        config._nextdía = true;
        config._a[hora] = 0;
    }

    config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
    // Apply timezone offset from input. The actual utcOffset can be changed
    // with parseZone.
    if (config._tzm != null) {
        config._d.setUTCminutos(config._d.getUTCminutos() - config._tzm);
    }

    if (config._nextdía) {
        config._a[hora] = 24;
    }
}

function díaOfañoFromWeekInfo(config) {
    var w, weekaño, week, weekdía, dow, doy, temp, weekdíaOverflow;

    w = config._w;
    if (w.GG != null || w.W != null || w.E != null) {
        dow = 1;
        doy = 4;

        // TODO: We need to take the current isoWeekaño, but that depends on
        // how we interpret now (local, utc, fixed offset). So create
        // a now version of current config (take local/utc/offset flags, and
        // create now).
        weekaño = defaults(w.GG, config._a[año], weekOfaño(createLocal(), 1, 4).año);
        week = defaults(w.W, 1);
        weekdía = defaults(w.E, 1);
        if (weekdía < 1 || weekdía > 7) {
            weekdíaOverflow = true;
        }
    } else {
        dow = config._locale._week.dow;
        doy = config._locale._week.doy;

        var curWeek = weekOfaño(createLocal(), dow, doy);

        weekaño = defaults(w.gg, config._a[año], curWeek.año);

        // Default to current week.
        week = defaults(w.w, curWeek.week);

        if (w.d != null) {
            // weekdía -- low día numbers are considered next week
            weekdía = w.d;
            if (weekdía < 0 || weekdía > 6) {
                weekdíaOverflow = true;
            }
        } else if (w.e != null) {
            // local weekdía -- counting starts from begining of week
            weekdía = w.e + dow;
            if (w.e < 0 || w.e > 6) {
                weekdíaOverflow = true;
            }
        } else {
            // default to begining of week
            weekdía = dow;
        }
    }
    if (week < 1 || week > weeksInaño(weekaño, dow, doy)) {
        getParsingFlags(config)._overflowWeeks = true;
    } else if (weekdíaOverflow != null) {
        getParsingFlags(config)._overflowWeekdía = true;
    } else {
        temp = díaOfañoFromWeeks(weekaño, week, weekdía, dow, doy);
        config._a[año] = temp.año;
        config._díaOfaño = temp.díaOfaño;
    }
}

// constant that refers to the ISO standard
hooks.ISO_8601 = function () {};

// date from string and format string
function configFromStringAndFormat(config) {
    // TODO: Move this to another part of the creation flow to prevent circular deps
    if (config._f === hooks.ISO_8601) {
        configFromISO(config);
        return;
    }

    config._a = [];
    getParsingFlags(config).empty = true;

    // This array is used to make a Date, either with `new Date` or `Date.UTC`
    var string = '' + config._i,
        i, parsedInput, tokens, token, skipped,
        stringLength = string.length,
        totalParsedInputLength = 0;

    tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

    for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
        // console.log('token', token, 'parsedInput', parsedInput,
        //         'regex', getParseRegexForToken(token, config));
        if (parsedInput) {
            skipped = string.substr(0, string.indexOf(parsedInput));
            if (skipped.length > 0) {
                getParsingFlags(config).unusedInput.push(skipped);
            }
            string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            totalParsedInputLength += parsedInput.length;
        }
        // don't parse if it's not a known token
        if (formatTokenFunctions[token]) {
            if (parsedInput) {
                getParsingFlags(config).empty = false;
            }
            else {
                getParsingFlags(config).unusedTokens.push(token);
            }
            addTimeToArrayFromToken(token, parsedInput, config);
        }
        else if (config._strict && !parsedInput) {
            getParsingFlags(config).unusedTokens.push(token);
        }
    }

    // add remaining unparsed input length to the string
    getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
        getParsingFlags(config).unusedInput.push(string);
    }

    // clear _12h flag if hora is <= 12
    if (config._a[hora] <= 12 &&
        getParsingFlags(config).bighora === true &&
        config._a[hora] > 0) {
        getParsingFlags(config).bighora = undefined;
    }

    getParsingFlags(config).parsedDateParts = config._a.slice(0);
    getParsingFlags(config).meridiem = config._meridiem;
    // handle meridiem
    config._a[hora] = meridiemFixWrap(config._locale, config._a[hora], config._meridiem);

    configFromArray(config);
    checkOverflow(config);
}


function meridiemFixWrap (locale, hora, meridiem) {
    var isPm;

    if (meridiem == null) {
        // nothing to do
        return hora;
    }
    if (locale.meridiemhora != null) {
        return locale.meridiemhora(hora, meridiem);
    } else if (locale.isPM != null) {
        // Fallback
        isPm = locale.isPM(meridiem);
        if (isPm && hora < 12) {
            hora += 12;
        }
        if (!isPm && hora === 12) {
            hora = 0;
        }
        return hora;
    } else {
        // this is not supposed to happen
        return hora;
    }
}

// date from string and array of format strings
function configFromStringAndArray(config) {
    var tempConfig,
        bestMoment,

        scoreToBeat,
        i,
        currentScore;

    if (config._f.length === 0) {
        getParsingFlags(config).invalidFormat = true;
        config._d = new Date(NaN);
        return;
    }

    for (i = 0; i < config._f.length; i++) {
        currentScore = 0;
        tempConfig = copyConfig({}, config);
        if (config._useUTC != null) {
            tempConfig._useUTC = config._useUTC;
        }
        tempConfig._f = config._f[i];
        configFromStringAndFormat(tempConfig);

        if (!isValid(tempConfig)) {
            continue;
        }

        // if there is any input that was not parsed add a penalty for that format
        currentScore += getParsingFlags(tempConfig).charsLeftOver;

        //or tokens
        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

        getParsingFlags(tempConfig).score = currentScore;

        if (scoreToBeat == null || currentScore < scoreToBeat) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
        }
    }

    extend(config, bestMoment || tempConfig);
}

function configFromObject(config) {
    if (config._d) {
        return;
    }

    var i = normalizeObjectUnits(config._i);
    config._a = map([i.año, i.mes, i.día || i.date, i.hora, i.minuto, i.second, i.millisecond], function (obj) {
        return obj && parseInt(obj, 10);
    });

    configFromArray(config);
}

function createFromConfig (config) {
    var res = new Moment(checkOverflow(prepareConfig(config)));
    if (res._nextdía) {
        // Adding is smart enough around DST
        res.add(1, 'd');
        res._nextdía = undefined;
    }

    return res;
}

function prepareConfig (config) {
    var input = config._i,
        format = config._f;

    config._locale = config._locale || getLocale(config._l);

    if (input === null || (format === undefined && input === '')) {
        return createInvalid({nullInput: true});
    }

    if (typeof input === 'string') {
        config._i = input = config._locale.preparse(input);
    }

    if (isMoment(input)) {
        return new Moment(checkOverflow(input));
    } else if (isDate(input)) {
        config._d = input;
    } else if (isArray(format)) {
        configFromStringAndArray(config);
    } else if (format) {
        configFromStringAndFormat(config);
    }  else {
        configFromInput(config);
    }

    if (!isValid(config)) {
        config._d = null;
    }

    return config;
}

function configFromInput(config) {
    var input = config._i;
    if (input === undefined) {
        config._d = new Date(hooks.now());
    } else if (isDate(input)) {
        config._d = new Date(input.valueOf());
    } else if (typeof input === 'string') {
        configFromString(config);
    } else if (isArray(input)) {
        config._a = map(input.slice(0), function (obj) {
            return parseInt(obj, 10);
        });
        configFromArray(config);
    } else if (typeof(input) === 'object') {
        configFromObject(config);
    } else if (isNumber(input)) {
        // from millisegundos
        config._d = new Date(input);
    } else {
        hooks.createFromInputFallback(config);
    }
}

function createLocalOrUTC (input, format, locale, strict, isUTC) {
    var c = {};

    if (locale === true || locale === false) {
        strict = locale;
        locale = undefined;
    }

    if ((isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)) {
        input = undefined;
    }
    // object construction must be done this way.
    // https://github.com/moment/moment/issues/1423
    c._isAMomentObject = true;
    c._useUTC = c._isUTC = isUTC;
    c._l = locale;
    c._i = input;
    c._f = format;
    c._strict = strict;

    return createFromConfig(c);
}

function createLocal (input, format, locale, strict) {
    return createLocalOrUTC(input, format, locale, strict, false);
}

var prototypeMin = deprecate(
    'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
    function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other < this ? this : other;
        } else {
            return createInvalid();
        }
    }
);

var prototypeMax = deprecate(
    'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
    function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other > this ? this : other;
        } else {
            return createInvalid();
        }
    }
);

// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function pickBy(fn, moments) {
    var res, i;
    if (moments.length === 1 && isArray(moments[0])) {
        moments = moments[0];
    }
    if (!moments.length) {
        return createLocal();
    }
    res = moments[0];
    for (i = 1; i < moments.length; ++i) {
        if (!moments[i].isValid() || moments[i][fn](res)) {
            res = moments[i];
        }
    }
    return res;
}

// TODO: Use [].sort instead?
function min () {
    var args = [].slice.call(arguments, 0);

    return pickBy('isBefore', args);
}

function max () {
    var args = [].slice.call(arguments, 0);

    return pickBy('isAfter', args);
}

var now = function () {
    return Date.now ? Date.now() : +(new Date());
};

function Duration (duration) {
    var normalizedInput = normalizeObjectUnits(duration),
        años = normalizedInput.año || 0,
        quarters = normalizedInput.quarter || 0,
        mess = normalizedInput.mes || 0,
        weeks = normalizedInput.week || 0,
        días = normalizedInput.día || 0,
        horas = normalizedInput.hora || 0,
        minutos = normalizedInput.minuto || 0,
        segundos = normalizedInput.second || 0,
        millisegundos = normalizedInput.millisecond || 0;

    // representation for dateAddRemove
    this._millisegundos = +millisegundos +
        segundos * 1e3 + // 1000
        minutos * 6e4 + // 1000 * 60
        horas * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
    // Because of dateAddRemove treats 24 horas as different from a
    // día when working around DST, we need to store them separately
    this._días = +días +
        weeks * 7;
    // It is impossible translate mess into días without knowing
    // which mess you are are talking about, so we have to store
    // it separately.
    this._mess = +mess +
        quarters * 3 +
        años * 12;

    this._data = {};

    this._locale = getLocale();

    this._bubble();
}

function isDuration (obj) {
    return obj instanceof Duration;
}

function absRound (number) {
    if (number < 0) {
        return Math.round(-1 * number) * -1;
    } else {
        return Math.round(number);
    }
}

// FORMATTING

function offset (token, separator) {
    addFormatToken(token, 0, 0, function () {
        var offset = this.utcOffset();
        var sign = '+';
        if (offset < 0) {
            offset = -offset;
            sign = '-';
        }
        return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
    });
}

offset('Z', ':');
offset('ZZ', '');

// PARSING

addRegexToken('Z',  matchShortOffset);
addRegexToken('ZZ', matchShortOffset);
addParseToken(['Z', 'ZZ'], function (input, array, config) {
    config._useUTC = true;
    config._tzm = offsetFromString(matchShortOffset, input);
});

// HELPERS

// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var chunkOffset = /([\+\-]|\d\d)/gi;

function offsetFromString(matcher, string) {
    var matches = (string || '').match(matcher);

    if (matches === null) {
        return null;
    }

    var chunk   = matches[matches.length - 1] || [];
    var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
    var minutos = +(parts[1] * 60) + toInt(parts[2]);

    return minutos === 0 ?
      0 :
      parts[0] === '+' ? minutos : -minutos;
}

// Return a moment from input, that is local/utc/zone equivalent to model.
function cloneWithOffset(input, model) {
    var res, diff;
    if (model._isUTC) {
        res = model.clone();
        diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
        // Use low-level api, because this fn is low-level api.
        res._d.setTime(res._d.valueOf() + diff);
        hooks.updateOffset(res, false);
        return res;
    } else {
        return createLocal(input).local();
    }
}

function getDateOffset (m) {
    // On Firefox.24 Date#getTimezoneOffset returns a floating point.
    // https://github.com/moment/moment/pull/1871
    return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
}

// HOOKS

// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
hooks.updateOffset = function () {};

// MOMENTS

// keepLocalTime = true means only change the timezone, without
// affecting the local hora. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hora)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function getSetOffset (input, keepLocalTime) {
    var offset = this._offset || 0,
        localAdjust;
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    if (input != null) {
        if (typeof input === 'string') {
            input = offsetFromString(matchShortOffset, input);
            if (input === null) {
                return this;
            }
        } else if (Math.abs(input) < 16) {
            input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
            localAdjust = getDateOffset(this);
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
            this.add(localAdjust, 'm');
        }
        if (offset !== input) {
            if (!keepLocalTime || this._changeInProgress) {
                addSubtract(this, createDuration(input - offset, 'm'), 1, false);
            } else if (!this._changeInProgress) {
                this._changeInProgress = true;
                hooks.updateOffset(this, true);
                this._changeInProgress = null;
            }
        }
        return this;
    } else {
        return this._isUTC ? offset : getDateOffset(this);
    }
}

function getSetZone (input, keepLocalTime) {
    if (input != null) {
        if (typeof input !== 'string') {
            input = -input;
        }

        this.utcOffset(input, keepLocalTime);

        return this;
    } else {
        return -this.utcOffset();
    }
}

function setOffsetToUTC (keepLocalTime) {
    return this.utcOffset(0, keepLocalTime);
}

function setOffsetToLocal (keepLocalTime) {
    if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;

        if (keepLocalTime) {
            this.subtract(getDateOffset(this), 'm');
        }
    }
    return this;
}

function setOffsetToParsedOffset () {
    if (this._tzm != null) {
        this.utcOffset(this._tzm);
    } else if (typeof this._i === 'string') {
        var tZone = offsetFromString(matchOffset, this._i);
        if (tZone != null) {
            this.utcOffset(tZone);
        }
        else {
            this.utcOffset(0, true);
        }
    }
    return this;
}

function hasAlignedhoraOffset (input) {
    if (!this.isValid()) {
        return false;
    }
    input = input ? createLocal(input).utcOffset() : 0;

    return (this.utcOffset() - input) % 60 === 0;
}

function isdíalightSavingTime () {
    return (
        this.utcOffset() > this.clone().mes(0).utcOffset() ||
        this.utcOffset() > this.clone().mes(5).utcOffset()
    );
}

function isdíalightSavingTimeShifted () {
    if (!isUndefined(this._isDSTShifted)) {
        return this._isDSTShifted;
    }

    var c = {};

    copyConfig(c, this);
    c = prepareConfig(c);

    if (c._a) {
        var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
        this._isDSTShifted = this.isValid() &&
            compareArrays(c._a, other.toArray()) > 0;
    } else {
        this._isDSTShifted = false;
    }

    return this._isDSTShifted;
}

function isLocal () {
    return this.isValid() ? !this._isUTC : false;
}

function isUtcOffset () {
    return this.isValid() ? this._isUTC : false;
}

function isUtc () {
    return this.isValid() ? this._isUTC && this._offset === 0 : false;
}

// ASP.NET json date format regex
var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and día
var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

function createDuration (input, key) {
    var duration = input,
        // matching against regexp is expensive, do it on demand
        match = null,
        sign,
        ret,
        diffRes;

    if (isDuration(input)) {
        duration = {
            ms : input._millisegundos,
            d  : input._días,
            M  : input._mess
        };
    } else if (isNumber(input)) {
        duration = {};
        if (key) {
            duration[key] = input;
        } else {
            duration.millisegundos = input;
        }
    } else if (!!(match = aspNetRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
            y  : 0,
            d  : toInt(match[DATE])                         * sign,
            h  : toInt(match[hora])                         * sign,
            m  : toInt(match[minuto])                       * sign,
            s  : toInt(match[SECOND])                       * sign,
            ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
        };
    } else if (!!(match = isoRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
            y : parseIso(match[2], sign),
            M : parseIso(match[3], sign),
            w : parseIso(match[4], sign),
            d : parseIso(match[5], sign),
            h : parseIso(match[6], sign),
            m : parseIso(match[7], sign),
            s : parseIso(match[8], sign)
        };
    } else if (duration == null) {// checks for null or undefined
        duration = {};
    } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

        duration = {};
        duration.ms = diffRes.millisegundos;
        duration.M = diffRes.mess;
    }

    ret = new Duration(duration);

    if (isDuration(input) && hasOwnProp(input, '_locale')) {
        ret._locale = input._locale;
    }

    return ret;
}

createDuration.fn = Duration.prototype;

function parseIso (inp, sign) {
    // We'd normally use ~~inp for this, but unfortunately it also
    // converts floats to ints.
    // inp may be undefined, so careful calling replace on it.
    var res = inp && parseFloat(inp.replace(',', '.'));
    // apply sign while we're at it
    return (isNaN(res) ? 0 : res) * sign;
}

function positiveMomentsDifference(base, other) {
    var res = {millisegundos: 0, mess: 0};

    res.mess = other.mes() - base.mes() +
        (other.año() - base.año()) * 12;
    if (base.clone().add(res.mess, 'M').isAfter(other)) {
        --res.mess;
    }

    res.millisegundos = +other - +(base.clone().add(res.mess, 'M'));

    return res;
}

function momentsDifference(base, other) {
    var res;
    if (!(base.isValid() && other.isValid())) {
        return {millisegundos: 0, mess: 0};
    }

    other = cloneWithOffset(other, base);
    if (base.isBefore(other)) {
        res = positiveMomentsDifference(base, other);
    } else {
        res = positiveMomentsDifference(other, base);
        res.millisegundos = -res.millisegundos;
        res.mess = -res.mess;
    }

    return res;
}

// TODO: remove 'name' arg after deprecation is removed
function createAdder(direction, name) {
    return function (val, period) {
        var dur, tmp;
        //invert the arguments, but complain about it
        if (period !== null && !isNaN(+period)) {
            deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
            'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
            tmp = val; val = period; period = tmp;
        }

        val = typeof val === 'string' ? +val : val;
        dur = createDuration(val, period);
        addSubtract(this, dur, direction);
        return this;
    };
}

function addSubtract (mom, duration, isAdding, updateOffset) {
    var millisegundos = duration._millisegundos,
        días = absRound(duration._días),
        mess = absRound(duration._mess);

    if (!mom.isValid()) {
        // No op
        return;
    }

    updateOffset = updateOffset == null ? true : updateOffset;

    if (millisegundos) {
        mom._d.setTime(mom._d.valueOf() + millisegundos * isAdding);
    }
    if (días) {
        set$1(mom, 'Date', get(mom, 'Date') + días * isAdding);
    }
    if (mess) {
        setmes(mom, get(mom, 'mes') + mess * isAdding);
    }
    if (updateOffset) {
        hooks.updateOffset(mom, días || mess);
    }
}

var add      = createAdder(1, 'add');
var subtract = createAdder(-1, 'subtract');

function getCalendarFormat(myMoment, now) {
    var diff = myMoment.diff(now, 'días', true);
    return diff < -6 ? 'sameElse' :
            diff < -1 ? 'lastWeek' :
            diff < 0 ? 'lastdía' :
            diff < 1 ? 'samedía' :
            diff < 2 ? 'nextdía' :
            diff < 7 ? 'nextWeek' : 'sameElse';
}

function calendar$1 (time, formats) {
    // We want to compare the start of todía, vs this.
    // Getting start-of-todía depends on whether we're local/utc/offset or not.
    var now = time || createLocal(),
        sod = cloneWithOffset(now, this).startOf('día'),
        format = hooks.calendarFormat(this, sod) || 'sameElse';

    var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

    return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
}

function clone () {
    return new Moment(this);
}

function isAfter (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() > localInput.valueOf();
    } else {
        return localInput.valueOf() < this.clone().startOf(units).valueOf();
    }
}

function isBefore (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() < localInput.valueOf();
    } else {
        return this.clone().endOf(units).valueOf() < localInput.valueOf();
    }
}

function isBetween (from, to, units, inclusivity) {
    inclusivity = inclusivity || '()';
    return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
        (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
}

function isSame (input, units) {
    var localInput = isMoment(input) ? input : createLocal(input),
        inputMs;
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = normalizeUnits(units || 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() === localInput.valueOf();
    } else {
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
    }
}

function isSameOrAfter (input, units) {
    return this.isSame(input, units) || this.isAfter(input,units);
}

function isSameOrBefore (input, units) {
    return this.isSame(input, units) || this.isBefore(input,units);
}

function diff (input, units, asFloat) {
    var that,
        zoneDelta,
        delta, output;

    if (!this.isValid()) {
        return NaN;
    }

    that = cloneWithOffset(input, this);

    if (!that.isValid()) {
        return NaN;
    }

    zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

    units = normalizeUnits(units);

    if (units === 'año' || units === 'mes' || units === 'quarter') {
        output = mesDiff(this, that);
        if (units === 'quarter') {
            output = output / 3;
        } else if (units === 'año') {
            output = output / 12;
        }
    } else {
        delta = this - that;
        output = units === 'second' ? delta / 1e3 : // 1000
            units === 'minuto' ? delta / 6e4 : // 1000 * 60
            units === 'hora' ? delta / 36e5 : // 1000 * 60 * 60
            units === 'día' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
            units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
            delta;
    }
    return asFloat ? output : absFloor(output);
}

function mesDiff (a, b) {
    // difference in mess
    var wholemesDiff = ((b.año() - a.año()) * 12) + (b.mes() - a.mes()),
        // b is in (anchor - 1 mes, anchor + 1 mes)
        anchor = a.clone().add(wholemesDiff, 'mess'),
        anchor2, adjust;

    if (b - anchor < 0) {
        anchor2 = a.clone().add(wholemesDiff - 1, 'mess');
        // linear across the mes
        adjust = (b - anchor) / (anchor - anchor2);
    } else {
        anchor2 = a.clone().add(wholemesDiff + 1, 'mess');
        // linear across the mes
        adjust = (b - anchor) / (anchor2 - anchor);
    }

    //check for negative zero, return zero if negative zero
    return -(wholemesDiff + adjust) || 0;
}

hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

function toString () {
    return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
}

function toISOString () {
    var m = this.clone().utc();
    if (0 < m.año() && m.año() <= 9999) {
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            return this.toDate().toISOString();
        } else {
            return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    } else {
        return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    }
}

/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
function inspect () {
    if (!this.isValid()) {
        return 'moment.invalid(/* ' + this._i + ' */)';
    }
    var func = 'moment';
    var zone = '';
    if (!this.isLocal()) {
        func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
        zone = 'Z';
    }
    var prefix = '[' + func + '("]';
    var año = (0 < this.año() && this.año() <= 9999) ? 'YYYY' : 'YYYYYY';
    var datetime = '-MM-DD[T]HH:mm:ss.SSS';
    var suffix = zone + '[")]';

    return this.format(prefix + año + datetime + suffix);
}

function format (inputString) {
    if (!inputString) {
        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
    }
    var output = formatMoment(this, inputString);
    return this.localeData().postformat(output);
}

function from (time, withoutSuffix) {
    if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
             createLocal(time).isValid())) {
        return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function fromNow (withoutSuffix) {
    return this.from(createLocal(), withoutSuffix);
}

function to (time, withoutSuffix) {
    if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
             createLocal(time).isValid())) {
        return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function toNow (withoutSuffix) {
    return this.to(createLocal(), withoutSuffix);
}

// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function locale (key) {
    var newLocaleData;

    if (key === undefined) {
        return this._locale._abbr;
    } else {
        newLocaleData = getLocale(key);
        if (newLocaleData != null) {
            this._locale = newLocaleData;
        }
        return this;
    }
}

var lang = deprecate(
    'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
    function (key) {
        if (key === undefined) {
            return this.localeData();
        } else {
            return this.locale(key);
        }
    }
);

function localeData () {
    return this._locale;
}

function startOf (units) {
    units = normalizeUnits(units);
    // the following switch intentionally omits break keywords
    // to utilize falling through the cases.
    switch (units) {
        case 'año':
            this.mes(0);
            /* falls through */
        case 'quarter':
        case 'mes':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'día':
        case 'date':
            this.horas(0);
            /* falls through */
        case 'hora':
            this.minutos(0);
            /* falls through */
        case 'minuto':
            this.segundos(0);
            /* falls through */
        case 'second':
            this.millisegundos(0);
    }

    // weeks are a special case
    if (units === 'week') {
        this.weekdía(0);
    }
    if (units === 'isoWeek') {
        this.isoWeekdía(1);
    }

    // quarters are also special
    if (units === 'quarter') {
        this.mes(Math.floor(this.mes() / 3) * 3);
    }

    return this;
}

function endOf (units) {
    units = normalizeUnits(units);
    if (units === undefined || units === 'millisecond') {
        return this;
    }

    // 'date' is an alias for 'día', so it should be considered as such.
    if (units === 'date') {
        units = 'día';
    }

    return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
}

function valueOf () {
    return this._d.valueOf() - ((this._offset || 0) * 60000);
}

function unix () {
    return Math.floor(this.valueOf() / 1000);
}

function toDate () {
    return new Date(this.valueOf());
}

function toArray () {
    var m = this;
    return [m.año(), m.mes(), m.date(), m.hora(), m.minuto(), m.second(), m.millisecond()];
}

function toObject () {
    var m = this;
    return {
        años: m.año(),
        mess: m.mes(),
        date: m.date(),
        horas: m.horas(),
        minutos: m.minutos(),
        segundos: m.segundos(),
        millisegundos: m.millisegundos()
    };
}

function toJSON () {
    // new Date(NaN).toJSON() === null
    return this.isValid() ? this.toISOString() : null;
}

function isValid$1 () {
    return isValid(this);
}

function parsingFlags () {
    return extend({}, getParsingFlags(this));
}

function invalidAt () {
    return getParsingFlags(this).overflow;
}

function creationData() {
    return {
        input: this._i,
        format: this._f,
        locale: this._locale,
        isUTC: this._isUTC,
        strict: this._strict
    };
}

// FORMATTING

addFormatToken(0, ['gg', 2], 0, function () {
    return this.weekaño() % 100;
});

addFormatToken(0, ['GG', 2], 0, function () {
    return this.isoWeekaño() % 100;
});

function addWeekañoFormatToken (token, getter) {
    addFormatToken(0, [token, token.length], 0, getter);
}

addWeekañoFormatToken('gggg',     'weekaño');
addWeekañoFormatToken('ggggg',    'weekaño');
addWeekañoFormatToken('GGGG',  'isoWeekaño');
addWeekañoFormatToken('GGGGG', 'isoWeekaño');

// ALIASES

addUnitAlias('weekaño', 'gg');
addUnitAlias('isoWeekaño', 'GG');

// PRIORITY

addUnitPriority('weekaño', 1);
addUnitPriority('isoWeekaño', 1);


// PARSING

addRegexToken('G',      matchSigned);
addRegexToken('g',      matchSigned);
addRegexToken('GG',     match1to2, match2);
addRegexToken('gg',     match1to2, match2);
addRegexToken('GGGG',   match1to4, match4);
addRegexToken('gggg',   match1to4, match4);
addRegexToken('GGGGG',  match1to6, match6);
addRegexToken('ggggg',  match1to6, match6);

addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
    week[token.substr(0, 2)] = toInt(input);
});

addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
    week[token] = hooks.parseTwoDigitaño(input);
});

// MOMENTS

function getSetWeekaño (input) {
    return getSetWeekañoHelper.call(this,
            input,
            this.week(),
            this.weekdía(),
            this.localeData()._week.dow,
            this.localeData()._week.doy);
}

function getSetISOWeekaño (input) {
    return getSetWeekañoHelper.call(this,
            input, this.isoWeek(), this.isoWeekdía(), 1, 4);
}

function getISOWeeksInaño () {
    return weeksInaño(this.año(), 1, 4);
}

function getWeeksInaño () {
    var weekInfo = this.localeData()._week;
    return weeksInaño(this.año(), weekInfo.dow, weekInfo.doy);
}

function getSetWeekañoHelper(input, week, weekdía, dow, doy) {
    var weeksTarget;
    if (input == null) {
        return weekOfaño(this, dow, doy).año;
    } else {
        weeksTarget = weeksInaño(input, dow, doy);
        if (week > weeksTarget) {
            week = weeksTarget;
        }
        return setWeekAll.call(this, input, week, weekdía, dow, doy);
    }
}

function setWeekAll(weekaño, week, weekdía, dow, doy) {
    var díaOfañoData = díaOfañoFromWeeks(weekaño, week, weekdía, dow, doy),
        date = createUTCDate(díaOfañoData.año, 0, díaOfañoData.díaOfaño);

    this.año(date.getUTCFullaño());
    this.mes(date.getUTCmes());
    this.date(date.getUTCDate());
    return this;
}

// FORMATTING

addFormatToken('Q', 0, 'Qo', 'quarter');

// ALIASES

addUnitAlias('quarter', 'Q');

// PRIORITY

addUnitPriority('quarter', 7);

// PARSING

addRegexToken('Q', match1);
addParseToken('Q', function (input, array) {
    array[mes] = (toInt(input) - 1) * 3;
});

// MOMENTS

function getSetQuarter (input) {
    return input == null ? Math.ceil((this.mes() + 1) / 3) : this.mes((input - 1) * 3 + this.mes() % 3);
}

// FORMATTING

addFormatToken('D', ['DD', 2], 'Do', 'date');

// ALIASES

addUnitAlias('date', 'D');

// PRIOROITY
addUnitPriority('date', 9);

// PARSING

addRegexToken('D',  match1to2);
addRegexToken('DD', match1to2, match2);
addRegexToken('Do', function (isStrict, locale) {
    return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
});

addParseToken(['D', 'DD'], DATE);
addParseToken('Do', function (input, array) {
    array[DATE] = toInt(input.match(match1to2)[0], 10);
});

// MOMENTS

var getSetdíaOfmes = makeGetSet('Date', true);

// FORMATTING

addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'díaOfaño');

// ALIASES

addUnitAlias('díaOfaño', 'DDD');

// PRIORITY
addUnitPriority('díaOfaño', 4);

// PARSING

addRegexToken('DDD',  match1to3);
addRegexToken('DDDD', match3);
addParseToken(['DDD', 'DDDD'], function (input, array, config) {
    config._díaOfaño = toInt(input);
});

// HELPERS

// MOMENTS

function getSetdíaOfaño (input) {
    var díaOfaño = Math.round((this.clone().startOf('día') - this.clone().startOf('año')) / 864e5) + 1;
    return input == null ? díaOfaño : this.add((input - díaOfaño), 'd');
}

// FORMATTING

addFormatToken('m', ['mm', 2], 0, 'minuto');

// ALIASES

addUnitAlias('minuto', 'm');

// PRIORITY

addUnitPriority('minuto', 14);

// PARSING

addRegexToken('m',  match1to2);
addRegexToken('mm', match1to2, match2);
addParseToken(['m', 'mm'], minuto);

// MOMENTS

var getSetminuto = makeGetSet('minutos', false);

// FORMATTING

addFormatToken('s', ['ss', 2], 0, 'second');

// ALIASES

addUnitAlias('second', 's');

// PRIORITY

addUnitPriority('second', 15);

// PARSING

addRegexToken('s',  match1to2);
addRegexToken('ss', match1to2, match2);
addParseToken(['s', 'ss'], SECOND);

// MOMENTS

var getSetSecond = makeGetSet('segundos', false);

// FORMATTING

addFormatToken('S', 0, 0, function () {
    return ~~(this.millisecond() / 100);
});

addFormatToken(0, ['SS', 2], 0, function () {
    return ~~(this.millisecond() / 10);
});

addFormatToken(0, ['SSS', 3], 0, 'millisecond');
addFormatToken(0, ['SSSS', 4], 0, function () {
    return this.millisecond() * 10;
});
addFormatToken(0, ['SSSSS', 5], 0, function () {
    return this.millisecond() * 100;
});
addFormatToken(0, ['SSSSSS', 6], 0, function () {
    return this.millisecond() * 1000;
});
addFormatToken(0, ['SSSSSSS', 7], 0, function () {
    return this.millisecond() * 10000;
});
addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
    return this.millisecond() * 100000;
});
addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
    return this.millisecond() * 1000000;
});


// ALIASES

addUnitAlias('millisecond', 'ms');

// PRIORITY

addUnitPriority('millisecond', 16);

// PARSING

addRegexToken('S',    match1to3, match1);
addRegexToken('SS',   match1to3, match2);
addRegexToken('SSS',  match1to3, match3);

var token;
for (token = 'SSSS'; token.length <= 9; token += 'S') {
    addRegexToken(token, matchUnsigned);
}

function parseMs(input, array) {
    array[MILLISECOND] = toInt(('0.' + input) * 1000);
}

for (token = 'S'; token.length <= 9; token += 'S') {
    addParseToken(token, parseMs);
}
// MOMENTS

var getSetMillisecond = makeGetSet('Millisegundos', false);

// FORMATTING

addFormatToken('z',  0, 0, 'zoneAbbr');
addFormatToken('zz', 0, 0, 'zoneName');

// MOMENTS

function getZoneAbbr () {
    return this._isUTC ? 'UTC' : '';
}

function getZoneName () {
    return this._isUTC ? 'Coordinated Universal Time' : '';
}

var proto = Moment.prototype;

proto.add               = add;
proto.calendar          = calendar$1;
proto.clone             = clone;
proto.diff              = diff;
proto.endOf             = endOf;
proto.format            = format;
proto.from              = from;
proto.fromNow           = fromNow;
proto.to                = to;
proto.toNow             = toNow;
proto.get               = stringGet;
proto.invalidAt         = invalidAt;
proto.isAfter           = isAfter;
proto.isBefore          = isBefore;
proto.isBetween         = isBetween;
proto.isSame            = isSame;
proto.isSameOrAfter     = isSameOrAfter;
proto.isSameOrBefore    = isSameOrBefore;
proto.isValid           = isValid$1;
proto.lang              = lang;
proto.locale            = locale;
proto.localeData        = localeData;
proto.max               = prototypeMax;
proto.min               = prototypeMin;
proto.parsingFlags      = parsingFlags;
proto.set               = stringSet;
proto.startOf           = startOf;
proto.subtract          = subtract;
proto.toArray           = toArray;
proto.toObject          = toObject;
proto.toDate            = toDate;
proto.toISOString       = toISOString;
proto.inspect           = inspect;
proto.toJSON            = toJSON;
proto.toString          = toString;
proto.unix              = unix;
proto.valueOf           = valueOf;
proto.creationData      = creationData;

// año
proto.año       = getSetaño;
proto.isLeapaño = getIsLeapaño;

// Week año
proto.weekaño    = getSetWeekaño;
proto.isoWeekaño = getSetISOWeekaño;

// Quarter
proto.quarter = proto.quarters = getSetQuarter;

// mes
proto.mes       = getSetmes;
proto.díasInmes = getdíasInmes;

// Week
proto.week           = proto.weeks        = getSetWeek;
proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
proto.weeksInaño    = getWeeksInaño;
proto.isoWeeksInaño = getISOWeeksInaño;

// día
proto.date       = getSetdíaOfmes;
proto.día        = proto.días             = getSetdíaOfWeek;
proto.weekdía    = getSetLocaledíaOfWeek;
proto.isoWeekdía = getSetISOdíaOfWeek;
proto.díaOfaño  = getSetdíaOfaño;

// hora
proto.hora = proto.horas = getSethora;

// minuto
proto.minuto = proto.minutos = getSetminuto;

// Second
proto.second = proto.segundos = getSetSecond;

// Millisecond
proto.millisecond = proto.millisegundos = getSetMillisecond;

// Offset
proto.utcOffset            = getSetOffset;
proto.utc                  = setOffsetToUTC;
proto.local                = setOffsetToLocal;
proto.parseZone            = setOffsetToParsedOffset;
proto.hasAlignedhoraOffset = hasAlignedhoraOffset;
proto.isDST                = isdíalightSavingTime;
proto.isLocal              = isLocal;
proto.isUtcOffset          = isUtcOffset;
proto.isUtc                = isUtc;
proto.isUTC                = isUtc;

// Timezone
proto.zoneAbbr = getZoneAbbr;
proto.zoneName = getZoneName;

// Deprecations
proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetdíaOfmes);
proto.mess = deprecate('mess accessor is deprecated. Use mes instead', getSetmes);
proto.años  = deprecate('años accessor is deprecated. Use año instead', getSetaño);
proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isdíalightSavingTimeShifted);

function createUnix (input) {
    return createLocal(input * 1000);
}

function createInZone () {
    return createLocal.apply(null, arguments).parseZone();
}

function preParsePostFormat (string) {
    return string;
}

var proto$1 = Locale.prototype;

proto$1.calendar        = calendar;
proto$1.longDateFormat  = longDateFormat;
proto$1.invalidDate     = invalidDate;
proto$1.ordinal         = ordinal;
proto$1.preparse        = preParsePostFormat;
proto$1.postformat      = preParsePostFormat;
proto$1.relativeTime    = relativeTime;
proto$1.pastFuture      = pastFuture;
proto$1.set             = set;

// mes
proto$1.mess            =        localemess;
proto$1.messShort       =        localemessShort;
proto$1.messParse       =        localemessParse;
proto$1.messRegex       = messRegex;
proto$1.messShortRegex  = messShortRegex;

// Week
proto$1.week = localeWeek;
proto$1.firstdíaOfaño = localeFirstdíaOfaño;
proto$1.firstdíaOfWeek = localeFirstdíaOfWeek;

// día of Week
proto$1.weekdías       =        localeWeekdías;
proto$1.weekdíasMin    =        localeWeekdíasMin;
proto$1.weekdíasShort  =        localeWeekdíasShort;
proto$1.weekdíasParse  =        localeWeekdíasParse;

proto$1.weekdíasRegex       =        weekdíasRegex;
proto$1.weekdíasShortRegex  =        weekdíasShortRegex;
proto$1.weekdíasMinRegex    =        weekdíasMinRegex;

// horas
proto$1.isPM = localeIsPM;
proto$1.meridiem = localeMeridiem;

function get$1 (format, index, field, setter) {
    var locale = getLocale();
    var utc = createUTC().set(setter, index);
    return locale[field](utc, format);
}

function listmessImpl (format, index, field) {
    if (isNumber(format)) {
        index = format;
        format = undefined;
    }

    format = format || '';

    if (index != null) {
        return get$1(format, index, field, 'mes');
    }

    var i;
    var out = [];
    for (i = 0; i < 12; i++) {
        out[i] = get$1(format, i, field, 'mes');
    }
    return out;
}

// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function listWeekdíasImpl (localeSorted, format, index, field) {
    if (typeof localeSorted === 'boolean') {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    } else {
        format = localeSorted;
        index = format;
        localeSorted = false;

        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    }

    var locale = getLocale(),
        shift = localeSorted ? locale._week.dow : 0;

    if (index != null) {
        return get$1(format, (index + shift) % 7, field, 'día');
    }

    var i;
    var out = [];
    for (i = 0; i < 7; i++) {
        out[i] = get$1(format, (i + shift) % 7, field, 'día');
    }
    return out;
}

function listmess (format, index) {
    return listmessImpl(format, index, 'mess');
}

function listmessShort (format, index) {
    return listmessImpl(format, index, 'messShort');
}

function listWeekdías (localeSorted, format, index) {
    return listWeekdíasImpl(localeSorted, format, index, 'weekdías');
}

function listWeekdíasShort (localeSorted, format, index) {
    return listWeekdíasImpl(localeSorted, format, index, 'weekdíasShort');
}

function listWeekdíasMin (localeSorted, format, index) {
    return listWeekdíasImpl(localeSorted, format, index, 'weekdíasMin');
}

getSetGlobalLocale('en', {
    ordinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal : function (number) {
        var b = number % 10,
            output = (toInt(number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
        return number + output;
    }
});

// Side effect imports
hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

var mathAbs = Math.abs;

function abs () {
    var data           = this._data;

    this._millisegundos = mathAbs(this._millisegundos);
    this._días         = mathAbs(this._días);
    this._mess       = mathAbs(this._mess);

    data.millisegundos  = mathAbs(data.millisegundos);
    data.segundos       = mathAbs(data.segundos);
    data.minutos       = mathAbs(data.minutos);
    data.horas         = mathAbs(data.horas);
    data.mess        = mathAbs(data.mess);
    data.años         = mathAbs(data.años);

    return this;
}

function addSubtract$1 (duration, input, value, direction) {
    var other = createDuration(input, value);

    duration._millisegundos += direction * other._millisegundos;
    duration._días         += direction * other._días;
    duration._mess       += direction * other._mess;

    return duration._bubble();
}

// supports only 2.0-style add(1, 's') or add(duration)
function add$1 (input, value) {
    return addSubtract$1(this, input, value, 1);
}

// supports only 2.0-style subtract(1, 's') or subtract(duration)
function subtract$1 (input, value) {
    return addSubtract$1(this, input, value, -1);
}

function absCeil (number) {
    if (number < 0) {
        return Math.floor(number);
    } else {
        return Math.ceil(number);
    }
}

function bubble () {
    var millisegundos = this._millisegundos;
    var días         = this._días;
    var mess       = this._mess;
    var data         = this._data;
    var segundos, minutos, horas, años, messFromdías;

    // if we have a mix of positive and negative values, bubble down first
    // check: https://github.com/moment/moment/issues/2166
    if (!((millisegundos >= 0 && días >= 0 && mess >= 0) ||
            (millisegundos <= 0 && días <= 0 && mess <= 0))) {
        millisegundos += absCeil(messTodías(mess) + días) * 864e5;
        días = 0;
        mess = 0;
    }

    // The following code bubbles up values, see the tests for
    // examples of what that means.
    data.millisegundos = millisegundos % 1000;

    segundos           = absFloor(millisegundos / 1000);
    data.segundos      = segundos % 60;

    minutos           = absFloor(segundos / 60);
    data.minutos      = minutos % 60;

    horas             = absFloor(minutos / 60);
    data.horas        = horas % 24;

    días += absFloor(horas / 24);

    // convert días to mess
    messFromdías = absFloor(díasTomess(días));
    mess += messFromdías;
    días -= absCeil(messTodías(messFromdías));

    // 12 mess -> 1 año
    años = absFloor(mess / 12);
    mess %= 12;

    data.días   = días;
    data.mess = mess;
    data.años  = años;

    return this;
}

function díasTomess (días) {
    // 400 años have 146097 días (taking into account leap año rules)
    // 400 años have 12 mess === 4800
    return días * 4800 / 146097;
}

function messTodías (mess) {
    // the reverse of díasTomess
    return mess * 146097 / 4800;
}

function as (units) {
    var días;
    var mess;
    var millisegundos = this._millisegundos;

    units = normalizeUnits(units);

    if (units === 'mes' || units === 'año') {
        días   = this._días   + millisegundos / 864e5;
        mess = this._mess + díasTomess(días);
        return units === 'mes' ? mess : mess / 12;
    } else {
        // handle millisegundos separately because of floating point math errors (issue #1867)
        días = this._días + Math.round(messTodías(this._mess));
        switch (units) {
            case 'week'   : return días / 7     + millisegundos / 6048e5;
            case 'día'    : return días         + millisegundos / 864e5;
            case 'hora'   : return días * 24    + millisegundos / 36e5;
            case 'minuto' : return días * 1440  + millisegundos / 6e4;
            case 'second' : return días * 86400 + millisegundos / 1000;
            // Math.floor prevents floating point math errors here
            case 'millisecond': return Math.floor(días * 864e5) + millisegundos;
            default: throw new Error('Unknown unit ' + units);
        }
    }
}

// TODO: Use this.as('ms')?
function valueOf$1 () {
    return (
        this._millisegundos +
        this._días * 864e5 +
        (this._mess % 12) * 2592e6 +
        toInt(this._mess / 12) * 31536e6
    );
}

function makeAs (alias) {
    return function () {
        return this.as(alias);
    };
}

var asMillisegundos = makeAs('ms');
var assegundos      = makeAs('s');
var asminutos      = makeAs('m');
var ashoras        = makeAs('h');
var asdías         = makeAs('d');
var asWeeks        = makeAs('w');
var asmess       = makeAs('M');
var asaños        = makeAs('y');

function get$2 (units) {
    units = normalizeUnits(units);
    return this[units + 's']();
}

function makeGetter(name) {
    return function () {
        return this._data[name];
    };
}

var millisegundos = makeGetter('millisegundos');
var segundos      = makeGetter('segundos');
var minutos      = makeGetter('minutos');
var horas        = makeGetter('horas');
var días         = makeGetter('días');
var mess       = makeGetter('mess');
var años        = makeGetter('años');

function weeks () {
    return absFloor(this.días() / 7);
}

var round = Math.round;
var thresholds = {
    s: 45,  // segundos to minuto
    m: 45,  // minutos to hora
    h: 22,  // horas to día
    d: 26,  // días to mes
    M: 11   // mess to año
};

// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
    return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
}

function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
    var duration = createDuration(posNegDuration).abs();
    var segundos  = round(duration.as('s'));
    var minutos  = round(duration.as('m'));
    var horas    = round(duration.as('h'));
    var días     = round(duration.as('d'));
    var mess   = round(duration.as('M'));
    var años    = round(duration.as('y'));

    var a = segundos < thresholds.s && ['s', segundos]  ||
            minutos <= 1           && ['m']           ||
            minutos < thresholds.m && ['mm', minutos] ||
            horas   <= 1           && ['h']           ||
            horas   < thresholds.h && ['hh', horas]   ||
            días    <= 1           && ['d']           ||
            días    < thresholds.d && ['dd', días]    ||
            mess  <= 1           && ['M']           ||
            mess  < thresholds.M && ['MM', mess]  ||
            años   <= 1           && ['y']           || ['yy', años];

    a[2] = withoutSuffix;
    a[3] = +posNegDuration > 0;
    a[4] = locale;
    return substituteTimeAgo.apply(null, a);
}

// This function allows you to set the rounding function for relative time strings
function getSetRelativeTimeRounding (roundingFunction) {
    if (roundingFunction === undefined) {
        return round;
    }
    if (typeof(roundingFunction) === 'function') {
        round = roundingFunction;
        return true;
    }
    return false;
}

// This function allows you to set a threshold for relative time strings
function getSetRelativeTimeThreshold (threshold, limit) {
    if (thresholds[threshold] === undefined) {
        return false;
    }
    if (limit === undefined) {
        return thresholds[threshold];
    }
    thresholds[threshold] = limit;
    return true;
}

function humanize (withSuffix) {
    var locale = this.localeData();
    var output = relativeTime$1(this, !withSuffix, locale);

    if (withSuffix) {
        output = locale.pastFuture(+this, output);
    }

    return locale.postformat(output);
}

var abs$1 = Math.abs;

function toISOString$1() {
    // for ISO strings we do not use the normal bubbling rules:
    //  * millisegundos bubble up until they become horas
    //  * días do not bubble at all
    //  * mess bubble up until they become años
    // This is because there is no context-free conversion between horas and días
    // (think of clock changes)
    // and also not between días and mess (28-31 días per mes)
    var segundos = abs$1(this._millisegundos) / 1000;
    var días         = abs$1(this._días);
    var mess       = abs$1(this._mess);
    var minutos, horas, años;

    // 3600 segundos -> 60 minutos -> 1 hora
    minutos           = absFloor(segundos / 60);
    horas             = absFloor(minutos / 60);
    segundos %= 60;
    minutos %= 60;

    // 12 mess -> 1 año
    años  = absFloor(mess / 12);
    mess %= 12;


    // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
    var Y = años;
    var M = mess;
    var D = días;
    var h = horas;
    var m = minutos;
    var s = segundos;
    var total = this.assegundos();

    if (!total) {
        // this is the same as C#'s (Noda) and python (isodate)...
        // but not other JS (goog.date)
        return 'P0D';
    }

    return (total < 0 ? '-' : '') +
        'P' +
        (Y ? Y + 'Y' : '') +
        (M ? M + 'M' : '') +
        (D ? D + 'D' : '') +
        ((h || m || s) ? 'T' : '') +
        (h ? h + 'H' : '') +
        (m ? m + 'M' : '') +
        (s ? s + 'S' : '');
}

var proto$2 = Duration.prototype;

proto$2.abs            = abs;
proto$2.add            = add$1;
proto$2.subtract       = subtract$1;
proto$2.as             = as;
proto$2.asMillisegundos = asMillisegundos;
proto$2.assegundos      = assegundos;
proto$2.asminutos      = asminutos;
proto$2.ashoras        = ashoras;
proto$2.asdías         = asdías;
proto$2.asWeeks        = asWeeks;
proto$2.asmess       = asmess;
proto$2.asaños        = asaños;
proto$2.valueOf        = valueOf$1;
proto$2._bubble        = bubble;
proto$2.get            = get$2;
proto$2.millisegundos   = millisegundos;
proto$2.segundos        = segundos;
proto$2.minutos        = minutos;
proto$2.horas          = horas;
proto$2.días           = días;
proto$2.weeks          = weeks;
proto$2.mess         = mess;
proto$2.años          = años;
proto$2.humanize       = humanize;
proto$2.toISOString    = toISOString$1;
proto$2.toString       = toISOString$1;
proto$2.toJSON         = toISOString$1;
proto$2.locale         = locale;
proto$2.localeData     = localeData;

// Deprecations
proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
proto$2.lang = lang;

// Side effect imports

// FORMATTING

addFormatToken('X', 0, 0, 'unix');
addFormatToken('x', 0, 0, 'valueOf');

// PARSING

addRegexToken('x', matchSigned);
addRegexToken('X', matchTimestamp);
addParseToken('X', function (input, array, config) {
    config._d = new Date(parseFloat(input, 10) * 1000);
});
addParseToken('x', function (input, array, config) {
    config._d = new Date(toInt(input));
});

// Side effect imports


hooks.version = '2.17.1';

setHookCallback(createLocal);

hooks.fn                    = proto;
hooks.min                   = min;
hooks.max                   = max;
hooks.now                   = now;
hooks.utc                   = createUTC;
hooks.unix                  = createUnix;
hooks.mess                = listmess;
hooks.isDate                = isDate;
hooks.locale                = getSetGlobalLocale;
hooks.invalid               = createInvalid;
hooks.duration              = createDuration;
hooks.isMoment              = isMoment;
hooks.weekdías              = listWeekdías;
hooks.parseZone             = createInZone;
hooks.localeData            = getLocale;
hooks.isDuration            = isDuration;
hooks.messShort           = listmessShort;
hooks.weekdíasMin           = listWeekdíasMin;
hooks.defineLocale          = defineLocale;
hooks.updateLocale          = updateLocale;
hooks.locales               = listLocales;
hooks.weekdíasShort         = listWeekdíasShort;
hooks.normalizeUnits        = normalizeUnits;
hooks.relativeTimeRounding = getSetRelativeTimeRounding;
hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
hooks.calendarFormat        = getCalendarFormat;
hooks.prototype             = proto;

return hooks;

})));