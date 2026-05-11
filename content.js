let interval;

async function clickOnAvatar() {
    console.debug(new Date().toLocaleTimeString(), 'Check the status');
    const avatarButton = document.querySelector('#idna-me-control-avatar-trigger')

    if (avatarButton) {
        if (!avatarButton.ariaLabel.includes('Away')) return;

        avatarButton.click();
        await timeout();

        const statusButton = document.querySelector('div[role="menuitem"][tabindex="0"][data-tid="set-presence-status-menu-item"]');
        statusButton?.click();
        await timeout();

        const availableButton = document.querySelector('div[role="menuitemradio"][tabindex="0"][name="status"][data-tid="me_control_presence_availability_available"]')
        availableButton?.click();
        await timeout();

        avatarButton.click();
        console.log(new Date().toLocaleTimeString(), 'Status was changed from Away to Available');
    }
    else console.warn('clickOnAvatar() - Cannot find avatarButton ' + new Date().toLocaleTimeString());
}

function timeout(ms= 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(new Date().toLocaleTimeString(), 'Message from the extension:', message);

    if (message.extensionEnabled) startCheckingStatus();
    else stopCheckingStatus();

    sendResponse?.({extensionEnabled: Boolean(interval)});
});

function startCheckingStatus() {
    stopCheckingStatus();
    clickOnAvatar();
    interval = setInterval(clickOnAvatar, 5000);
}

function stopCheckingStatus() {
    if (!interval) return;

    clearInterval(interval);
    interval = undefined;
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        console.log(new Date().toLocaleTimeString(), 'Teams page was hidden');
    } else {
        console.log(new Date().toLocaleTimeString(), 'Teams page is visible');
    }
});
