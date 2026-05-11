let extensionEnabled = false;
const teamsUrl = 'https://teams.microsoft.com/v2/';
const wakeupAlarmName = 'wakeup-alarm';
// https://developer.chrome.com/docs/extensions/reference/api/tabs

// when the browser starts up
chrome.runtime.onStartup.addListener(initializeExtensionState);

chrome.runtime.onInstalled.addListener(({reason}) => {
    initializeExtensionState();
    console.log('Teams Always On extension ' + reason);

    chrome.contextMenus.removeAll().then(() => chrome.contextMenus.create({
        id: 'reload', title: 'Reload Extension', visible: true, contexts: ['action']
    }));
});

chrome.action.onClicked.addListener(async (activeTab) => {
    if (!activeTab.url?.startsWith(teamsUrl)) {
        await openTeamsTab();
        return;
    }

    if (extensionEnabled) {
        await disableExtension('Disabled from extension action');
    } else {
        await enableExtension();
    }
});

chrome.alarms.onAlarm.addListener(async ({name}) => {
    if (!extensionEnabled) return;

    const teamsTab = await getTeamsTab();
    if (!teamsTab) {
        await disableExtension('Teams tab is not available');
        return;
    }

    console.log('Sending alarm', name);

    const messageSent = await sendContentScriptStatus(teamsTab.id, true);
    if (!messageSent) {
        await disableExtension('Cannot communicate with Teams tab');
    }
});

chrome.tabs.onRemoved.addListener(disableIfNoTeamsTab);
async function disableIfNoTeamsTab(tabid, info) {
    console.log('chrome.tabs.onRemoved()', tabid, info)
    if (!extensionEnabled) return;

    const teamsTab = await getTeamsTab();
    if (!teamsTab) await disableExtension('No Teams tab is open');
}

// on click 'Reload Extension'
chrome.contextMenus.onClicked.addListener(async info => {
    if (info.menuItemId !== 'reload') return;

    console.log('Clicked on the context menu button - reload extension');
    const tabs = await chrome.tabs.query({url: teamsUrl + '*'});

    tabs.forEach((tab, index) => {
        if (index === 0) chrome.tabs.update(tab.id, { active: true, url: tabs[0].url });
        else chrome.tabs.remove(tab.id); // removing other Teams tabs if exist
    })

    chrome.runtime.reload();
});

async function enableExtension(tabId) {
    const teamsTab = tabId ? {id: tabId} : await getTeamsTab();
    if (!teamsTab) {
        await disableExtension('Teams tab is not available');
        return;
    }

    const messageSent = await sendContentScriptStatus(teamsTab.id, true);
    if (!messageSent) {
        await disableExtension('Cannot enable Teams tab', teamsTab.id);
        return;
    }

    extensionEnabled = true;

    await startKeepAwake();
}

async function disableExtension(reason, tabId) {
    extensionEnabled = false;
    chrome.power.releaseKeepAwake();
    await chrome.alarms.clearAll();

    const teamsTab = tabId ? {id: tabId} : await getTeamsTab();
    if (teamsTab) await sendContentScriptStatus(teamsTab.id, false);

    await setIconStatus(false);
    if (reason) console.log('Teams Always On disabled:', reason);
}

function initializeExtensionState() {
    setTimeout(enableExtension, 3000);
}

async function startKeepAwake() {
    const alarm = await chrome.alarms.get(wakeupAlarmName);
    console.log('Alarm timer before', alarm?.name);

    if (!alarm) await chrome.alarms.create(wakeupAlarmName, {
        delayInMinutes: 2,
        periodInMinutes: 2
    });

    chrome.power.requestKeepAwake('system');
    await setIconStatus(true);

    const alarm2 = await chrome.alarms.get(wakeupAlarmName);
    console.log('Alarm timer after', alarm2);
}

async function sendContentScriptStatus(tabId, enabled) {
    try {
        await chrome.tabs.sendMessage(tabId, {extensionEnabled: enabled});
        return true;
    } catch (e) {
        console.log('Error sending message to tab id:', tabId, e);
        return false;
    }
}

async function getTeamsTab() {
    const teamsTabs = await chrome.tabs.query({url: teamsUrl + '*'});
    return teamsTabs[0];
}

async function setIconStatus(enabled) {
    await chrome.action.setIcon({path: 'images/icon-128' + (enabled ? '' : '-disabled') + '.png'});
    await chrome.action.setTitle({title: enabled ? 'Enabled' : 'Disabled'});
}

async function openTeamsTab() {
    const teamsTab = await getTeamsTab();
    if (teamsTab) await chrome.tabs.update(teamsTab.id, {active: true});
    else await chrome.tabs.create({
        url: teamsUrl,
        active: true
    });
}
