let interval = setInterval(clickOnAvatar, 5000);

async function clickOnAvatar() {
    console.log('clickOnAvatar()');
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
        console.log(new Date().toLocaleTimeString(), 'Status was changed');
    }
    else console.log('Cannot find avatarButton');
}

function timeout(ms= 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.runtime.onMessage.addListener(message => {
    console.log('message received from extension:', message);
    clearInterval(interval);

    if (message.extensionEnabled) interval = setInterval(clickOnAvatar, 5000);
});

document.addEventListener("visibilitychange", (ev) => {
    if (document.hidden) {
        console.log(new Date().toLocaleTimeString(), 'Document was hidden', ev);
    } else {
        console.log(new Date().toLocaleTimeString(), 'Document is visible', ev);
    }
});
