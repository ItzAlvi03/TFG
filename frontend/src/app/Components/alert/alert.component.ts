import { Component } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {
  /**
   * correct - boolean - Determinate if the pop up is an error or succesfull message
   */
  correct: boolean = false;
  /**
     * mensaje - string - This is the message of the pop up
     */
  mensaje: string = "Error al iniciar sesion";
  /**
   * alerta - boolean - Activates or deactivate the pop up message
   */
  alerta: boolean = false;

constructor(private service: ApiService) {}
  ngOnInit(): void {
    this.service.alert.subscribe((mostrar: boolean) => {
      this.correct = this.service.correct.value;
      this.mensaje = this.service.message.value;
      setTimeout(() => {
        this.alerta = this.service.alert.value;
      }, 50);
    })
  }
}
