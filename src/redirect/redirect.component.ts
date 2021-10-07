import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    template: 'Redirecting...<a href="home">Click Here to proceed</a>'
})

export class RedirectComponent implements OnInit {

    constructor(private router: Router) {
    }

    static getCookie() {
        // Returns cookie if found
        // otherwise return '/home' for default
        const keyValue = document.cookie.match('(^|;) ?lastPage=([^;]*)(;|$)');
        var returnValue : string = "";
        if (keyValue == null) {
            returnValue = '/home';
        }
        if (keyValue[2].toString() == '/') {
            returnValue = '/home';
        }
        else {
            returnValue = keyValue ? keyValue[2] : '/home';
        }
        return returnValue;

    }

    ngOnInit() {
        // Redirects to whatever the cookie is
        const promise = this.router.navigate([RedirectComponent.getCookie()]);
        //console.log(promise);
    }
}
