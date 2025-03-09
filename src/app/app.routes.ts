// src/app/routes.ts

import { Routes } from '@angular/router';
import { CallbackComponent } from './core/shared/call-back/call-back.component';
import { LoginComponent } from './core/views/auth/login/login.component';
import { HomeComponent } from './core/views/home/home.component';
import { AuthGuard } from './core/guards/auth.guard'; // Import the AuthGuard
import { PlaylistPageComponent } from './core/views/playlist-page/playlist-page.component';
import { AlbumPageComponent } from './core/views/album-page/album-page.component';
import { SearchPageComponent } from './core/views/search-page/search-page.component';
import { TrackPageComponent } from './core/views/track-page/track-page.component';
import { ArtistPageComponent } from './core/views/artist-page/artist-page.component';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { MobileSearchPageComponent } from './core/views/mobile/mobile-search-page/mobile-search-page.component';


export const routes: Routes = [
    
    { path: 'home', component: HomeComponent , canActivate: [AuthGuard] }, // Protect the HomeComponent
    { path: 'callback', component: CallbackComponent },
    {path:'auth/login', component:LoginComponent },
    {path:'playlist/:id', component:PlaylistPageComponent, canActivate: [AuthGuard]}, //Protect playlist page
    {path:'album/:id', component:AlbumPageComponent, canActivate: [AuthGuard]}, //Protect album page
    {path :'search', component:SearchPageComponent, canActivate: [AuthGuard]},// Route to SearchPageComponent with query.
    {path:'track/:id', component:TrackPageComponent, canActivate: [AuthGuard]},
    {path:'artist/:id', component:ArtistPageComponent, canActivate: [AuthGuard]},
    {path:'mobile/library', component:SidebarComponent, canActivate: [AuthGuard]},
    {path:'mobile/search', component:MobileSearchPageComponent, canActivate: [AuthGuard]},
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];