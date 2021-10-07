import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {HomeComponent} from './home/home.component';
import {LinksComponent} from './links/links.component';
import {RedirectComponent} from './redirect/redirect.component';

// Routes defined for router-outlet
// Displays the Component based on the url
const routes: Routes = [
    {path: '', component: RedirectComponent}, // Redirect to home or favs depending on cookie
    {path: 'home', component: HomeComponent},
    {path: 'favs', component: HomeComponent}, // Not wrong, favs is just HomeComponent with filter fixed to favorite
    {path: 'links', component: LinksComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

