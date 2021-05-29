import registrationPage from './PageModels/RegistrationPageModel';
import loginPage from './PageModels/LoginPageModel';
import navigationPagePart from './PagePartModels/NavigationPagePartModel';

fixture `The registration and login pages`
    .page `http://localhost:3000/#/register`

test
    ('should allow to register and then log into a new account', async t => {

        await t.expect(navigationPagePart.loggedinUserBadge.exists).eql(false);

        const email = `j.doe+${Math.random()}@example.com`;

        await registrationPage.typeCredentials(email, 's3cret');
        await t.expect(registrationPage.emailInput.value).eql(email);
        await t.expect(registrationPage.passwordInput.value).eql('s3cret');

        await registrationPage.submitForm();

        await t.expect(loginPage.registrationSuccessfulAlert.textContent).eql('Registration finished successfully. Please log in.');

        await loginPage.typeCredentials(email, 'wrong s3cret');
        await t.expect(loginPage.emailInput.value).eql(email);
        await t.expect(loginPage.passwordInput.value).eql('wrong s3cret');

        await loginPage.submitForm();

        await t.expect(loginPage.errorMessageAlert.textContent).eql('Unexpected response from server (code 403).');

        await loginPage.clearCredentials();
        await loginPage.typeCredentials(email, 's3cret');
        await t.expect(loginPage.emailInput.value).eql(email);
        await t.expect(loginPage.passwordInput.value).eql('s3cret');

        await loginPage.submitForm();

        await t.expect(navigationPagePart.loggedinUserBadge.textContent).contains(email);
    });
