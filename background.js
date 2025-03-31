let extensionEnabled = true;
const teamsUrl = 'https://teams.microsoft.com/v2';


chrome.action.onClicked.addListener(async (tab) => {
    const teamsTabs = await chrome.tabs.query({ url: teamsUrl + '/*' });
    if (teamsTabs.length === 0) {
        await chrome.tabs.create({url: teamsUrl, active: true});
    }
    else {
        if (tab.url.startsWith(teamsUrl)) { // if tab is active
            extensionEnabled = !extensionEnabled;

            await chrome.tabs.sendMessage(tab.id, {extensionEnabled});

            chrome.action.setIcon({
                path: {
                    38: 'images/icon-128' + (extensionEnabled ? '' : '-disabled') + '.png'
                }
            });
            chrome.action.setTitle({ title: extensionEnabled ? 'Teams Always On - Enabled ' : 'Teams Always On - Disabled' });
        }
        else {
            await chrome.tabs.update(teamsTabs[0].id, { active: true });
        }
    }
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    /*
    "install" Specifies the event reason as a new installation.
    "update" an extension update.
    "chrome_update" Chrome update.
    "shared_module_update" update to a shared module.
     */

    const { isOnToolbar } = await chrome.action.getUserSettings();
    const { os, arch } = await chrome.runtime.getPlatformInfo();
    console.log('Extension icon pinned: ' + isOnToolbar);
    console.log(`Browser Platform: ${os} ${arch}`);

    if (reason === 'install' || reason === 'update') {
        if (!chrome.contextMenus) return;
        chrome.contextMenus.create({
            id: 'reload',
            title: 'Reload Extension',
            visible: true,
            contexts: ['action']
        });

        // if (chrome.contextMenus.onClicked.hasListeners()) return;

        chrome.contextMenus.onClicked.addListener(info => {
            console.log('Clicked on the context menu button');
            switch (info.menuItemId) {
                case 'reload':
                    chrome.runtime.reload();
                    break;
            }
        });

        console.log('added a new contextMenus listener');
    }
});
