function clickOnButton() {
    const button = document.querySelector("#idna-me-control-avatar-trigger")

    if (button) {
        button.click();
    }
    else console.log("Not logged in");
}

setInterval(clickOnButton, 5000);
