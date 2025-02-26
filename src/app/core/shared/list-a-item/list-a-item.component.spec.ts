import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAItemComponent } from './list-a-item.component';

describe('ListAItemComponent', () => {
  let component: ListAItemComponent;
  let fixture: ComponentFixture<ListAItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
