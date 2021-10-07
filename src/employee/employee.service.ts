import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

import {DataTransferService} from '../data-transfer/data-transfer.service';
import {environment} from '../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class EmployeeService {

    // WebService URL
    apiUrl = 'http://localhost/WS4ContactBook/myapi.php/employees/';
    localDataSource = new BehaviorSubject([]);

    constructor(private http: HttpClient, private dataTransferService: DataTransferService) {
        if (!environment.production) {
            // this.apiUrl = 'http://localhost/path/to/api/employees/';
        }
    }

    // If for some reason, could not get data, give back Team data hardcoded
    static handleError(dataTransferService) {
        const devFallback = FALLBACK_EMPLOYEES;
        if (!environment.production) {
            for (let i = 0; i < 7; i++) {
                devFallback.push(FALLBACK_EMPLOYEES[i % 6]);
            }
        }
        dataTransferService.changeData(devFallback);

        return new Observable((observer) => {
            observer.next(devFallback);
            observer.complete();
            return {
                unsubscribe() {
                }
            };
        });
    }

    // Fetches all employee data
    getEmployees() {
        const localData = this.dataTransferService.getData();
        if (localData !== undefined) { // If data already fetched once, send from localData
            this.localDataSource.next(localData);
            return this.localDataSource.asObservable();
        }
        //return this.http.get(this.apiUrl, {headers: new HttpHeaders().set('From', 'nsm')})
        return this.http.get(this.apiUrl)
            .pipe(
                tap((_: object[]) => this.dataTransferService.changeData(_)), // After getting data, save it locally
                catchError(() => EmployeeService.handleError(this.dataTransferService))
            );
    }

}

const FALLBACK_EMPLOYEES: object[] = [
    {
        STATUS: 1,
        NAME: 'Donald Duck',
        DEPARTMENT: 'Disney',
        TEAM_NAME: 'ABC',
        TELEXTENSION: '123',
        DESIGNATION: 'Cartoon Character',
        EMPCODE: 'C-1532',
        EMPCODENUMBER: 1532,
        EMAIL: 'donald@disney.com',
        BLOODGROUP: 'O+',
        MOBILE: '+123432123',
        CAR1: '12348704',
        CAR2: '12345944',
        BIKE: undefined
    },
    {
        STATUS: 2,
        NAME: 'Naseem Amjad',
        DEPARTMENT: 'Software Developers',
        TEAM_NAME: 'Innovative',
        TELEXTENSION: '951',
        DESIGNATION: 'Programmer',
        EMPCODE: 'T-421',
        EMPCODENUMBER: 421,
        EMAIL: 'naseem@technologist.com',
        BLOODGROUP: 'O+',
        MOBILE: '03004020***',
        CAR1: '12345131',
        CAR2: '12346438',
        BIKE: undefined
    },
    {
        STATUS: 3,
        NAME: 'Daisy Duck',
        DEPARTMENT: 'Disney',
        TEAM_NAME: 'ABC',
        TELEXTENSION: '125',
        DESIGNATION: 'Cartoon Character',
        EMPCODE: 'C-1533',
        EMPCODENUMBER: 1533,
        EMAIL: 'daisy@disney.com',
        BLOODGROUP: 'O+',
        MOBILE: '+123432124',
        CAR1: '12348705',
        CAR2: undefined,
        BIKE: undefined
    },
    {
        STATUS: 4,
        NAME: 'Micky Mouse',
        DEPARTMENT: 'Disney',
        TEAM_NAME: 'ABC',
        TELEXTENSION: '126',
        DESIGNATION: 'Cartoon Character',
        EMPCODE: 'C-1543',
        EMPCODENUMBER: 1543,
        EMAIL: 'micky@disney.com',
        BLOODGROUP: 'O-',
        MOBILE: '+123432114',
        CAR1: '12348705',
        CAR2: undefined,
        BIKE: undefined
    },
    {
        STATUS: 5,
        NAME: 'Minnie Mouse',
        DEPARTMENT: 'Disney',
        TEAM_NAME: 'ABC',
        TELEXTENSION: '127',
        DESIGNATION: 'Cartoon Character',
        EMPCODE: 'C-1544',
        EMPCODENUMBER: 1544,
        EMAIL: 'minnie@disney.com',
        BLOODGROUP: 'O-',
        MOBILE: '+123332114',
        CAR1: '123455705',
        CAR2: undefined,
        BIKE: '4445'
    },
    {
        STATUS: 6,
        NAME: 'Bugs Bunny',
        DEPARTMENT: 'Looney Tunes',
        TEAM_NAME: 'ACME',
        TELEXTENSION: '127',
        DESIGNATION: 'Cartoon Character',
        EMPCODE: 'C-1744',
        EMPCODENUMBER: 1744,
        EMAIL: 'bunny@looneytunes.com',
        BLOODGROUP: 'AB+',
        MOBILE: '+123002114',
        CAR1: '123450005',
        CAR2: undefined,
        BIKE: '1245'
    },
    {
        STATUS: 7,
        NAME: 'Daffy Duck',
        DEPARTMENT: 'Looney Tunes',
        TEAM_NAME: 'ACME',
        TELEXTENSION: '129',
        DESIGNATION: 'Cartoon Character',
        EMPCODE: 'C-1794',
        EMPCODENUMBER: 1794,
        EMAIL: 'daffy@looneytunes.com',
        BLOODGROUP: 'B+',
        MOBILE: '+12309114',
        CAR1: '123459005',
        CAR2: undefined,
        BIKE: '11474'
    }
];

