async function clickOnButton() {
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
    }
    else console.log('Cannot find avatarButton');
}

setInterval(clickOnButton, 5000);

function timeout(ms= 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
