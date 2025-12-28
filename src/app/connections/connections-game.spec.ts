import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionsGame } from './connections-game';

describe('ConnectionsGame', () => {
  let component: ConnectionsGame;
  let fixture: ComponentFixture<ConnectionsGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionsGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionsGame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
