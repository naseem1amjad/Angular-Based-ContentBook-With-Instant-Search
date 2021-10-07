import {Component, OnInit} from '@angular/core';

import {DataTransferService} from '../data-transfer/data-transfer.service';
import {Router, NavigationEnd} from '@angular/router';

@Component({
    selector: 'app-advanced-search',
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.css']
})
export class AdvancedSearchComponent implements OnInit {

    url: string;
    selectsData: object; // Select options from data

    // All update automatically from [(ngModel)] in html
    NAME: string;
    DEPARTMENT: string;
    TEAM_NAME: string;
    DESIGNATION: string;
    TELEXTENSION: string;
    EMPCODE: string;
    ATTENDANCE: string;
    FAV: string;
    MOBILE: string;
    BLOODGROUP: string;
    VEHICLE: string;

    constructor(private router: Router, private dataTransferService: DataTransferService) {
        this.router.events.subscribe((_: NavigationEnd) => {
            this.url = _.url;
        });
        this.dataTransferService.advancedSearchSelects.subscribe((selectsData) => this.selectsData = selectsData);
        this.dataTransferService.advancedToggle.subscribe(() => this.clear());
    }

    ngOnInit() {
    }

    clear() {
        this.NAME = undefined;
        this.DEPARTMENT = undefined;
        this.TEAM_NAME = undefined;
        this.DESIGNATION = undefined;
        this.TELEXTENSION = undefined;
        this.EMPCODE = undefined;
        this.ATTENDANCE = undefined;
        this.FAV = undefined;
        this.MOBILE = undefined;
        this.BLOODGROUP = undefined;
        this.VEHICLE = undefined;
        this.search();
    }

    search() {
        this.dataTransferService.changeAdvancedSearch({
            NAME: this.NAME,
            DEPARTMENT: this.DEPARTMENT,
            TEAM_NAME: this.TEAM_NAME,
            DESIGNATION: this.DESIGNATION,
            TELEXTENSION: this.TELEXTENSION,
            EMPCODE: this.EMPCODE,
            ATTENDANCE: this.ATTENDANCE,
            FAV: this.FAV === undefined ? this.url === '/favs' : this.FAV,
            MOBILE: this.MOBILE,
            BLOODGROUP: this.BLOODGROUP,
            VEHICLE: this.VEHICLE,
            // Used for HomeComponent.filterPredicate
            // May be useless (workable without this)
            newSearch: true
        });
    }

}
