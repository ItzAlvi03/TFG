import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-interactive-pop-up',
  templateUrl: './interactive-pop-up.component.html',
  styleUrls: ['./interactive-pop-up.component.css']
})
export class InteractivePopUpComponent {
  @Input() mensaje!: string;
  @Input() interactiveType: number = 1;
  @Output() output: EventEmitter<number> = new EventEmitter<number>();
  @Output() confirm: EventEmitter<boolean> = new EventEmitter<boolean>();
  number: number = 0;

  sendConfirmationBack(confirm: boolean){
    if(this.interactiveType == 1){
      this.output.emit(this.number);
    }
    this.confirm.emit(confirm);
  }
}
