let extensionEnabled = true;
const teamsUrl = 'https://teams.microsoft.com/v2/';
// https://developer.chrome.com/docs/extensions/reference/api/tabs

chrome.action.onClicked.addListener(activeTab => {
    // if Teams tab is active
    if (activeTab.url.startsWith(teamsUrl)) {
        enableDisableContentScript(activeTab.id);
    } else {
        openTeamsTab();
    }
});

chrome.runtime.onInstalled.addListener(async ({reason}) => {
    console.log('Teams Always On extension ' + reason);
    const {os, arch} = await chrome.runtime.getPlatformInfo();
    console.log(`Browser Platform: ${os} ${arch}`);

    if (reason === 'install' || reason === 'update') {
        chrome.contextMenus.create({
            id: 'reload', title: 'Reload Extension', visible: true, contexts: ['action']
        });

        const alarm = await chrome.alarms.get('wakeup-alarm');
        if (!alarm) await chrome.alarms.create('wakeup-alarm', {
            delayInMinutes: 2,
            periodInMinutes: 2
        });
    }
});

async function enableDisableContentScript(tabId) {
    extensionEnabled = !extensionEnabled;

    try {
        await chrome.tabs.sendMessage(tabId, {extensionEnabled});
    } catch (e) {
        chrome.tabs.reload(tabId);
        extensionEnabled = !extensionEnabled;
        return;
    }

    if (extensionEnabled) chrome.power.requestKeepAwake('system');
    else chrome.power.releaseKeepAwake();

    chrome.action.setIcon({path: 'images/icon-128' + (extensionEnabled ? '' : '-disabled') + '.png'});
    chrome.action.setTitle({title: extensionEnabled ? 'Teams Always On - Enabled ' : 'Teams Always On - Disabled'});
}

async function openTeamsTab() {
    const teamsTabs = await chrome.tabs.query({url: teamsUrl});
    if (teamsTabs.length === 0) await chrome.tabs.create({
        url: teamsUrl,
        active: true
    });
    else await chrome.tabs.update(teamsTabs[0].id, {active: true});
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (extensionEnabled && alarm.name) {
        const teamsTabs = await chrome.tabs.query({url: teamsUrl});
        if (teamsTabs.length) await chrome.tabs.sendMessage(teamsTabs[0].id, {extensionEnabled});
        console.log('Sending alarm', alarm.name);
    }
});

chrome.contextMenus.onClicked.addListener(async info => {
    if (info.menuItemId !== 'reload') return;

    console.log('Clicked on the context menu button');
    const tabs = await chrome.tabs.query({url: teamsUrl})
    if (tabs.length > 0) tabs.forEach((tab, index) => {
        if (index === 0) chrome.tabs.update(tab.id, { active: true, url: tabs[0].url });
        else chrome.tabs.remove(tab.id);
    })

    chrome.runtime.reload();
});