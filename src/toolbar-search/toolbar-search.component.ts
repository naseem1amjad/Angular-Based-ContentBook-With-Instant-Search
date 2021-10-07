import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';

import {DataTransferService} from '../data-transfer/data-transfer.service';
import {Router, NavigationEnd} from '@angular/router';

@Component({
    selector: 'app-toolbar-search',
    templateUrl: './toolbar-search.component.html',
    styleUrls: ['./toolbar-search.component.css'],
})
export class ToolbarSearchComponent implements OnInit {

    advancedToggleVal: boolean; // updates automatically from [(ngModel)] in html
    searchValue: string; // updates automatically from [(ngModel)] in html
    disabled = false;
    hovering = false;

    constructor(private router: Router, private dataTransferService: DataTransferService) {
        // Clear search bar on url change
        this.router.events.subscribe((_: NavigationEnd) => {
            if (_.url === undefined) {
                return;
            }
            this.searchValue = '';
            this.disabled = _.url === '/links';
        });
    }

    advancedToggle() {
        // called when clicked on the toggle button
        //console.log("Filter Clicked");
        this.dataTransferService.setAdvancedToggle(this.advancedToggleVal);
    }

    clearAdvancedSearch() {
        this.dataTransferService.resetAdvancedSearch();
        this.applyFilter();
    }

    applyFilter() {
        // called on keyup in searchbar
        this.dataTransferService.changeFilterText(this.searchValue);
    }

    ngOnInit() {
        this.advancedToggle();
    }

}
