import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveRadioListComponent } from './live-radio-list.component';

describe('LiveRadioListComponent', () => {
  let component: LiveRadioListComponent;
  let fixture: ComponentFixture<LiveRadioListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveRadioListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveRadioListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
