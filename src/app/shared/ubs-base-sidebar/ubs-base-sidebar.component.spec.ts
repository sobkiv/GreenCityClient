import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared.module';
import { UbsAdminTableComponent } from '../../ubs/ubs-admin/components/ubs-admin-table/ubs-admin-table.component';
import { HeaderComponent } from '../header/header.component';
import { UbsBaseSidebarComponent } from './ubs-base-sidebar.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserMessagesService } from '../../ubs/ubs-user/services/user-messages.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { JwtService } from '@global-service/jwt/jwt.service';
import { Subject } from 'rxjs';

describe('UbsBaseSidebarComponent', () => {
  let component: UbsBaseSidebarComponent;
  let fixture: ComponentFixture<UbsBaseSidebarComponent>;

  let localStorageServiceMock: LocalStorageService;
  let userMessagesService: UserMessagesService;
  let jwtService: JwtService;

  const listItem = {
    link: '',
    name: 'ubs-user.orders',
    routerLink: 'orders'
  };

  localStorageServiceMock = new LocalStorageService();

  beforeEach(async(() => {
    userMessagesService = new UserMessagesService(null, localStorageServiceMock);
    jwtService = new JwtService(localStorageServiceMock);

    TestBed.configureTestingModule({
      imports: [
        MatSidenavModule,
        MatIconModule,
        MatTableModule,
        DragDropModule,
        MatCheckboxModule,
        MatPaginatorModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule,
        InfiniteScrollModule
      ],
      declarations: [UbsBaseSidebarComponent, UbsAdminTableComponent, HeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsBaseSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return icon link from list item', () => {
    listItem.link = component.bellsNotification;
    expect(component.getIcon(listItem)).toBe(listItem.link);
  });

  it('should return default icon link', () => {
    userMessagesService.countOfNoReadeMessages = 1;
    listItem.link = component.bellsNoneNotification;
    expect(component.getIcon(listItem)).toBe(listItem.link);
  });

  it('should toggle sidebar menu state', () => {
    component.toggleSideBar();
    expect(component.toggleSideBar).toBeTruthy();
  });

  it('should trigger onResize method when window is resized', () => {
    const spyOnResize = spyOn(component, 'onResize');
    window.dispatchEvent(new Event('resize'));
    expect(spyOnResize).toHaveBeenCalled();
  });

  it('should call getCountOfUnreadNotification', () => {
    const getCountOfUnreadNotificationSpy = spyOn(component, 'getCountOfUnreadNotification');
    component.ngAfterViewInit();
    expect(getCountOfUnreadNotificationSpy).toHaveBeenCalled();
  });

  it('ngAfterViewInit should called getCountOfUnreadNotification method one time', () => {
    const getCountOfUnreadNotificationSpy = spyOn(component, 'getCountOfUnreadNotification');
    component.ngAfterViewInit();
    expect(getCountOfUnreadNotificationSpy).toHaveBeenCalledTimes(1);
  });

  it('calls detect changes', () => {
    const spy = spyOn((component as any).cdr, 'detectChanges');
    component.ngAfterViewChecked();
    expect(spy).toHaveBeenCalled();
  });

  it('destroy should be closed after ngOnDestroy()', () => {
    component.destroy = new Subject<boolean>();
    spyOn(component.destroy, 'next');
    component.ngOnDestroy();
    expect(component.destroy.next).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on destroy', () => {
    component.destroy.subscribe();
    component.ngOnDestroy();
    expect(component.destroy.closed).toBeTruthy();
  });
});
