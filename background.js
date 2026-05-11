let extensionEnabled = true;
const teamsUrl = 'https://teams.microsoft.com/v2/';
// https://developer.chrome.com/docs/extensions/reference/api/tabs

// when the browser starts up
chrome.runtime.onStartup.addListener(async () => {
    const alarm = await chrome.alarms.get('wakeup-alarm');
    console.log('Teams Always On extension started', alarm);
});

chrome.runtime.onInstalled.addListener(async ({reason}) => {
    console.log('Teams Always On extension ' + reason);
    const alarm = await chrome.alarms.get('wakeup-alarm');
    console.log('Alarm timer', alarm);

    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: 'reload', title: 'Reload Extension', visible: true, contexts: ['action']
    });
});

chrome.action.onClicked.addListener(async (activeTab) => {
    // if Teams tab is active
    if (activeTab.url.startsWith(teamsUrl)) {
        await enableDisableContentScript(activeTab.id);
    } else {
        await openTeamsTab();
    }

    const alarm = await chrome.alarms.get('wakeup-alarm');
    console.log('Alarm timer before', alarm);

    if (extensionEnabled) {

        if (!alarm) await chrome.alarms.create('wakeup-alarm', {
            delayInMinutes: 2,
            periodInMinutes: 2
        });

        chrome.power.requestKeepAwake('system');
    }
    else {
        chrome.power.releaseKeepAwake();
        await chrome.alarms.clearAll();
    }

    const alarm2 = await chrome.alarms.get('wakeup-alarm');
    console.log('Alarm timer after', alarm2);

});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (extensionEnabled && alarm.name) {
        const teamsTabs = await chrome.tabs.query({url: teamsUrl});
        if (teamsTabs.length) await chrome.tabs.sendMessage(teamsTabs[0].id, {extensionEnabled});
        console.log('Sending alarm', alarm.name);
    }
});

// on click 'Reload Extension'
chrome.contextMenus.onClicked.addListener(async info => {
    if (info.menuItemId !== 'reload') return;

    console.log('Clicked on the context menu button');
    const tabs = await chrome.tabs.query({url: teamsUrl + '*'});
    console.log('Tabs', tabs[0]?.url);

    tabs.forEach((tab, index) => {
        if (index === 0) chrome.tabs.update(tab.id, { active: true, url: tabs[0].url });
        else chrome.tabs.remove(tab.id);
    })

    chrome.runtime.reload();
});

async function enableDisableContentScript(tabId) {
    extensionEnabled = !extensionEnabled;

    try {
        await chrome.tabs.sendMessage(tabId, {extensionEnabled});
    } catch (e) {
        console.log('Error sending message to tab id:', tabId, e);
        await chrome.tabs.reload(tabId);
        extensionEnabled = !extensionEnabled;
        return;
    }

    await chrome.action.setIcon({path: 'images/icon-128' + (extensionEnabled ? '' : '-disabled') + '.png'});
    await chrome.action.setTitle({title: extensionEnabled ? 'Teams Always On - Enabled ' : 'Teams Always On - Disabled'});
}

async function openTeamsTab() {
    const teamsTabs = await chrome.tabs.query({url: teamsUrl + '*'});
    if (teamsTabs.length) await chrome.tabs.update(teamsTabs[0].id, {active: true});
    else await chrome.tabs.create({
        url: teamsUrl,
        active: true
    });
}
