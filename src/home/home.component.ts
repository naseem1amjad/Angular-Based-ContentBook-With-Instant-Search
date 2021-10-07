import {Component, OnInit, ViewChild} from '@angular/core';
import {
    MatPaginator,
    MatSort,
    MatTableDataSource,
    MatSnackBar,
    MatSortHeader,
    MatSortable
} from '@angular/material';
import {Router, NavigationEnd} from '@angular/router';

import {DataTransferService} from '../data-transfer/data-transfer.service';
import {EmployeeService} from '../employee/employee.service';

declare var $: any;

const MIN_SEARCH_LENGTH = 2;
const FILTER_FAVS = '###star'; // Special string that tells the filter to show all favorite records
const FILTER_ADVANCED = '###advanced'; // Special string that tells to filter using fields in advanced filter
                                       // instead of the search bar
const FAVORITE_STRING = 'star';
const NOT_FAVORITE_STRING = 'star_outline';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    // columns displayed in table in order
    displayedColumns: string[] = ['FAV', 'EMPCODENUMBER', 'NAME', 'EMAIL', 'TELEXTENSION', 'MOBILE',
        'DEPARTMENT', 'TEAM_NAME', 'DESIGNATION', 'BLOODGROUP', 'CAR', 'BIKE'];
    dataSource = new MatTableDataSource([]); // MatTableDataSource allows for sorting, pagination, filtering

    markerTimeout;
    url: string;
    advancedSearch: object;
    advancedToggleVal: boolean;
    filterTextSaved: string;

    constructor(private router: Router, private dataTransferService: DataTransferService,
        private employeeService: EmployeeService, private snackbar: MatSnackBar) {
        // change this.url and url in DataTransferService whenever it changes
        this.router.events.subscribe((_: NavigationEnd) => {
            this.url = _.url;
            this.dataTransferService.changeUrl(_.url);
        });
    }

    static favoriteHelper(favs: string, employeeCodeNumber) {
        // toggles employeeCodeNumber in favs
        const favsList = favs.split(',');
        const foundIndex = $.inArray(employeeCodeNumber, favsList);
        if (foundIndex === -1) { // if employeeCodeNumber not in favs, add it
            favsList.push(employeeCodeNumber);
        } else { // if employeeCodeNumber in favs, remove it
            favsList.splice(foundIndex, 1);
        }
        return favsList;
    }

    static getCookie(key) {
        // returns cookie if found else return 'new'
        const keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : 'new';
    }

    static fixNameLeft(event = null) {
        //console.log('Fixing left');
        $('.mat-column-NAME').css('left', $('.mat-header-cell.mat-column-EMPCODENUMBER').innerWidth());//hack for white space showing before second verical (name) column 
    }

    ngOnInit() {
        this.dataTransferService.filterText.subscribe((e) => {
            this.applyFilter(e);
            this.filterTextSaved = e;
            setTimeout(HomeComponent.fixNameLeft, 200);
        });
        this.dataTransferService.advancedSearch.subscribe((search: object) => {
            this.advancedSearch = search;
            const keys = Object.keys(search);
            let allEmpty = true; // Variable to check if all fields in search are empty so we should remove
                                 // any filters
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] === 'newSearch') {
                    continue;
                } // newSearch is never empty; skip it. Check newSearch in advanced-search.component.ts
                // Continues as empty if field undefined
                if (this.advancedSearch[keys[i]] === undefined) {
                    continue;
                }
                if (keys[i] === 'FAV' || keys[i] === 'ATTENDANCE') { // treat false for checkboxes as empty
                    allEmpty = !this.advancedSearch[keys[i]];
                    if (!allEmpty) {
                        break;
                    }
                } else if ($.inArray(keys[i], ['DEPARTMENT', 'TEAM_NAME', 'DESIGNATION', 'BLOODGROUP']) !==
                    -1) {
                    // Treats only undefined as empty for select fields
                    allEmpty = false;
                    break;
                } else if (this.advancedSearch[keys[i]].trim().length > 0) { // Treat only whitespace as empty for text
                    allEmpty = false;
                    break;
                }
            }
            if (allEmpty) {
                this.advancedSearch['newSearch'] = false;
                this.applyFilter(''); // Update empty filter
            } else {
                this.applyFilter(FILTER_ADVANCED);
            }
        });
        this.dataTransferService.advancedToggle.subscribe((val) => {
            //console.log("for IE: advanced Toggle Subscribe ="+val);
            this.advancedToggleVal = val; // Used to display and hide the advanced filter div
            $('div.main').scrollTop(0);
        });
        this.paginator.showFirstLastButtons = true;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.employeeService.getEmployees().subscribe( // Do these things when new data fetched from service
            (dataSource: object[]) => {
                $('.loader').hide();
                for (let i = 0; i < dataSource.length; i++) {
                    const email = dataSource[i]['EMAIL'];
                    if (email != null) //added by nsm
                        dataSource[i]['EMAILID'] = email.substr(0, email.indexOf('@'));
                }
                this.dataSource = new MatTableDataSource(dataSource);
                this.dataSource.paginator = this.paginator;
                //this.sort.sort(<MatSortable>({id: 'EMPCODENUMBER', start: 'asc'}));
                this.sort.sortChange.subscribe(HomeComponent.fixNameLeft);
                this.dataSource.sort = this.sort;
                // Redefine the data to sort for each column
                this.dataSource.sortingDataAccessor = (item, property) => {
                    switch (property) {
                        case 'CAR':
                            return item.CAR1; // Sort using fav instead of id in id row
                        default:
                            return item[property]; // Regular data in the rest
                    }
                };

                // Use custom filtering
                this.dataSource.filterPredicate = (data, filter) => this.filterPredicate(data, filter);
                this.updateFavs();
                this.applyFilter(undefined);
                // update data in DataTransferService for AdvancedSearchComponent select options
                setTimeout(HomeComponent.fixNameLeft, 200);
            }
        );
        this.handleBackToTopButton();
    }

    onPaginateChange(event) {
        this.highlight(this.filterTextSaved);
    }

    handleBackToTopButton() {
        // hides BackToTopButton if already near top and shows it if scrolled down
        // go to top on clicking the button
        const backToTop = $('.back-to-top');
        const divMain = $('div.main');
        backToTop.click(function () {
            divMain.animate({scrollTop: 0}, 500, 'swing');
        });
        divMain.scroll(function () {
            if ($(this).scrollTop() > 500) {
                backToTop.show();
            } else {
                backToTop.hide();
            }
        });
    }

    filterPredicate(data, filter) {
        // if should search from advanced search fields
        if (this.advancedSearch !== {} && ('newSearch' in this.advancedSearch) &&
            this.advancedSearch['newSearch']) {
            const keys = Object.keys(this.advancedSearch);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (this.advancedSearch[key] === undefined || key === 'newSearch') {
                    continue;
                } // if field not set in advanced search, don't try to filter using it
                if (key === 'VEHICLE') { // Special handling of vehicle field
                    let vehicleFound = false;
                    // filter vehicle field text from non alphanumerics
                    const vehicle = this.advancedSearch['VEHICLE'].trim().toLowerCase()
                        .replace(/[^a-zA-Z0-9 ]/g, '');
                    
                    // Check car1, car2 and motorBike fields in records for matches
                    if (data['CAR1'] != undefined &&
                        data['CAR1'].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').indexOf(vehicle) !== -1) {
                        vehicleFound = true;
                    }
                    if (data['CAR2'] != undefined &&
                        data['CAR2'].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').indexOf(vehicle) !== -1) {
                        vehicleFound = true;
                    }
                    if (data['BIKE'] != undefined &&
                        data['BIKE'].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').indexOf(vehicle) !== -1) {
                        vehicleFound = true;
                    }
                    if (!vehicleFound) {
                        return false;
                    }
                } else if (key === 'FAV') { // Special handling of favorite field
                    if (this.advancedSearch[key] && data['FAV'] === NOT_FAVORITE_STRING) {
                        return false;
                    }
                } else if (key === 'ATTENDANCE') { // Special handling of attendance field
                } else if ($.inArray(key, ['DEPARTMENT', 'TEAM_NAME', 'DESIGNATION', 'BLOODGROUP']) !== -1) {
                    // Special handling of select inputs
                    if (data[key] === undefined && this.advancedSearch[key].lenght > 0) {
                        return false;
                    }
                    if (data[key] !== this.advancedSearch[key]) {
                        return false;
                    }
                } else { // All other fields
                    if (data[key] === undefined && this.advancedSearch[key].trim().length > 0) {
                        return false;
                    }
                    if (String(data[key]).toLowerCase()
                        .indexOf(this.advancedSearch[key].trim().toLowerCase()) === -1) {
                        return false;
                    }
                }
            }
            return true; // if not retured false above, all fields were found so return true
        }
        // if should search from search bar
        let matchesFilterInAny = false; // match found in any field
        
        if ((data.NAME !== undefined && data.NAME.toLowerCase().indexOf(filter) !== -1)
            || (data.DEPARTMENT !== undefined && data.DEPARTMENT.toLowerCase().indexOf(filter) !== -1)
            || (data.TEAM_NAME !== undefined && data.TEAM_NAME.toLowerCase().indexOf(filter) !== -1)
            ||
            (data.TELEXTENSION != undefined && String(data.TELEXTENSION).toLowerCase().indexOf(filter) !== -1)
            || (data.DESIGNATION != undefined && data.DESIGNATION.toLowerCase().indexOf(filter) !== -1)
            || (data.EMPCODE !== undefined && String(data.EMPCODE).toLowerCase().indexOf(filter) !== -1)
            || (data.EMAIL != undefined && data.EMAIL.toLowerCase().indexOf(filter) !== -1)
            || (data.MOBILE != undefined && data.MOBILE.toLowerCase().indexOf(filter) !== -1)
            || (data.BLOODGROUP != undefined && data.BLOODGROUP.toLowerCase().indexOf(filter) !== -1)
            || (data.CAR1 != undefined && data.CAR1.toLowerCase().indexOf(filter) !== -1)
            || (data.CAR2 != undefined && data.CAR2.toLowerCase().indexOf(filter) !== -1)
            || (data.BIKE != undefined && data.BIKE.toLowerCase().indexOf(filter) !== -1)) {
            matchesFilterInAny = true;
        }
        if (this.url === '/home') {
            return matchesFilterInAny;
        } // no need to check favorite if in /home
        if (data.FAV === NOT_FAVORITE_STRING) {
            return false;
        } // if in /favs and not favorite
        if (filter === FILTER_FAVS) {
            return true;
        } // if in /favs and filter is set to all favorite records, disregard matchesFound and return true
        return matchesFilterInAny; // if in /favs and record is favorite
    }

    clickFavorite(e) {
        // Called from favorite button in id column
        // Toggles favorite state

        // Click can come from the button or the mat-icon
        if (e.tagName === 'MAT-ICON') {
            e = e.parentElement.parentElement;
        } // This makes e point to the same tag for future
        // Employee Code is in a hidden span in a tag before the button
        e = e.previousSibling; // Point to the span
        const employeeCodeNumber = e.innerHTML; // Should be employee code
        if (typeof(Storage) === 'undefined') { // If local storage not supported
            let favs = HomeComponent.getCookie('favs'); // then get favs from cookies
            if (favs === 'new') { // if favs never set before
                favs = ''; // make favs sensible value for future
                const snackBar = this.snackbar.open('No HTML5 Storage. Using cookies', 'Okay'); // and show
                                                                                                // user a
                // message that we're
                // using cookies
                snackBar.onAction().subscribe(() => snackBar.dismiss()); // dismiss message on clicking the
                                                                         // button in the message
                setTimeout(() => snackBar.dismiss(), 7000); // dismiss after 7 seconds either way
            }
            // get updated favs list after removing or adding favorite
            const favsList = HomeComponent.favoriteHelper(favs, employeeCodeNumber);
            // set favs cookie
            const expires = new Date();
            expires.setTime(expires.getTime() + (900 * 24 * 60 * 60 * 1000));
            document.cookie = 'favs' + '=' + favsList + ';expires=' + expires.toUTCString();
        } else { // if local storage supported
            let favs = localStorage.favs;
            if (favs === undefined) {
                favs = '';
            }
            // get updated favs list after removing or adding favorite
            favs = HomeComponent.favoriteHelper(favs, employeeCodeNumber);
            localStorage.favs = favs;
        }
        this.updateFavs(employeeCodeNumber); // update favorite button of record
    }

    updateFavs(employeeCodeNumber?) {
        // Makes all favorite records stars filled and unfavortie records unfilled
        // Parameter employeeCodeNumber (optional)
        //           if set, only updates the record of employeeCodeNumber
        // Sets record.fav = FAVORITE_STRING or NOT_FACORTIE_STRING
        const data = this.dataSource.data;
        if (data === undefined || data.length === 0) {
            return;
        }
        let favs: string; // Get favs from cookies or local storage
        if (typeof(Storage) === 'undefined') {
            favs = HomeComponent.getCookie('favs');
        } else {
            favs = localStorage.favs;
        }
        if (favs === undefined) {
            favs = '';
        }
        const favsList = favs.split(',');

        // If employeeCodeNumber passed
        if (employeeCodeNumber !== undefined) {
            $.each(data, function (i, employee) {
                // Find record with employeeCodeNumber and update
                if (String(employee.EMPCODENUMBER) === employeeCodeNumber) {
                    employee.FAV = $.inArray(employeeCodeNumber, favsList) ===
                    -1 ? NOT_FAVORITE_STRING : FAVORITE_STRING;
                    return;
                }
            });
        } else {
            for (let i = 0; i < data.length; i++) { // Update all recoreds
                data[i].FAV =
                    $.inArray(String(data[i].EMPCODENUMBER), favsList) ===
                    -1 ? NOT_FAVORITE_STRING : FAVORITE_STRING;
            }
        }
    }

    highlight(text) {
        // Sets timeout to mark "text" in table
        // Uses one timeout and resets it if already defined to save on computation
        if (this.markerTimeout !== undefined) {
            clearTimeout(this.markerTimeout);
        }
        this.markerTimeout = setTimeout(() => {
            // .mat-cell:not(.mat-column-id = all column data except id
            const cells = $('.mat-cell:not(.mat-column-id)');
            cells.unmark();
            if (text.length < MIN_SEARCH_LENGTH) {
                return;
            } // Don't mark if less than MIN_SEARCH_LENGTH characters
            cells.mark(text, {separateWordSearch: false}); // Mark and don't separate
            // marks with space. Google
            // mark.js
        }, 200);
    }

    applyFilter(e) {
        // Applys filter to the table
        // e = filter text; can be special string
        if (e === undefined) { // either because data hasn't come yet or manually
            if (this.url === '/favs') { // even if data is undefined and url is '/favs', filter to only favorites
                this.dataSource.filter = FILTER_FAVS;
            } else {
                this.dataSource.filter = '';
            }
            return;
        }
        if (e === FILTER_ADVANCED) {
            this.dataSource.filter = e; // Set filter to filter using advanced filter fields
            if (this.dataSource.paginator) { // Update paginator
                this.dataSource.paginator.firstPage();
            }
            return;
        }
        if (this.dataSource.filter !== e.trim().toLowerCase()) { // Don't search again if filter already the same to save computation
            if (e.length >= MIN_SEARCH_LENGTH) { // Set filter if more than MIN_SEARCH_LENGTH
                this.dataSource.filter = e.trim().toLowerCase();
            } else { // else filter to favorites if on '/favs'
                if (this.url === '/favs') {
                    this.dataSource.filter = FILTER_FAVS;
                } else {
                    this.dataSource.filter = '';
                }
            }
            if (this.dataSource.paginator) {
                this.dataSource.paginator.firstPage();
            } // Update paginator
        }
        this.highlight(e);
    }

}
