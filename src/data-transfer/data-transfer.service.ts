import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

declare var $: any;

@Injectable({
    providedIn: 'root'
})

export class DataTransferService {

    defaultSearch: object = {newSearch: false};
    data: object[];
    private filterTextSource = new BehaviorSubject('');
    filterText = this.filterTextSource.asObservable();
    private advancedToggleSource = new BehaviorSubject(false);
    advancedToggle = this.advancedToggleSource.asObservable();
    private advancedSearchSource = new BehaviorSubject(this.defaultSearch);
    advancedSearch = this.advancedSearchSource.asObservable();
    private advancedSearchSelectsSource = new BehaviorSubject({});
    advancedSearchSelects = this.advancedSearchSelectsSource.asObservable();

    constructor() {
    }

    // Updates url from HomeComponent for many Components to use
    changeUrl(url) {
        this.resetAdvancedSearch();

        const expires = new Date();
        expires.setTime(expires.getTime() + (900 * 24 * 60 * 60 * 1000));
        document.cookie = 'lastPage=' + url + ';expires=' + expires.toUTCString();
    }

    // From ToolbarSearchComponent to HomeComponent for filtering data
    changeFilterText(message: string) {
        this.filterTextSource.next(message);
    }

    // From ToolbarSearchComponent to HomeComponent for showing and hiding AdvancedSearchComponent
    setAdvancedToggle(val) {
        this.advancedToggleSource.next(val);
        if (!val) {            
            this.resetAdvancedSearch();
        }
    }

    // From AdvancedSearchComponent to HomeComponent for advanced filter data
    changeAdvancedSearch(search: object) {
        this.advancedSearchSource.next(search);
    }

    resetAdvancedSearch() {
        this.advancedSearchSource.next(this.defaultSearch);
    }

    // For EmployeeService
    changeData(data: object[]) {
        this.data = data;
        this.advancedSearchSelectsSource.next({
            depts: this.getUniques('DEPARTMENT'),
            teams: this.getUniques('TEAM_NAME'),
            desigs: this.getUniques('DESIGNATION'),
            bloodGroups: this.getUniques('BLOODGROUP')
        });
    }

    getData() {
        return this.data;
    }

    // From HomeComponent to AdvancedSearchComponent for advanced search select options
    getUniques(field) {
        // Get different items in field (only no duplicates)
        const list = [];
        for (let i = 0; i < this.data.length; i++) {
            if ($.inArray(this.data[i][field], list) === -1) {
                list.push(this.data[i][field]);
            }
        }
        return list.sort();
    }

}
