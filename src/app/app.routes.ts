// src/app/routes.ts

import { Routes } from '@angular/router';
import { CallbackComponent } from './core/shared/call-back/call-back.component';
import { LoginComponent } from './core/views/auth/login/login.component';
import { HomeComponent } from './core/views/home/home.component';
import { AuthGuard } from './core/guards/auth.guard'; // Import the AuthGuard
import { PlaylistPageComponent } from './core/views/playlist-page/playlist-page.component';
import { AlbumPageComponent } from './core/views/album-page/album-page.component';


export const routes: Routes = [
    
    { path: 'home', component: HomeComponent , canActivate: [AuthGuard] }, // Protect the HomeComponent
    { path: 'callback', component: CallbackComponent },
    {path:'auth/login', component:LoginComponent },
    {path:'playlist/:id', component:PlaylistPageComponent, canActivate: [AuthGuard]}, //Protect playlist page
    {path:'album/:id', component:AlbumPageComponent, canActivate: [AuthGuard]}, //Protect album page
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];