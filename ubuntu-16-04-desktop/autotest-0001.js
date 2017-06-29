const tools = require('./autotest-tools');

const appPath = '/home/autotests/staff-app';
const configPath = '/home/autotests/.config/Staff.com';
const configPath2 = '/home/autotests/.local/share/SF/';
const uninstallPath = '/home/autotests/staff-app/uninstall';
const clearDownloadDir = '/bin/rm -rf /home/autotests/Downloads/*';
const maximizeFirefox = '/usr/bin/wmctrl -r "Mozilla Firefox" -b add,maximized_vert,maximized_horz';

const leftClick = 0;
const rightClick = 1;

const siteUrl = 'app.staff.com';
const login = 'alexey.dubchak+inviteuser697@staff.dev';
const password = '123456';

async function main() {
    tools.execute(clearDownloadDir);
    await tools.rmdir(configPath);
    await tools.rmdir(configPath2);
    await tools.rmdir(appPath);

    // Download client
    await tools.click('firefox-icon', leftClick, [100, 100]);
    await tools.waitFor('firefox-url');
    tools.execute(maximizeFirefox);
    await tools.input(siteUrl);
    await tools.pressEnter();

    await tools.waitFor('firefox-app-staff-com-login-tab-label');
    await tools.input(login);
    await tools.pressTab();
    await tools.input(password);
    await tools.click('firefox-app-staff-com-login-button', leftClick, [0, 0]);

    await tools.waitFor('firefox-app-staff-com--page-label-top-project');

    await tools.click('firefox-app-staff-com-download-button', leftClick, [0, 0]);
    await tools.click('firefox-app-staff-com-ubuntu-button', leftClick, [0, 0]);
    await tools.click('firefox-app-staff-com-download-for-ubuntu-button', leftClick, [0, 0]);
    await tools.click('firefox-download-dialog-save-file-button', leftClick, [0, 0]);

    await tools.click('firefox-downloaded-status', leftClick, [0, 200]);
    await tools.waitUntil('firefox-download-cancel-button');
    await tools.click('firefox-download-open-folder-button', leftClick, [0, 0]);

    await tools.click('firefox-icon-active', rightClick, [300, 0]);
    await tools.click('menu-quit-black', leftClick, [400, 400]);

    // Run installer
    await tools.click('staff-app-binary-icon', rightClick, [0, 0]);
    await tools.click('menu-properties', leftClick, [0, 0]);
    await tools.click('permissions-tab', leftClick, [0, 0]);
    await tools.click('allow-execute-checkbox', leftClick, [0, 0]);
    await tools.click('window-close-button', leftClick, [0, 0]);

    await tools.click('staff-app-binary-icon', rightClick, [0, 0]);
    await tools.click('menu-run', leftClick, [0, 0]);

    await tools.click('files-icon-active', rightClick, [0, 0]);
    await tools.click('menu-quit-black', leftClick, [0, 0]);

    await tools.click('installer-forward-button-active', leftClick, [0, 100]);
    await tools.click('installer-forward-button', leftClick, [0, 100]);
    await tools.waitFor('installer-setup-finish-message');
    await tools.click('installer-finish-button-active', leftClick, [0, 100]);

    // Login to client
    await tools.click('staff-app-email-edit', leftClick, [0, 0]);
    await tools.input(login);
    await tools.pressTab();
    await tools.input(password);
    await tools.click('staff-app-login-button', leftClick, [100, 100]);
    await tools.waitUntil('staff-app-login-button-disabled');

    // Check client work
    await tools.waitFor('staff-app-tray-inactive');

    await tools.click('staff-app-bio-true', leftClick, [0, 0]);
    await tools.click('staff-app-task-bausch', leftClick, [0, 0]);

    await tools.waitFor('staff-app-tray-active');
    await tools.waitFor('staff-app-active');
    await tools.waitFor('staff-app-informer-active');

    await tools.click('staff-app-active', leftClick, [300, 0]);

    await tools.waitFor('staff-app-tray-inactive');
    await tools.waitFor('staff-app-inactive');
    await tools.waitFor('staff-app-informer-inactive');

    await tools.click('staff-app-inactive', leftClick, [300, 0]);

    await tools.waitFor('staff-app-tray-active');
    await tools.waitFor('staff-app-active');
    await tools.waitFor('staff-app-informer-active');

    await tools.click('staff-app-task-opti-free', leftClick, [0, 0]);
    await tools.waitFor('staff-app-informer-task-opti-free');

    await tools.click('staff-app-active', leftClick, [300, 0]);

    await tools.waitFor('staff-app-tray-inactive');
    await tools.waitFor('staff-app-inactive');
    await tools.waitFor('staff-app-informer-inactive');

    await tools.click('staff-app-task-bausch', leftClick, [300, 0]);
    await tools.waitFor('staff-app-informer-task-bausch');
    await tools.waitFor('staff-app-tray-active');
    await tools.waitFor('staff-app-active');
    await tools.waitFor('staff-app-informer-active');

    // Logout from client
    await tools.click('staff-app-tray-active', rightClick, [0, 0]);
    await tools.click('menu-logout', leftClick, [0, 0]);

    // Quit from client
    await tools.click('staff-app-tray-inactive', rightClick, [0, 0]);
    await tools.click('menu-quit', leftClick, [0, 0]);

    // Uninstall client
    tools.execute(uninstallPath);

    await tools.waitFor('uninstall-message');
    await tools.click('dialog-yes-button-active', leftClick, [0, 0]);
    await tools.waitFor('uninstall-complete-message');
    await tools.click('dialog-ok-button-active', leftClick, [0, 0]);

    // Check that client uninstalled
    await tools.dirNotExists(appPath);
    await tools.rmdir(configPath);
    await tools.rmdir(configPath2);
    tools.execute(clearDownloadDir);
}

main().catch((err) => {
    console.log(err.stack || err);
});
