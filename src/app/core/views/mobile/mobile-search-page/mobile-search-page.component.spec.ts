import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSearchPageComponent } from './mobile-search-page.component';

describe('MobileSearchPageComponent', () => {
  let component: MobileSearchPageComponent;
  let fixture: ComponentFixture<MobileSearchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileSearchPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
