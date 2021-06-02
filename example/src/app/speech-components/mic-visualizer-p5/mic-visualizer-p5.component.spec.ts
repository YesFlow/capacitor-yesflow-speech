import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MicVisualizerP5Component } from './mic-visualizer-p5.component';

describe('MicVisualizerP5Component', () => {
  let component: MicVisualizerP5Component;
  let fixture: ComponentFixture<MicVisualizerP5Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MicVisualizerP5Component ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MicVisualizerP5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
