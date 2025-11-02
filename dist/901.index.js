"use strict";
exports.id = 901;
exports.ids = [901];
exports.modules = {

/***/ 427:
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Client = void 0;
const core = __importStar(__webpack_require__(2186));
const cookiejar_1 = __webpack_require__(5507);
const request_1 = __importDefault(__webpack_require__(5819));
const fs = __importStar(__webpack_require__(7147));
const path = __importStar(__webpack_require__(1017));
const RELEASES_URL = 'https://releases.1c.ru';
const PROJECTS_URL = '/project/';
const LOGIN_URL = 'https://login.1c.ru';
const TICKET_URL = `${LOGIN_URL}/rest/public/ticket/get`;
class Client {
    login;
    password;
    cookies;
    ticket = '';
    constructor(login, password) {
        if (!login || !password) {
            const err = new Error('Do not set login or/and password');
            core.setFailed(err);
            throw err;
        }
        this.login = login;
        this.password = password;
        this.cookies = new cookiejar_1.CookieJar();
    }
    async auth() {
        const continueURL = await this.getAuthToken();
        await (0, request_1.default)(continueURL, { cookie: this.cookies });
    }
    async getAuthToken(url = RELEASES_URL) {
        core.debug('Authorization');
        const body = {
            login: this.login,
            password: this.password,
            serviceNick: url
        };
        const response = await (0, request_1.default)(TICKET_URL, {
            method: 'POST',
            body: JSON.stringify(body),
            cookie: this.cookies,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        this.checkResponseError(response);
        const data = await response.json();
        return `${LOGIN_URL}/ticket/auth?token=${data.ticket}`;
    }
    async getText(url) {
        const fullURL = new URL(url, RELEASES_URL);
        const response = await this.get(fullURL.toString());
        return await response.text();
    }
    async get(url) {
        let response = await (0, request_1.default)(url, { cookie: this.cookies });
        if (response.status === 401) {
            core.debug('Re-Authorization');
            const newURL = await this.getAuthToken(url);
            core.debug(`Request. [GET] ${newURL}`);
            response = await (0, request_1.default)(newURL, { cookie: this.cookies });
        }
        await this.checkResponseError(response);
        return response;
    }
    async downloadFile(url, output) {
        const fullURL = new URL(url, RELEASES_URL);
        const response = await this.get(fullURL.toString());
        const fileName = extractFileName(response);
        if (fileName === undefined) {
            core.error(`Can't extract file name from response for ${url}`);
            return undefined;
        }
        const fullFileName = path.resolve(output, fileName);
        try {
            if (fs.statSync(fullFileName).isFile()) {
                core.info(`${fileName} already exist`);
                return fullFileName;
            }
        }
        catch {
            /* empty */
        }
        core.info(`Downloading ${fileName}...`);
        const destination = fs.createWriteStream(fullFileName, { flags: 'wx' });
        const contentLength = response.headers.get('content-length');
        const totalSize = contentLength ? parseInt(contentLength) : 0;
        let downloadedSize = 0;
        await new Promise((resolve, reject) => {
            response.body.on('data', chunk => {
                downloadedSize += chunk.length;
                if (totalSize > 0 && downloadedSize % (1024 * 1024) === 0) {
                    // Каждые MB
                    const progress = Math.round((downloadedSize / totalSize) * 100);
                    core.info(`Download progress: ${progress}% (${Math.round(downloadedSize / 1024 / 1024)}MB / ${Math.round(totalSize / 1024 / 1024)}MB)`);
                }
            });
            response.body.pipe(destination);
            response.body.on('error', reject);
            destination.on('finish', resolve);
        });
        // Проверяем размер файла
        const stats = fs.statSync(fullFileName);
        if (totalSize > 0 && stats.size !== totalSize) {
            core.warning(`File size mismatch: expected ${totalSize}, got ${stats.size}`);
            // Удаляем поврежденный файл
            fs.unlinkSync(fullFileName);
            throw new Error(`Downloaded file is corrupted: size mismatch`);
        }
        core.info(`Downloaded (${stats.size} bytes)`);
        return fullFileName;
    }
    async projectPage(project) {
        return await this.getText(`${PROJECTS_URL}${project}?allUpdates=true`);
    }
    async checkResponseError(response) {
        if (response.status === 200) {
            return;
        }
        const message = `Response error.
        Status: ${response.status} (${response.statusText})
        Body: ${await response.text()}`;
        core.error(message);
        throw message;
    }
}
exports.Client = Client;
function extractFileName(response) {
    const header = response.headers.get('content-disposition');
    if (header === null) {
        return undefined;
    }
    const prefix = 'filename=';
    let filename = header.substring(header.indexOf(prefix) + prefix.length);
    if (filename.startsWith('"') && filename.endsWith('"')) {
        filename = filename.substring(1, filename.length - 1);
    }
    return filename;
}


/***/ }),

/***/ 9289:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFilters = getFilters;
exports.filter = filter;
const x64Pattern = /.*(\(64-bit\)|\(64 бит\)).*/;
const rpmPattern = /.+RPM.+(ОС Linux|для Linux$|Linux-систем$).*/;
const debPattern = /.+DEB.+(ОС Linux|для Linux$|Linux-систем$).*/;
const linuxPattern = /.*(ОС Linux|для Linux$|Linux-систем$).*/;
const windowsPattern = /.*(ОС Windows|для Windows$|для Windows\\s\\+).*/;
const osxPattern = /.+(OS X|для macOS)$/;
const clientPattern = /^Клиент.+/;
const serverPattern = /^[Cервер|Сервер].+/;
const thinPattern = /^Тонкий клиент.+/;
const fullPattern = /^Технологическая платформа.+/;
const offlinePattern = /.+(без интернета|оффлайн).*/;
const clientOrServerPattern = /^[Клиент|Cервер|Сервер].+/;
const SHA = /.*(Контрольная сумма|sha).*/;
function getFilters(artifactFilter) {
    const filters = new Array();
    filters.push(v => !SHA.test(v));
    switch (artifactFilter.osName) {
        case 'win':
            filters.push(windowsPattern.test.bind(windowsPattern));
            break;
        case 'mac':
            filters.push(osxPattern.test.bind(osxPattern));
            break;
        case 'linux':
            filters.push(linuxPattern.test.bind(linuxPattern));
            break;
        case 'deb':
            filters.push(debPattern.test.bind(debPattern));
            break;
        case 'rpm':
            filters.push(rpmPattern.test.bind(rpmPattern));
            break;
    }
    switch (artifactFilter.architecture) {
        case 'x86':
            filters.push(v => !x64Pattern.test(v));
            break;
        case 'x64':
            filters.push(x64Pattern.test.bind(x64Pattern));
            break;
    }
    switch (artifactFilter.type) {
        case 'full':
            filters.push(fullPattern.test.bind(fullPattern));
            break;
        case 'server':
            filters.push(serverPattern.test.bind(serverPattern));
            break;
        case 'client':
            filters.push(clientPattern.test.bind(clientPattern));
            break;
        case 'thinClient':
            filters.push(thinPattern.test.bind(thinPattern));
            break;
        case 'clientOrServer':
            filters.push(clientOrServerPattern.test.bind(clientOrServerPattern));
            break;
    }
    if (artifactFilter.offline === true) {
        filters.push(offlinePattern.test.bind(offlinePattern));
    }
    else {
        filters.push(v => !offlinePattern.test(v));
    }
    return filters;
}
function filter(files, filters) {
    return files.filter(file => {
        const failure = filters.find(f => !f(file.name));
        return failure === undefined;
    });
}


/***/ }),

