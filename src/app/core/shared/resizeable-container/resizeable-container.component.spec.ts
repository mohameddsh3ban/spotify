import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizeableContainerComponent } from './resizeable-container.component';

describe('ResizeableContainerComponent', () => {
  let component: ResizeableContainerComponent;
  let fixture: ComponentFixture<ResizeableContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizeableContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResizeableContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
