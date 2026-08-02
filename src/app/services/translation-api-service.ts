// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { Observable, of, concat, forkJoin, timer } from 'rxjs';
// import { map, catchError, concatMap, toArray } from 'rxjs/operators';

// interface MyMemoryResponse {
//   responseData: {
//     translatedText: string;
//   };
//   responseStatus: number | string;
//   matches?: any[];
// }

// const STATIC_DICTIONARY: Record<string, string> = {
//   'ავტომატიკა': 'Automatic',
//   'მექანიკა': 'Manual',
//   'ვარიატორი': 'CVT',

//   'მარცხენა': 'Left',
//   'მარჯვენა': 'Right',

//   'წინა': 'Front',
//   'უკანა': 'Rear',

//   'თეთრი': 'White',
//   'შავი': 'Black',
//   'ვერცხლისფერი': 'Silver',
//   'ნაცრისფერი': 'Grey',
//   'წითელი': 'Red',
//   'ლურჯი': 'Blue',
//   'ყავისფერი': 'Brown',
//   'ბეჟი': 'Beige',
//   'მწვანე': 'Green',
//   'ყვითელი': 'Yellow',
//   'ნარინჯისფერი': 'Orange',
//   'იისფერი': 'Purple',

//   'ნაჭერი': 'Fabric',
//   'ხელოვნური ტყავი': 'Faux Leather',
//   'ალკანტარა': 'Alcantara',
//   'ტყავი': 'Leather',
//   'კომბინირებული': 'Combined',

//   'ბენზინი': 'Petrol',
//   'დიზელი': 'Diesel',
//   'ელექტრო': 'Electric',
//   'ჰიბრიდი': 'Hybrid',
//   'გაზი': 'Gas',

//   'სედანი': 'Sedan',
//   'ჯიპი': 'SUV',
//   'ჰეტჩბექი': 'Hatchback',
//   'უნივერსალი': 'Wagon',
//   'კუპე': 'Coupe',
//   'კაბრიოლეტი': 'Convertible',
//   'პიკაპი': 'Pickup',
//   'მინივენი': 'Minivan',

//   'თბილისი': 'Tbilisi',
//   'ბათუმი': 'Batumi',
//   'ქუთაისი': 'Kutaisi',
//   'რუსთავი': 'Rustavi',
//   'გორი': 'Gori',
//   'ზუგდიდი': 'Zugdidi',
//   'ფოთი': 'Poti',
//   'თელავი': 'Telavi',
// };

// const REVERSE_DICTIONARY: Record<string, string> = Object.entries(STATIC_DICTIONARY)
//   .reduce((acc, [ka, en]) => {
//     acc[en.toLowerCase()] = ka;
//     return acc;
//   }, {} as Record<string, string>);

// @Injectable({
//   providedIn: 'root'
// })
// export class TranslationApiService {
//   private http = inject(HttpClient);
//   private apiUrl = 'https://api.mymemory.translated.net/get';
//   private cache: { [key: string]: string } = {};

//   private readonly BATCH_SIZE = 5;
//   private readonly BATCH_DELAY_MS = 1200;

//   private lookupStatic(text: string, targetLang: 'ka' | 'en'): string | null {
//     const trimmed = text.trim();

//     if (targetLang === 'en') {
//       if (STATIC_DICTIONARY[trimmed]) {
//         return STATIC_DICTIONARY[trimmed];
//       }
//     } else {
//       const found = REVERSE_DICTIONARY[trimmed.toLowerCase()];
//       if (found) {
//         return found;
//       }
//     }

//     return null;
//   }

//   translateText(text: string, targetLang: 'ka' | 'en'): Observable<string> {
//     if (!text || !text.trim()) return of(text);

//     const staticResult = this.lookupStatic(text, targetLang);
//     if (staticResult !== null) {
//       return of(staticResult);
//     }

//     const cacheKey = `${targetLang}:${text}`;
//     if (this.cache[cacheKey]) {
//       return of(this.cache[cacheKey]);
//     }

//     const sourceLang = targetLang === 'en' ? 'ka' : 'en';
//     const params = {
//       q: text,
//       langpair: `${sourceLang}|${targetLang}`
//     };

//     return this.http.get<MyMemoryResponse>(this.apiUrl, { params }).pipe(
//       map((res: MyMemoryResponse) => {
//         const status = Number(res.responseStatus);

//         if (status !== 200) {
//           console.warn('MyMemory ვერ თარგმნა (status):', status, 'ტექსტი:', text);
//           return text;
//         }

//         let translated = res.responseData?.translatedText ?? text;

//         if (translated.includes('MYMEMORY WARNING') || translated.includes('INVALID')) {
//           console.warn('MyMemory limit/error:', translated);
//           return text;
//         }

//         this.cache[cacheKey] = translated;
//         return translated;
//       }),
//       catchError(err => {
//         if (err.status === 429) {
//           console.warn('MyMemory rate limit (429), ორიგინალი ტექსტი გამოიყენება:', text);
//         } else {
//           console.error('თარგმნის შეცდომა:', text, err);
//         }
//         return of(text);
//       })
//     );
//   }

//   translateBatch(texts: string[], targetLang: 'ka' | 'en'): Observable<string[]> {
//     if (!texts.length) return of([]);

//     const results: string[] = new Array(texts.length);
//     const textToIndices = new Map<string, number[]>();

//     texts.forEach((text, i) => {
//       if (!text || !text.trim()) {
//         results[i] = text;
//         return;
//       }

//       const staticResult = this.lookupStatic(text, targetLang);
//       if (staticResult !== null) {
//         results[i] = staticResult;
//         return;
//       }

//       const cacheKey = `${targetLang}:${text}`;
//       if (this.cache[cacheKey]) {
//         results[i] = this.cache[cacheKey];
//         return;
//       }

//       // დუბლიკატების დაჯგუფება — ერთი და იგივე ტექსტი მხოლოდ ერთხელ იგზავნება
//       const trimmed = text.trim();
//       if (!textToIndices.has(trimmed)) {
//         textToIndices.set(trimmed, []);
//       }
//       textToIndices.get(trimmed)!.push(i);
//     });

//     const uniqueTexts = Array.from(textToIndices.keys());
//     if (uniqueTexts.length === 0) return of(results);

//     const batches: string[][] = [];
//     for (let i = 0; i < uniqueTexts.length; i += this.BATCH_SIZE) {
//       batches.push(uniqueTexts.slice(i, i + this.BATCH_SIZE));
//     }

//     const batchObservables: Observable<void>[] = batches.map((batch, batchIndex) => {
//       const delaySource: Observable<number> = batchIndex === 0 ? of(0) : timer(this.BATCH_DELAY_MS);

//       return delaySource.pipe(
//         concatMap(() => {
//           const requests: Observable<string>[] = batch.map(text => this.translateText(text, targetLang));
//           return forkJoin(requests);
//         }),
//         map((translatedBatch: string[]) => {
//           batch.forEach((text, i) => {
//             const indices = textToIndices.get(text) ?? [];
//             indices.forEach(idx => {
//               results[idx] = translatedBatch[i];
//             });
//           });
//         })
//       );
//     });

//     return concat(...batchObservables).pipe(
//       toArray(),
//       map(() => results)
//     );
//   }
// }