/***/ 6441:
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.downloadRelease = downloadRelease;
const downloader_1 = __webpack_require__(427);
const parser = __importStar(__webpack_require__(6704));
const core = __importStar(__webpack_require__(2186));
const filter = __importStar(__webpack_require__(9289));
const process_1 = __importDefault(__webpack_require__(7282));
const path_1 = __importDefault(__webpack_require__(1017));
const io = __importStar(__webpack_require__(7436));
const unpacker_1 = __webpack_require__(7431);
class OneGet {
    client;
    downloadTo;
    constructor(downloadTo) {
        const login = process_1.default.env.ONEC_USERNAME ?? '';
        const password = process_1.default.env.ONEC_PASSWORD ?? '';
        this.client = new downloader_1.Client(login, password);
        this.downloadTo = downloadTo;
    }
    async auth() {
        await this.client.auth();
    }
    async download(version, artifactFilter) {
        const filters = filter.getFilters(artifactFilter);
        const files = filter.filter(version.files, filters);
        if (files.length === 0) {
            error(`Found't files for version ${JSON.stringify(artifactFilter)}`);
        }
        core.debug(`Files for downloading ${JSON.stringify(files)}`);
        const downloadedFiles = [];
        for (const file of files) {
            for (let attempt = 1; attempt <= 2; attempt++) {
                core.info(`Downloading ${file.name}`);
                core.debug(`Get artifact download page: ${file.name}`);
                const links = parser.fileDownloadLinks(await this.client.getText(file.url));
                if (links.length === 0) {
                    core.error(`Don't found links for file ${file.name}`);
                    continue;
                }
                for (const link of links) {
                    const location = await this.client.downloadFile(link, this.downloadTo);
                    if (location !== undefined) {
                        downloadedFiles.push(location);
                        break;
                    }
                }
                break;
            }
        }
        return downloadedFiles;
    }
    async versionInfo(project, version) {
        core.debug(`Get project page for: ${project}`);
        const page = await this.client.projectPage(project);
        const versions = parser.versions(page);
        const filteredVersions = versions.filter(v => v.name === version);
        if (filteredVersions.length === 0) {
            error(`Version ${version} for ${project} not found`);
        }
        const versionInfo = filteredVersions[0];
        core.debug(`Version info: ${JSON.stringify(versionInfo)}`);
        versionInfo.files = await this.versionFiles(versionInfo);
        core.debug(`Version files: ${JSON.stringify(versionInfo.files)}`);
        return versionInfo;
    }
    async versionFiles(version) {
        core.debug(`Get project version page for: ${version.name}`);
        const page = await this.client.getText(version.url);
        return parser.releaseFiles(page);
    }
}
exports["default"] = OneGet;
async function downloadRelease(release, destination, unpack = false) {
    const downloadDestination = unpack
        ? path_1.default.resolve('tmp', '__downloads__')
        : destination;
    io.mkdirP(downloadDestination);
    io.mkdirP(destination);
    const oneGet = new OneGet(downloadDestination);
    await oneGet.auth();
    const version = await oneGet.versionInfo(release.project, release.version);
    const artifacts = await oneGet.download(version, release);
    if (unpack) {
        await (0, unpacker_1.unpackFiles)(artifacts, destination);
    }
}
function error(message) {
    core.error(message);
    throw message;
}


