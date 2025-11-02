"use strict";
exports.id = 991;
exports.ids = [991];
exports.modules = {

/***/ 5991:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EDT = void 0;
const onecTool_1 = __webpack_require__(6803);
const core = __importStar(__webpack_require__(2186));
const exec_1 = __webpack_require__(1514);
const glob = __importStar(__webpack_require__(8090));
const tc = __importStar(__webpack_require__(7784));
const onegetjs_1 = __webpack_require__(6441);
class EDT extends onecTool_1.OnecTool {
    INSTALLED_CACHE_PRIMARY_KEY = 'edt';
    version;
    cache_;
    platform;
    constructor(version, platform) {
        super();
        this.version = version;
        this.platform = platform;
        this.cache_ = this.getCacheDirs();
    }
    async download() {
        const onegetPlatform = this.getPlatformType();
        await (0, onegetjs_1.downloadRelease)({
            project: 'DevelopmentTools10',
            version: this.version,
            osName: onegetPlatform,
            offline: true
        }, `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`, true);
    }
    async install() {
        let installerPattern;
        if (this.isWindows()) {
            installerPattern = '1ce-installer-cli.exe';
        }
        else {
            installerPattern = '1ce-installer-cli';
        }
        if (this.isWindows()) {
            const pattern = `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}/**/1c_edt_distr_offline*.zip`;
            core.info(pattern);
            const globber = await glob.create(pattern);
            for await (const file of globber.globGenerator()) {
                await tc.extractZip(file);
            }
        }
        const patterns = [
            `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}/**/${installerPattern}`
        ];
        const globber = await glob.create(patterns.join('\n'));
        const files = await globber.glob();
        core.info(`finded ${files}`);
        const install_arg = [
            'install',
            '--ignore-hardware-checks',
            '--ignore-signature-warnings',
            '--overwrite'
        ];
        if (this.isLinux()) {
            await (0, exec_1.exec)('sudo', [files[0], ...install_arg]);
        }
        else if (this.isWindows()) {
            await (0, exec_1.exec)(files[0], install_arg);
        }
        else {
            core.setFailed(`Unrecognized os${this.platform}`);
        }
    }
    getCacheDirs() {
        if (this.isWindows()) {
            return ['C:/Program Files/1C', 'C:/ProgramData/1C/1CE/ring-commands.cfg'];
        }
        else if (this.isLinux()) {
            return ['/opt/1C', '/etc/1C/1CE/ring-commands.cfg'];
        }
        else if (this.isMac()) {
            return ['/Applications/1C'];
        }
        else {
            throw new Error('Not supported on this OS type');
        }
    }
    getRunFileNames() {
        if (this.isWindows()) {
            return ['ring.bat', '1cedtcli.bat'];
        }
        else {
            return ['ring', '1cedtcli.sh'];
        }
    }
}
exports.EDT = EDT;


/***/ })

};
;
//# sourceMappingURL=991.index.js.map