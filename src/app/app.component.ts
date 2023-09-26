import { Component, OnInit, SecurityContext } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { WeatherService } from './services/weather.service';
import { catchError } from 'rxjs/operators';
import { weatherConfig } from './weatherConfig/weatherConfig';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title = 'weather-app';
  
  placeHolder : string = 'Search for city';
  
  cityName: string = '';  
  weatherType: any;
  isDay: any;
  allData: any;
  IsWait: boolean = true;
  
  
  constructor(private weather: WeatherService) {};
  
  ngOnInit() {
    this.weather.getWeatherData('Knezha').subscribe({
      next: (v) => {
        this.weatherType = weatherConfig.data.find(el => el.code == v.current.condition.code);
        
        this.allData = v;
        
        this.isDay = this.allData.current.is_day === 1 ? this.isDay = true : false;
      },
      complete: () => {
        console.log('Completed!');
        this.IsWait = false;
      } 
    })
    
  };
  
  showValue() {
    this.IsWait = true;
    
    if(this.cityName.length > 0) {
      this.weather.getWeatherData(this.cityName).subscribe({
        next: (v) => {
          this.weatherType = weatherConfig.data.find(el => el.code == v.current.condition.code);
          
          this.allData = v;
          
          this.isDay = this.allData.current.is_day === 1 ? this.isDay = true : false;
          
          console.log(v);
        },
        error: (error) => {
          console.log(`Data from error : ${error}`);
          this.placeHolder = 'No matching location found!';
          
        },
        complete: () => {
          console.log('Completed!');
          this.placeHolder = 'Search for city';
          this.IsWait = false;
        } 
      })
    }
    
    
    this.cityName = '';
    
    
    
  };


  
  
  // ngOnInit(): void {
  //   let headers = new HttpHeaders({});
  //   this.http.get<any>('http://api.weatherapi.com/v1/current.json?key=473a0d1243124bab99d72107230408&q=London', {
  //     headers: headers
  //   }).subscribe(data => {
  //     console.log(`Now it's ${data.current.temp_c}`);
  //   })
  // }
  
  
}
