
export default class LoginPage {

    constructor(page) {
        this.page = page;
    }

    // XPath Locators
    mobileInput = '//*[@id="loginPhone"]';
    passwordInput = '//*[@id="loginPassword"]';

    loginButton = '//button[normalize-space()="Login"]';

    async navigate() {
        await this.page.goto('/');
    }

    async login(mobile, password) {

        // Select Mobile Number option
        await this.page.getByLabel('Mobile Number').check();

        // Enter Mobile Number
        await this.page.locator(this.mobileInput).fill(mobile);

        // Enter Password
        await this.page.locator(this.passwordInput).fill(password);

        // Click Login
        await this.page.locator(this.loginButton).click();
    }
}
