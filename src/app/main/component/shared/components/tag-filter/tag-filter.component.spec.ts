import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TagFilterComponent } from './tag-filter.component';

describe('TagFilterComponent', () => {
  let component: TagFilterComponent;
  let fixture: ComponentFixture<TagFilterComponent>;

  const tagsListDataMock = ['test', 'test', 'test', 'test'];
  const changes = {
    tagListData: {
      currentValue: tagsListDataMock
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TagFilterComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // @ts-ignore
    component.storageKey = 'Test';
    component.tagsListData = tagsListDataMock;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Test the basic functionality', () => {
    it('should call methods OnInit', () => {
      const spy = spyOn(component as any, 'getSessionStorageFilters');
      const spy1 = spyOn(component, 'emitActiveFilters');

      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
      expect(spy1).toHaveBeenCalled();
    });

    it('should get filters OnInit', () => {
      spyOn(component as any, 'getSessionStorageFilters').and.returnValue([]);

      component.ngOnInit();
      expect(component.filters).toEqual([]);
    });

    it('Should call setTags method inside ngOnChanges', () => {
      // @ts-ignore
      const spy = spyOn(component, 'setTags');
      component.ngOnChanges({ tagsListData: new SimpleChange(null, tagsListDataMock, null) });

      expect(spy).toHaveBeenCalledWith(tagsListDataMock);
    });

    it('Should create new filters array', () => {
      sessionStorage.removeItem('Test');
      // @ts-ignore
      component.setTags(tagsListDataMock);
      expect(component.filters.length).toBeGreaterThan(0);
    });

    it('Should change filter state to true', () => {
      component.filters = [{ name: 'test', nameUa: 'test', isActive: false }];
      component.toggleFilter('test');
      expect(component.filters[0].isActive).toBe(true);
    });

    it('Should return null if there is no data in sessionStorage', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);
      // @ts-ignore
      const val = component.getSessionStorageFilters();
      expect(val).toEqual([]);
    });

    it('Should return parsed data', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);
      const val = (component as any).getSessionStorageFilters();
      expect(val).toEqual([]);
    });
  });
});
