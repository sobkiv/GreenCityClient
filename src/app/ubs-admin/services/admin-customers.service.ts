import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICustomersTable } from '../models/customers-table.model';
import { ICustomerOrdersTable } from './../models/customer-orders-table.model';

@Injectable({
  providedIn: 'root'
})
export class AdminCustomersService {
  url = 'https://greencity-ubs.azurewebsites.net/ubs/management';

  constructor(private http: HttpClient) {}

  getCustomers(column: string, page?: number, filters?: string, sortingType?: string): Observable<ICustomersTable> {
    return this.http.get<ICustomersTable>(`${this.url}/usersAll?page=${page}&columnName=${column}&${filters}&sortingOrder=${sortingType}`);
  }

  getCustomerOrders(id: string): Observable<ICustomerOrdersTable> {
    return this.http.get<ICustomerOrdersTable>(`${this.url}/${id}/ordersAll`);
  }
}
