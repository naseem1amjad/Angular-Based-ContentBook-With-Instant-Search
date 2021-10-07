import {Component, OnInit} from '@angular/core';

const LINKS: object[] = [
    {
        href: 'https://www.ajsoftpk.com/naseem_amjad/',
        text: 'Home Page',
        desc: 'Naseem Amjad Home Page',
        icon: 'flare'
    },
    {
        href: 'https://www.urdujini.com',
        text: 'Urdu Game',
        desc: 'Urdu Game called PhansiGhar',
        icon: 'school'
    },
    {
        href: 'https://www.ajsoftpk.com/naseem_amjad/urdu/',
        text: 'Free Urdu Software',
        desc: 'Urdu Software to download',
        icon: 'mood'
    },
    {
        href: 'https://www.ajsoftpk.com/ ',
        text: 'AJSoft',
        desc: 'Software Development Company',
        icon: 'code'
    },
    {
        href: 'https://www.urdujini.com/phansighar/ ',
        text: 'Urdu Word Game',
        desc: 'Urdu Hangman Game',
        icon: 'cloud'
    },
];

@Component({
    selector: 'app-links',
    templateUrl: './links.component.html',
    styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

    links = LINKS;

    constructor() {
    }

    ngOnInit() {
    }

}

