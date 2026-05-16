import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestsLeaderboard } from './quests-leaderboard';

describe('QuestsLeaderboard', () => {
  let component: QuestsLeaderboard;
  let fixture: ComponentFixture<QuestsLeaderboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestsLeaderboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestsLeaderboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
