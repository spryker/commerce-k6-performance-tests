import { AbstractPage } from '../abstract-page';

const url = '/security-gui/login';

const formSelector = 'form[name="auth"]';
const inputEmailSelector = `${formSelector} input[name="auth[username]"]`;
const inputPasswordSelector = `${formSelector} input[name="auth[password]"]`;
const submitButtonSelector = `${formSelector} button[type="submit"]`;

export class LoginPage extends AbstractPage {
    async open() {
        await this.page.goto(`${this.baseUrl}${url}`);
    }

    async fillEmail(email) {
        await this.page.locator(inputEmailSelector).type(email);
    }

    async fillPassword(password) {
        await this.page.locator(inputPasswordSelector).type(password);
    }

    async submitForm() {
        await this.page.locator(submitButtonSelector).click();
    }
}