"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var containerHtml_1 = __importDefault(require("./containerHtml"));
/**
 * Container where Notifications are pushed into.
 *
 * @class NotificationContainer
 */
var NotificationContainer = /** @class */ (function () {
    /**
     * Creates an instance of NotificationContainer.
     * @memberof NotificationContainer
     */
    function NotificationContainer() {
        var _this = this;
        /**
         * Determines if the container window has been loaded.
         *
         * @type {boolean}
         * @memberof NotificationContainer
         */
        this.ready = false;
        /**
         * Collection of Notifications that are currently inside
         * the container.
         *
         * @private
         * @type {Notification[]}
         * @memberof NotificationContainer
         */
        this.notifications = [];
        /**
         * Displays the notification visually.
         *
         * @private
         * @param {Notification} notification
         * @memberof NotificationContainer
         */
        this.displayNotification = function (notification) {
            _this.window &&
                _this.window.webContents.send("notification-add", notification.getSource());
            notification.emit("display");
            if (notification.options.timeout) {
                setTimeout(function () {
                    notification.close();
                }, notification.options.timeout);
            }
        };
        var options = {};
        var display = require("electron").screen.getPrimaryDisplay();
        var displayWidth = display.workArea.x + display.workAreaSize.width;
        var displayHeight = display.workArea.y + display.workAreaSize.height;
        options.height = 24;
        options.width = NotificationContainer.CONTAINER_WIDTH;
        options.alwaysOnTop = true;
        options.skipTaskbar = true;
        options.resizable = false;
        options.minimizable = false;
        options.fullscreenable = false;
        options.focusable = false;
        options.show = false;
        options.frame = false;
        options.transparent = true;
        options.hasShadow = true;
        options.x = displayWidth - NotificationContainer.CONTAINER_WIDTH;
        if (process.platform === "darwin")
            options.y = 0;
        else
            options.y = displayHeight - options.height;
        options.webPreferences = {
            nodeIntegration: true,
            contextIsolation: false,
        }; // Since we're not displaying untrusted content
        // (all links are opened in a real browser window), we can enable this.
        this.window = new electron_1.BrowserWindow(options);
        this.window.setVisibleOnAllWorkspaces(true);
        // this.window.loadURL(path.join("file://", __dirname, "/container.html"));
        // this.window.loadURL(
        //   path.join(process.resourcesPath ?? "", "container.html")
        // );
        this.window.loadURL("data:text/html;charset=utf-8," + containerHtml_1.default);
        this.window.setIgnoreMouseEvents(true, { forward: true });
        this.window.showInactive();
        // this.window.webContents.openDevTools({ mode: 'detach' });
        electron_1.ipcMain.on("notification-clicked", function (e, id) {
            var notification = _this.notifications.find(function (notification) { return notification.id == id; });
            if (notification) {
                notification.emit("click");
            }
        });
        electron_1.ipcMain.on("button-clicked", function (e, _a) {
            var id = _a.id, event = _a.event;
            var notification = _this.notifications.find(function (notification) { return notification.id == id; });
            if (notification && event) {
                notification.emit(event);
            }
        });
        electron_1.ipcMain.on("adjust-height", function (_e, height) {
            if (height > 30) {
                _this.window && _this.window.setIgnoreMouseEvents(false);
            }
            else {
                _this.window &&
                    _this.window.setIgnoreMouseEvents(true, { forward: true });
            }
            if (process.platform !== "darwin") {
                var display_1 = require("electron").screen.getPrimaryDisplay();
                var displayHeight_1 = display_1.workArea.y + display_1.workAreaSize.height;
                _this.window &&
                    _this.window.setPosition(_this.window.getPosition()[0], displayHeight_1 - height);
            }
            _this.window && _this.window.setSize(_this.window.getSize()[0], height);
        });
        // ipcMain.on("make-clickable", (e: any) => {
        //   this.window && this.window.setIgnoreMouseEvents(false);
        // });
        // ipcMain.on("make-unclickable", (e: any) => {
        //   this.window && this.window.setIgnoreMouseEvents(true, { forward: true });
        // });
        this.window.webContents.on("did-finish-load", function () {
            _this.ready = true;
            if (NotificationContainer.CUSTOM_STYLES) {
                _this.window &&
                    _this.window.webContents.send("custom-styles", NotificationContainer.CUSTOM_STYLES);
            }
            _this.notifications.forEach(_this.displayNotification);
        });
        this.window.on("closed", function () {
            _this.window = null;
        });
    }
    /**
     * Adds a notification logically (notifications[]) and
     * physically (DOM Element).
     *
     * @param {Notification} notification
     * @memberof NotificationContainer
     */
    NotificationContainer.prototype.addNotification = function (notification) {
        if (this.ready) {
            this.displayNotification(notification);
        }
        this.notifications.push(notification);
    };
    /**
     * Removes a notification logically (notifications[]) and
     * physically (DOM Element).
     *
     * @param {Notification} notification
     * @memberof NotificationContainer
     */
    NotificationContainer.prototype.removeNotification = function (notification) {
        this.notifications.splice(this.notifications.indexOf(notification), 1);
        this.window &&
            this.window.webContents.send("notification-remove", notification.id);
        notification.emit("close");
    };
    /**
     * Destroys the container.
     *
     * @memberof NotificationContainer
     */
    NotificationContainer.prototype.dispose = function () {
        this.window && this.window.close();
    };
    /**
     * The container's width.
     * @default 300
     *
     * @static
     * @memberof NotificationContainer
     */
    NotificationContainer.CONTAINER_WIDTH = 300;
    return NotificationContainer;
}());
exports.default = NotificationContainer;
//# sourceMappingURL=NotificationContainer.js.map