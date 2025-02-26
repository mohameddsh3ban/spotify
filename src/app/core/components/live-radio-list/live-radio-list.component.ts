import { Component, input } from '@angular/core';
import { ILiveRadio } from '../../model/liveRadio.model';

@Component({
  selector: 'app-live-radio-list',
  imports: [],
  templateUrl: './live-radio-list.component.html',
  styleUrl: './live-radio-list.component.css'
})
export class LiveRadioListComponent {
  liveRadios = input.required<ILiveRadio[]>();
}
