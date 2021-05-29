import { t, Selector } from 'testcafe';

class LoginPageModel {
    emailInput: Selector;
    passwordInput: Selector;
    submitButton: Selector;
    registrationSuccessfulAlert: Selector;
    errorMessageAlert: Selector;

    constructor () {
        this.emailInput = Selector('input').withAttribute('data-testid', 'email-input');
        this.passwordInput = Selector('input').withAttribute('data-testid', 'password-input');
        this.submitButton = Selector('button').withAttribute('data-testid', 'submit-button');
        this.registrationSuccessfulAlert = Selector('div').withAttribute('data-testid', 'registration-successful-alert');
        this.errorMessageAlert = Selector('div').withAttribute('data-testid', 'error-message-alert');
    }

    async typeCredentials(email, password) {
        await t.typeText(this.emailInput, email);
        await t.typeText(this.passwordInput, password);
    }

    async clearCredentials() {
        await t.selectText(this.emailInput).pressKey('delete');
        await t.selectText(this.passwordInput).pressKey('delete');
    }

    async submitForm() {
        await t.click(this.submitButton);
    }
}

export default new LoginPageModel();
