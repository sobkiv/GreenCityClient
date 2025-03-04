import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TariffsService } from '../../services/tariffs.service';
import { UbsAdminEmployeeComponent } from './ubs-admin-employee.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { BehaviorSubject, of } from 'rxjs';
import { Locations } from '../../models/tariffs.interface';
import { Store } from '@ngrx/store';
import { UbsAdminEmployeeService } from '../../services/ubs-admin-employee.service';
import { environment } from '@environment/environment.js';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { UbsAdminEmployeeEditFormComponent } from './ubs-admin-employee-edit-form/ubs-admin-employee-edit-form.component';

describe('UbsAdminEmployeeComponent', () => {
  let component: UbsAdminEmployeeComponent;
  let fixture: ComponentFixture<UbsAdminEmployeeComponent>;
  let dialog: MatDialog;
  let store: MockStore<any>;
  const initialState = {};

  let httpMock: HttpTestingController;
  let service: UbsAdminEmployeeService;

  const urlMock = environment.backendUbsLink + '/admin/ubs-employee';
  const positionMock = [
    {
      id: 0,
      name: 'fake'
    }
  ];

  const dialogStub = {
    afterClosed() {
      return of(true);
    }
  };

  const mockRegion = [
    {
      locationsDto: [
        {
          latitude: 18,
          locationId: 3,
          locationStatus: 'фейк1',
          locationTranslationDtoList: [
            { languageCode: 'ua', locationName: 'Фейк1' },
            { languageCode: 'en', locationName: 'Fake1' }
          ],
          longitude: 17
        },
        {
          latitude: 11,
          locationId: 5,
          locationStatus: 'фейк2',
          locationTranslationDtoList: [
            { languageCode: 'ua', locationName: 'Фейк2' },
            { languageCode: 'en', locationName: 'Fake2' }
          ],
          longitude: 155
        }
      ],
      regionId: 1,
      regionTranslationDtos: [
        { regionName: 'Фейк область', languageCode: 'ua' },
        { regionName: 'Fake region', languageCode: 'en' }
      ]
    }
  ];

  const fakeLocations: Locations = {
    locationsDto: [
      {
        latitude: 0,
        locationId: 159,
        locationStatus: 'active',
        locationTranslationDtoList: [
          { languageCode: 'ua', locationName: 'фейк' },
          { languageCode: 'en', locationName: 'fake' }
        ],
        longitude: 0
      },
      {
        latitude: 0,
        locationId: 0,
        locationStatus: 'active',
        locationTranslationDtoList: [
          { languageCode: 'ua', locationName: 'фейк2' },
          { languageCode: 'en', locationName: 'fake' }
        ],
        longitude: 0
      }
    ],
    regionId: 1,
    regionTranslationDtos: [
      {
        regionName: 'fake',
        languageCode: 'ua'
      }
    ]
  };

  const fakeCouriers = {
    courierId: 2,
    courierStatus: 'fake',
    nameUk: 'фейкКурєр2',
    nameEn: 'fakeCourier2',
    createDate: 'fakeDate',
    createdBy: 'fakeAdmin'
  };

  const tariffsServiceMock = jasmine.createSpyObj('tariffsServiceMock', ['getCouriers']);
  tariffsServiceMock.getCouriers.and.returnValue(of([fakeCouriers]));

  const storeMock = jasmine.createSpyObj('Store', ['select', 'dispatch']);
  storeMock.select.and.returnValue(of({ locations: { locations: [fakeLocations] } }));

  const localStorageServiceMock = jasmine.createSpyObj('localStorageServiceMock', [
    'getCurrentLanguage',
    'languageBehaviourSubject',
    'getAccessToken'
  ]);
  localStorageServiceMock.getCurrentLanguage.and.returnValue(of('ua'));
  localStorageServiceMock.languageBehaviourSubject = new BehaviorSubject('ua');

  const languageServiceMock = jasmine.createSpyObj('languageServiceMock', ['getCurrentLanguage', 'getCurrentLangObs', 'getLangValue']);
  languageServiceMock.getCurrentLangObs.and.returnValue(of('ua'));
  languageServiceMock.getCurrentLanguage.and.returnValue('ua');
  languageServiceMock.getLangValue = (valUa: string, valEn: string) => {
    return valUa;
  };

  const matDialogMock = jasmine.createSpyObj('matDialogMock', ['open']);
  matDialogMock.open.and.returnValue(dialogStub);

  const fakeMatDialogRef = jasmine.createSpyObj(['close', 'afterClosed']);
  fakeMatDialogRef.afterClosed.and.returnValue(of(true));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UbsAdminEmployeeComponent, MatAutocomplete],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatDialogModule,
        ReactiveFormsModule,
        FormsModule,
        MatAutocompleteModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatCheckboxModule,
        MatIconModule,
        MatChipsModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: Store, useValue: storeMock },
        { provide: MatDialog, useValue: matDialogMock },
        { provide: MatDialogRef, useValue: dialogStub },
        { provide: TariffsService, useValue: tariffsServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: LanguageService, useValue: languageServiceMock }
      ],

      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UbsAdminEmployeeComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
    component.locations = [fakeLocations];
    service = TestBed.inject(UbsAdminEmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(Store) as MockStore;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call methods onInit', () => {
    const spy1 = spyOn(component as any, 'getPositions');
    const spy2 = spyOn(component as any, 'initForm');
    const spy3 = spyOn(component as any, 'getContacts');
    const spy4 = spyOn(component as any, 'getLocations');
    const spy5 = spyOn(component as any, 'getCouriers');
    const spy6 = spyOn(component as any, 'setCountOfCheckedFilters');
    component.ngOnInit();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(spy5).toHaveBeenCalled();
    expect(spy6).toHaveBeenCalled();
    expect(spy6).toHaveBeenCalledTimes(8);
  });

  it('should initialize the form correctly', () => {
    const spy = spyOn((component as any).fb, 'group');
    (component as any).initForm();
    expect(spy).toHaveBeenCalled();
  });

  it('initForm should create', () => {
    const initFormFake = {
      position: '',
      contacts: '',
      region: '',
      city: '',
      courier: ''
    };

    (component as any).initForm();
    expect(component.searchForm.value).toEqual(initFormFake);
  });

  it('should get all postitions', () => {
    service.getAllPositions().subscribe((data) => {
      expect(data).toBe(positionMock);
    });
  });

  it('should get all couriers', () => {
    component.getCouriers();
    expect(component.couriersName).toEqual(['фейкКурєр2']);
  });

  it('should get locations', () => {
    component.getLocations();
    expect(storeMock.dispatch).toHaveBeenCalled();
  });

  it('should call openAddEmployeeDialog', () => {
    component.openDialog();
    expect(matDialogMock.open).toHaveBeenCalledWith(UbsAdminEmployeeEditFormComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'admin-cabinet-dialog-container'
    });
  });

  it('should add new city item', () => {
    const eventMock = {
      value: ''
    };
    const option = 'city';
    component.selectedCities = [];
    component.addItem(eventMock as any, option);
    expect(component.selectedCities.length).toEqual(0);
    expect(component.city.value).toEqual('');
  });

  it('should add new position item', () => {
    const eventMock = {
      value: ''
    };
    const option = 'position';
    component.selectedPositions = [];
    component.addItem(eventMock as any, option);
    expect(component.selectedPositions.length).toEqual(0);
    expect(component.position.value).toEqual('');
  });

  it('should add new courier item', () => {
    const eventMock = {
      value: ''
    };
    const option = 'courier';
    component.selectedCouriers = [];
    component.addItem(eventMock as any, option);
    expect(component.selectedCouriers.length).toEqual(0);
    expect(component.courier.value).toEqual('');
  });

  it('should return value by getLangValue', () => {
    const value = (component as any).getLangValue('value', 'enValue');
    expect(value).toBe('value');
  });

  it('should call method for selecting one city', () => {
    const eventMock = {
      option: {
        value: 'First'
      }
    };
    const spy = spyOn(component, 'selectCity');
    component.onSelectCity(eventMock as any);
    expect(spy).toHaveBeenCalledWith(eventMock);
    expect(component.city.value).toEqual('');
  });

  it('should call method for selecting all cities', () => {
    const eventMock = {
      option: {
        value: 'all'
      }
    };
    const spy = spyOn(component, 'toggleSelectAllCity');
    component.onSelectCity(eventMock as any);
    expect(spy).toHaveBeenCalled();
    expect(component.city.value).toEqual('');
  });

  it('should call method for selecting all couriers', () => {
    const eventMock = {
      option: {
        value: 'all'
      }
    };
    const spy = spyOn(component, 'toggleSelectAllCourier');
    component.onSelectCourier(eventMock as any);
    expect(spy).toHaveBeenCalled();
    expect(component.courier.value).toEqual('');
  });

  it('should remove selected city if it exists in list', () => {
    const eventMock = {
      option: {
        viewValue: 'fake'
      }
    };
    component.selectedCities = [
      { name: 'fake', id: 159, englishName: 'fake' },
      { name: 'fake2', id: 0, englishName: 'fake2' }
    ];
    component.selectCity(eventMock as any);
    expect(component.selectedCities).toEqual([{ name: 'fake2', id: 0, englishName: 'fake2' }]);
  });

  it('should check if all Cities is choosen', () => {
    component.selectedCities = [
      { name: 'fake', id: 154, englishName: 'fake' },
      { name: 'fake2', id: 0, englishName: 'fake2' }
    ];
    component.cities = [
      { name: 'fake', id: 154 },
      { name: 'fake2', id: 0 }
    ];
    const result = component.isCityChecked();
    expect(result).toEqual(true);
  });

  it('should check if all Positions is choosen', () => {
    component.selectedPositions = [
      { name: 'fake', id: 154 },
      { name: 'fake2', id: 5 }
    ];
    component.employeePositions = [
      { name: 'fake', id: 154 },
      { name: 'fake2', id: 5 }
    ];
    const result = component.isPositionChecked();
    expect(result).toEqual(true);
  });

  it('should check if all Couriers is choosen', () => {
    component.selectedCouriers = [
      { name: 'fake', id: 139, englishName: 'fake', ukrainianName: 'фейк' },
      { name: 'fake2', id: 2, englishName: 'fake2', ukrainianName: 'фейк2' }
    ];
    component.couriers = [
      { courierId: 139, nameEn: 'fake', nameUk: 'фейк' },
      { courierId: 2, nameEn: 'fake2', nameUk: 'фейк2' }
    ];
    const result = component.isCourierChecked();
    expect(result).toEqual(true);
  });

  it('should map cities from region', () => {
    const result = component.mapCities(mockRegion);
    expect(result).toEqual([
      {
        id: 3,
        name: 'Фейк1',
        locationTranslationDtoList: [
          { languageCode: 'ua', locationName: 'Фейк1' },
          { languageCode: 'en', locationName: 'Fake1' }
        ]
      },
      {
        id: 5,
        name: 'Фейк2',
        locationTranslationDtoList: [
          { languageCode: 'ua', locationName: 'Фейк2' },
          { languageCode: 'en', locationName: 'Fake2' }
        ]
      }
    ]);
  });

  it('should filter options', () => {
    const mockCities = ['Фейк1', 'Фейк2'];
    const result = component._filter('Фейк1', mockCities);
    expect(result).toEqual(['Фейк1']);
  });

  it('should select all items of cities', () => {
    const spy = spyOn(component, 'isCityChecked').and.returnValue(false);
    component.cities = [
      {
        name: 'First',
        id: 9,
        locationTranslationDtoList: [
          {
            locationName: 'fakeValue',
            languageCode: 'ua'
          },
          {
            locationName: 'FakeValue1',
            languageCode: 'en'
          }
        ]
      },
      {
        name: 'Second',
        id: 4,
        locationTranslationDtoList: [
          {
            locationName: 'fakeValue',
            languageCode: 'ua'
          },
          {
            locationName: 'FakeValue2',
            languageCode: 'en'
          }
        ]
      }
    ];
    component.toggleSelectAllCity();
    expect(spy).toHaveBeenCalled();
    expect(component.selectedCities.length).toEqual(2);
    expect(component.selectedCities).toEqual([
      {
        name: 'fakeValue',
        id: 9,
        englishName: 'FakeValue1',
        ukrainianName: 'fakeValue'
      },
      {
        name: 'fakeValue',
        id: 4,
        englishName: 'FakeValue2',
        ukrainianName: 'fakeValue'
      }
    ]);
  });

  it('should set city placeholder', () => {
    component.selectedCities = [{ name: 'Фейк' }];
    const placeholderName = 'cityPlaceholder';
    const filterOption = 'city';
    component.setCountOfCheckedFilters(component.selectedCities, filterOption, placeholderName);
    expect(component.cityPlaceholder).toEqual('1 ubs-tariffs.selected');
  });

  it('should set position placeholder', () => {
    component.selectedPositions = ['ФейкПозиція1', 'ФейкПозиція2'];
    const placeholderName = 'positionsPlaceholder';
    const filterOption = 'position';
    component.setCountOfCheckedFilters(component.selectedPositions, filterOption, placeholderName);
    expect(component.positionsPlaceholder).toEqual('2 ubs-tariffs.selected');
  });

  it('should set courier placeholder', () => {
    component.selectedCouriers = ['ФейкКурьєр1', 'ФейкКурєр2'];
    const placeholderName = 'courierPlaceholder';
    const filterOption = 'courier';
    component.setCountOfCheckedFilters(component.selectedCouriers, filterOption, placeholderName);
    expect(component.courierPlaceholder).toEqual('2 ubs-tariffs.selected');
  });

  it('should setCountOfCheckedFilters() when resetAllFilters called', () => {
    const spy = spyOn(component, 'setCountOfCheckedFilters');
    component.resetAllFilters();
    expect(spy).toHaveBeenCalledTimes(5);
  });

  it('should setCountOfCheckedFilters() set Placeholder name', () => {
    component.selectedPositions = [];
    const placeholderName = 'positionsPlaceholder';
    const filterOption = 'position';
    const spy = spyOn(component as any, 'positionsPlaceholder');
    component.setCountOfCheckedFilters(component.selectedPositions, filterOption, placeholderName);
    expect((component as any).positionsPlaceholder).toBe('position');
  });

  it('should called setCountOfCheckedFilters() at toggleSelectAllCity', () => {
    const spy = spyOn(component as any, 'setCountOfCheckedFilters');
    component.toggleSelectAllCity();
    expect(spy).toHaveBeenCalled();
  });

  it('should called setCountOfCheckedFilters() at toggleSelectAllCourier', () => {
    const spy = spyOn(component as any, 'setCountOfCheckedFilters');
    component.toggleSelectAllCourier();
    expect(spy).toHaveBeenCalled();
  });

  it('should called setCountOfCheckedFilters() at toggleSelectAllRegion', () => {
    const spy = spyOn(component as any, 'setCountOfCheckedFilters');
    component.toggleSelectAllRegion();
    expect(spy).toHaveBeenCalled();
  });

  it('should called toggleSelectAllCity()', () => {
    (component as any).toggleSelectAllCity();
    (component as any).isCityChecked();
    expect(component.selectedCities.length).toBe(0);
  });

  it('should called toggleSelectAllRegion()', () => {
    (component as any).toggleSelectAllRegion();
    (component as any).isRegionChecked();
    expect(component.selectedRegions.length).toBe(1);
  });

  it('should called toggleSelectAllCourier', () => {
    (component as any).toggleSelectAllCourier();
    (component as any).isCourierChecked();
    expect(component.selectedCouriers.length).toBe(1);
  });

  it('should called toggleSelectAllCity, toggleSelectAllCourier at onSelectCourier, onSelectCity', () => {
    const eventMock = {
      option: {
        value: 'all'
      }
    };

    const spy1 = spyOn(component, 'toggleSelectAllCity');
    (component as any).onSelectCity(eventMock);
    expect(spy1).toHaveBeenCalled();

    const spy2 = spyOn(component, 'toggleSelectAllCourier');
    (component as any).onSelectCourier(eventMock);
    expect(spy2).toHaveBeenCalled();
  });

  it('should setCountOfCheckedFilters() when resetAllFilters called', () => {
    component.selectedPositions = ['ФейкПозиція1', 'ФейкПозиція2'];
    component.selectedCouriers = ['ФейкКурьєр1', 'ФейкКурєр2'];
    component.selectedCities = [{ name: 'ФейкМісто' }];
    component.selectedRegions = [{ name: 'ФейкРегіон' }];
    const spy = spyOn(component.searchForm, 'reset');
    component.resetAllFilters();
    expect(component.selectedPositions.length).toBe(0);
    expect(component.selectedCouriers.length).toBe(0);
    expect(component.selectedCities.length).toBe(0);
    expect(component.selectedRegions.length).toBe(0);
    expect(component.selectedContact.length).toBe(0);
    expect(spy).toHaveBeenCalled();
  });
});
