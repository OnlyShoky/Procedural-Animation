import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YinyangComponent } from './yinyang.component';

describe('YinyangComponent', () => {
  let component: YinyangComponent;
  let fixture: ComponentFixture<YinyangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YinyangComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YinyangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
