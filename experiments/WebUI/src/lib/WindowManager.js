const defaultWindowOptions = "width=600,height=600,menubar=0,toolbar=0,location=0,personalBar=0,status=0,resizable=1";

const windowOptionsMap = {};

const windowMap = {};

function getWindowOptions(routeName) {
    return (routeName in windowOptionsMap) ? windowOptionsMap[routeName] : defaultWindowOptions;
}

function registerWindow(routeName, routeWindow) {
    if (!routeWindow) {
        return;
    }
    routeWindow.id = Date.now();
    // NOTE HACK need to wait before adding listener
    setTimeout(() => {
        try {
            routeWindow.addEventListener('unload', (e) => {
                console.log(routeName, 'closed window', e.currentTarget.id);
                delete (windowMap[routeName]);
            });
        } catch (e) {
            // ignore exception
        }
    }, 1000);
    windowMap[routeName] = routeWindow;
}

function doOpenWindow(routeName) {
    const href = window.location.href;
    const url = href.substring(0, href.lastIndexOf('/') + 1) + routeName;

    if (window.opener) {
        return null;
    }

    if (routeName in windowMap) {
        const routeWindow = windowMap[routeName];
        routeWindow.focus();
        console.log(routeName, 'focused window', routeWindow.id);
        return routeWindow;
    } else {
        console.log(routeName, 'creating window');
        const windowOptions = getWindowOptions(routeName);
        // TODO vehicle namespace
        const routeWindow = window.open(url, 'StarControl/' + routeName, windowOptions);
        if (!routeWindow) {
            return null;
        }
        registerWindow(routeName, routeWindow);
        console.log(routeName, 'created window', routeWindow.id);
        return routeWindow;
    }
}

const WindowManager = {

    openWindow: function (routeName) {
        return doOpenWindow(routeName);
    },

    closeAllWindows: function () {
        const routeNames = ["Dashboard", "Diagnostics", "Sentuators", "ScriptControl"];
        routeNames.forEach(routeName => {
            if (routeName in windowMap) {
                const routeWindow = windowMap[routeName];
                routeWindow.close();
                delete(windowMap[routeName]);
            }
        });
    },
};

export default WindowManager;
