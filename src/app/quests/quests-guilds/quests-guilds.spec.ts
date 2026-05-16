import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestsGuilds } from './quests-guilds';

describe('QuestsGuilds', () => {
  let component: QuestsGuilds;
  let fixture: ComponentFixture<QuestsGuilds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestsGuilds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestsGuilds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
