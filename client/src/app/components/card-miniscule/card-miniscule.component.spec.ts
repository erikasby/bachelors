import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMinisculeComponent } from './card-miniscule.component';

describe('CardMinisculeComponent', () => {
  let component: CardMinisculeComponent;
  let fixture: ComponentFixture<CardMinisculeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardMinisculeComponent]
    });
    fixture = TestBed.createComponent(CardMinisculeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
