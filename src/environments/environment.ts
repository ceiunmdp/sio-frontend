// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
   production: false,
   apiUrl: "http://localhost:3000/api/v1",
   wsUrl: "http://localhost:3000/",
   apiJsonServer: "http://localhost:3004/api/v1",
   firebaseConfig: {
      apiKey: "AIzaSyAJb55Yooq3ftBhiKwn3Kvzpe4ZmJWALqQ",
      authDomain: "icei-d3c94.firebaseapp.com",
      databaseURL: "https://icei-d3c94.firebaseio.com",
      projectId: "icei-d3c94",
      storageBucket: "icei-d3c94.appspot.com",
      messagingSenderId: "993559184474",
      appId: "1:993559184474:web:42f65f61de64f8695c8463",
      measurementId: "G-FJ8YG6NC24"
   }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