/***/ }),

/***/ 6704:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.versions = versions;
exports.releaseFiles = releaseFiles;
exports.fileDownloadLinks = fileDownloadLinks;
const node_html_parser_1 = __webpack_require__(4363);
const PROJECT_VERSIONS_SELECTOR = 'td.versionColumn>a';
const RELEASE_FILES_SELECTOR = '.files-container .formLine a';
const DOWNLOAD_LINK_SELECTOR = '.downloadDist a';
function versions(content) {
    const root = (0, node_html_parser_1.parse)(content);
    const cells = root.querySelectorAll(PROJECT_VERSIONS_SELECTOR);
    return cells.map(cell => ({
        name: cell.text.trim(),
        url: cell.getAttribute('href')
    }));
}
function releaseFiles(content) {
    const root = (0, node_html_parser_1.parse)(content);
    const cells = root.querySelectorAll(RELEASE_FILES_SELECTOR);
    return cells.map(cell => ({
        name: cell.text.trim(),
        url: cell.getAttribute('href')
    }));
}
function fileDownloadLinks(content) {
    const root = (0, node_html_parser_1.parse)(content);
    const cells = root.querySelectorAll(DOWNLOAD_LINK_SELECTOR);
    return cells
        .map(a => a.getAttribute('href'))
        .filter((v) => v !== null && v !== undefined);
}


/***/ }),

/***/ 5819:
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = request;
const node_fetch_1 = __importDefault(__webpack_require__(467));
const cookiejar_1 = __webpack_require__(5507);
const core = __importStar(__webpack_require__(2186));
async function request(urlString, init) {
    core.debug(`Request [${init?.method ?? 'GET'}] ${urlString}`);
    const url = new URL(urlString);
    const cookieJar = init?.cookie;
    const cookieValue = cookieJar
        ?.getCookies({
        domain: url.host,
        path: url.pathname,
        secure: true,
        script: false
    })
        .map(c => c.toValueString())
        .join('; ');
    const fetchInit = init ?? {};
    if (cookieValue && fetchInit.headers === undefined) {
        fetchInit.headers = {
            cookie: cookieValue
        };
    }
    fetchInit.redirect = 'manual';
    const response = await (0, node_fetch_1.default)(urlString, fetchInit);
    parseCookies(response, cookieJar);
    if (isRedirect(response)) {
        const locationURL = new URL(response.headers.get('location') ?? '', response.url);
        core.debug(`Redirect to: ${locationURL}`);
        return await request(locationURL.toString(), {
            cookie: cookieJar
        });
    }
    return response;
}
function isRedirect(response) {
    return response.status === 301 || response.status === 302;
}
function parseCookies(response, cookieJar) {
    if (cookieJar === undefined) {
        return;
    }
    response.headers.raw()['set-cookie']?.map(v => {
        const cookie = new cookiejar_1.Cookie(v);
        cookieJar?.setCookie(cookie);
    });
}


/***/ }),

