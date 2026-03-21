import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionManage } from './promotion-manage';

describe('PromotionManage', () => {
  let component: PromotionManage;
  let fixture: ComponentFixture<PromotionManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromotionManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
