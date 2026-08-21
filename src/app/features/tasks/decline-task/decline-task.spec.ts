import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclineTask } from './decline-task';

describe('DeclineTask', () => {
  let component: DeclineTask;
  let fixture: ComponentFixture<DeclineTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclineTask],
    }).compileComponents();

    fixture = TestBed.createComponent(DeclineTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