/***/ 6803:
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OnecTool = void 0;
const core = __importStar(__webpack_require__(2186));
const cache = __importStar(__webpack_require__(7799));
const glob = __importStar(__webpack_require__(8090));
const path_1 = __importDefault(__webpack_require__(1017));
const utils_1 = __webpack_require__(1314);
const PLATFORM_WIN = 'win32';
const PLATFORM_LIN = 'linux';
const PLATFORM_MAC = 'darwin';
class OnecTool {
    CACHE_KEY_PREFIX = 'setup';
    INSTALLER_CACHE_PRIMARY_KEY = 'installer';
    async updatePath() {
        for (const element of this.getRunFileNames()) {
            const pattern = `${this.cache_[0]}/**/${element}`;
            core.info(pattern);
            const globber = await glob.create(pattern);
            for await (const file of globber.globGenerator()) {
                core.info(`add to PATH ${path_1.default.dirname(file)} (${file}) `);
                core.addPath(path_1.default.dirname(file));
                break;
            }
        }
    }
    getInstallersPath() {
        return `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`;
    }
    async handleLoadedCache() {
        await this.updatePath();
    }
    async restoreInstallationPackage() {
        const primaryKey = this.computeInstallerKey();
        const restorePath = this.getInstallersPath();
        const matchedKey = await (0, utils_1.restoreCacheByPrimaryKey)([restorePath], primaryKey);
        await this.handleLoadedCache();
        await this.handleMatchResult(matchedKey, primaryKey);
        return matchedKey;
    }
    async restoreInstalledTool() {
        const primaryKey = this.computeInstalledKey();
        const matchedKey = await (0, utils_1.restoreCacheByPrimaryKey)(this.cache_, primaryKey);
        await this.handleLoadedCache();
        await this.handleMatchResult(matchedKey, primaryKey);
        return matchedKey;
    }
    computeInstalledKey() {
        return `${this.CACHE_KEY_PREFIX}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`;
    }
    computeInstallerKey() {
        return `${this.CACHE_KEY_PREFIX}--${this.INSTALLER_CACHE_PRIMARY_KEY}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`;
    }
    async handleMatchResult(matchedKey, primaryKey) {
        if (matchedKey) {
            core.info(`Cache restored from key: ${matchedKey}`);
        }
        else {
            core.info(`${primaryKey} cache is not found`);
        }
        core.setOutput('cache-hit', matchedKey === primaryKey);
    }
    async saveInstallerCache() {
        try {
            await cache.saveCache([this.getInstallersPath()], this.computeInstallerKey());
        }
        catch (error) {
            if (error instanceof Error)
                core.info(error.message);
        }
    }
    async saveInstalledCache() {
        try {
            core.info(`Trying to save: ${this.cache_.slice().toString()}`);
            await cache.saveCache(this.cache_.slice(), this.computeInstalledKey());
        }
        catch (error) {
            if (error instanceof Error)
                core.info(error.message);
        }
    }
    isWindows() {
        return PLATFORM_WIN === this.platform;
    }
    isMac() {
        return PLATFORM_MAC === this.platform;
    }
    isLinux() {
        return PLATFORM_LIN === this.platform;
    }
    getPlatformType() {
        switch (this.platform) {
            case PLATFORM_WIN: {
                return 'win';
            }
            case PLATFORM_MAC: {
                return 'mac';
            }
            case PLATFORM_LIN: {
                return 'linux';
            }
            default: {
                core.setFailed(`Unrecognized os ${this.platform}`);
                throw new Error(`Unrecognized os ${this.platform}`);
            }
        }
    }
}
exports.OnecTool = OnecTool;


/***/ }),

/***/ 7431:
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
exports.unpack = unpack;
exports.unpackFiles = unpackFiles;
const tc = __importStar(__webpack_require__(7784));
const exec_1 = __webpack_require__(1514);
const core = __importStar(__webpack_require__(2186));
const io = __importStar(__webpack_require__(7436));
async function unpack(file, destination) {
    core.info(`Unpack ${file} to ${destination}`);
    // Убеждаемся, что директория назначения существует
    await io.mkdirP(destination);
    if (file.endsWith('.zip')) {
        await tc.extractZip(file, destination);
    }
    else if (file.endsWith('.tar') || file.endsWith('.tar.gz')) {
        // Используем системный tar для лучшего контроля
        await (0, exec_1.exec)('tar', [
            'xz',
            '--warning=no-unknown-keyword',
            '--overwrite',
            '-C',
            destination,
            '-f',
            file
        ]);
    }
    else if (file.endsWith('.rar')) {
        // 7z может завершиться с ошибкой, но частично распаковать файлы
        await (0, exec_1.exec)('7z', ['x', file, `-o${destination}`, '-y']);
    }
    else {
        throw new Error(`Unsupported archive format: ${file}`);
    }
}
async function unpackFiles(files, destination) {
    for (const file of files) {
        await unpack(file, destination);
    }
}


/***/ })

};
;
//# sourceMappingURL=901.index.js.map