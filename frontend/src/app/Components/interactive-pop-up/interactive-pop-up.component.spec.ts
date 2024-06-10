import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractivePopUpComponent } from './interactive-pop-up.component';

describe('InteractivePopUpComponent', () => {
  let component: InteractivePopUpComponent;
  let fixture: ComponentFixture<InteractivePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractivePopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractivePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
