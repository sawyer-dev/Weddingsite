import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quests } from './quests';

describe('Quests', () => {
  let component: Quests;
  let fixture: ComponentFixture<Quests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
