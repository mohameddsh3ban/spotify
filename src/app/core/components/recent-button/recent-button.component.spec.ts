import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentButtonComponent } from './recent-button.component';

describe('RecentButtonComponent', () => {
  let component: RecentButtonComponent;
  let fixture: ComponentFixture<RecentButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
