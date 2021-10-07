import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    url: string;

    constructor(private router: Router) {
        // update this.url whenever url changed
        router.events.subscribe((_: NavigationEnd) => {
            if (_.url !== undefined) {
                this.url = _.url;
            }
        });
    }

    static getCookie() {
        // Returns cookie if found
        // otherwise return '/home' for default
        const keyValue = document.cookie.match('(^|;) ?hitCount=([^;]*)(;|$)');
        return keyValue ? +keyValue[2] : 0;
    }

    static handleAnimatedArrow() {
        const hitCount = AppComponent.getCookie();
        if (hitCount > 7) {
            $('.animated-arrow').hide();
        }
        const expires = new Date();
        expires.setTime(expires.getTime() + (900 * 24 * 60 * 60 * 1000));
        document.cookie = 'hitCount' + '=' + (hitCount + 1) + ';expires=' + expires.toUTCString();
    }

    // Sets the name of the menu on the top left according to the url
    menuName() {
        if (this.url === '/favs') {
            return 'Favs';
        } else if (this.url === '/home') {
            return 'Home';
        } else if (this.url === '/links') {
            return 'Links';
        }
    }

    ngOnInit() {
        AppComponent.handleAnimatedArrow();
    }
}
