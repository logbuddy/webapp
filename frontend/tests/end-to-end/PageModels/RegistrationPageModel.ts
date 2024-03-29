import { t, Selector } from 'testcafe';

class RegistrationPageModel {
    emailInput: Selector;
    passwordInput: Selector;
    submitButton: Selector;

    constructor () {
        this.emailInput = Selector('input').withAttribute('data-testid', 'email-input');
        this.passwordInput = Selector('input').withAttribute('data-testid', 'password-input');
        this.submitButton = Selector('button').withAttribute('data-testid', 'submit-button');
    }

    async typeCredentials(email, password) {
        await t.typeText(this.emailInput, email);
        await t.typeText(this.passwordInput, password);
    }

    async submitForm() {
        await t.click(this.submitButton);
    }
}

export default new RegistrationPageModel();
