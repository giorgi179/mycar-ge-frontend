import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HomeService } from '../../services/home-service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language-service';

import { CarListItem, FilterCriteria, HomeFiltre } from '../home-filtre/home-filtre';

import { environment } from '../../../environments/environment.development';


@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [
    TranslatePipe,
    HomeFiltre
  ],
  templateUrl: './cars.html',
  styleUrl: './cars.scss',
})
export class Cars implements OnInit {


  private api = inject(HomeService);

  private langService = inject(LanguageService);

  private route = inject(ActivatedRoute);

  private router = inject(Router);



  carList = signal<CarListItem[]>([]);


  error = signal<string | null>(null);



  imageUrl = environment.imageUrl;



  activeFilter = signal<FilterCriteria | null>(null);





  ngOnInit(): void {


    this.route.queryParamMap.subscribe(params => {



      const search = params.get('search');



      if (search) {

        this.searchCars(search);

      }
      else {

        this.loadCars();

      }





      const filterParam = params.get('filter');



      if (filterParam) {


        try {

          this.activeFilter.set(
            JSON.parse(filterParam)
          );

        }
        catch {

          this.activeFilter.set(null);

        }


      }
      else {

        this.activeFilter.set(null);

      }



    });



  }







  private loadCars(): void {


    this.error.set(null);



    this.api.getAllCar()
      .subscribe({

        next: (data) => {


          this.carList.set(data);


        },


        error: (err) => {


          console.error(err);


          this.error.set(
            this.langService.translate('home.error')
          );


        }


      });


  }







  private searchCars(searchTerm:string):void {



    this.error.set(null);



    this.api.searchCars(searchTerm)
      .subscribe({

        next:(data)=>{


          this.carList.set(data);


        },


        error:(err)=>{


          console.error(err);


          this.error.set(
            this.langService.translate('home.error')
          );


        }


      });



  }









  onFilterChange(criteria:FilterCriteria):void {



    this.activeFilter.set(criteria);



    this.router.navigate([],{

      relativeTo:this.route,


      queryParams:{

        filter:JSON.stringify(criteria)

      },


      queryParamsHandling:'merge'


    });



  }







  onClearFilters():void {



    this.activeFilter.set(null);



    this.router.navigate([],{

      relativeTo:this.route,


      queryParams:{

        filter:null

      },


      queryParamsHandling:'merge'


    });



  }







  goToCarDetails(id:number):void {


    this.router.navigate([
      '/car',
      id
    ]);


  }









  filteredCars = computed(()=>{



    const cars = this.carList();


    const f = this.activeFilter();




    if(!f){

      return cars;

    }





    return cars.filter(car=>{



      const d = car.carDetals;





      if(f.manufacturer &&
        d?.manufacturer !== f.manufacturer)

        return false;





      if(f.model &&
        car.carModel !== f.model)

        return false;





      if(f.location &&
        car.city !== f.location)

        return false;





      if(f.year &&
        car.carAge !== f.year)

        return false;





      if(f.fuel &&
        car.fuelType !== f.fuel)

        return false;







      if(f.price){


        const price = car.carPrice;



        if(
          f.price === '0-10000' &&
          !(price >=0 && price <=10000)
        )

          return false;



        if(
          f.price === '10000-25000' &&
          !(price >10000 && price <=25000)
        )

          return false;




        if(
          f.price === '25000-50000' &&
          !(price >25000 && price <=50000)
        )

          return false;




        if(
          f.price === '50000+' &&
          !(price >50000)
        )

          return false;



      }







      if(
        f.vinOnly &&
        !d?.vinCode
      )

        return false;







      const a = f.additional;





      if(a){



        if(
          a.transmission &&
          d?.transmission !== a.transmission
        )

          return false;




        if(
          a.cylinders !== null &&
          d?.cylinders !== a.cylinders
        )

          return false;




        if(
          a.airbags !== null &&
          d?.airbags !== a.airbags
        )

          return false;





        if(
          a.steeringWheel &&
          d?.steeringWheel !== a.steeringWheel
        )

          return false;





        if(
          a.driveType &&
          d?.driveType !== a.driveType
        )

          return false;





        if(
          a.doors &&
          d?.doors !== a.doors
        )

          return false;





        if(
          a.hasTechInspection !== null &&
          d?.hasTechInspection !== a.hasTechInspection
        )

          return false;





        if(
          a.hasCatalyst !== null &&
          d?.hasCatalyst !== a.hasCatalyst
        )

          return false;






        if(
          a.color.length &&
          (!d?.color ||
          !a.color.includes(d.color))
        )

          return false;






        if(
          a.interiorMaterial.length &&
          (!d?.interiorMaterial ||
          !a.interiorMaterial.includes(d.interiorMaterial))
        )

          return false;







        if(
          a.interiorColor.length &&
          (!d?.interiorColor ||
          !a.interiorColor.includes(d.interiorColor))
        )

          return false;






        if(
          a.isExchangePossible &&
          !d?.isExchangePossible
        )

          return false;



      }





      return true;



    });



  });



}