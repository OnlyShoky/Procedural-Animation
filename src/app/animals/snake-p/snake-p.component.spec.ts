import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnakePComponent } from './snake-p.component';

describe('SnakePComponent', () => {
  let component: SnakePComponent;
  let fixture: ComponentFixture<SnakePComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnakePComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SnakePComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
