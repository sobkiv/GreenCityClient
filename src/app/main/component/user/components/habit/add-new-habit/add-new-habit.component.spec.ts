import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AddNewHabitComponent } from './add-new-habit.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { ShoppingListService } from './habit-edit-shopping-list/shopping-list.service';
import { HabitService } from '@global-service/habit/habit.service';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DEFAULTFULLINFOHABIT } from '@global-user/components/habit/mocks/habit-assigned-mock';
import { ECONEWSMOCK } from 'src/app/main/component/eco-news/mocks/eco-news-mock';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { DEFAULTHABIT } from '../mocks/habit-assigned-mock';
import { HABITLIST } from '../mocks/habit-mock';

describe('AddNewHabitComponent', () => {
  let component: AddNewHabitComponent;
  let fixture: ComponentFixture<AddNewHabitComponent>;
  let matSnackBarMock: MatSnackBarComponent;
  let fakeHabitAssignService: HabitAssignService;
  let fakeShoppingListService: ShoppingListService;
  let fakeHabitService: HabitService;
  let fakeLocalStorageService: LocalStorageService;

  const mockActivatedRoute = {
    params: of({ habitId: 2 })
  };
  const locationMock = { back: () => {} };

  class MatDialogMock {
    open() {
      return {
        afterClosed: () => of(true)
      };
    }
  }

  fakeHabitAssignService = jasmine.createSpyObj('fakeHabitAssignService', [
    'getHabitByAssignId',
    'deleteHabitById',
    'assignCustomHabit',
    'setHabitStatus',
    'progressNotificationHasDisplayed'
  ]);
  fakeHabitAssignService.getHabitByAssignId = () => of(DEFAULTFULLINFOHABIT);
  fakeHabitAssignService.deleteHabitById = () => of();
  fakeHabitAssignService.assignCustomHabit = () => of(DEFAULTFULLINFOHABIT);
  fakeHabitAssignService.setHabitStatus = () => of(DEFAULTFULLINFOHABIT);
  fakeHabitAssignService.progressNotificationHasDisplayed = () => of({});

  fakeHabitService = jasmine.createSpyObj('fakeHabitService', ['getHabitById', 'getHabitsByTagAndLang']);
  fakeHabitService.getHabitById = () => of(DEFAULTHABIT);
  fakeHabitService.getHabitsByTagAndLang = () => of(HABITLIST);

  fakeLocalStorageService = jasmine.createSpyObj('fakeLocalStorageService', {
    getCurrentLanguage: () => 'ua'
  });
  fakeLocalStorageService.getUserId = () => 2;
  fakeLocalStorageService.languageSubject = new Subject<string>();
  fakeLocalStorageService.languageSubject.next('ua');

  matSnackBarMock = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);

  fakeShoppingListService = jasmine.createSpyObj('fakeShoppingListService', [
    'getHabitAllShopLists',
    'getHabitShopList',
    'addHabitCustomShopList',
    'updateHabitShopList'
  ]);
  fakeShoppingListService.getHabitAllShopLists = () => of();
  fakeShoppingListService.getHabitShopList = () => of();
  fakeShoppingListService.addHabitCustomShopList = () => of();
  fakeShoppingListService.updateHabitShopList = () => of();

  matSnackBarMock.openSnackBar = (type: string) => {};

  const ecoNewsServiceMock = jasmine.createSpyObj('EcoNewsService', ['getEcoNewsListByPage']);
  ecoNewsServiceMock.getEcoNewsListByPage = () => of(ECONEWSMOCK);

  const routerMock: Router = jasmine.createSpyObj('router', ['navigate']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewHabitComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        NoopAnimationsModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatSnackBarComponent, useValue: matSnackBarMock },
        { provide: HabitService, useValue: fakeHabitService },
        { provide: HabitAssignService, useValue: fakeHabitAssignService },
        { provide: EcoNewsService, useValue: ecoNewsServiceMock },
        { provide: ShoppingListService, useValue: fakeShoppingListService },
        { provide: LocalStorageService, useValue: fakeLocalStorageService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Location, useValue: locationMock },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewHabitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('bindLang(lang) should invoke translate.setDefaultLang(lang)', () => {
    spyOn((component as any).translate, 'setDefaultLang').and.returnValue('test');
    (component as any).bindLang('en');
    expect((component as any).translate.setDefaultLang).toHaveBeenCalledWith('en');
  });

  it('changing of fakeLocalStorageService.languageSubject should invoke methods', () => {
    const spy = spyOn(component as any, 'checkIfAssigned');
    spyOn(component as any, 'bindLang').and.returnValue('test');
    fakeLocalStorageService.languageSubject.subscribe((lang) => {
      expect((component as any).bindLang).toHaveBeenCalledWith(lang);
      expect(spy).toHaveBeenCalled();
    });
    fakeLocalStorageService.languageSubject.next('en');
  });

  it('should set recommended habits on getRecommendedHabits', () => {
    (component as any).getRecommendedHabits(1, 3, ['tag']);
    expect(component.recommendedHabits).toEqual(HABITLIST.page);
  });

  it('should set recommended news on getRecommendedNews', () => {
    (component as any).getRecommendedNews(1, 3);
    expect(component.recommendedNews).toEqual(ECONEWSMOCK.page);
  });

  it('should call getStars on initHabitData', () => {
    const spy = spyOn(component as any, 'getStars');
    (component as any).initHabitData(DEFAULTHABIT);
    expect(spy).toHaveBeenCalled();
  });

  it('should set data on initHabitData', () => {
    (component as any).initHabitData(DEFAULTHABIT);
    expect(component.habitResponse).toEqual(DEFAULTHABIT);
    expect(component.initialDuration).toEqual(DEFAULTHABIT.defaultDuration);
  });

  it('getDefaultHabit should invoke inHabitData method', () => {
    const spy = spyOn(component as any, 'initHabitData');
    (component as any).getDefaultHabit();
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate back on onGoBack without call dialog', () => {
    component.initialDuration = 1;
    component.newDuration = 1;
    component.standartShopList = null;
    component.customShopList = null;
    const spy = spyOn(locationMock, 'back');
    component.onGoBack();
    expect(spy).toHaveBeenCalled();
  });

  it('getUserId should set this.userId', () => {
    (component as any).getUserId();
    expect((component as any).userId).toBe(2);
  });

  it('getDuration should set this.newDuration', () => {
    component.getDuration(1);
    expect(component.newDuration).toEqual(1);
  });

  it('should set canAcquire false on getProgressValue', () => {
    component.assignedHabit = DEFAULTFULLINFOHABIT;
    component.getProgressValue(60);
    expect(component.canAcquire).toBeFalsy();
  });

  it('should set canAcquire true on getProgressValue', () => {
    component.assignedHabit = DEFAULTFULLINFOHABIT;
    component.getProgressValue(80);
    expect(component.canAcquire).toBeTruthy();
  });

  it('should not call congratulation dialog on getProgressValue', () => {
    const spyDialog = spyOn(component as any, 'getOpenDialog');
    const spyRef = spyOn(component as any, 'afterDialogClosed');
    component.getProgressValue(60);
    expect(spyDialog).not.toHaveBeenCalled();
    expect(spyRef).not.toHaveBeenCalled();
  });

  it('should call congratulation dialog on getProgressValue', () => {
    component.assignedHabit = DEFAULTFULLINFOHABIT;
    component.isAcquired = false;
    component.canAcquire = true;
    const spyDialog = spyOn(component as any, 'getOpenDialog');
    const spyRef = spyOn(component as any, 'afterDialogClosed');
    component.getProgressValue(80);
    expect(spyDialog).toHaveBeenCalled();
    expect(spyRef).toHaveBeenCalled();
  });

  it('checkIfAssigned method should call getCustomShopList', () => {
    (component as any).habitAssignId = 2;
    component.isEditing = true;
    const spy = spyOn(component as any, 'getCustomShopList');
    (component as any).checkIfAssigned();
    expect(spy).toHaveBeenCalled();
  });

  it('checkIfAssigned method should invoke getDefaultHabit', () => {
    (component as any).habitId = 3;
    component.isEditing = false;
    const spy = spyOn(component as any, 'getDefaultHabit');
    (component as any).checkIfAssigned();
    expect(spy).toHaveBeenCalled();
  });

  it('goToProfile method should navigate to user profile page', () => {
    (component as any).userId = 2;
    component.goToProfile();
    expect(routerMock.navigate).toHaveBeenCalledWith(['profile', 2]);
  });

  it('should call go to profile and snackbar on afterHabitWasUpdated', () => {
    const spyGoProfile = spyOn(component, 'goToProfile');
    const spySnackBar = spyOn(matSnackBarMock, 'openSnackBar');
    (component as any).afterHabitWasUpdated();
    expect(spyGoProfile).toHaveBeenCalled();
    expect(spySnackBar).toHaveBeenCalledWith('habitUpdated');
  });
});
