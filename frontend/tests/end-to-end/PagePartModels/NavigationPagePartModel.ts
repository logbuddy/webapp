import { t, Selector } from 'testcafe';

class NavigationPagePartModel {
    loggedinUserBadge: Selector;

    constructor() {
        this.loggedinUserBadge = Selector('li').withAttribute('data-testid', 'loggedin-user-badge');
    }
}

export default new NavigationPagePartModel();
