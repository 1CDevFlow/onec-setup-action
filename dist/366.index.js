exports.id = 366;
exports.ids = [366];
exports.modules = {

/***/ 4773:
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
     true ? factory(exports) :
    0;
})(this, (function (exports) { 'use strict';

    const semver = /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;
    const validateAndParse = (version) => {
        if (typeof version !== 'string') {
            throw new TypeError('Invalid argument expected string');
        }
        const match = version.match(semver);
        if (!match) {
            throw new Error(`Invalid argument not valid semver ('${version}' received)`);
        }
        match.shift();
        return match;
    };
    const isWildcard = (s) => s === '*' || s === 'x' || s === 'X';
    const tryParse = (v) => {
        const n = parseInt(v, 10);
        return isNaN(n) ? v : n;
    };
    const forceType = (a, b) => typeof a !== typeof b ? [String(a), String(b)] : [a, b];
    const compareStrings = (a, b) => {
        if (isWildcard(a) || isWildcard(b))
            return 0;
        const [ap, bp] = forceType(tryParse(a), tryParse(b));
        if (ap > bp)
            return 1;
        if (ap < bp)
            return -1;
        return 0;
    };
    const compareSegments = (a, b) => {
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const r = compareStrings(a[i] || '0', b[i] || '0');
            if (r !== 0)
                return r;
        }
        return 0;
    };

    /**
     * Compare [semver](https://semver.org/) version strings to find greater, equal or lesser.
     * This library supports the full semver specification, including comparing versions with different number of digits like `1.0.0`, `1.0`, `1`, and pre-release versions like `1.0.0-alpha`.
     * @param v1 - First version to compare
     * @param v2 - Second version to compare
     * @returns Numeric value compatible with the [Array.sort(fn) interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters).
     */
    const compareVersions = (v1, v2) => {
        // validate input and split into segments
        const n1 = validateAndParse(v1);
        const n2 = validateAndParse(v2);
        // pop off the patch
        const p1 = n1.pop();
        const p2 = n2.pop();
        // validate numbers
        const r = compareSegments(n1, n2);
        if (r !== 0)
            return r;
        // validate pre-release
        if (p1 && p2) {
            return compareSegments(p1.split('.'), p2.split('.'));
        }
        else if (p1 || p2) {
            return p1 ? -1 : 1;
        }
        return 0;
    };

    /**
     * Compare [semver](https://semver.org/) version strings using the specified operator.
     *
     * @param v1 First version to compare
     * @param v2 Second version to compare
     * @param operator Allowed arithmetic operator to use
     * @returns `true` if the comparison between the firstVersion and the secondVersion satisfies the operator, `false` otherwise.
     *
     * @example
     * ```
     * compare('10.1.8', '10.0.4', '>'); // return true
     * compare('10.0.1', '10.0.1', '='); // return true
     * compare('10.1.1', '10.2.2', '<'); // return true
     * compare('10.1.1', '10.2.2', '<='); // return true
     * compare('10.1.1', '10.2.2', '>='); // return false
     * ```
     */
    const compare = (v1, v2, operator) => {
        // validate input operator
        assertValidOperator(operator);
        // since result of compareVersions can only be -1 or 0 or 1
        // a simple map can be used to replace switch
        const res = compareVersions(v1, v2);
        return operatorResMap[operator].includes(res);
    };
    const operatorResMap = {
        '>': [1],
        '>=': [0, 1],
        '=': [0],
        '<=': [-1, 0],
        '<': [-1],
        '!=': [-1, 1],
    };
    const allowedOperators = Object.keys(operatorResMap);
    const assertValidOperator = (op) => {
        if (typeof op !== 'string') {
            throw new TypeError(`Invalid operator type, expected string but got ${typeof op}`);
        }
        if (allowedOperators.indexOf(op) === -1) {
            throw new Error(`Invalid operator, expected one of ${allowedOperators.join('|')}`);
        }
    };

    /**
     * Match [npm semver](https://docs.npmjs.com/cli/v6/using-npm/semver) version range.
     *
     * @param version Version number to match
     * @param range Range pattern for version
     * @returns `true` if the version number is within the range, `false` otherwise.
     *
     * @example
     * ```
     * satisfies('1.1.0', '^1.0.0'); // return true
     * satisfies('1.1.0', '~1.0.0'); // return false
     * ```
     */
    const satisfies = (version, range) => {
        // clean input
        range = range.replace(/([><=]+)\s+/g, '$1');
        // handle multiple comparators
        if (range.includes('||')) {
            return range.split('||').some((r) => satisfies(version, r));
        }
        else if (range.includes(' - ')) {
            const [a, b] = range.split(' - ', 2);
            return satisfies(version, `>=${a} <=${b}`);
        }
        else if (range.includes(' ')) {
            return range
                .trim()
                .replace(/\s{2,}/g, ' ')
                .split(' ')
                .every((r) => satisfies(version, r));
        }
        // if no range operator then "="
        const m = range.match(/^([<>=~^]+)/);
        const op = m ? m[1] : '=';
        // if gt/lt/eq then operator compare
        if (op !== '^' && op !== '~')
            return compare(version, range, op);
        // else range of either "~" or "^" is assumed
        const [v1, v2, v3, , vp] = validateAndParse(version);
        const [r1, r2, r3, , rp] = validateAndParse(range);
        const v = [v1, v2, v3];
        const r = [r1, r2 !== null && r2 !== void 0 ? r2 : 'x', r3 !== null && r3 !== void 0 ? r3 : 'x'];
        // validate pre-release
        if (rp) {
            if (!vp)
                return false;
            if (compareSegments(v, r) !== 0)
                return false;
            if (compareSegments(vp.split('.'), rp.split('.')) === -1)
                return false;
        }
        // first non-zero number
        const nonZero = r.findIndex((v) => v !== '0') + 1;
        // pointer to where segments can be >=
        const i = op === '~' ? 2 : nonZero > 1 ? nonZero : 1;
        // before pointer must be equal
        if (compareSegments(v.slice(0, i), r.slice(0, i)) !== 0)
            return false;
        // after pointer must be >=
        if (compareSegments(v.slice(i), r.slice(i)) === -1)
            return false;
        return true;
    };

    /**
     * Validate [semver](https://semver.org/) version strings.
     *
     * @param version Version number to validate
     * @returns `true` if the version number is a valid semver version number, `false` otherwise.
     *
     * @example
     * ```
     * validate('1.0.0-rc.1'); // return true
     * validate('1.0-rc.1'); // return false
     * validate('foo'); // return false
     * ```
     */
    const validate = (version) => typeof version === 'string' && /^[v\d]/.test(version) && semver.test(version);
    /**
     * Validate [semver](https://semver.org/) version strings strictly. Will not accept wildcards and version ranges.
     *
     * @param version Version number to validate
     * @returns `true` if the version number is a valid semver version number `false` otherwise
     *
     * @example
     * ```
     * validate('1.0.0-rc.1'); // return true
     * validate('1.0-rc.1'); // return false
     * validate('foo'); // return false
     * ```
     */
    const validateStrict = (version) => typeof version === 'string' &&
        /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(version);

    exports.compare = compare;
    exports.compareVersions = compareVersions;
    exports.satisfies = satisfies;
    exports.validate = validate;
    exports.validateStrict = validateStrict;

}));
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 1366:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Platform83 = void 0;
const onecTool_1 = __webpack_require__(6803);
const core = __importStar(__webpack_require__(2186));
const exec_1 = __webpack_require__(1514);
const onegetjs_1 = __webpack_require__(6441);
const glob = __importStar(__webpack_require__(8090));
const compare_versions_1 = __webpack_require__(4773);
class Platform83 extends onecTool_1.OnecTool {
    INSTALLED_CACHE_PRIMARY_KEY = 'onec';
    version;
    cache_;
    platform;
    constructor(version, platform) {
        super();
        this.version = version;
        this.platform = platform;
        this.cache_ = this.getCacheDirs();
    }
    useNewInstaller() {
        return (0, compare_versions_1.compareVersions)(this.version, '8.3.20') >= 0;
    }
    async download() {
        let platformType = this.getPlatformType();
        let installerType = 'full';
        if (platformType == 'linux' && !this.useNewInstaller()) {
            installerType = 'clientOrServer';
            platformType = 'deb';
        }
        await (0, onegetjs_1.downloadRelease)({
            project: 'Platform83',
            version: this.version,
            osName: platformType,
            architecture: 'x64',
            type: installerType
        }, this.getInstallersPath(), true);
        core.info(`onec was downloaded`);
    }
    async install() {
        const installerPattern = this.isWindows()
            ? 'setup.exe'
            : this.useNewInstaller()
                ? 'setup-full'
                : '*.deb';
        const path = this.getInstallersPath();
        const globber = await glob.create(`${path}/**/${installerPattern}*`);
        const files = await globber.glob();
        core.info(`found ${files}`);
        if (this.isLinux() && this.useNewInstaller()) {
            await (0, exec_1.exec)('sudo', [
                files[0],
                '--mode',
                'unattended',
                '--enable-components',
                'server,client_full',
                '--disable-components',
                'client_thin,client_thin_fib,ws'
            ]);
        }
        else if (this.isLinux()) {
            for await (const mask of ['common', 'server', 'thin-client', 'client']) {
                const files = await (await glob.create(`${path}/1c-enterprise83-${mask}_*.deb`)).glob();
                if (files.length !== 0) {
                    await (0, exec_1.exec)('sudo', ['dpkg', '-i', '--force-all', `${files[0]}`]);
                }
                else {
                    core.warning(`File not found for ${mask} (mask: 1c-enterprise83-${mask}_*.deb)`);
                }
            }
        }
        else if (this.isWindows()) {
            await (0, exec_1.exec)(files[0], [
                '/l',
                'ru',
                '/S',
                'server=1',
                'thinclient=1',
                'RU=1',
                'EN=1',
                'LANGUAGES=RU,EN',
                '/quiet',
                '/qn',
                'INSTALLSRVRASSRVC=0',
                '/norestart'
            ]);
        }
        else {
            core.setFailed(`Unrecognized os ${this.platform}`);
        }
    }
    getCacheDirs() {
        if (this.isWindows()) {
            return ['C:/Program Files/1cv8'];
        }
        else if (this.isLinux() && this.useNewInstaller()) {
            return ['/opt/1cv8'];
        }
        else if (this.isLinux()) {
            return ['/opt/1C/v8.3'];
        }
        else if (this.isMac()) {
            return ['/opt/1cv8']; // /Applications/1cv8.localized/8.3.21.1644/ but only .app
        }
        else {
            throw new Error('Not supported on this OS type');
        }
    }
    getRunFileNames() {
        if (this.isWindows()) {
            return ['1cv8.exe'];
        }
        else {
            return ['1cv8'];
        }
    }
}
exports.Platform83 = Platform83;


/***/ })

};
;
//# sourceMappingURL=366.index.js.map