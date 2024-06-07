import { Component } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent {
  mostrar: any;
  mensaje: any;
  
  constructor(private service: ApiService) {}
  
  ngOnInit(): void {
    this.service.spinner.subscribe((mostrar: boolean) => {
      this.mensaje = this.service.spinnerMessage.value;
      this.mostrar = mostrar;
    });
  }
}
